import { StatusCodes } from "http-status-codes";
import { getEnv } from "lib/env";
import { RequestContext } from "rakkasjs";

export default function testMiddleware(_req: Request, ctx: RequestContext) {
	if (import.meta.env.PROD && getEnv().NODE_ENV !== "test") {
		return new Response(null, { status: StatusCodes.NOT_FOUND });
	}

	return ctx.next();
}
