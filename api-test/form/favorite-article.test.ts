import { Article, User } from "~/client/interfaces";
import {
	apiCall,
	formSubmit,
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
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/favorite`,
			token: jane.token,
		});

		expect(location).toBe(`/article/${encodeURIComponent(article.slug)}`);

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
			token: jane.token,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			favorited: true,
			favoritesCount: 1,
		});
	});

	it("redirects to referer", async () => {
		const jane = await registerJaneFoo();
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/favorite`,
			token: jane.token,
			headers: { referer: "/" },
		});

		expect(location).toBe("/");
	});

	it("allow favoriting twice", async () => {
		const jane = await registerJaneFoo();
		await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/favorite`,
			method: "POST",
			token: jane.token,
		});

		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/favorite`,
			token: jane.token,
		});

		expect(location).toBe(`/article/${encodeURIComponent(article.slug)}`);

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
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
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/favorite`,
		});

		expect(location).toBe(`/register`);
	});

	it("rejects favoriting one's own article", async () => {
		await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/favorite`,
			token: john.token,
		});

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
			url: `/api/form/article/non-existent-1234/favorite`,
			token: jane.token,
		});

		expect(location).toBe("/article/non-existent-1234");
	});
});
