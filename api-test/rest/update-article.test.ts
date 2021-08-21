import { Article, SingleArticleResponse } from "lib/api-types";
import {
	apiCall,
	DATE_REGEX,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Update Article API", () => {
	let article: Article;
	let johnsToken: string;

	beforeEach(async () => {
		await resetDb();

		const john = await registerJohnDoe();
		johnsToken = john.token;

		const r = await apiCall<SingleArticleResponse>({
			url: "/api/articles",
			method: "POST",
			token: johnsToken,
			data: {
				article: {
					title: "My article title",
					description: "My article description",
					body: "My article body",
					tagList: ["aaa", "bbb", "ccc"],
				},
			},
		});

		if (!r.ok) {
			console.error(r.status, r.error);
			throw new Error("Could not create article");
		}

		article = r.data.article;
	});

	it("updates title", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "PUT",
			token: johnsToken,
			data: { article: { title: "My updated article title" } },
		});
		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			updatedAt: expect.stringMatching(DATE_REGEX),
			title: "My updated article title",
			slug: expect.stringMatching(/^my-updated-article-title-/),
		});
	});

	it("updates description", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "PUT",
			token: johnsToken,
			data: { article: { description: "My updated article description" } },
		});
		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			updatedAt: expect.stringMatching(DATE_REGEX),
			description: "My updated article description",
		});
	});

	it("updates body", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "PUT",
			token: johnsToken,
			data: { article: { body: "My updated article body" } },
		});
		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			updatedAt: expect.stringMatching(DATE_REGEX),
			body: "My updated article body",
		});
	});

	it("updates tags", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "PUT",
			token: johnsToken,
			data: { article: { tagList: ["aaa", "yyy", "zzz"] } },
		});
		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			updatedAt: expect.stringMatching(DATE_REGEX),
			tagList: ["aaa", "yyy", "zzz"],
		});
	});

	it("rejects unauthenticated", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "PUT",
			data: { article: { body: "My updated article body" } },
		});
		expect(r.status).toBe(401);
	});

	it("rejects other users", async () => {
		const jane = await registerJaneFoo();
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "PUT",
			data: { article: { body: "My updated article body" } },
			token: jane.token,
		});
		expect(r.status).toBe(403);
	});

	it("rejects non-existent slug", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/invalid-slug-1234}`,
			method: "PUT",
			token: johnsToken,
			data: { article: { body: "My updated article body" } },
		});
		expect(r.status).toBe(404);
	});
});
