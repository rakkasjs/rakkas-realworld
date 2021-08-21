import {
	Article,
	Comment,
	CommentResponse,
	MultipleCommentsResponse,
	SingleArticleResponse,
	User,
} from "lib/api-types";
import {
	apiCall,
	formSubmit,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Delete Comment API", () => {
	let john: User;
	let jane: User;
	let article: Article;
	let comment: Comment;

	beforeEach(async () => {
		await resetDb();

		john = await registerJohnDoe();

		const r = await apiCall<SingleArticleResponse>({
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
		const r2 = await apiCall<CommentResponse>({
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
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(
				article.slug,
			)}/delete-comment-${comment.id}`,
			token: jane.token,
		});

		expect(location).toBe(`/article/${encodeURIComponent(article.slug)}`);

		const r = await apiCall<MultipleCommentsResponse>({
			url: `/api/articles/${encodeURIComponent(article.slug)}/comments`,
		});

		expect(r.status).toBe(200);
		expect(r.data?.comments.length).toBe(0);
	});

	it("rejects unauthenticated", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(
				article.slug,
			)}/delete-comment-${comment.id}`,
		});

		expect(location).toBe("/register");
	});

	it("rejects other users", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(
				article.slug,
			)}/delete-comment-${comment.id}`,
			token: john.token,
		});

		expect(location).toBe(
			`/article/${encodeURIComponent(
				article.slug,
			)}?error=author+should+be+the+same`,
		);
	});

	it("rejects non-existent-slug", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/invalid-slug-1234/delete-comment-${comment.id}`,
			token: jane.token,
		});

		expect(location).toBe("/article/invalid-slug-1234");
	});

	it("rejects non-existent comment ID", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(
				article.slug,
			)}/delete-comment-${comment.id + 1}`,
			token: jane.token,
		});

		expect(location).toBe(`/article/${encodeURIComponent(article.slug)}`);
	});
});
