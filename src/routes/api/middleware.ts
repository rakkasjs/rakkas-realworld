import { RequestContext } from "rakkasjs";
import { StatusCodes } from "http-status-codes";
import { json } from "@hattip/response";

export default async function conduitMiddleware(ctx: RequestContext) {
	ctx.handleError = (err: any) =>
		json({
			message: err.message,
			stack: err.stack,
		});

	if (ctx.request.headers.get("content-type") !== "application/json") {
		return json(
			{ errors: { body: ["should be JSON"] } },
			{ status: StatusCodes.UNSUPPORTED_MEDIA_TYPE },
		);
	}
}
