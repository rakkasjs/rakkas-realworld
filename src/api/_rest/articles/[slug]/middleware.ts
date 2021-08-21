import { ConduitRequest } from "api/_rest/middleware";
import { RakkasResponse } from "rakkasjs";

export type ConduitArticleRequest = ConduitRequest & {
	context: { articleId: number };
};

export type ConduitArticleRequestHandler = (
	request: ConduitArticleRequest,
) => RakkasResponse | Promise<RakkasResponse>;

export default async function slugParsingMiddleware(
	request: ConduitRequest,
	next: ConduitArticleRequestHandler,
): Promise<RakkasResponse> {
	const slug = request.params.slug;

	const lastMinus = slug.lastIndexOf("-");
	if (lastMinus < 0) {
		return { status: 404 };
	}

	const id = Number(slug.slice(lastMinus + 1));

	if (!Number.isInteger(id)) {
		return { status: 404 };
	}

	return next({
		...request,
		context: {
			...request.context,
			articleId: id,
		},
	});
}
