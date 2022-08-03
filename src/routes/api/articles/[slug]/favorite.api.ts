import { json } from "@hattip/response";
import { RequestContext } from "rakkasjs";

export async function post(ctx: RequestContext) {
	const article = await ctx.locals.conduit.favoriteArticle(ctx.params.slug);

	return json({ article });
}

export async function del(ctx: RequestContext) {
	const article = await ctx.locals.conduit.unfavoriteArticle(ctx.params.slug);

	return json({ article });
}
