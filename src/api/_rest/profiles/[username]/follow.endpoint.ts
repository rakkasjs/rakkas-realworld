import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ConduitRequestHandler } from "api/_rest/middleware";
import { StatusCodes } from "http-status-codes";
import { Profile } from "lib/api-types";

export const post: ConduitRequestHandler = async ({
	params: { username },
	context: { user, db },
}) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	if (user.username === username) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: { errors: { username: ["cannot follow self"] } },
		};
	}

	try {
		const followed = await db.user.update({
			where: { username },
			data: {
				followers: { connect: { id: user.id } },
			},
			select: {
				username: true,
				bio: true,
				image: true,
			},
		});

		const profile: Profile = {
			username: followed.username,
			bio: followed.bio,
			image: followed.image,
			following: true,
		};

		return { body: { profile } };
	} catch (error) {
		if (
			error instanceof PrismaClientKnownRequestError &&
			error.code === "P2016"
		) {
			return { status: 404 };
		}

		throw error;
	}
};

export const del: ConduitRequestHandler = async ({
	params: { username },
	context: { user, db },
}) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	if (user.username === username) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: { errors: { username: ["cannot unfollow self"] } },
		};
	}

	const followed = await db.user.findUnique({ where: { username } });

	if (!followed) return { status: 404 };

	try {
		const unfollowed = await db.user.update({
			where: { username },
			data: { followers: { disconnect: { id: user.id } } },
			select: { username: true, bio: true, image: true },
		});

		const profile: Profile = {
			username: unfollowed.username,
			bio: unfollowed.bio,
			image: unfollowed.image,
			following: false,
		};

		return { body: { profile } };
	} catch (error) {
		if (
			error instanceof PrismaClientKnownRequestError &&
			error.code === "P2016"
		) {
			return { status: 404 };
		}

		throw error;
	}
};
