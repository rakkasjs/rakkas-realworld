import { ConduitArticleRequestHandler } from "api/_rest/articles/[slug]/middleware";
import { StatusCodes } from "http-status-codes";

export const del: ConduitArticleRequestHandler = async ({
	context: { articleId, user, db },
	params,
}) => {
	if (!user) {
		return { status: StatusCodes.UNAUTHORIZED };
	}

	const commentId = Number(params.commentId);

	if (!Number.isInteger(commentId) || commentId <= 0) {
		return { status: 404 };
	}

	const comment = await db.comment.findUnique({
		where: { id: commentId },
		select: {
			author: { select: { id: true } },
			article: { select: { id: true } },
		},
	});

	if (!comment || comment.article.id !== articleId) {
		return { status: 404 };
	}

	if (comment.author.id !== user.id) {
		return {
			status: 403,
			body: { errors: { author: ["should be the same"] } },
		};
	}

	await db.comment.delete({ where: { id: commentId } });

	return { body: { result: "deleted" } };
};
