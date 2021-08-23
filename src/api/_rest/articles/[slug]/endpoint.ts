import { StatusCodes } from "http-status-codes";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import { ConduitArticleRequestHandler } from "./middleware";
import { dbArticleToClientArticle, getArticleInclude } from "../endpoint";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { z } from "zod";

export const get: ConduitArticleRequestHandler = async ({
	context: { articleId, user, db },
}) => {
	const rawArticle = await db.article.findUnique({
		where: { id: articleId },
		include: getArticleInclude(user?.id),
	});

	if (!rawArticle) {
		return { status: 404 };
	}

	return { body: { article: dbArticleToClientArticle(rawArticle) } };
};

export const put: ConduitArticleRequestHandler = async ({
	context: { articleId, user, db },
	body,
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

	if (article.authorId !== user.id) {
		return {
			status: 403,
			body: { errors: { author: ["should be the same"] } },
		};
	}

	const r = z
		.object({
			article: z
				.object({
					title: z.string().nonempty("can't be blank"),
					description: z.string().nonempty("can't be blank"),
					body: z.string().nonempty("can't be blank"),
					tagList: z.array(z.string().nonempty()),
				})
				.partial(),
		})
		.safeParse(body);

	if (!r.success) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: { errors: zodToConduitError(r.error) },
		};
	}

	const patch = r.data.article;

	try {
		const [rawArticle] = await db.$transaction([
			db.article.update({
				where: { id: articleId },
				data: {
					title: patch.title,
					description: patch.description,
					body: patch.body,
					tags: patch.tagList && {
						deleteMany: { tagName: { notIn: patch.tagList } },
						connectOrCreate: patch.tagList.map((t) => ({
							create: { tagName: t },
							where: { articleId_tagName: { articleId, tagName: t } },
						})),
					},
				},
				include: getArticleInclude(user.id),
			}),
		]);

		return {
			body: { article: dbArticleToClientArticle(rawArticle) },
		};
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

export const del: ConduitArticleRequestHandler = async ({
	context: { articleId, db, user },
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

	if (article.authorId !== user.id) {
		return {
			status: 403,
			body: { errors: { author: ["should be the same"] } },
		};
	}

	await db.articleTags.deleteMany({ where: { articleId } });

	try {
		await db.article.delete({ where: { id: articleId } });

		return { body: { result: "deleted" } };
	} catch (error) {
		if (
			error instanceof PrismaClientKnownRequestError &&
			error.code === "P2025" &&
			(error.meta as any)?.cause === "Record to delete does not exist."
		) {
			return { status: 404 };
		}
		throw error;
	}
};
