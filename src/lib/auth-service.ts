import { hash, compare } from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { db } from "lib/db";
import { getEnv } from "lib/env";
import { ConduitAuthInterface, User, UserSummary } from "lib/interfaces";
import { NewUser, LoginCredentials, UpdateUser } from "lib/validation";
import { SignJWT } from "jose";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ConduitError } from "lib/conduit-error";

export class ConduitAuthService implements ConduitAuthInterface {
	#user?: Promise<UserSummary | undefined>;

	constructor(user?: Promise<UserSummary | undefined>) {
		this.#user = user;
	}

	async register(user: NewUser): Promise<User> {
		user = NewUser.parse(user);

		const { username, email, password } = user;

		const { SALT_ROUNDS } = getEnv();
		const passwordHash = await hash(password, SALT_ROUNDS || 12);

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

			const token = await createSignedToken(id);

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

		const isCorrect = await compare(password, passwordHash || "");

		if (!isCorrect) {
			throw new ConduitError(StatusCodes.UNPROCESSABLE_ENTITY, undefined, {
				"email or password": ["is incorrect"],
			});
		}

		const token = await createSignedToken(id);

		return { ...user, token };
	}

	async updateUser(userUpdate: UpdateUser): Promise<User> {
		const user = await this.#user;

		if (!user) throw new ConduitError(StatusCodes.UNAUTHORIZED);

		const { password, ...rest } = UpdateUser.parse(userUpdate);

		let passwordHash: string | undefined;
		if (password) {
			const { SALT_ROUNDS } = getEnv();
			passwordHash = await hash(password, SALT_ROUNDS || 12);
		}

		const dbUser = await db.user.update({
			where: { id: user.id },
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
			token: user.token,
		};
	}
}

export async function createSignedToken(userId: number): Promise<string> {
	const { SERVER_SECRET } = getEnv();

	const secret =
		typeof atob === "function"
			? Uint8Array.from(atob(SERVER_SECRET), (c) => c.charCodeAt(0))
			: Buffer.from(SERVER_SECRET, "base64");

	return await new SignJWT({ id: userId })
		.setProtectedHeader({ alg: "HS256" })
		.sign(secret);
}