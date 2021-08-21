import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { StatusCodes } from "http-status-codes";
import { getArticleInclude, dbArticleToClientArticle } from "../endpoint";
import { ConduitArticleRequestHandler } from "./middleware";

export const post: ConduitArticleRequestHandler = async ({
	context: { articleId, user, db },
}) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	const article = await db.article.findUnique({
		where: { id: articleId },
		select: { authorId: true },
	});

	if (!article) {
		return { status: 404 };
	}

	if (article?.authorId === user.id) {
		return { status: 422, errors: { user: ["cannot favorite own article"] } };
	}

	try {
		const dbArticle = await db.article.update({
			where: { id: articleId },
			data: {
				favoritedBy: {
					connect: { id: user.id },
				},
			},
			include: getArticleInclude(user.id),
		});

		return { body: { article: dbArticleToClientArticle(dbArticle) } };
	} catch (error) {
		// This is needed because of the possibility of a race condition between the
		// existence check and the update
		if (
			error instanceof PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			return { status: 404 };
		}

		throw error;
	}
};

export const del: ConduitArticleRequestHandler = async ({
	context: { articleId, user, db },
}) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	try {
		const dbArticle = await db.article.update({
			where: { id: articleId },
			data: {
				favoritedBy: { disconnect: { id: user.id } },
			},
			include: getArticleInclude(user.id),
		});

		return { body: { article: dbArticleToClientArticle(dbArticle) } };
	} catch (error) {
		if (
			error instanceof PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			return { status: 404 };
		}

		throw error;
	}
};
