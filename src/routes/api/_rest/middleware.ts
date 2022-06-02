import { RequestContext } from "rakkasjs";
import { StatusCodes } from "http-status-codes";
import { ConduitService, verifyToken } from "lib/conduit-services";
import { makeLazyValue } from "lib/utils";

export default async function conduitMiddleware(
	req: Request,
	ctx: RequestContext,
): Promise<Response> {
	if (req.headers.get("content-type") !== "application/json") {
		return new Response(
			JSON.stringify({ errors: { body: ["should be JSON"] } }),
			{ status: StatusCodes.UNSUPPORTED_MEDIA_TYPE },
		);
	}

	let token = req.headers.get("authorization");
	if (token) token = token.slice("Token ".length);

	// const { AUTH_API_URL = ctx.url.origin + "/api" } = getEnv();

	// const boundFetch: typeof fetch = (...args) => fetch(...args);

	ctx.conduit = new ConduitService(
		makeLazyValue(() => verifyToken(token || undefined)),
	);

	// hasToken: !!token,
	// auth:
	// 	AUTH_API_URL === req.url.origin + "/api"
	// 		? new ConduitAuthService(makeLazyValue(() => verifyToken(token)))
	// 		: new ConduitAuthClient(boundFetch, AUTH_API_URL, token),

	// await ctx.next(req, ctx).catch((error) => {
	// 	if (error instanceof ZodError) {
	// 		return {
	// 			status: StatusCodes.UNPROCESSABLE_ENTITY,
	// 			body: { errors: zodToConduitError(error) },
	// 		};
	// 	} else if (error instanceof ConduitError) {
	// 		return {
	// 			status: error.status,
	// 			body: { errors: error.issues },
	// 		};
	// 	}
	//
	// 	throw error;
	// });

	const response = await ctx.next();

	response.headers.set("content-type", "application/json");
	return response;
}
