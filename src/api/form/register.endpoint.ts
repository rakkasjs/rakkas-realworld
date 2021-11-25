import { FormSubmitRequestHandler } from "api/form/middleware";
import { serialize } from "cookie";

export const post: FormSubmitRequestHandler = async ({
	context,
	body,
	url,
}) => {
	context.setRedirects({ success: "/", error: "/register" });

	const user = await context.auth.register(body as any);

	return {
		headers: {
			"set-cookie": serialize("authToken", user.token, {
				maxAge: 60 * 60 * 24 * 30,
				path: "/",
				sameSite: true,
				secure: url.protocol === "https",
			}),
		},
	};
};
