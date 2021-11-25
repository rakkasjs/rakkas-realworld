import { FormSubmitRequestHandler } from "api/form/middleware";

export const post: FormSubmitRequestHandler = async ({ context, body }) => {
	context.setRedirects({ success: "/settings", error: "/settings" });

	await context.auth.updateUser(body);

	return {};
};
