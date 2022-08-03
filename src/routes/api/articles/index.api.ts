import { json } from "@hattip/response";
import { StatusCodes } from "http-status-codes";
import { RequestContext } from "rakkasjs";

export async function get(ctx: RequestContext) {
	const url = ctx.url;

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

	const articles = await ctx.locals.conduit.listArticles({
		tag,
		author,
		favorited,
		limit,
		offset,
	});

	return json(articles);
}

export async function post(ctx: RequestContext) {
	const body = await ctx.request.json();
	const article = await ctx.locals.conduit.createArticle(body?.article);

	return json({ article }, { status: StatusCodes.CREATED });
}
