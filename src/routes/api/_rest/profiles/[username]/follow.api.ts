import { json } from "@hattip/response";
import { RequestContext } from "rakkasjs";

export async function post(ctx: RequestContext) {
	const profile = await ctx.locals.conduit.followUser(ctx.params.username);

	return json({ profile });
}

export async function del(ctx: RequestContext) {
	const profile = await ctx.locals.conduit.unfollowUser(ctx.params.username);

	return json({ profile });
}
