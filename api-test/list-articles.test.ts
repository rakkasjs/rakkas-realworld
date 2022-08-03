import { describe, it, expect, beforeAll } from "vitest";
import { ArticleList, User } from "~/client/interfaces";
import {
	apiCall,
	DATE_REGEX,
	expectProfile,
	resetDb,
} from "./api-test-helpers";

describe("List Articles API", () => {
	let janesToken: string;
	let slugs: string[];

	beforeAll(async () => {
		await resetDb();

		const r = await apiCall<{ john: User; jane: User; slugs: string[] }>({
			url: "/api/test/populate-2",
			method: "POST",
		});

		if (!r.ok) {
			console.error(r.status, r.error);
			throw new Error("Could not populate database");
		}

		slugs = r.data.slugs;
		janesToken = r.data.jane.token;
	});

	it("lists last 20 articles", async () => {
		const r = await apiCall<ArticleList>({ url: "/api/articles" });

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(50);

		expect(r.data?.articles.length).toBe(20);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				slug: expect.stringMatching(/^janes-article-/),
				title: `Jane's article #${49 - i} title`,
				description: `Jane's article #${49 - i} description`,
				body: `Jane's article #${49 - i} body`,
				tagList: ["Jane", `x${Math.floor((49 - i) / 10)}`, `y${(49 - i) % 10}`],
				createdAt: expect.stringMatching(DATE_REGEX),
				updatedAt: expect.stringMatching(DATE_REGEX),
				favorited: false,
				favoritesCount: 0,
			});

			expectProfile(article.author, { username: "Jane Foo" });
		});
	});

	it("honors limit parameter", async () => {
		const r = await apiCall<ArticleList>({
			url: "/api/articles?limit=10",
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(50);

		expect(r.data?.articles.length).toBe(10);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				slug: expect.stringMatching(/^janes-article-/),
				title: `Jane's article #${49 - i} title`,
				description: `Jane's article #${49 - i} description`,
				body: `Jane's article #${49 - i} body`,
				tagList: ["Jane", `x${Math.floor((49 - i) / 10)}`, `y${(49 - i) % 10}`],
				createdAt: expect.stringMatching(DATE_REGEX),
				updatedAt: expect.stringMatching(DATE_REGEX),
				favorited: false,
				favoritesCount: 0,
			});

			expectProfile(article.author, { username: "Jane Foo" });
		});
	});

	it("doesn't allow limit to be greater than 20", async () => {
		const r = await apiCall<ArticleList>({
			url: "/api/articles?limit=50",
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(50);

		expect(r.data?.articles.length).toBe(20);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				slug: expect.stringMatching(/^janes-article-/),
				title: `Jane's article #${49 - i} title`,
				description: `Jane's article #${49 - i} description`,
				body: `Jane's article #${49 - i} body`,
				tagList: ["Jane", `x${Math.floor((49 - i) / 10)}`, `y${(49 - i) % 10}`],
				createdAt: expect.stringMatching(DATE_REGEX),
				updatedAt: expect.stringMatching(DATE_REGEX),
				favorited: false,
				favoritesCount: 0,
			});

			expectProfile(article.author, { username: "Jane Foo" });
		});
	});

	it("honors offset parameter", async () => {
		const r = await apiCall<ArticleList>({
			url: "/api/articles?offset=40",
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(50);

		expect(r.data?.articles.length).toBe(10);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				slug: expect.stringMatching(/^johns-article-/),
				title: `John's article #${9 - i} title`,
				description: `John's article #${9 - i} description`,
				body: `John's article #${9 - i} body`,
				tagList: ["John", `x${Math.floor((9 - i) / 10)}`, `y${(9 - i) % 10}`],
				createdAt: expect.stringMatching(DATE_REGEX),
				updatedAt: expect.stringMatching(DATE_REGEX),
				favorited: false,
				favoritesCount: 0,
			});

			expectProfile(article.author);
		});
	});

	it("honors tag parameter", async () => {
		const r = await apiCall<ArticleList>({
			url: "/api/articles?tag=x4",
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(10);

		expect(r.data?.articles.length).toBe(10);

		r.data?.articles.forEach((article) => {
			expect(article).toMatchObject({
				tagList: expect.arrayContaining(["x4"]),
			});
		});
	});

	it("honors favorited parameter", async () => {
		// Jane favorites 21 of John's articles
		for (let i = 0; i < 21; i++) {
			await apiCall({
				url: `/api/articles/${encodeURIComponent(slugs[i])}/favorite`,
				method: "POST",
				token: janesToken,
			});
		}

		const r = await apiCall<ArticleList>({
			url: "/api/articles?favorited=Jane%20Foo",
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(21);

		expect(r.data?.articles.length).toBe(20);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				slug: expect.stringMatching(/^johns-article-/),
				title: `John's article #${20 - i} title`,
				description: `John's article #${20 - i} description`,
				body: `John's article #${20 - i} body`,
				tagList: ["John", `x${Math.floor((20 - i) / 10)}`, `y${(20 - i) % 10}`],
				createdAt: expect.stringMatching(DATE_REGEX),
				updatedAt: expect.stringMatching(DATE_REGEX),
				favorited: false,
				favoritesCount: 1,
			});

			expectProfile(article.author);
		});
	});

	it("rejects unknown user for favorited parameter", async () => {
		const r = await apiCall({ url: "/api/articles?favorited=Nope" });
		expect(r.status).toBe(404);
	});
});
