import { ConduitRequestHandler } from "api/_rest/middleware";

export const get: ConduitRequestHandler = async ({
	params: { username },
	context,
}) => {
	const profile = await context.conduit.getProfile(username);

	return { body: { profile } };
};
