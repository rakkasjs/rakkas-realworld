import { Article } from "~/client/interfaces";
import {
	apiCall,
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

	it("deletes article", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/delete`,
			token: johnsToken,
		});

		expect(location).toBe("/");

		const r = await apiCall<{ article: Article }>({
			url: `/api/articles/${encodeURIComponent(article.slug)}`,
		});
		expect(r.status).toBe(404);
	});

	it("rejects unauthenticated", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/delete`,
		});

		expect(location).toBe("/register");
	});

	it("rejects other users", async () => {
		const jane = await registerJaneFoo();
		const { location } = await formSubmit({
			url: `/api/form/article/${encodeURIComponent(article.slug)}/delete`,
			token: jane.token,
		});

		expect(location).toBe(
			`/article/${encodeURIComponent(
				article.slug,
			)}?error=author+should+be+the+same`,
		);
	});

	it("rejects non-existent slug", async () => {
		const { location } = await formSubmit({
			url: `/api/form/article/invalid-slug-1234/delete`,
			token: johnsToken,
		});

		expect(location).toBe(`/article/invalid-slug-1234`);
	});
});
