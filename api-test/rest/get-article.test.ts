import { describe, it, expect, beforeEach } from "vitest";
import { Article } from "~/client/interfaces";
import { apiCall, registerJohnDoe, resetDb } from "../api-test-helpers";

describe("Get Article API", () => {
	let article: Article;

	beforeEach(async () => {
		await resetDb();
		const { token } = await registerJohnDoe();
		const r = await apiCall<{ article: Article }>({
			url: "/api/articles",
			method: "POST",
			token,
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

	it("gets article", async () => {
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
		});
		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject(article);
	});

	it("rejects non-existent slug", async () => {
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/invalid-slug-1234}`,
		});
		expect(r.status).toBe(404);
	});
});
