import { describe, it, expect, beforeEach } from "vitest";
import { Article, User } from "~/client/interfaces";
import {
	apiCall,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "./api-test-helpers";

describe("Unfavorite Article API", () => {
	let john: User;
	let article: Article;

	beforeEach(async () => {
		await resetDb();

		john = await registerJohnDoe();

		const r = await apiCall<{ article: Article }>({
			url: "/api/articles",
			method: "POST",
			token: john.token,
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

	it("unfavorites article", async () => {
		const jane = await registerJaneFoo();
		await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "POST",
			token: jane.token,
		});

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "DELETE",
			token: jane.token,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject(article);
	});

	it("allow unfavoriting even if not favorited", async () => {
		const jane = await registerJaneFoo();

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "DELETE",
			token: jane.token,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject(article);
	});

	it("rejects unauthenticated", async () => {
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "DELETE",
		});

		expect(r.status).toBe(401);
	});

	it("allows unfavoriting one's own article", async () => {
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "DELETE",
			token: john.token,
		});

		expect(r.status).toBe(200);
	});

	it("rejects non-existent", async () => {
		const jane = await registerJaneFoo();
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/non-existent-1234/favorite`,
			method: "DELETE",
			token: jane.token,
		});

		expect(r.status).toBe(404);
	});
});
