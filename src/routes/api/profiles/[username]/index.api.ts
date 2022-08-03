import { json } from "@hattip/response";
import { RequestContext } from "rakkasjs";

export async function get(ctx: RequestContext) {
	const profile = await ctx.locals.conduit.getProfile(ctx.params.username);

	return json({ profile });
}
