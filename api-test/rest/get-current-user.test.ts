import { User } from "lib/interfaces";
import {
	apiCall,
	expectUser,
	registerJohnDoe,
	resetDb,
} from "../api-test-helpers";

describe("Get Current User API", () => {
	beforeEach(async () => {
		await resetDb();
	});

	it("gets user info", async () => {
		const { token } = await registerJohnDoe();

		const data = {
			email: "updated@example.com",
			username: "updated username",
			bio: "updated bio",
			image: "https://example.com/image.jpeg",
		};

		await apiCall({
			url: "/api/user",
			method: "PUT",
			token,
			data: { user: data },
		});

		const r = await apiCall<{ user: User }>({ url: "/api/user", token });

		expect(r.status).toBe(200);
		expectUser(r.data?.user, data);
	});

	it("rejects unauthenticated", async () => {
		const r = await apiCall<{ user: User }>({ url: "/api/user" });
		expect(r.status).toBe(401);
	});
});
