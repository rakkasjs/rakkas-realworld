import { FormSubmitRequestHandler } from "api/form/middleware";
import { url } from "lib/utils";

export const post: FormSubmitRequestHandler = async ({
	context,
	params: { slug },
}) => {
	context.setRedirects({ success: "/", error: url`/article/${slug}` });

	await context.conduit.deleteArticle(slug);

	return {};
};
