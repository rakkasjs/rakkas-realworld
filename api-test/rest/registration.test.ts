import { User } from "lib/interfaces";
import {
	apiCall,
	expectUser,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Registration API", () => {
	beforeEach(() => resetDb());

	it("registers user", async () => {
		const r = await apiCall<{ user: User }>({
			url: "/api/users",
			method: "POST",
			data: {
				user: {
					username: "John Doe",
					email: "john.doe@example.com",
					password: "topsecret",
				},
			},
		});

		expect(r.status).toBe(201);
		expectUser(r.data?.user);
	});

	describe("rejects duplicate", () => {
		beforeEach(() => registerJohnDoe());

		it("user name", async () => {
			const r = await apiCall<{ user: User }>({
				url: "/api/users",
				method: "POST",
				data: {
					user: {
						username: "John Doe",
						email: "not.john.doe@example.com",
						password: "topsecret",
					},
				},
			});

			expect(r.status).toBe(422);
			expect(r.error).toMatchObject({
				errors: { username: ["is already taken"] },
			});
		});

		it("e-mail address", async () => {
			const r = await apiCall<{ user: User }>({
				url: "/api/users",
				method: "POST",
				data: {
					user: {
						username: "Not John Doe",
						email: "john.doe@example.com",
						password: "topsecret",
					},
				},
			});

			expect(r.status).toBe(422);
			expect(r.error).toMatchObject({
				errors: { email: ["is already taken"] },
			});
		});

		it("user name and e-mail address", async () => {
			const r = await apiCall<{ user: User }>({
				url: "/api/users",
				method: "POST",
				data: {
					user: {
						username: "John Doe",
						email: "john.doe@example.com",
						password: "topsecret",
					},
				},
			});

			expect(r.status).toBe(422);
			expect(r.error).toMatchObject({
				errors: { username: ["is already taken"], email: ["is already taken"] },
			});
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
				data: { user: { ...user, username: "" } },
				errors: { username: ["can't be blank"] },
			},
			{
				name: "email",
				data: { user: { ...user, email: "not-a-valid-email" } },
				errors: { email: ["is invalid"] },
			},
			{
				name: "password",
				data: { user: { ...user, password: "short" } },
				errors: { password: ["is too short (minimum is 8 characters)"] },
			},
			{
				name: "email, username, and password all at once",
				data: {
					user: { username: "", email: "invalid-email", password: "short" },
				},
				errors: {
					username: ["can't be blank"],
					email: ["is invalid"],
					password: ["is too short (minimum is 8 characters)"],
				},
			},
			{
				name: "missing fields",
				data: {
					user: {},
				},
				errors: {
					username: ["Required"],
					email: ["Required"],
					password: ["Required"],
				},
			},
		];

		inputs.forEach((input) => {
			it(input.name, async () => {
				const r = await apiCall<{ user: User }>({
					url: "/api/users",
					method: "POST",
					data: input.data,
				});

				expect(r.status).toBe(422);
				expect(r.error).toMatchObject({ errors: input.errors });
			});
		});
	});
});
