import { StatusCodes } from "http-status-codes";
import { ConduitRequestHandler } from "../middleware";

export const get: ConduitRequestHandler = async ({ context, url }) => {
	const tag = url.searchParams.get("tag") ?? undefined;
	const author = url.searchParams.get("author") ?? undefined;
	const favorited = url.searchParams.get("favorited") ?? undefined;
	let limit = Number(url.searchParams.get("limit"));
	let offset = Number(url.searchParams.get("offset"));

	if (!Number.isInteger(limit) || limit <= 0 || limit > 20) {
		limit = 20;
	}

	if (!Number.isInteger(offset) || offset <= 0) {
		offset = 0;
	}

	const articles = await context.conduit.listArticles({
		tag,
		author,
		favorited,
		limit,
		offset,
	});

	return { body: articles };
};

export const post: ConduitRequestHandler = async ({ context, body }) => {
	const article = await context.conduit.createArticle(body?.article);

	return { status: StatusCodes.CREATED, body: { article } };
};
