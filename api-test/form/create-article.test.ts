import { formSubmit, registerJohnDoe, resetDb } from "../api-test-helpers";

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
		const { location } = await formSubmit({
			url: "/api/form/article",
			data: { ...article, tagList: article.tagList.join(" ") },
			token,
		});

		expect(location).toMatch(/^\/article\/my-article-title-/);
	});

	it("rejects aunauthenticated", async () => {
		const { location } = await formSubmit({
			url: "/api/form/article",
			data: { ...article, tagList: article.tagList.join(" ") },
		});

		expect(location).toBe("/register");
	});

	const props = ["title", "description", "body"];
	for (const prop of props) {
		it(`rejects empty ${prop}`, async () => {
			const { token } = await registerJohnDoe();
			const { location } = await formSubmit({
				url: "/api/form/article",
				data: { ...article, tagList: article.tagList.join(" "), [prop]: "" },
				token,
			});

			expect(location).toBe(`/editor?error=${prop}+can%27t+be+blank`);
		});
	}
});
