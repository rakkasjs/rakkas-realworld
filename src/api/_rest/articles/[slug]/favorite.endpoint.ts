import { ConduitRequestHandler } from "api/_rest/middleware";

export const post: ConduitRequestHandler = async ({
	context,
	params: { slug },
}) => {
	const article = await context.conduit.favoriteArticle(slug);

	return { body: { article }, status: 200 };
};

export const del: ConduitRequestHandler = async ({
	context,
	params: { slug },
}) => {
	const article = await context.conduit.unfavoriteArticle(slug);

	return { body: { article }, status: 200 };
};
