import { createRequestHandler } from "rakkasjs";
import { cookie } from "@hattip/cookie";
import { ConduitService, ConduitAuthService, verifyToken } from "~/service";
import { ConduitAuthClient, ConduitClient } from "~/client";
import { ZodError } from "zod";
import { json } from "@hattip/response";
import { zodToConduitError } from "~/lib/zod-to-conduit-error";
import { StatusCodes } from "http-status-codes";

(ZodError.prototype as any).toResponse = function toResponse() {
	return json(
		{ errors: zodToConduitError(this) },
		{ status: StatusCodes.UNPROCESSABLE_ENTITY },
	);
};

export default createRequestHandler({
	middleware: {
		beforePages: [
			cookie(),
			async (ctx) => {
				const { apiUrl = "/api" } = ctx.cookie;
				const authToken =
					(ctx.request.headers.get("authorization") || "").slice(
						"Token ".length,
					) || ctx.cookie.authToken;

				const userSummary = await verifyToken(authToken);

				const parsedApiUrl = new URL(apiUrl, ctx.url);

				// We can call the backend directly if it points to our API
				if (parsedApiUrl.href === new URL("/api", ctx.url).href) {
					// If AUTH_API_URL is set, use the remote auth service.
					// Otherwise, use the local auth service
					ctx.locals.auth = process.env.AUTH_API_URL
						? new ConduitAuthClient(
								ctx.fetch,
								process.env.AUTH_API_URL,
								authToken,
						  )
						: new ConduitAuthService(userSummary);
					ctx.locals.conduit = new ConduitService(userSummary);
				} else {
					// Use a remote API
					ctx.locals.auth = new ConduitAuthClient(
						ctx.fetch,
						process.env.AUTH_API_URL || apiUrl,
						authToken,
					);
					ctx.locals.conduit = new ConduitClient(ctx.fetch, apiUrl, authToken);
				}
			},
		],
	},

	createPageHooks(reqCtx) {
		return {
			async extendPageContext(pageCtx) {
				pageCtx.locals.auth = reqCtx.locals.auth;
				pageCtx.locals.conduit = reqCtx.locals.conduit;
				// We'll prefetch this early on so that we can
				// access it in route guards.
				pageCtx.queryClient.setQueryData(
					"user",
					await reqCtx.locals.conduit.getCurrentUser(),
				);
			},
		};
	},
});
