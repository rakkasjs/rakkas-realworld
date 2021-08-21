import { Article, SingleArticleResponse } from "lib/api-types";
import {
	apiCall,
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

	it("deletes article", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "DELETE",
			token: johnsToken,
		});

		expect(r.status).toBe(200);

		const r2 = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
		});
		expect(r2.status).toBe(404);
	});

	it("rejects unauthenticated", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "DELETE",
		});
		expect(r.status).toBe(401);
	});

	it("rejects other users", async () => {
		const jane = await registerJaneFoo();
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			method: "DELETE",
			token: jane.token,
		});
		expect(r.status).toBe(403);
	});

	it("rejects non-existent slug", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: `/api/articles/invalid-slug-1234}`,
			method: "DELETE",
			token: johnsToken,
		});
		expect(r.status).toBe(404);
	});
});
