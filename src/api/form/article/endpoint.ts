import {
	convertResponse,
	FormSubmitRequestHandler,
	paramsToObject,
} from "api/form/middleware";
import { StatusCodes } from "http-status-codes";
import { post as createArticle } from "api/_rest/articles/endpoint";
import { SingleArticleResponse } from "lib/api-types";

export const post: FormSubmitRequestHandler = async (req) => {
	const { tagList, ...params } = paramsToObject(req.body);

	const response = await createArticle({
		...req,
		type: "json",
		body: {
			article: {
				...params,
				tagList: (tagList || "")
					.split(" ")
					.filter(Boolean)
					.map((s) => s.trim()),
			},
		},
	});

	const slug =
		response.status === 201
			? (response.body as SingleArticleResponse).article.slug
			: undefined;

	if (slug) {
		return {
			status: StatusCodes.SEE_OTHER,
			headers: { location: `/article/${slug}` },
		};
	}

	return convertResponse(response, "/", "/editor");
};
