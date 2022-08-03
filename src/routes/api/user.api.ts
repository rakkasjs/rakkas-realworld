import { json } from "@hattip/response";
import { RequestContext } from "rakkasjs";
import { ConduitError } from "~/lib/conduit-error";

export async function get(ctx: RequestContext) {
	const user = await ctx.locals.conduit.getCurrentUser();

	if (!user) {
		throw new ConduitError(401, "Not logged in");
	}

	return json({ user });
}

export async function put(ctx: RequestContext) {
	const body = await ctx.request.json();
	const user = await ctx.locals.auth.updateUser(body?.user);

	return json({ user });
}
