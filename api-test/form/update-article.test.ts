import { Article } from "~/client/interfaces";
import {
	apiCall,
	DATE_REGEX,
	formSubmit,
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

		const r = await apiCall<{ article: Article }>({
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
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}`,
			token: johnsToken,
			data: {
				title: "My updated article title",
				description: article.description,
				body: article.body,
				tagList: "aaa bbb ccc",
			},
		});

		expect(location).toMatch(/^\/article\/my-updated-article-title-/);

		const newSlug = location.slice("/article/".length);
		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(newSlug)}`,
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
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}`,
			token: johnsToken,
			data: {
				title: article.title,
				description: "My updated article description",
				body: article.body,
				tagList: "aaa bbb ccc",
			},
		});

		expect(location).toMatch(new RegExp(`^\\/article\\/${article.slug}`));

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			updatedAt: expect.stringMatching(DATE_REGEX),
			description: "My updated article description",
		});
	});

	it("updates body", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}`,
			token: johnsToken,
			data: {
				title: article.title,
				description: article.description,
				body: "My updated article body",
				tagList: "aaa bbb ccc",
			},
		});

		expect(location).toBe(`/article/${article.slug}`);

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			updatedAt: expect.stringMatching(DATE_REGEX),
			body: "My updated article body",
		});
	});

	it("updates tags", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}`,
			token: johnsToken,
			data: {
				title: article.title,
				description: article.description,
				body: article.body,
				tagList: "aaa yyy zzz",
			},
		});

		expect(location).toMatch(new RegExp(`^\\/article\\/${article.slug}`));

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
		});

		expect(r.status).toBe(200);
		expect(r.data?.article).toMatchObject({
			...article,
			updatedAt: expect.stringMatching(DATE_REGEX),
			tagList: ["aaa", "yyy", "zzz"],
		});
	});

	it("rejects unauthenticated", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}`,
			data: {
				title: article.title,
				description: article.description,
				body: "My updated article body",
				tagList: "aaa bbb ccc",
			},
		});

		expect(location).toBe("/register");
	});

	it("rejects other users", async () => {
		const jane = await registerJaneFoo();
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}`,
			token: jane.token,
			data: {
				title: article.title,
				description: article.description,
				body: "My updated article body",
				tagList: "aaa bbb ccc",
			},
		});

		expect(location).toBe(
			`/editor/${article.slug}?error=author+should+be+the+same`,
		);
	});

	it("rejects non-existent slug", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/invalid-slug-1234`,
			token: johnsToken,
			data: {
				title: article.title,
				description: article.description,
				body: "My updated article body",
				tagList: "aaa bbb ccc",
			},
		});

		expect(location).toBe(`/editor/invalid-slug-1234`);
	});
});
