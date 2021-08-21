import { UserResponse } from "lib/api-types";
import {
	apiCall,
	expectUser,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Authentication API", () => {
	beforeEach(async () => {
		await resetDb();
		await registerJohnDoe();
	});

	it("authenticates user with correct credentials", async () => {
		const r = await apiCall<UserResponse>({
			url: "/api/users/login",
			method: "POST",
			data: { user: { email: "john.doe@example.com", password: "topsecret" } },
		});

		expect(r.status).toBe(200);
		expectUser(r.data?.user);
	});

	it("rejects incorrect email", async () => {
		const r = await apiCall<UserResponse>({
			url: "/api/users/login",
			method: "POST",
			data: {
				user: { email: "not.john.doe@example.com", password: "topsecret" },
			},
		});

		expect(r.status).toBe(422);
		expect(r.error).toMatchObject({
			errors: { "email or password": ["is incorrect"] },
		});
	});

	it("rejects incorrect password", async () => {
		const r = await apiCall<UserResponse>({
			url: "/api/users/login",
			method: "POST",
			data: { user: { email: "john.doe@example.com", password: "incorrect" } },
		});

		expect(r.status).toBe(422);
		expect(r.error).toMatchObject({
			errors: { "email or password": ["is incorrect"] },
		});
	});

	it("reports missing fields", async () => {
		const r = await apiCall<UserResponse>({
			url: "/api/users/login",
			method: "POST",
			data: { user: {} },
		});

		expect(r.status).toBe(422);
		expect(r.error).toMatchObject({
			errors: {
				"email": ["Required"],
				"password": ["Required"],
			},
		});
	});
});
