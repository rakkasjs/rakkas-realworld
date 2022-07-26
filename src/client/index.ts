import {
	Article,
	ArticleList,
	Comment,
	ConduitAuthInterface,
	ConduitInterface,
	ListArticlesOptions,
	LoginCredentials,
	NewArticle,
	NewUser,
	PaginationOptions,
	Profile,
	UpdateArticle,
	UpdateUser,
	User,
} from "./interfaces";
import { ConduitError } from "~/lib/conduit-error";
import { url } from "~/lib/utils";

class RestClient {
	#fetch: typeof window.fetch;
	#apiUrl: string;

	token?: string;

	public constructor(
		fetch: typeof window.fetch,
		apiUrl: string,
		token?: string,
	) {
		this.#fetch = fetch;
		this.#apiUrl = apiUrl;
		this.token = token;
	}

	private async _doFetch(input: RequestInfo, init?: RequestInit) {
		let delay = 300;
		for (let retries = 1; retries <= 5; ++retries) {
			const result = await this.#fetch(input, init)
				.then(async (r) => {
					if (!r.ok) {
						const json = await r.json().catch(() => ({}));
						throw new ConduitError(r.status, r.statusText, json.errors);
					}

					const text = await r.text();

					if (!text) return;

					return JSON.parse(text);
				})
				.catch((error) => {
					if (error instanceof ConduitError) {
						// Don't retry on client error
						if (error.status && error.status >= 400 && error.status < 500) {
							throw error;
						}

						return error;
					}

					return new ConduitError();
				});

			if (!(result instanceof ConduitError)) return result;

			await new Promise((resolve) => setTimeout(resolve, delay));
			delay *= 1.5;

			if (retries === 5) throw result;
		}
	}

	protected async _makeRequest<T>(
		endpoint: string,
		method = "GET",
		body?: unknown,
	): Promise<T> {
		const init: RequestInit = {
			headers: {
				"Content-Type": "application/json",
			},
			method,
			body:
				body === null || body === undefined ? undefined : JSON.stringify(body),
		};

		if (this.token) {
			(
				init.headers as Record<string, string>
			).authorization = `Token ${this.token}`;

			// Cloudflare workers throw when a value is provided for credentials
			if (!import.meta.env.SSR) {
				init.credentials = "include";
			}
		}

		return this._doFetch(this.#apiUrl + endpoint, init);
	}
}

export class ConduitAuthClient
	extends RestClient
	implements ConduitAuthInterface
{
	async register(user: NewUser): Promise<User> {
		const result = await this._makeRequest<{ user: User }>("/users", "POST", {
			user,
		});

		return result.user;
	}

	async login(credentials: LoginCredentials): Promise<User> {
		const result = await this._makeRequest<{ user: User }>(
			"/users/login",
			"POST",
			{
				user: credentials,
			},
		);

		return result.user;
	}

	async updateUser(user: UpdateUser): Promise<User> {
		if (!this.token) throw new ConduitError(401, "Not logged in");

		const result = await this._makeRequest<{ user: User }>("/user", "PUT", {
			user,
		});

		return result.user;
	}
}

export class ConduitClient extends RestClient implements ConduitInterface {
	async getComments(slug: string): Promise<Comment[]> {
		const result = await this._makeRequest<{ comments: Comment[] }>(
			url`/articles/${slug}/comments`,
		);

		return result.comments;
	}

	async getTags(): Promise<string[]> {
		const result = await this._makeRequest<{ tags: string[] }>(`/tags`);

		return result.tags;
	}

	async getCurrentUser(): Promise<User> {
		const result = await this._makeRequest<{ user: User }>("/user");

		return result.user;
	}

	async getProfile(username: string): Promise<Profile> {
		const result = await this._makeRequest<{ profile: Profile }>(
			url`/profiles/${username}`,
		);

		return result.profile;
	}

	async followUser(username: string): Promise<Profile> {
		const result = await this._makeRequest<{ profile: Profile }>(
			url`/profiles/${username}/follow`,
			"POST",
		);

		return result.profile;
	}

	async unfollowUser(username: string): Promise<Profile> {
		const result = await this._makeRequest<{ profile: Profile }>(
			url`/profiles/${username}/follow`,
			"DELETE",
		);

		return result.profile;
	}

	async listArticles(options: ListArticlesOptions): Promise<ArticleList> {
		const query = encodeQueryParams(options);

		return this._makeRequest<ArticleList>("/articles" + query);
	}

	async feedArticles(options: PaginationOptions): Promise<ArticleList> {
		const query = encodeQueryParams(options);

		return this._makeRequest<ArticleList>("/articles/feed" + query);
	}

	async createArticle(article: NewArticle): Promise<Article> {
		const result = await this._makeRequest<{ article: Article }>(
			"/articles",
			"POST",
			{ article },
		);

		return result.article;
	}

	async getArticle(slug: string): Promise<Article> {
		const result = await this._makeRequest<{ article: Article }>(
			url`/articles/${slug}`,
		);

		return result.article;
	}

	async updateArticle(slug: string, article: UpdateArticle): Promise<Article> {
		const result = await this._makeRequest<{ article: Article }>(
			url`/articles/${slug}`,
			"PUT",
			{ article },
		);

		return result.article;
	}

	async deleteArticle(slug: string): Promise<void> {
		await this._makeRequest(url`/articles/${slug}`, "DELETE");
	}

	async addComment(slug: string, comment: string): Promise<Comment> {
		const result = await this._makeRequest<{ comment: Comment }>(
			url`/articles/${slug}/comments`,
			"POST",
			{ comment: { body: comment } },
		);

		return result.comment;
	}

	async deleteComment(slug: string, id: number): Promise<void> {
		await this._makeRequest(url`/articles/${slug}/comments/${id}`, "DELETE");
	}

	async favoriteArticle(slug: string): Promise<Article> {
		const result = await this._makeRequest<{ article: Article }>(
			url`/articles/${slug}/favorite`,
			"POST",
		);

		return result.article;
	}

	async unfavoriteArticle(slug: string): Promise<Article> {
		const result = await this._makeRequest<{ article: Article }>(
			url`/articles/${slug}/favorite`,
			"DELETE",
		);

		return result.article;
	}
}

/** Encode query params */
function encodeQueryParams(
	params: Record<string, string | number | undefined>,
): string {
	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			query.set(key, value.toString());
		}
	}

	const str = query.toString();

	return str ? `?${str}` : "";
}
