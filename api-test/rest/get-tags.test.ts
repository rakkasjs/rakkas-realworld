import { Article } from "lib/interfaces";
import { apiCall, registerJohnDoe, resetDb } from "../api-test-helpers";

describe("", () => {
	it("gets tags in popularity order", async () => {
		await resetDb();
		const john = await registerJohnDoe();

		const tagList = ["aaa", "bbb", "ccc"];

		while (tagList.length) {
			await apiCall<{ article: Article }>({
				url: "/api/articles",
				method: "POST",
				token: john.token,
				data: {
					article: {
						title: "My article title",
						description: "My article description",
						body: "My article body",
						tagList,
					},
				},
			});

			tagList.shift();
		}

		const r = await apiCall<{ tags: string }>({ url: "/api/tags" });

		expect(r.status).toBe(200);
		expect(r.data?.tags).toStrictEqual(["ccc", "bbb", "aaa"]);
	});
});
