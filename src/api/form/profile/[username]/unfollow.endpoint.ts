import { FormSubmitRequestHandler } from "api/form/middleware";
import { url } from "lib/utils";

export const post: FormSubmitRequestHandler = async ({
	context,
	params: { username },
}) => {
	const redirect = url`/profile/${username}`;
	context.setRedirects({ success: redirect, error: redirect });

	await context.conduit.unfollowUser(username);

	return {};
};
