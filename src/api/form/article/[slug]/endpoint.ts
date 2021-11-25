import { FormSubmitRequestHandler } from "api/form/middleware";
import { url } from "lib/utils";

export const post: FormSubmitRequestHandler = async ({
	context,
	body,
	params: { slug },
}) => {
	context.setRedirects({ success: "/editor", error: url`/editor/${slug}` });

	const article = await context.conduit.updateArticle(slug, {
		...(body as any),
		tagList: (body.tagList || "")
			.split(" ")
			.filter(Boolean)
			.map((s) => s.trim()),
	});

	context.setRedirects({ success: url`/article/${article.slug}` });

	return {};
};
