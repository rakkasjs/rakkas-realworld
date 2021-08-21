import { SingleArticleResponse } from "lib/api-types";
import {
	apiCall,
	DATE_REGEX,
	expectProfile,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Create Article API", () => {
	beforeEach(() => resetDb());

	const article = {
		title: "My article title",
		description: "My article description",
		body: "My article body",
		tagList: ["aaa", "bbb", "ccc"],
	};

	it("creates an article", async () => {
		const { token } = await registerJohnDoe();
		const r = await apiCall<SingleArticleResponse>({
			url: "/api/articles",
			method: "POST",
			token,
			data: { article },
		});

		expect(r.status).toBe(201);
		expect(r.data?.article).toMatchObject({
			slug: expect.stringMatching(/^my-article-title-/),
			title: "My article title",
			description: "My article description",
			body: "My article body",
			tagList: ["aaa", "bbb", "ccc"],
			createdAt: expect.stringMatching(DATE_REGEX),
			updatedAt: expect.stringMatching(DATE_REGEX),
			favorited: false,
			favoritesCount: 0,
		});
		expectProfile(r.data?.article.author);
	});

	it("rejects aunauthenticated", async () => {
		const r = await apiCall<SingleArticleResponse>({
			url: "/api/articles",
			method: "POST",
			data: { article },
		});

		expect(r.status).toBe(401);
	});

	const props = ["title", "description", "body"];
	for (const prop of props) {
		it(`rejects empty ${prop}`, async () => {
			const { token } = await registerJohnDoe();
			const r = await apiCall<SingleArticleResponse>({
				url: "/api/articles",
				method: "POST",
				data: { article: { ...article, [prop]: "" } },
				token,
			});

			expect(r.status).toBe(422);
			expect(r.error).toMatchObject({ errors: { [prop]: ["can't be blank"] } });
		});
	}
});
