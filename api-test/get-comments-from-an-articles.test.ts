import { describe, it, expect, beforeEach } from "vitest";
import { Article, Comment } from "~/client/interfaces";
import {
	apiCall,
	DATE_REGEX,
	expectProfile,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "./api-test-helpers";

describe("Get Comments from an Article API", () => {
	let article: Article;

	beforeEach(async () => {
		await resetDb();

		const john = await registerJohnDoe();

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

		const jane = await registerJaneFoo();
		await apiCall<{ comment: Comment }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments`,
			method: "POST",
			token: jane.token,
			data: { comment: { body: "Jane's comment" } },
		});
	});

	it("gets comments", async () => {
		const r = await apiCall<{ comments: Comment[] }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments`,
		});

		expect(r.status).toBe(200);
		expect(r.data?.comments.length).toBe(1);
		const comment = r.data?.comments[0];

		expect(comment).toMatchObject({
			createdAt: expect.stringMatching(DATE_REGEX),
			updatedAt: expect.stringMatching(DATE_REGEX),
			body: "Jane's comment",
		});
		expect(typeof comment?.id).toBe("number");
		expectProfile(comment?.author, { username: "Jane Foo" });
	});

	it("rejects non-existent slug", async () => {
		const r = await apiCall<{ comment: Comment }>({
			url: `/api/articles/non-existent-1234/comments`,
		});
		expect(r.status).toBe(404);
	});
});
