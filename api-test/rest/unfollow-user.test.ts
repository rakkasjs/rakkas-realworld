import { ProfileResponse } from "lib/conduit-client";
import {
	apiCall,
	expectProfile,
	registerJaneFoo,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Unfollow User API", () => {
	let janesToken: string;

	beforeEach(async () => {
		await resetDb();
		await registerJohnDoe();
		const jane = await registerJaneFoo();
		janesToken = jane.token;
	});

	it("unfollows followed profile", async () => {
		await apiCall<ProfileResponse>({
			url: "/api/profiles/John%20Doe/follow",
			method: "POST",
			token: janesToken,
		});

		const r = await apiCall<ProfileResponse>({
			url: "/api/profiles/John%20Doe/follow",
			method: "DELETE",
			token: janesToken,
		});

		expect(r.status).toBe(200);
		expectProfile(r.data?.profile);
	});

	it("unfollows already unfollowed profile", async () => {
		const r = await apiCall<ProfileResponse>({
			url: "/api/profiles/John%20Doe/follow",
			method: "DELETE",
			token: janesToken,
		});

		expect(r.status).toBe(200);
		expectProfile(r.data?.profile);
	});
});
