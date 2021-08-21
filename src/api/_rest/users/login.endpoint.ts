import { StatusCodes } from "http-status-codes";
import { compare } from "bcrypt";
import { getEnv } from "lib/env";
import { sign } from "jsonwebtoken";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import { ConduitRequestHandler } from "../middleware";
import { z } from "zod";

export const post: ConduitRequestHandler = async ({
	body,
	context: { db },
}) => {
	const r = z
		.object({
			user: z.object({
				// No need to validate the e-mail address
				email: z.string(),
				password: z.string(),
			}),
		})
		.safeParse(body);

	if (!r.success) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: { errors: zodToConduitError(r.error) },
		};
	}

	const { email, password } = r.data.user;

	const { SERVER_SECRET } = getEnv();

	const { passwordHash, id, ...user } =
		(await db.user.findUnique({
			where: { email },
			select: {
				id: true,
				username: true,
				email: true,
				bio: true,
				image: true,
				passwordHash: true,
			},
		})) || {};

	const isCorrect = await compare(password, passwordHash || "");

	const token = sign({ id }, SERVER_SECRET, {
		expiresIn: "60 days",
		noTimestamp: true,
	});

	if (!isCorrect) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: {
				errors: {
					"email or password": ["is incorrect"],
				},
			},
		};
	}

	return {
		body: { user: { ...user, token } },
	};
};
