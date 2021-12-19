import { ConduitRequestHandler } from "api/_rest/middleware";

export const post: ConduitRequestHandler = async ({
	params: { username },
	context,
}) => {
	const profile = await context.conduit.followUser(username);

	return { body: { profile }, status: 200 };
};

export const del: ConduitRequestHandler = async ({
	params: { username },
	context,
}) => {
	const profile = await context.conduit.unfollowUser(username);

	return { body: { profile } };
};
