import { json } from "@hattip/response";
import { RequestContext } from "rakkasjs";

export async function post(ctx: RequestContext) {
	const body = await ctx.request.json();
	const user = await ctx.locals.auth.login(body?.user);

	return json({ user });
}
