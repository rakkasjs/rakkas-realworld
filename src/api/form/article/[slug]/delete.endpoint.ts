import { convertResponse, FormSubmitRequestHandler } from "api/form/middleware";
import { StatusCodes } from "http-status-codes";
import { del as deleteArticle } from "api/_rest/articles/[slug]/endpoint";

export const post: FormSubmitRequestHandler = async (req) => {
	const slug = req.params.slug;

	const lastMinus = slug.lastIndexOf("-");
	if (lastMinus < 0) {
		// Redirect to original article, which should give a 404
		return {
			status: StatusCodes.SEE_OTHER,
			headers: { location: `/article/${slug}` },
		};
	}

	const articleId = Number(slug.slice(lastMinus + 1));
	if (!Number.isInteger(articleId)) {
		// Redirect to original article, which should give a 404
		return {
			status: StatusCodes.SEE_OTHER,
			headers: { location: `/article/${slug}` },
		};
	}

	return convertResponse(
		await deleteArticle({
			...req,
			context: {
				...req.context,
				articleId,
			},
			type: "json",
		}),
		`/`,
		`/article/${slug}`,
	);
};
