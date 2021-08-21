import { getReasonPhrase } from "http-status-codes";
import {
	Article,
	Comment,
	CommentResponse,
	LoginUser,
	MultipleCommentsResponse,
	NewArticle,
	NewUser,
	Profile,
	SingleArticleResponse,
	UpdateArticle,
	UpdateUser,
	User,
	UserResponse,
} from "lib/api-types";

export interface TagsResponse {
	tags: string[];
}

export interface ArticlesResponse {
	articles: Article[];
	articlesCount: number;
}

export interface ProfileResponse {
	profile: Profile;
}

interface ArticleOptions {
	tag?: string;
	author?: string;
	favorited?: string;
	offset?: number;
	feed?: boolean;
}

export interface ConduitRequestContext {
	fetch: typeof fetch;
	apiUrl: string;
	user?: User;
}

function getSafeReasonPhrase(status: number) {
	try {
		return getReasonPhrase(status);
	} catch {
		return undefined;
	}
}

export const ARTICLES_PER_PAGE = 20;

export class ConduitError extends Error {
	private readonly issues?: Readonly<Record<string, string[]>>;
	public readonly status?: number;

	constructor(
		status?: number,
		message?: string,
		issues?: Readonly<Record<string, string[]>>,
	) {
		super(
			message ||
				(status && getSafeReasonPhrase(status)) ||
				"An error has occured",
		);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = "ConduitError";
		this.status = status;
		this.issues = issues;
	}

	get messages(): string[] {
		if (!this.issues) return [this.message];

		const messages: string[] = [];
		for (const [field, issues] of Object.entries(this.issues)) {
			for (const issue of issues) {
				messages.push(field + " " + issue);
			}
		}

		return messages;
	}
}

export async function makeRequest(
	{ fetch, ...ctx }: ConduitRequestContext,
	endpoint: string,
	method = "GET",
	body?: unknown,
): Promise<unknown> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (ctx.user) {
		headers.authorization = "Token " + ctx.user.token;
	}

	return await fetch(ctx.apiUrl + endpoint, {
		headers,
		method,
		credentials: "include",
		body:
			body === null || body === undefined ? undefined : JSON.stringify(body),
	})
		.then(async (r) => {
			if (!r.ok) {
				const json = await r.json().catch(() => ({}));
				throw new ConduitError(r.status, r.statusText, json.errors);
			}

			const json = await r.json();
			return json;
		})
		.catch((error) => {
			if (error instanceof ConduitError) throw error;
			console.error(error);
			throw new ConduitError();
		});
}

export async function getCurrentUser(
	ctx: ConduitRequestContext,
): Promise<User | null> {
	if (!ctx.user) return null;

	try {
		const result = (await makeRequest(ctx, "/user")) as UserResponse;
		return result.user;
	} catch (error) {
		if ((error as ConduitError).status === 401) return null;
		throw error;
	}
}

export async function login(
	ctx: ConduitRequestContext,
	user: LoginUser,
): Promise<User> {
	const result = (await makeRequest(ctx, "/users/login", "POST", {
		user,
	})) as UserResponse;

	return result.user;
}

export async function register(
	ctx: ConduitRequestContext,
	user: NewUser,
): Promise<User> {
	const result = (await makeRequest(ctx, "/users", "POST", {
		user,
	})) as UserResponse;

	return result.user;
}

export async function updateUser(
	ctx: ConduitRequestContext,
	user: UpdateUser,
): Promise<User> {
	const result = (await makeRequest(ctx, "/user", "PUT", {
		user,
	})) as UserResponse;

	return result.user;
}

export async function getProfile(
	ctx: ConduitRequestContext,
	userName: string,
): Promise<Profile> {
	const result = (await makeRequest(
		ctx,
		`/profiles/${encodeURIComponent(userName)}`,
	)) as ProfileResponse;

	return result.profile;
}

export async function getTags(ctx: ConduitRequestContext): Promise<string[]> {
	const result = (await makeRequest(ctx, `/tags`)) as TagsResponse;

	return result.tags;
}

export async function getArticles(
	ctx: ConduitRequestContext,
	{ feed, ...options }: ArticleOptions = {},
): Promise<ArticlesResponse> {
	if (options) {
		(Object.keys(options) as Array<keyof typeof options>).forEach((k) => {
			if (options[k] === undefined) delete options[k];
		});
	}

	const query = new URLSearchParams(options as Record<string, string>);
	const result = (await makeRequest(
		ctx,
		(feed ? "/articles/feed?" : "/articles?") + query.toString(),
	)) as ArticlesResponse;

	return result;
}

export async function favorite(
	ctx: ConduitRequestContext,
	slug: string,
): Promise<void> {
	await makeRequest(
		ctx,
		`/articles/${encodeURIComponent(slug)}/favorite`,
		"POST",
	);
}

export async function unfavorite(
	ctx: ConduitRequestContext,
	slug: string,
): Promise<void> {
	await makeRequest(
		ctx,
		`/articles/${encodeURIComponent(slug)}/favorite`,
		"DELETE",
	);
}

export async function createArticle(
	ctx: ConduitRequestContext,
	article: NewArticle,
): Promise<Article> {
	const result = (await makeRequest(ctx, "/articles", "POST", {
		article,
	})) as SingleArticleResponse;

	return result.article;
}

export async function getArticle(
	ctx: ConduitRequestContext,
	slug: string,
): Promise<Article> {
	const result = (await makeRequest(
		ctx,
		`/articles/${encodeURIComponent(slug)}`,
	)) as SingleArticleResponse;

	return result.article;
}

export async function updateArticle(
	ctx: ConduitRequestContext,
	slug: string,
	article: UpdateArticle,
): Promise<Article> {
	const result = (await makeRequest(
		ctx,
		`/articles/${encodeURIComponent(slug)}`,
		"PUT",
		{ article },
	)) as SingleArticleResponse;

	return result.article;
}

export async function deleteArticle(
	ctx: ConduitRequestContext,
	slug: string,
): Promise<void> {
	await makeRequest(ctx, `/articles/${encodeURIComponent(slug)}`, "DELETE");
}

export async function followUser(
	ctx: ConduitRequestContext,
	username: string,
): Promise<Profile> {
	const result = (await makeRequest(
		ctx,
		`/profiles/${encodeURIComponent(username)}/follow`,
		"POST",
	)) as { profile: Profile };

	return result.profile;
}

export async function unfollowUser(
	ctx: ConduitRequestContext,
	username: string,
): Promise<Profile> {
	const result = (await makeRequest(
		ctx,
		`/profiles/${encodeURIComponent(username)}/follow`,
		"DELETE",
	)) as { profile: Profile };

	return result.profile;
}

export async function getComments(
	ctx: ConduitRequestContext,
	articleSlug: string,
): Promise<Comment[]> {
	const result = (await makeRequest(
		ctx,
		`/articles/${encodeURIComponent(articleSlug)}/comments`,
		"GET",
	)) as MultipleCommentsResponse;

	return result.comments;
}

export async function addComment(
	ctx: ConduitRequestContext,
	articleSlug: string,
	commentBody: string,
): Promise<Comment> {
	const result = (await makeRequest(
		ctx,
		`/articles/${encodeURIComponent(articleSlug)}/comments`,
		"POST",
		{ comment: { body: commentBody } },
	)) as CommentResponse;

	return result.comment;
}

export async function deleteComment(
	ctx: ConduitRequestContext,
	articleSlug: string,
	commentId: number,
): Promise<void> {
	await makeRequest(
		ctx,
		`/articles/${encodeURIComponent(articleSlug)}/comments/${commentId}`,
		"DELETE",
	);
}
