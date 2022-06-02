import { RequestContext } from "rakkasjs";

export async function get(req: Request, ctx: RequestContext) {
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

	const articles = await ctx.conduit.listArticles({
		tag,
		author,
		favorited,
		limit,
		offset,
	});

	return new Response(JSON.stringify(articles));
}

export function post() {
	throw new Error("Method not implemented.");
}
