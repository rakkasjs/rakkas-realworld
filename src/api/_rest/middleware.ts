import { RakkasMiddleware, RakkasRequest, RakkasResponse } from "rakkasjs";
import { StatusCodes } from "http-status-codes";
import { getEnv } from "lib/env";
import { ConduitAuthInterface, ConduitInterface } from "lib/interfaces";
import { ConduitAuthService } from "lib/auth-service";
import { ConduitAuthClient } from "lib/rest-client";
import { ConduitService, verifyToken } from "lib/conduit-services";
import { ZodError } from "zod";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import { ConduitError } from "lib/conduit-error";
import { makeLazyValue } from "lib/utils";

export type ConduitRequest = Omit<RakkasRequest, "context"> & {
	context: {
		hasToken: boolean;
		auth: ConduitAuthInterface;
		conduit: ConduitInterface;
	};
};

export type ConduitRequestHandler = (
	request: ConduitRequest,
) => RakkasResponse | Promise<RakkasResponse>;

const conduitMiddleware: RakkasMiddleware = async (request, next) => {
	if (request.type !== "empty" && request.type !== "json") {
		return {
			status: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
			body: { errors: { body: ["should be JSON"] } },
		};
	}

	let token = request.headers.get("authorization") || undefined;
	if (token) token = token.slice("Token ".length);

	const { AUTH_API_URL = request.url.origin + "/api" } = getEnv();

	const boundFetch: typeof fetch = (...args) => fetch(...args);

	const conduitRequest: ConduitRequest = {
		...request,
		context: {
			hasToken: !!token,
			auth:
				AUTH_API_URL === request.url.origin + "/api"
					? new ConduitAuthService(makeLazyValue(() => verifyToken(token)))
					: new ConduitAuthClient(boundFetch, AUTH_API_URL, token),
			conduit: new ConduitService(makeLazyValue(() => verifyToken(token))),
		},
	};

	const response: RakkasResponse = await next(conduitRequest).catch((error) => {
		if (error instanceof ZodError) {
			return {
				status: StatusCodes.UNPROCESSABLE_ENTITY,
				body: { errors: zodToConduitError(error) },
			};
		} else if (error instanceof ConduitError) {
			return {
				status: error.status,
				body: { errors: error.issues },
			};
		}

		throw error;
	});

	return {
		...response,
		headers: { ...response.headers, "Content-Type": "application/json" },
	};
};

export default conduitMiddleware;
