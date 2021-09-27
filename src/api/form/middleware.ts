import { RakkasMiddleware, RakkasRequest, RakkasResponse } from "rakkasjs";
import { parse } from "cookie";
import { PrismaClient, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { db } from "lib/db";
import { getEnv } from "lib/env";
import { verify } from "jsonwebtoken";

export type FormSubmitRequest = RakkasRequest & {
	context: {
		db: PrismaClient;
		token?: string;
		user?: User;
	};
};

export type FormSubmitRequestHandler = (
	request: FormSubmitRequest,
) => RakkasResponse | Promise<RakkasResponse>;

const FormSubmitMiddleware: RakkasMiddleware = async (request, next) => {
	if (request.type !== "empty" && request.type !== "form-data") {
		return {
			status: StatusCodes.SEE_OTHER,
			headers: { location: "/register?error=unacceptable%20body" },
		};
	}

	const formSubmitRequest: FormSubmitRequest = {
		...request,
		context: {
			db,
			...(await getUser(request)),
		},
	};

	const response = await next(formSubmitRequest);

	return {
		...response,
		headers: { ...response.headers, "Content-Type": "application/json" },
	};
};

export default FormSubmitMiddleware;

export function convertResponse(
	response: RakkasResponse,
	successRedirect: string,
	errorRedirect: string,
): RakkasResponse {
	if (!response.status || (response.status >= 200 && response.status < 300)) {
		return {
			status: 303,
			headers: { location: successRedirect },
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

		return {
			status: 303,
			headers: {
				location:
					response.status === 401
						? "/register"
						: errorRedirectUrl.href.slice(errorRedirectUrl.origin.length),
			},
		};
	}
}

export function paramsToObject(
	params?: URLSearchParams,
): Record<string, string> {
	return params ? Object.fromEntries(params.entries()) : {};
}

async function getUser(
	request: RakkasRequest,
): Promise<{ user: User; token: string } | null> {
	const { authToken } = parse(request.headers.get("cookie") || "");

	if (!authToken) {
		return null;
	}

	const { SERVER_SECRET } = getEnv();

	try {
		const verified = verify(authToken, SERVER_SECRET, {
			algorithms: ["HS256"],
		});

		if (
			typeof verified !== "object" ||
			!verified ||
			!Number.isInteger(verified.id)
		) {
			return null;
		}

		const id: number = verified.id;

		const user = await db.user.findUnique({
			where: { id },
		});

		if (!user) return null;

		return { user, token: authToken };
	} catch (err) {
		return null;
	}
}
