import { formSubmit, resetDb } from "../api-test-helpers";

describe("Logout", () => {
	beforeEach(async () => {
		await resetDb();
	});

	it("clears login cookie", async () => {
		const { location, cookies } = await formSubmit({ url: "/api/form/logout" });

		expect(location).toBe("/");

		const authTokenCookie = cookies.find(
			(cookie) => cookie.name === "authToken",
		);

		expect(authTokenCookie).toMatchObject({
			value: "",
			maxAge: 0,
			path: "/",
			sameSite: "Strict",
		});
	});
});
