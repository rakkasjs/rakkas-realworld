import { ProfileResponse } from "lib/conduit-client";
import {
	apiCall,
	expectProfile,
	formSubmit,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Follow User API", () => {
	let janesToken: string;

	beforeEach(async () => {
		await resetDb();
		await registerJohnDoe();
		const jane = await registerJaneFoo();
		janesToken = jane.token;
	});

	it("follows user", async () => {
		const { location } = await formSubmit({
			url: `/api/form/profile/John%20Doe/follow`,
			token: janesToken,
		});

		expect(location).toBe("/profile/John%20Doe");

		const r = await apiCall<ProfileResponse>({
			url: "/api/profiles/John%20Doe",
			token: janesToken,
		});

		expect(r.status).toBe(200);
		expectProfile(r.data?.profile, { following: true });
	});

	it("follows already followed user", async () => {
		await apiCall<ProfileResponse>({
			url: "/api/profiles/John%20Doe/follow",
			method: "POST",
			token: janesToken,
		});

		const { location } = await formSubmit({
			url: `/api/form/profile/John%20Doe/follow`,
			token: janesToken,
		});

		expect(location).toBe("/profile/John%20Doe");

		const r2 = await apiCall<ProfileResponse>({
			url: "/api/profiles/John%20Doe/follow",
			method: "DELETE",
			token: janesToken,
		});

		expect(r2.status).toBe(200);
		expectProfile(r2.data?.profile);
	});

	it("rejects following oneself", async () => {
		const { location } = await formSubmit({
			url: "/api/form/profile/Jane%20Foo/follow",
			token: janesToken,
		});

		expect(location).toBe(
			"/profile/Jane%20Foo?error=username+cannot+follow+self",
		);
	});
});
