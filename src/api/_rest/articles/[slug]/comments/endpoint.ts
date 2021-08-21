import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import {
	dbUserToProfile,
	getProfileInclude,
} from "api/_rest/articles/endpoint";
import { ConduitArticleRequestHandler } from "api/_rest/articles/[slug]/middleware";
import { StatusCodes } from "http-status-codes";
import { Comment } from "lib/api-types";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import { z } from "zod";

export const get: ConduitArticleRequestHandler = async ({
	context: { articleId, user, db },
}) => {
	const article = await db.article.findUnique({
		where: { id: articleId },
		select: {
			comments: {
				orderBy: {
					createdAt: "desc",
				},
				select: {
					id: true,
					createdAt: true,
					updatedAt: true,
					body: true,
					author: { include: getProfileInclude(user?.id) },
				},
			},
		},
	});

	if (!article) {
		return { status: 404 };
	}

	const comments: Comment[] = article.comments.map((dbComment) => ({
		...dbComment,
		createdAt: dbComment.createdAt.toISOString(),
		updatedAt: dbComment.updatedAt.toISOString(),
		author: dbUserToProfile(dbComment.author),
	}));

	return { body: { comments } };
};

export const post: ConduitArticleRequestHandler = async ({
	context: { articleId, user, db },
	body,
}) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	const r = z
		.object({
			comment: z.object({ body: z.string().nonempty("can't be blank") }),
		})
		.safeParse(body);

	if (!r.success) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: { errors: zodToConduitError(r.error) },
		};
	}

	const commentBody = r.data.comment.body;

	try {
		const dbComment = await db.comment.create({
			data: {
				articleId,
				authorId: user.id,
				body: commentBody,
			},
			select: {
				id: true,
				createdAt: true,
				updatedAt: true,
				body: true,
				author: { include: getProfileInclude(user.id) },
			},
		});

		const comment: Comment = {
			...dbComment,
			createdAt: dbComment.createdAt.toISOString(),
			updatedAt: dbComment.updatedAt.toISOString(),
			author: dbUserToProfile(dbComment.author),
		};

		return { body: { comment } };
	} catch (error) {
		if (
			error instanceof PrismaClientKnownRequestError &&
			error.code === "P2003"
		) {
			return { status: 404 };
		}

		throw error;
	}
};
