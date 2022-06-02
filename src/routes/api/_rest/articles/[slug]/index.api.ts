import { ConduitRequestHandler } from "api/_rest/middleware";

export const get: ConduitRequestHandler = async ({
	context,
	params: { slug },
}) => {
	const article = await context.conduit.getArticle(slug);

	return { body: { article } };
};

export const put: ConduitRequestHandler = async ({
	context,
	body,
	params: { slug },
}) => {
	const article = await context.conduit.updateArticle(slug, body?.article);

	return { body: { article } };
};

export const del: ConduitRequestHandler = async ({
	context,
	params: { slug },
}) => {
	await context.conduit.deleteArticle(slug);

	return {};
};
