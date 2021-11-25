import { Profile } from "lib/interfaces";
import {
	apiCall,
	expectProfile,
	formSubmit,
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
		await apiCall<{ profile: Profile }>({
			url: "/api/profiles/John%20Doe/follow",
			method: "POST",
			token: janesToken,
		});

		const { location } = await formSubmit({
			url: "/api/form/profile/John%20Doe/unfollow",
			token: janesToken,
		});

		expect(location).toBe("/profile/John%20Doe");

		const r = await apiCall<{ profile: Profile }>({
			url: "/api/profiles/John%20Doe",
			token: janesToken,
		});

		expect(r.status).toBe(200);
		expectProfile(r.data?.profile);
	});

	it("unfollows already unfollowed profile", async () => {
		const { location } = await formSubmit({
			url: "/api/form/profile/John%20Doe/unfollow",
			token: janesToken,
		});

		expect(location).toBe("/profile/John%20Doe");

		const r = await apiCall<{ profile: Profile }>({
			url: "/api/profiles/John%20Doe",
			token: janesToken,
		});

		expect(r.status).toBe(200);
		expectProfile(r.data?.profile);
	});
});
