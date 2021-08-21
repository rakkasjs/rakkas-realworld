import { User, UserResponse } from "lib/api-types";
import {
	apiCall,
	expectUser,
	formSubmit,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Update User API", () => {
	let john: User;

	beforeEach(async () => {
		await resetDb();
		john = await registerJohnDoe();
	});

	const updateInputs = [
		{ name: "email", data: { email: "updated@example.com" } },
		{ name: "username", data: { username: "updated username" } },
		{ name: "bio", data: { bio: "updated bio" } },
		{ name: "image", data: { image: "https://example.com/image.jpeg" } },
	];

	for (const { name, data } of updateInputs) {
		it(`updates ${name}`, async () => {
			const { location } = await formSubmit({
				url: "/api/form/settings",
				token: john.token,
				data: {
					username: "John Doe",
					email: "john.doe@example.com",
					bio: "",
					image: "",
					...data,
				},
			});

			expect(location).toBe("/settings");

			const r = await apiCall<UserResponse>({
				url: "/api/user",
				token: john.token,
			});

			expect(r.status).toBe(200);
			expectUser(r.data?.user, { ...data });
		});
	}

	it("updates password", async () => {
		async () => {
			const { location } = await formSubmit({
				url: "/api/form/settings",
				token: john.token,
				data: {
					username: "John Doe",
					email: "john.doe@example.com",
					bio: "",
					image: "",
					password: "updated password",
				},
			});

			expect(location).toBe("/settings");

			// Login with new password
			const r2 = await apiCall<UserResponse>({
				url: "/api/users/login",
				method: "POST",
				data: {
					user: { email: "john.doe@example.com", password: "updated password" },
				},
			});

			expect(r2.status).toBe(200);
			expectUser(r2.data?.user);

			// Fails with old password
			const r3 = await apiCall<UserResponse>({
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
		const { location } = await formSubmit({
			url: "/api/form/settings",
			data: {
				username: "John Doe",
				email: "john.doe@example.com",
				bio: "New bio",
				image: "new image",
			},
		});

		expect(location).toBe("/register");
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
			const { location } = await formSubmit({
				url: "/api/form/settings",
				token: john.token,
				data: {
					username: "John Doe",
					email: "john.doe@example.com",
					bio: "",
					image: "",
					...data,
				},
			});

			const params = new URLSearchParams();
			if (errors) {
				for (const [k, values] of Object.entries(errors)) {
					for (const v of values) params.append("error", k + " " + v);
				}
			}

			expect(location).toBe("/settings?" + params.toString());
		});
	}
});
