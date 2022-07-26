import { json } from "@hattip/response";
import { RequestContext } from "rakkasjs";

export async function get(ctx: RequestContext) {
	const limit = Number(ctx.url.searchParams.get("limit")) || undefined;
	const offset = Number(ctx.url.searchParams.get("offset")) || undefined;

	const articles = await ctx.locals.conduit.feedArticles({ limit, offset });

	return json(articles);
}
