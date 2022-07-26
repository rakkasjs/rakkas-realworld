import { describe, it, expect, beforeEach } from "vitest";
import { User } from "~/client/interfaces";
import {
	apiCall,
	expectUser,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Update User API", () => {
	beforeEach(async () => {
		await resetDb();
	});

	const updateInputs = [
		{ name: "email", data: { email: "updated@example.com" } },
		{ name: "username", data: { username: "updated username" } },
		{ name: "bio", data: { bio: "updated bio" } },
		{ name: "image", data: { image: "https://example.com/image.jpeg" } },
	];

	for (const { name, data } of updateInputs) {
		it(`updates ${name}`, async () => {
			const { token } = await registerJohnDoe();

			const r = await apiCall<{ user: User }>({
				url: "/api/user",
				method: "PUT",
				token,
				data: {
					user: {
						username: "John Doe",
						email: "john.doe@example.com",
						bio: "",
						image: "",
						...data,
					},
				},
			});

			expect(r.status).toBe(200);
			expectUser(r.data?.user, { ...data });
		});
	}

	it("updates password", async () => {
		async () => {
			const { token } = await registerJohnDoe();
			const r = await apiCall<{ user: User }>({
				url: "/api/user",
				method: "PUT",
				token,
				data: {
					user: { password: "updated password" },
				},
			});

			expect(r.status).toBe(200);
			expectUser(r.data?.user);

			// Login with new password
			const r2 = await apiCall<{ user: User }>({
				url: "/api/users/login",
				method: "POST",
				data: {
					user: { email: "john.doe@example.com", password: "updated password" },
				},
			});

			expect(r2.status).toBe(200);
			expectUser(r2.data?.user);

			// Fails with old password
			const r3 = await apiCall<{ user: User }>({
				url: "/api/users/login",
				method: "POST",
				data: {
					user: { email: "john.doe@example.com", password: "topsecret" },
				},
			});

			expect(r3.status).toBe(422);
		};
	});

	it("rejects unauthenticated", async () => {
		const r = await apiCall<{ user: User }>({
			url: "/api/user",
			method: "PUT",
			data: { user: { username: "updated name" } },
		});

		expect(r.status).toBe(401);
	});

	const invalidInputs = [
		{
			name: "email",
			data: { email: "invalid email" },
			errors: { email: ["is invalid"] },
		},
		{
			name: "username",
			data: { username: "" },
			errors: { username: ["can't be blank"] },
		},
		{
			name: "image",
			data: { image: "invalid url" },
			errors: { image: ["is invalid"] },
		},
	];

	for (const { name, data, errors } of invalidInputs) {
		it(`rejects invalid ${name}`, async () => {
			const { token } = await registerJohnDoe();
			const r = await apiCall<{ user: User }>({
				url: "/api/user",
				method: "PUT",
				token,
				data: {
					user: {
						username: "John Doe",
						email: "john.doe@example.com",
						bio: "",
						image: "",
						...data,
					},
				},
			});

			expect(r.status).toBe(422);
			expect(r.error).toMatchObject({ errors });
		});
	}
});
