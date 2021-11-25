import { Profile } from "lib/interfaces";
import {
	apiCall,
	expectProfile,
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
		const r = await apiCall<{ profile: Profile }>({
			url: "/api/profiles/John%20Doe/follow",
			method: "POST",
			token: janesToken,
		});

		expect(r.status).toBe(200);
		expectProfile(r.data?.profile, { following: true });
	});

	it("follows already followed user", async () => {
		await apiCall<{ profile: Profile }>({
			url: "/api/profiles/John%20Doe/follow",
			method: "POST",
			token: janesToken,
		});

		const r = await apiCall<{ profile: Profile }>({
			url: "/api/profiles/John%20Doe/follow",
			method: "POST",
			token: janesToken,
		});

		expect(r.status).toBe(200);
		expectProfile(r.data?.profile, { following: true });

		const r2 = await apiCall<{ profile: Profile }>({
			url: "/api/profiles/John%20Doe/follow",
			method: "DELETE",
			token: janesToken,
		});

		expect(r2.status).toBe(200);
		expectProfile(r2.data?.profile);
	});

	it("rejects following oneself", async () => {
		const r = await apiCall<{ profile: Profile }>({
			url: "/api/profiles/Jane%20Foo/follow",
			method: "POST",
			token: janesToken,
		});

		expect(r.status).toBe(422);
	});
});
