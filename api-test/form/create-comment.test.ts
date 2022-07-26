import { Article, Comment } from "~/client/interfaces";
import {
	apiCall,
	DATE_REGEX,
	expectProfile,
	formSubmit,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Add Comments to an Article API", () => {
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

	it("adds comment", async () => {
		const jane = await registerJaneFoo();
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/comment`,
			token: jane.token,
			data: { body: "Jane's comment" },
		});

		expect(location).toBe(`/article/${article.slug}`);

		const r = await apiCall<{ comments: Comment[] }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments`,
		});

		expect(r.status).toBe(200);
		expect(r.data?.comments?.length).toBe(1);
		expect(r.data?.comments[0]).toMatchObject({
			createdAt: expect.stringMatching(DATE_REGEX),
			updatedAt: expect.stringMatching(DATE_REGEX),
			body: "Jane's comment",
		});
		expect(typeof r.data?.comments[0].id).toBe("number");
		expectProfile(r.data?.comments[0].author, { username: "Jane Foo" });
	});

	it("rejects non-existent slug", async () => {
		const jane = await registerJaneFoo();
		const { location } = await formSubmit({
			url: "/api/form/article/non-existent-1234/comment",
			token: jane.token,
			data: { body: "Jane's comment" },
		});

		expect(location).toBe("/article/non-existent-1234");
	});

	it("rejects unauthenticated", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/comment`,
			data: { body: "Jane's comment" },
		});

		expect(location).toBe("/register");
	});
});
