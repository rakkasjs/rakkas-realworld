import { RequestContext } from "rakkasjs";

export async function get(ctx: RequestContext): Promise<Response> {
	const tags = await ctx.locals.conduit.getTags();

	return new Response(JSON.stringify({ tags }));
}
