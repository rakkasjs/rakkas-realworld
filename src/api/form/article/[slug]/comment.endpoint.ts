import {
	convertResponse,
	FormSubmitRequestHandler,
	paramsToObject,
} from "api/form/middleware";
import { StatusCodes } from "http-status-codes";
import { post as createComment } from "api/_rest/articles/[slug]/comments/endpoint";

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

	const params = paramsToObject(req.body);

	return await convertResponse(
		await createComment({
			...req,
			context: {
				...req.context,
				articleId,
			},
			type: "json",
			body: { comment: params },
		}),
		`/article/${slug}`,
		`/article/${slug}`,
	);
};
