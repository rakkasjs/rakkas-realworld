/* eslint-disable import/no-named-as-default-member */
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { db } from "./db";
import { ConduitAuthInterface, User, UserSummary } from "~/client/interfaces";
import { NewUser, LoginCredentials, UpdateUser } from "~/lib/validation";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ConduitError } from "~/lib/conduit-error";
import { createSignedToken } from "~/service";

export class ConduitAuthService implements ConduitAuthInterface {
	#user?: UserSummary;
	#saltRounds: number;
	#secret: string;

	constructor(
		user: UserSummary | undefined,
		saltRounds: number,
		secret: string,
	) {
		this.#user = user;
		this.#saltRounds = saltRounds || 12;
		this.#secret = secret;
	}

	async register(user: NewUser): Promise<User> {
		user = NewUser.parse(user);

		const { username, email, password } = user;

		const passwordHash = await bcrypt.hash(password, this.#saltRounds);

		try {
			const { id, ...rest } = await db.user.create({
				data: {
					username,
					email,

					passwordHash,

					bio: "",
					image: null,
				},
				select: {
					id: true,
					username: true,
					email: true,
					bio: true,
					image: true,
				},
			});

			const token = await createSignedToken(id, this.#secret);

			return { ...rest, token };
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2002"
			) {
				// Parsing the error metadata is not sufficient: Some database drivers don't report all violations, just one.
				// But for good UX we need to report all of them, so we'll check which duplicates caused the problem here.

				const duplicates = await db.user.findMany({
					where: {
						OR: [{ username }, { email }],
					},
					select: { email: true, username: true },
				});

				const errors: Record<string, string[]> = {
					// Predefining them ensures a predictable order
					username: undefined as any,
					email: undefined as any,
				};

				duplicates.forEach((x) => {
					if (x.email === email) errors.email = ["is already taken"];
					if (x.username === username) errors.username = ["is already taken"];
				});

				if (!errors.email && !errors.username) {
					// Either we hit an unlikely race condition (the duplicate user got modified or deleted between the two db calls)
					// or a bug caused some other error. We'll assume the latter and rethrow.
					throw error;
				}

				throw new ConduitError(
					StatusCodes.UNPROCESSABLE_ENTITY,
					undefined,
					errors,
				);
			}

			throw error;
		}
	}

	async login(credentials: LoginCredentials): Promise<User> {
		const { email, password } = LoginCredentials.parse(credentials);

		const found = await db.user.findUnique({
			where: { email },
			select: {
				id: true,
				username: true,
				email: true,
				bio: true,
				image: true,
				passwordHash: true,
			},
		});

		if (!found) {
			throw new ConduitError(StatusCodes.UNPROCESSABLE_ENTITY, undefined, {
				"email or password": ["is incorrect"],
			});
		}

		const { passwordHash, id, ...user } = found;

		const isCorrect = await bcrypt.compare(password, passwordHash || "");

		if (!isCorrect) {
			throw new ConduitError(StatusCodes.UNPROCESSABLE_ENTITY, undefined, {
				"email or password": ["is incorrect"],
			});
		}

		const token = await createSignedToken(id, this.#secret);

		return { ...user, token };
	}

	async updateUser(userUpdate: UpdateUser): Promise<User> {
		if (!this.#user) throw new ConduitError(StatusCodes.UNAUTHORIZED);

		const { password, ...rest } = UpdateUser.parse(userUpdate);

		let passwordHash: string | undefined;
		if (password) {
			passwordHash = await bcrypt.hash(password, this.#saltRounds);
		}

		const dbUser = await db.user.update({
			where: { id: this.#user.id },
			data: {
				...rest,
				passwordHash,
				image:
					userUpdate.image === undefined ? undefined : userUpdate.image || null,
			},
			select: {
				id: true,
				username: true,
				email: true,
				image: true,
				bio: true,
			},
		});

		return {
			...dbUser,
			token: this.#user.token,
		};
	}
}
