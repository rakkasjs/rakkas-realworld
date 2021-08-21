import { FormSubmitRequestHandler } from "api/form/middleware";
import { serialize } from "cookie";
import { StatusCodes } from "http-status-codes";

export const post: FormSubmitRequestHandler = async (req) => {
	return {
		status: StatusCodes.SEE_OTHER,
		headers: {
			location: "/",
			"set-cookie": serialize("authToken", "", {
				maxAge: 0,
				path: "/",
				sameSite: true,
				secure: req.url.protocol === "https",
			}),
		},
	};
};
