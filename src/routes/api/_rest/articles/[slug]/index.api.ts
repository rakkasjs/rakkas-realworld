import { json } from "@hattip/response";
import { RequestContext } from "rakkasjs";

export async function get(ctx: RequestContext) {
	const article = await ctx.locals.conduit.getArticle(ctx.params.slug);

	return json({ article });
}

export async function put(ctx: RequestContext) {
	const body = await ctx.request.json();
	const article = await ctx.locals.conduit.updateArticle(
		ctx.params.slug,
		body?.article,
	);

	return json({ article });
}

export async function del(ctx: RequestContext) {
	await ctx.locals.conduit.deleteArticle(ctx.params.slug);

	return new Response();
}
