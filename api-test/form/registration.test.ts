import { formSubmit, registerJohnDoe, resetDb } from "../api-test-helpers";

describe("Registration form", () => {
	beforeEach(() => resetDb());

	it("registers user", async () => {
		const { location, cookies } = await formSubmit({
			url: "/api/form/register",
			data: {
				username: "John Doe",
				email: "john.doe@example.com",
				password: "topsecret",
			},
		});

		expect(location).toBe("/");

		const authTokenCookie = cookies.find(
			(cookie) => cookie.name === "authToken",
		);

		expect(authTokenCookie).toMatchObject({
			value: expect.stringContaining(""),
			maxAge: 60 * 60 * 24 * 30,
			path: "/",
			sameSite: "Strict",
		});
	});

	describe("rejects duplicate", () => {
		beforeEach(() => registerJohnDoe());

		it("user name", async () => {
			const { location } = await formSubmit({
				url: "/api/form/register",
				data: {
					username: "John Doe",
					email: "not.john.doe@example.com",
					password: "topsecret",
				},
			});

			expect(location).toBe("/register?error=username+is+already+taken");
		});

		it("e-mail address", async () => {
			const { location } = await formSubmit({
				url: "/api/form/register",
				data: {
					username: "Not John Doe",
					email: "john.doe@example.com",
					password: "topsecret",
				},
			});

			expect(location).toBe("/register?error=email+is+already+taken");
		});

		it("user name and e-mail address", async () => {
			const { location } = await formSubmit({
				url: "/api/form/register",
				data: {
					username: "John Doe",
					email: "john.doe@example.com",
					password: "topsecret",
				},
			});

			expect(location).toBe(
				"/register?error=username+is+already+taken&error=email+is+already+taken",
			);
		});
	});

	describe("rejects invalid", () => {
		const user = {
			username: "John Doe",
			email: "john.doe@example.com",
			password: "topsecret",
		};

		const inputs = [
			{
				name: "username",
				data: { ...user, username: "" },
				errors: { username: "can't be blank" },
			},
			{
				name: "email",
				data: { ...user, email: "not-a-valid-email" },
				errors: { email: "is invalid" },
			},
			{
				name: "password",
				data: { ...user, password: "short" },
				errors: { password: "is too short (minimum is 8 characters)" },
			},
			{
				name: "email, username, and password all at once",
				data: {
					username: "",
					email: "invalid-email",
					password: "short",
				},
				errors: {
					username: "can't be blank",
					email: "is invalid",
					password: "is too short (minimum is 8 characters)",
				},
			},
			{
				name: "missing fields",
				data: {},
				errors: {
					username: "Required",
					email: "Required",
					password: "Required",
				},
			},
		];

		inputs.forEach((input) => {
			it(input.name, async () => {
				const { location } = await formSubmit({
					url: "/api/form/register",
					data: input.data as Record<string, string>,
				});

				const params = new URLSearchParams();
				Object.entries(input.errors).forEach(([k, v]) =>
					params.append("error", k + " " + v),
				);

				expect(location).toBe("/register?" + params.toString());
			});
		});
	});
});
