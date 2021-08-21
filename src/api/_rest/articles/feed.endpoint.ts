import { StatusCodes } from "http-status-codes";
import { ConduitRequestHandler } from "../middleware";
import { dbArticleToClientArticle, getArticleInclude } from "./endpoint";

export const get: ConduitRequestHandler = async ({
	context: { user, db },
	url,
}) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	let limit = Number(url.searchParams.get("limit"));
	let offset = Number(url.searchParams.get("offset"));

	if (!Number.isInteger(limit) || limit <= 0) {
		limit = 20;
	}

	if (!Number.isInteger(offset) || offset <= 0) {
		offset = 0;
	}

	const rawArticles = await db.article.findMany({
		where: {
			author: { followers: { some: { id: user.id } } },
		},
		include: getArticleInclude(user.id),
		orderBy: { id: "desc" },
		skip: offset,
		take: Math.min(20, Number(limit)),
	});

	const articlesCount = await db.article.count({
		where: {
			author: { followers: { some: { id: user.id } } },
		},
	});

	return {
		body: {
			articles: rawArticles.map(dbArticleToClientArticle),
			articlesCount,
		},
	};
};
