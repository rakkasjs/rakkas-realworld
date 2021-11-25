import { ConduitError } from "lib/conduit-error";
import { db } from "lib/db";
import type {
	Article as PrismaArticle,
	User as PrismaUser,
} from "@prisma/client";
import {
	Article,
	ArticleList,
	Comment,
	ConduitInterface,
	Profile,
	User,
	UserSummary,
} from "lib/interfaces";
import {
	ListArticlesOptions,
	PaginationOptions,
	NewArticle,
	UpdateArticle,
} from "lib/validation";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import slugify from "slugify";
import { jwtVerify } from "jose";
import { getEnv } from "lib/env";

export class ConduitService implements ConduitInterface {
	#user: Promise<UserSummary | undefined>;

	constructor(userFactory: Promise<UserSummary | undefined>) {
		this.#user = userFactory;
	}

	private async _ensureUser(): Promise<UserSummary> {
		const currentUser = await this.#user;
		if (!currentUser) {
			throw new ConduitError(StatusCodes.UNAUTHORIZED, "Not logged in");
		}

		return currentUser;
	}

	async getComments(slug: string): Promise<Comment[]> {
		slug = z.string().parse(slug);
		const id = parseIdFromSlug(slug);

		if (!id) throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");

		const article = await db.article.findUnique({
			where: { id },
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
						author: true,
					},
				},
			},
		});

		if (!article) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		const comments: Comment[] = article.comments.map((dbComment) => ({
			...dbComment,
			createdAt: dbComment.createdAt.toISOString(),
			updatedAt: dbComment.updatedAt.toISOString(),
			author: dbUserToProfile(dbComment.author),
		}));

		return comments;
	}

	async getTags(): Promise<string[]> {
		const tags = await db.articleTags.groupBy({
			by: ["tagName"],
			_count: { articleId: true },
			orderBy: { _count: { articleId: "desc" } },
			take: 20,
		});

		return tags.map((tag) => tag.tagName);
	}

	async getCurrentUser(): Promise<User> {
		const currentUser = await this._ensureUser();

		const dbUser = await db.user.findUnique({
			where: { id: currentUser.id },
			select: {
				username: true,
				email: true,
				image: true,
				bio: true,
			},
		});

		if (!dbUser) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "User not found");
		}

		return {
			...dbUser,
			image: dbUser.image,
			token: currentUser.token,
		};
	}

	async getProfile(username: string): Promise<Profile> {
		const currentUser = await this.#user;

		username = z.string().parse(username);

		const dbProfile = await db.user.findUnique({
			where: { username },
			select: {
				username: true,
				bio: true,
				image: true,
				followers: currentUser ? { where: { id: currentUser.id } } : undefined,
			},
		});

		if (!dbProfile) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "User not found");
		}

		return {
			username: dbProfile.username,
			bio: dbProfile.bio,
			image: dbProfile.image,
			following: (dbProfile.followers || []).length > 0,
		};
	}

	async followUser(username: string): Promise<Profile> {
		const currentUser = await this._ensureUser();

		username = z.string().parse(username);

		if (username === currentUser.username) {
			throw new ConduitError(
				StatusCodes.UNPROCESSABLE_ENTITY,
				"You can't follow yourself",
				{ username: ["cannot follow self"] },
			);
		}

		try {
			const followed = await db.user.update({
				where: { username },
				data: {
					followers: { connect: { id: currentUser.id } },
				},
				select: {
					username: true,
					bio: true,
					image: true,
				},
			});

			return {
				username: followed.username,
				bio: followed.bio,
				image: followed.image,
				following: true,
			};
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2016"
			) {
				throw new ConduitError(StatusCodes.NOT_FOUND, "User not found");
			}

			throw error;
		}
	}

	async unfollowUser(username: string): Promise<Profile> {
		const currentUser = await this._ensureUser();

		username = z.string().parse(username);

		if (username === currentUser.username) {
			throw new ConduitError(
				StatusCodes.UNPROCESSABLE_ENTITY,
				"You can't unfollow yourself",
				{ username: ["cannot unfollow self"] },
			);
		}

		try {
			const unfollowed = await db.user.update({
				where: { username },
				data: {
					followers: { disconnect: { id: currentUser.id } },
				},
				select: {
					username: true,
					bio: true,
					image: true,
				},
			});

			return {
				username: unfollowed.username,
				bio: unfollowed.bio,
				image: unfollowed.image,
				following: false,
			};
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2016"
			) {
				throw new ConduitError(StatusCodes.NOT_FOUND, "User not found");
			}

			throw error;
		}
	}

	async listArticles(options: ListArticlesOptions): Promise<ArticleList> {
		const currentUser = await this.#user;

		let {
			tag,
			author,
			favorited,
			limit = 20,
			offset = 0,
		} = ListArticlesOptions.parse(options);

		if (limit > 20) limit = 20;
		if (offset < 0) offset = 0;

		const [result, articlesCount] = await db.$transaction([
			favorited
				? db.user.findUnique({
						where: { username: favorited },
						select: {
							favoriteArticles: {
								where: {
									author: author ? { username: author } : undefined,
									tags: tag ? { some: { tagName: tag } } : undefined,
								},
								orderBy: { id: "desc" },
								skip: offset,
								take: Math.min(20, Number(limit)),
								include: getArticleInclude(currentUser?.id),
							},
						},
				  })
				: db.article.findMany({
						where: {
							author: author ? { username: author } : undefined,
							tags: tag ? { some: { tagName: tag } } : undefined,
						},
						orderBy: { id: "desc" },
						skip: offset,
						take: Math.min(20, Number(limit)),
						include: getArticleInclude(currentUser?.id),
				  }),

			db.article.count({
				where: {
					favoritedBy: favorited
						? { some: { username: favorited } }
						: undefined,
					author: author ? { username: author } : undefined,
					tags: tag ? { some: { tagName: tag } } : undefined,
				},
			}),
		]);

		if (!result) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "User not found");
		}

		const dbArticles =
			"favoriteArticles" in result ? result.favoriteArticles : result;

		return {
			articles: dbArticles.map(dbArticleToClientArticle),
			articlesCount,
		};
	}

	async feedArticles(options: PaginationOptions): Promise<ArticleList> {
		const currentUser = await this._ensureUser();

		let { limit = 20, offset = 0 } = PaginationOptions.parse(options);

		if (limit > 20) limit = 20;
		if (offset < 0) offset = 0;

		const [dbArticles, articlesCount] = await db.$transaction([
			db.article.findMany({
				where: {
					author: { followers: { some: { id: currentUser.id } } },
				},
				include: getArticleInclude(currentUser.id),
				orderBy: { id: "desc" },
				skip: offset,
				take: limit,
			}),

			db.article.count({
				where: {
					author: { followers: { some: { id: currentUser.id } } },
				},
			}),
		]);

		return {
			articles: dbArticles.map(dbArticleToClientArticle),
			articlesCount,
		};
	}

	async getArticle(slug: string): Promise<Article> {
		const currentUser = await this.#user;

		slug = z.string().parse(slug);
		const id = parseIdFromSlug(slug);

		if (!id) throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");

		const dbArticle = await db.article.findUnique({
			where: { id },
			include: getArticleInclude(currentUser?.id),
		});

		if (!dbArticle) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		return dbArticleToClientArticle(dbArticle);
	}

	async createArticle(article: NewArticle): Promise<Article> {
		const currentUser = await this._ensureUser();

		article = NewArticle.parse(article);

		const dbArticle = await db.article.create({
			data: {
				title: article.title,
				description: article.description,
				body: article.body,
				author: { connect: { id: currentUser.id } },
				tags: {
					create: (article.tagList || []).map((s) => ({
						tagName: s,
					})),
				},
			},
			include: getArticleInclude(currentUser.id),
		});

		return dbArticleToClientArticle(dbArticle);
	}

	async updateArticle(slug: string, article: UpdateArticle): Promise<Article> {
		const currentUser = await this._ensureUser();

		slug = z.string().parse(slug);
		const id = parseIdFromSlug(slug);

		if (!id) throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");

		article = UpdateArticle.parse(article);

		const oldArticle = await db.article.findUnique({
			where: { id },
			select: { authorId: true },
		});

		if (!oldArticle) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		if (oldArticle.authorId !== currentUser.id) {
			throw new ConduitError(StatusCodes.FORBIDDEN, "Forbidden", {
				author: ["should be the same"],
			});
		}

		const dbArticle = await db.article.update({
			where: { id },
			data: {
				title: article.title,
				description: article.description,
				body: article.body,
				tags: article.tagList && {
					deleteMany: { tagName: { notIn: article.tagList } },
					connectOrCreate: article.tagList.map((t) => ({
						create: { tagName: t },
						where: { articleId_tagName: { articleId: id, tagName: t } },
					})),
				},
			},
			include: getArticleInclude(currentUser.id),
		});

		if (!dbArticle) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		return dbArticleToClientArticle(dbArticle);
	}

	async deleteArticle(slug: string): Promise<void> {
		const currentUser = await this._ensureUser();

		slug = z.string().parse(slug);
		const id = parseIdFromSlug(slug);

		if (!id) throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");

		const oldArticle = await db.article.findUnique({
			where: { id },
			select: { authorId: true },
		});

		if (!oldArticle) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		if (oldArticle.authorId !== currentUser.id) {
			throw new ConduitError(StatusCodes.FORBIDDEN, "Forbidden", {
				author: ["should be the same"],
			});
		}

		const deleted = await db.article.delete({
			where: { id },
		});

		if (!deleted) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}
	}

	async addComment(slug: string, comment: string): Promise<Comment> {
		const currentUser = await this._ensureUser();

		slug = z.string().parse(slug);
		const id = parseIdFromSlug(slug);

		if (!id) throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");

		comment = z.string().parse(comment);

		try {
			const dbComment = await db.comment.create({
				data: {
					body: comment,
					articleId: id,
					authorId: currentUser.id,
				},
				include: {
					author: { include: getProfileInclude(currentUser.id) },
				},
			});

			return {
				...dbComment,
				createdAt: dbComment.createdAt.toISOString(),
				updatedAt: dbComment.updatedAt.toISOString(),
				author: dbUserToProfile(dbComment.author),
			};
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2003"
			) {
				throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
			}

			throw error;
		}
	}

	async deleteComment(slug: string, id: number): Promise<void> {
		const currentUser = await this._ensureUser();

		slug = z.string().parse(slug);
		const articleId = parseIdFromSlug(slug);

		if (!articleId) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		id = z.number().int().positive().parse(id);

		const deleted = await db.comment.deleteMany({
			where: { id, authorId: currentUser.id },
		});

		if (!deleted.count) {
			// Was it someone else's comment?
			const comment = await db.comment.findUnique({
				where: { id },
				select: { articleId: true, authorId: true },
			});

			if (!comment) {
				throw new ConduitError(StatusCodes.NOT_FOUND, "Comment not found");
			} else if (comment.articleId !== articleId) {
				throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
			} else {
				throw new ConduitError(StatusCodes.FORBIDDEN, "Forbidden", {
					author: ["should be the same"],
				});
			}
		}
	}

	async favoriteArticle(slug: string): Promise<Article> {
		const currentUser = await this._ensureUser();

		slug = z.string().parse(slug);
		const id = parseIdFromSlug(slug);

		if (!id) throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");

		const article = await db.article.findUnique({ where: { id } });

		if (!article) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		if (article.authorId === currentUser.id) {
			throw new ConduitError(
				StatusCodes.UNPROCESSABLE_ENTITY,
				"You cannot favorite your own article",
				{ user: ["cannot favorite own article"] },
			);
		}

		const dbArticle = await db.article.update({
			where: { id },
			data: {
				favoritedBy: {
					connect: { id: currentUser.id },
				},
			},
			include: getArticleInclude(currentUser.id),
		});

		if (!dbArticle) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		return dbArticleToClientArticle(dbArticle);
	}

	async unfavoriteArticle(slug: string): Promise<Article> {
		const currentUser = await this._ensureUser();

		slug = z.string().parse(slug);
		const id = parseIdFromSlug(slug);

		if (!id) throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");

		const article = await db.article.findUnique({ where: { id } });

		if (!article) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		const dbArticle = await db.article.update({
			where: { id },
			data: {
				favoritedBy: {
					disconnect: { id: currentUser.id },
				},
			},
			include: getArticleInclude(),
		});

		if (!dbArticle) {
			throw new ConduitError(StatusCodes.NOT_FOUND, "Article not found");
		}

		return dbArticleToClientArticle(dbArticle);
	}
}

export async function verifyToken(
	token?: string,
): Promise<UserSummary | undefined> {
	if (!token) return undefined;

	const { SERVER_SECRET } = getEnv();

	const secret =
		typeof atob === "function"
			? Uint8Array.from(atob(SERVER_SECRET), (c) => c.charCodeAt(0))
			: Buffer.from(SERVER_SECRET, "base64");

	try {
		const { payload } = await jwtVerify(token, secret, {
			algorithms: ["HS256"],
		});

		const user = await db.user.findUnique({
			where: { id: payload.id as number },
			select: { id: true, username: true },
		});

		return user ? { ...user, token } : undefined;
	} catch (error) {
		return undefined;
	}
}

type DbArticle = PrismaArticle & {
	author: DbUser;
	tags: {
		tagName: string;
	}[];
	favoritedBy?: unknown[];
	_count?: {
		favoritedBy: number;
	} | null;
};

type DbUser = PrismaUser & {
	followers?: unknown[];
};

function dbArticleToClientArticle(a: DbArticle): Article {
	return {
		slug: slugify(`${a.title}-${a.id}`, { lower: true, strict: true }),
		title: a.title,
		description: a.description,
		body: a.body,
		createdAt: a.createdAt.toISOString(),
		updatedAt: a.updatedAt.toISOString(),
		author: dbUserToProfile(a.author),
		tagList: a.tags.map((tag) => tag.tagName),
		favorited: (a.favoritedBy?.length ?? 0) > 0,
		favoritesCount: a._count?.favoritedBy ?? 0,
	};
}

function dbUserToProfile(u: DbUser): Profile {
	return {
		username: u.username,
		bio: u.bio,
		image: u.image,
		following: (u.followers?.length ?? 0) > 0,
	};
}

function getArticleInclude(userId?: number) {
	return {
		author: { include: getProfileInclude(userId) },
		tags: { select: { tagName: true } },
		favoritedBy: userId
			? { where: { id: userId }, select: { id: true } }
			: false,
		_count: { select: { favoritedBy: true } },
	} as const;
}

function getProfileInclude(userId?: number) {
	return {
		followers: userId ? { where: { id: userId }, select: { id: true } } : false,
	} as const;
}

function parseIdFromSlug(slug: string): number | undefined {
	const lastMinus = slug.lastIndexOf("-");
	if (lastMinus < 0) {
		return undefined;
	}

	const id = Number(slug.slice(lastMinus + 1));
	return Number.isNaN(id) ? undefined : id;
}
