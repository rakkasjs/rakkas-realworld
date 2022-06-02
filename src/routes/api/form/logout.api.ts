import { FormSubmitRequestHandler } from "api/form/middleware";
import { serialize } from "cookie";

export const post: FormSubmitRequestHandler = async (req) => {
	return {
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
