import { ConduitRequestHandler } from "../middleware";

export const get: ConduitRequestHandler = async ({ context, url }) => {
	const limit = Number(url.searchParams.get("limit")) || undefined;
	const offset = Number(url.searchParams.get("offset")) || undefined;

	const articles = await context.conduit.feedArticles({ limit, offset });

	return { body: articles };
};
