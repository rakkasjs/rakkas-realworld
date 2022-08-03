import { RequestContext } from "rakkasjs";

export async function del(ctx: RequestContext) {
	await ctx.locals.conduit.deleteComment(
		ctx.params.slug,
		Number(ctx.params.commentId),
	);

	return new Response();
}
