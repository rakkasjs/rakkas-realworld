import { StatusCodes } from "http-status-codes";
import { Article, Profile } from "lib/api-types";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import slugify from "slugify";
import { Article as PrismaArticle, User } from "@prisma/client";
import { ConduitRequestHandler } from "../middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getArticleInclude(userId?: number) {
	return {
		author: { include: getProfileInclude(userId) },
		tags: { select: { tagName: true } },
		favoritedBy: userId
			? { where: { id: userId }, select: { id: true } }
			: false,
		_count: { select: { favoritedBy: true } },
	} as const;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getProfileInclude(userId?: number) {
	return {
		followers: userId ? { where: { id: userId }, select: { id: true } } : false,
	} as const;
}

type DbArticle = PrismaArticle & {
	author: DbUser;
	tags: {
		tagName: string;
	}[];
	favoritedBy?: unknown[];
	_count: {
		favoritedBy: number;
	} | null;
};

type DbUser = User & {
	followers?: unknown[];
};

export function dbArticleToClientArticle(a: DbArticle): Article {
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

export function dbUserToProfile(u: DbUser): Profile {
	return {
		username: u.username,
		bio: u.bio,
		image: u.image,
		following: (u.followers?.length ?? 0) > 0,
	};
}

export const get: ConduitRequestHandler = async ({
	context: { user, db },
	url,
}) => {
	const tag = url.searchParams.get("tag");
	const author = url.searchParams.get("author");
	const favorited = url.searchParams.get("favorited");
	let limit = Number(url.searchParams.get("limit"));
	let offset = Number(url.searchParams.get("offset"));

	if (!Number.isInteger(limit) || limit <= 0) {
		limit = 20;
	}

	if (!Number.isInteger(offset) || offset <= 0) {
		offset = 0;
	}

	const result = await (favorited
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
						include: getArticleInclude(user?.id),
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
				include: getArticleInclude(user?.id),
		  }));

	if (!result) {
		return { status: 404 };
	}

	const rawArticles =
		"favoriteArticles" in result ? result.favoriteArticles : result;

	const articlesCount = await db.article.count({
		where: {
			favoritedBy: favorited ? { some: { username: favorited } } : undefined,
			author: author ? { username: author } : undefined,
			tags: tag ? { some: { tagName: tag } } : undefined,
		},
	});

	return {
		body: {
			articles: rawArticles.map(dbArticleToClientArticle),
			articlesCount,
		},
	};
};

export const post: ConduitRequestHandler = async ({
	context: { user, db },
	body,
}) => {
	if (!user) {
		return {
			status: StatusCodes.UNAUTHORIZED,
		};
	}

	const r = z
		.object({
			article: z.object({
				title: z.string().nonempty("can't be blank"),
				description: z.string().nonempty("can't be blank"),
				body: z.string().nonempty("can't be blank"),
				tagList: z.array(z.string()),
			}),
		})
		.safeParse(body);

	if (!r.success) {
		return {
			status: StatusCodes.UNPROCESSABLE_ENTITY,
			body: { errors: zodToConduitError(r.error) },
		};
	}

	const seed = r.data.article;

	const rawArticle = await db.article.create({
		data: {
			title: seed.title,
			description: seed.description,
			body: seed.body,
			author: { connect: { id: user.id } },
			tags: {
				create: (seed.tagList || []).map((s) => ({
					tagName: s,
				})),
			},
		},
		include: getArticleInclude(),
	});

	return {
		status: StatusCodes.CREATED,
		body: { article: dbArticleToClientArticle(rawArticle) },
	};
};
