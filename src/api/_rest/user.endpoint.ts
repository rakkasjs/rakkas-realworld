import { StatusCodes } from "http-status-codes";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import { ConduitRequestHandler } from "./middleware";
import { hash } from "bcrypt";
import { getEnv } from "lib/env";
import { z } from "zod";
import isURL from "validator/lib/isURL";

export const get: ConduitRequestHandler = ({ context: { user, token } }) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	const { email, username, bio, image } = user;

	return {
		body: {
			user: { email, username, bio, image, token: token },
		},
	};
};

export const put: ConduitRequestHandler = async ({
	context: { user, db, token },
	body,
}) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	const r = z
		.object({
			user: z
				.object({
					email: z.string().email("is invalid"),
					password: z
						.string()
						.nonempty("can't be blank")
						.min(8, "is too short (minimum is 8 characters)"),
					username: z.string().nonempty("can't be blank"),
					bio: z.string(),
					image: z.string().refine((s) => !s || isURL(s), "is invalid"),
				})
				.partial(),
		})
		.safeParse(body);

	if (!r.success) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: { errors: zodToConduitError(r.error) },
		};
	}

	const { email, username, bio, image, password } = r.data.user;

	const { SALT_ROUNDS } = getEnv();

	const profile = await db.user.update({
		where: { email: user.email },
		data: {
			email,
			username,
			bio,
			image: image === "" ? null : image,
			passwordHash: password && (await hash(password, SALT_ROUNDS)),
		},
		select: {
			username: true,
			email: true,
			bio: true,
			image: true,
		},
	});

	return {
		body: {
			user: {
				...profile,
				token,
			},
		},
	};
};
