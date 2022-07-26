import { Article, User } from "~/client/interfaces";
import {
	apiCall,
	formSubmit,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Unfavorite Article", () => {
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

		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/unfavorite`,
			token: jane.token,
			headers: { referer: "/some-weird-address" },
		});

		expect(location).toBe("/some-weird-address");

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			token: jane.token,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject(article);
	});

	it("allow unfavoriting even if not favorited", async () => {
		const jane = await registerJaneFoo();

		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/unfavorite`,
			token: jane.token,
			headers: { referer: "/some-weird-address" },
		});

		expect(location).toBe("/some-weird-address");

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			token: jane.token,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject(article);
	});

	it("rejects unauthenticated", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/unfavorite`,
			headers: { referer: "/some-weird-address" },
		});

		expect(location).toBe("/register");
	});

	it("allows unfavoriting one's own article", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/unfavorite`,
			token: john.token,
			headers: { referer: "/some-weird-address" },
		});

		expect(location).toBe("/some-weird-address");

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			token: john.token,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject(article);
	});

	it("rejects non-existent", async () => {
		const jane = await registerJaneFoo();
		const { location } = await formSubmit({
			url: `/api/form/article/non-existent-1234/unfavorite`,
			token: jane.token,
		});

		expect(location).toBe("/article/non-existent-1234");
	});
});
