import { Article, Comment } from "lib/interfaces";
import {
	apiCall,
	DATE_REGEX,
	expectProfile,
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
		const r = await apiCall<{ comment: Comment }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments`,
			method: "POST",
			token: jane.token,
			data: { comment: { body: "Jane's comment" } },
		});

		expect(r.status).toBe(200);
		expect(r.data?.comment).toMatchObject({
			createdAt: expect.stringMatching(DATE_REGEX),
			updatedAt: expect.stringMatching(DATE_REGEX),
			body: "Jane's comment",
		});
		expect(typeof r.data?.comment.id).toBe("number");
		expectProfile(r.data?.comment.author, { username: "Jane Foo" });
	});

	it("rejects non-existent slug", async () => {
		const jane = await registerJaneFoo();
		const r = await apiCall<{ comment: Comment }>({
			url: `/api/articles/non-existent-1234/comments`,
			method: "POST",
			token: jane.token,
			data: { comment: { body: "Jane's comment" } },
		});
		expect(r.status).toBe(404);
	});

	it("rejects unauthenticated", async () => {
		const r = await apiCall<{ comment: Comment }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments`,
			method: "POST",
			data: { comment: { body: "Jane's comment" } },
		});
		expect(r.status).toBe(401);
	});
});
