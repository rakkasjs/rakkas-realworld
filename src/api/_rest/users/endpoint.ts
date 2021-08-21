import { StatusCodes } from "http-status-codes";
import { hash } from "bcrypt";
import { getEnv } from "lib/env";
import { sign } from "jsonwebtoken";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import { ConduitRequestHandler } from "../middleware";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { z } from "zod";

export const post: ConduitRequestHandler = async ({
	body,
	context: { db },
}) => {
	const r = z
		.object({
			user: z.object({
				username: z.string().nonempty("can't be blank"),
				email: z.string().nonempty("can't be blank").email("is invalid"),
				password: z
					.string()
					.nonempty("can't be blank")
					.min(8, "is too short (minimum is 8 characters)"),
			}),
		})
		.safeParse(body);

	if (!r.success) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: { errors: zodToConduitError(r.error) },
		};
	}

	const { username, email, password } = r.data.user;

	const { SALT_ROUNDS, SERVER_SECRET } = getEnv();

	const passwordHash = await hash(password, SALT_ROUNDS);
	try {
		const { id, ...user } = await db.user.create({
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

		const token = sign({ id }, SERVER_SECRET, {
			expiresIn: "60 days",
			noTimestamp: true,
		});

		return {
			status: StatusCodes.CREATED,
			body: { user: { ...user, token } },
		};
	} catch (error) {
		if (
			error instanceof PrismaClientKnownRequestError &&
			error.code === "P2002"
		) {
			// Parsing the error metadata is not sufficient: MySQL doesn't report ALL violations, just one.
			// But for good UX we need to report all of them, so we'll check which duplicates caused the problem here.

			const duplicates = await db.user.findMany({
				where: {
					OR: [{ username }, { email }],
				},
				select: { email: true, username: true },
			});

			const errors: Record<string, string[] | undefined> = {
				// Predefining them ensures a predictable order
				username: undefined,
				email: undefined,
			};

			duplicates.forEach((x) => {
				if (x.email === email) errors.email = ["is already taken"];
				if (x.username === username) errors.username = ["is already taken"];
			});

			if (!errors.email && !errors.username) {
				// Either we hit an extremely unlikely race condition (the duplicate user got deleted between the two db calls)
				// or a bug caused some other error. We'll assume the latter and rethrow.
				throw error;
			}

			return {
				status: StatusCodes.UNPROCESSABLE_ENTITY,
				body: { errors },
			};
		} else {
			throw error;
		}
	}
};
