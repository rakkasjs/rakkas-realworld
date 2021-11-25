import { ConduitRequestHandler } from "./middleware";

export const get: ConduitRequestHandler = async ({ context }) => {
	const tags = await context.conduit.getTags();

	return {
		body: { tags },
	};
};
