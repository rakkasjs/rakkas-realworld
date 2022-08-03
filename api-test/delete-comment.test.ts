import { describe, it, expect, beforeEach } from "vitest";
import { Article, Comment, User } from "~/client/interfaces";
import {
	apiCall,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "./api-test-helpers";

describe("Delete Comment API", () => {
	let john: User;
	let jane: User;
	let article: Article;
	let comment: Comment;

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

		jane = await registerJaneFoo();
		const r2 = await apiCall<{ comment: Comment }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments`,
			method: "POST",
			token: jane.token,
			data: { comment: { body: "Jane's comment" } },
		});

		if (!r2.ok) {
			console.error(r2.status, r2.error);
			throw new Error("Could not create comment");
		}

		comment = r2.data.comment;
	});

	it("deletes comment", async () => {
		const r = await apiCall<{ comments: Comment[] }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments/${
				comment.id
			}`,
			method: "DELETE",
			token: jane.token,
		});

		expect(r.status).toBe(200);

		const r2 = await apiCall<{ comments: Comment[] }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments`,
		});

		expect(r2.status).toBe(200);
		expect(r2.data?.comments.length).toBe(0);
	});

	it("rejects unauthenticated", async () => {
		const r = await apiCall<{ comment: Comment }>({
			url: `/api/articles/${article.slug}/comments/${comment.id}`,
			method: "DELETE",
		});
		expect(r.status).toBe(401);
	});

	it("rejects other users", async () => {
		const r = await apiCall<{ comment: Comment }>({
			url: `/api/articles/${article.slug}/comments/${comment.id}`,
			method: "DELETE",
			token: john.token,
		});
		expect(r.status).toBe(403);
	});

	it("rejects non-existent-slug", async () => {
		const r = await apiCall<{ comment: Comment }>({
			url: `/api/articles/non-existent-1234/comments/${comment.id}`,
			method: "DELETE",
			token: john.token,
		});
		expect(r.status).toBe(404);
	});

	it("rejects non-existent comment ID", async () => {
		const r = await apiCall<{ comment: Comment }>({
			url: `/api/articles/${article.slug}/comments/1234`,
			method: "DELETE",
			token: jane.token,
		});
		expect(r.status).toBe(404);
	});
});
