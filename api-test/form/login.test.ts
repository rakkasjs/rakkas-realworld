import { formSubmit, registerJohnDoe, resetDb } from "../api-test-helpers";

describe("Login form", () => {
	beforeEach(async () => {
		await resetDb();
		await registerJohnDoe();
	});

	it("authenticates user with correct credentials", async () => {
		const { location, cookies } = await formSubmit({
			url: "/api/form/login",
			data: {
				email: "john.doe@example.com",
				password: "topsecret",
			},
		});

		expect(location).toBe("/");

		const authTokenCookie = cookies.find(
			(cookie) => cookie.name === "authToken",
		);

		expect(authTokenCookie).toMatchObject({
			maxAge: 60 * 60 * 24 * 30,
			path: "/",
			sameSite: "Strict",
		});
	});

	it("rejects incorrect email", async () => {
		const { location } = await formSubmit({
			url: "/api/form/login",
			data: {
				email: "not.john.doe@example.com",
				password: "topsecret",
			},
		});

		expect(location).toBe("/login?error=email+or+password+is+incorrect");
	});

	it("rejects incorrect password", async () => {
		const { location } = await formSubmit({
			url: "/api/form/login",
			data: {
				email: "john.doe@example.com",
				password: "incorrect",
			},
		});

		expect(location).toBe("/login?error=email+or+password+is+incorrect");
	});

	it("reports missing fields", async () => {
		const { location } = await formSubmit({
			url: "/api/form/login",
			data: {},
		});

		expect(location).toBe(
			"/login?error=email+Required&error=password+Required",
		);
	});
});
