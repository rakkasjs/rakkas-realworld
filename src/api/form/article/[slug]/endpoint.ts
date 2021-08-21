import {
	convertResponse,
	FormSubmitRequestHandler,
	paramsToObject,
} from "api/form/middleware";
import { StatusCodes } from "http-status-codes";
import { put as updateArticle } from "api/_rest/articles/[slug]/endpoint";
import { SingleArticleResponse } from "lib/api-types";

export const post: FormSubmitRequestHandler = async (req) => {
	const originalSlug = req.params.slug;

	const lastMinus = originalSlug.lastIndexOf("-");
	if (lastMinus < 0) {
		// Redirect to original article, which should give a 404
		return {
			status: StatusCodes.SEE_OTHER,
			headers: { location: `/article/${originalSlug}` },
		};
	}

	const articleId = Number(originalSlug.slice(lastMinus + 1));
	if (!Number.isInteger(articleId)) {
		// Redirect to original article, which should give a 404
		return {
			status: StatusCodes.SEE_OTHER,
			headers: { location: `/article/${originalSlug}` },
		};
	}

	const params = paramsToObject(req.body);

	const response = await updateArticle({
		...req,
		context: {
			...req.context,
			articleId,
		},
		type: "json",
		body: {
			article: {
				...params,
				tagList: params.tagList
					.split(" ")
					.filter(Boolean)
					.map((s) => s.trim()),
			},
		},
	});

	// Slug may have changed
	const slug =
		(response.status ?? 200) === 200
			? (response.body as SingleArticleResponse).article.slug
			: undefined;

	if (slug) {
		return {
			status: StatusCodes.SEE_OTHER,
			headers: {
				location: `/article/${slug}`,
			},
		};
	}

	return convertResponse(
		response,
		`/article/${originalSlug}`,
		`/editor/${originalSlug}`,
	);
};
