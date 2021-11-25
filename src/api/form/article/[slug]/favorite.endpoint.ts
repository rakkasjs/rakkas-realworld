import { FormSubmitRequestHandler } from "api/form/middleware";
import { url } from "lib/utils";

export const post: FormSubmitRequestHandler = async ({
	context,
	params: { slug },
	headers,
}) => {
	const redirect = headers.get("referer") || url`/article/${slug}`;
	context.setRedirects({ success: redirect, error: redirect });

	await context.conduit.favoriteArticle(slug);

	return {};
};
