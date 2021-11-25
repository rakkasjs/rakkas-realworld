import { RakkasMiddleware, RakkasRequest, RakkasResponse } from "rakkasjs";
import { parse, serialize } from "cookie";
import { StatusCodes } from "http-status-codes";
import { getEnv } from "lib/env";
import { ConduitAuthInterface, ConduitInterface } from "lib/interfaces";
import { ConduitAuthService } from "lib/auth-service";
import { ConduitService, verifyToken } from "lib/conduit-services";
import { ConduitAuthClient, ConduitClient } from "lib/rest-client";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import { ConduitError } from "lib/conduit-error";
import { ZodError } from "zod";
import { makeLazyValue } from "lib/utils";

export type FormSubmitRequest = Omit<RakkasRequest, "context" | "body"> & {
	context: {
		hasToken: boolean;
		auth: ConduitAuthInterface;
		conduit: ConduitInterface;

		errorRedirect?: string;
		successRedirect?: string;
		setRedirects(redirects: { error?: string; success?: string }): void;
	};
	body: Record<string, string>;
};

export type FormSubmitRequestHandler = (
	request: FormSubmitRequest,
) => RakkasResponse | Promise<RakkasResponse>;

const formSubmitMiddleware: RakkasMiddleware = async (request, next) => {
	if (request.type !== "empty" && request.type !== "form-data") {
		return {
			status: StatusCodes.SEE_OTHER,
			headers: { location: "/register?error=unsupported%20media%20type" },
		};
	}

	const { authToken, apiUrl = request.url.origin + "/api" } = parse(
		request.headers.get("cookie") || "",
	);

	const { AUTH_API_URL = request.url.origin + "/api" } = getEnv();

	const lazyUser = makeLazyValue(() => verifyToken(authToken));

	const boundFetch = fetch.bind(globalThis);

	const formSubmitRequest: FormSubmitRequest = {
		...request,
		body: paramsToObject(request.body),
		context: {
			hasToken: !!authToken,
			auth:
				AUTH_API_URL === request.url.origin + "/api"
					? new ConduitAuthService(lazyUser)
					: new ConduitAuthClient(boundFetch, AUTH_API_URL, authToken),
			conduit:
				apiUrl === request.url.origin + "/api"
					? new ConduitService(lazyUser)
					: new ConduitClient(boundFetch, apiUrl, authToken),

			setRedirects({ error, success }) {
				this.errorRedirect = error;
				this.successRedirect = success;
			},
		},
	};

	const response = await next(formSubmitRequest as any).catch((error) => {
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
		} else {
			console.error(error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				body: { errors: { internal: ["Internal server error"] } },
			};
		}
	});

	return convertResponse(
		response,
		formSubmitRequest.context.successRedirect || "/",
		(response.status === 401 && "/register") ||
			formSubmitRequest.context.errorRedirect ||
			formSubmitRequest.headers.get("referer") ||
			"/",
	);
};

export default formSubmitMiddleware;

function convertResponse(
	response: RakkasResponse,
	successRedirect: string,
	errorRedirect: string,
): RakkasResponse {
	if (!response.status || (response.status >= 200 && response.status < 300)) {
		let headers = response.headers || [];

		if (!Array.isArray(headers)) {
			headers = Object.entries(headers);
		}

		return {
			status: 303,
			headers: [...headers, ["location", successRedirect]],
		};
	} else {
		const errors: Record<string, string[]> | undefined =
			response.body instanceof Object
				? (response.body as any)?.errors
				: undefined;

		const errorRedirectUrl = new URL(errorRedirect, "http://example.com");

		if (errors) {
			for (const [k, values] of Object.entries(errors)) {
				if (!values) continue;
				for (const v of values)
					errorRedirectUrl.searchParams.append("error", k + " " + v);
			}
		}

		const headers: Record<string, string> = {
			location: errorRedirectUrl.href.slice(errorRedirectUrl.origin.length),
		};

		// Delete auth cookie to avoid expired sessions being stuck in the browser
		if (response.status === 401) {
			headers["set-cookie"] = serialize("authToken", "", {
				maxAge: 0,
				path: "/",
				sameSite: true,
			});
		}

		return {
			status: 303,
			headers,
		};
	}
}

function paramsToObject(params?: URLSearchParams): Record<string, string> {
	return params ? Object.fromEntries(params.entries()) : {};
}
