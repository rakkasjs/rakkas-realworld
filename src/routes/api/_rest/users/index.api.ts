import { json } from "@hattip/response";
import { StatusCodes } from "http-status-codes";
import { RequestContext } from "rakkasjs";

export async function post(ctx: RequestContext) {
	const body = await ctx.request.json();
	const user = await ctx.locals.auth.register(body?.user);

	return json({ user }, { status: StatusCodes.CREATED });
}
