import { json } from "@hattip/response";
import { RequestContext } from "rakkasjs";

export async function get(ctx: RequestContext) {
	const comments = await ctx.locals.conduit.getComments(ctx.params.slug);

	return json({ comments });
}

export async function post(ctx: RequestContext) {
	const body = await ctx.request.json();
	const comment = await ctx.locals.conduit.addComment(
		ctx.params.slug,
		body?.comment?.body,
	);

	return json({ comment });
}
