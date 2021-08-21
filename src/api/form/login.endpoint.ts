import {
	convertResponse,
	FormSubmitRequestHandler,
	paramsToObject,
} from "api/form/middleware";
import { serialize } from "cookie";
import { StatusCodes } from "http-status-codes";
import { post as login } from "api/_rest/users/login.endpoint";
import { UserResponse } from "lib/api-types";

export const post: FormSubmitRequestHandler = async (req) => {
	const response = await login({
		...req,
		type: "json",
		body: { user: paramsToObject(req.body) },
	});

	const token =
		(response.status ?? 200) === 200
			? (response.body as UserResponse).user.token
			: undefined;

	if (token) {
		return {
			status: StatusCodes.SEE_OTHER,
			headers: {
				location: "/",
				"set-cookie": serialize("authToken", token, {
					maxAge: 60 * 60 * 24 * 30,
					path: "/",
					sameSite: true,
					secure: req.url.protocol === "https",
				}),
			},
		};
	}

	return convertResponse(response, "/", "/login");
};
