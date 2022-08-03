import { describe, it, expect } from "vitest";
import { Profile } from "~/client/interfaces";
import {
	apiCall,
	expectProfile,
	registerJohnDoe,
	resetDb,
} from "./api-test-helpers";

describe("Get Profile API", () => {
	it("gets profile", async () => {
		await resetDb();
		await registerJohnDoe();
		const r = await apiCall<{ profile: Profile }>({
			url: "/api/profiles/John%20Doe",
		});
		expect(r.status).toBe(200);
		expectProfile(r.data?.profile);
	});
});
