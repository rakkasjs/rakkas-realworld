import { ProfileResponse } from "lib/conduit-client";
import {
	apiCall,
	expectProfile,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Get Profile API", () => {
	it("gets profile", async () => {
		await resetDb();
		await registerJohnDoe();
		const r = await apiCall<ProfileResponse>({
			url: "/api/profiles/John%20Doe",
		});
		expect(r.status).toBe(200);
		expectProfile(r.data?.profile);
	});
});
