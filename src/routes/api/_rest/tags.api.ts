import { RequestContext } from "rakkasjs";

export async function get(
	req: Request,
	ctx: RequestContext,
): Promise<Response> {
	const tags = await ctx.conduit.getTags();

	return new Response(JSON.stringify({ tags }));
}
