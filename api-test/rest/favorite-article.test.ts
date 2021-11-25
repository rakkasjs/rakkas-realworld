import { Article, User } from "lib/interfaces";
import {
	apiCall,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Favorite Article API", () => {
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

	it("favorites article", async () => {
		const jane = await registerJaneFoo();
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "POST",
			token: jane.token,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			favorited: true,
			favoritesCount: 1,
		});
	});

	it("allow favoriting twice", async () => {
		const jane = await registerJaneFoo();

		await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "POST",
			token: jane.token,
		});

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "POST",
			token: jane.token,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			favorited: true,
			favoritesCount: 1,
		});
	});

	it("rejects unauthenticated", async () => {
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "POST",
		});

		expect(r.status).toBe(401);
	});

	it("rejects favoriting one's own article", async () => {
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "POST",
			token: john.token,
		});

		expect(r.status).toBe(422);
	});

	it("rejects non-existent", async () => {
		const jane = await registerJaneFoo();
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/non-existent-1234/favorite`,
			method: "POST",
			token: jane.token,
		});

		expect(r.status).toBe(404);
	});
});
