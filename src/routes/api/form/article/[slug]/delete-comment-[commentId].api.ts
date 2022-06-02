import { FormSubmitRequestHandler } from "api/form/middleware";
import { url } from "lib/utils";

export const post: FormSubmitRequestHandler = async ({
	context,
	params: { slug, commentId },
}) => {
	const redirect = url`/article/${slug}`;
	context.setRedirects({ success: redirect, error: redirect });

	await context.conduit.deleteComment(slug, Number(commentId));

	return {};
};
