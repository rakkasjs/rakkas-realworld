import { ConduitRequestHandler } from "./middleware";

export const get: ConduitRequestHandler = async ({ context }) => {
	const user = await context.conduit.getCurrentUser();

	return { body: { user } };
};

export const put: ConduitRequestHandler = async ({ context, body }) => {
	const user = await context.auth.updateUser(body?.user);

	return { body: { user } };
};
