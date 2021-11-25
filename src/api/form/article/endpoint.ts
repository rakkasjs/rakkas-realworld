import { FormSubmitRequestHandler } from "api/form/middleware";
import { url } from "lib/utils";

export const post: FormSubmitRequestHandler = async ({ context, body }) => {
	context.setRedirects({ success: "/editor", error: "/editor" });

	const article = await context.conduit.createArticle({
		...(body as any),
		tagList: (body.tagList || "")
			.split(" ")
			.filter(Boolean)
			.map((s) => s.trim()),
	});

	context.setRedirects({ success: url`/article/${article.slug}` });

	return {};
};
