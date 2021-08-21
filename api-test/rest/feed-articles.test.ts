import { User, UserResponse } from "lib/api-types";
import { ArticlesResponse } from "lib/conduit-client";
import { apiCall, resetDb } from "../api-test-helpers";

describe("Feed Articles API", () => {
	let me: User;

	beforeAll(async () => {
		await resetDb();
		await apiCall({ url: "/api/test/populate", method: "POST" });
		const r = await apiCall<UserResponse>({
			url: "/api/users/login",
			method: "POST",
			data: {
				user: {
					email: "donnetta.peterkin@example.com",
					password: "Donnetta Peterkin's password",
				},
			},
		});

		if (!r.ok) throw new Error("Could not login");

		me = r.data.user;

		// Follow the first 21
		for (const username of RANDOM_NAMES.slice(0, 21)) {
			await apiCall({
				url: `/api/profiles/${encodeURIComponent(username)}/follow`,
				method: "POST",
				token: me.token,
			});
		}
	});

	it("lists last 20 articles", async () => {
		const r = await apiCall<ArticlesResponse>({
			url: "/api/articles/feed",
			token: me.token,
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(21);

		expect(r.data?.articles.length).toBe(20);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				title: expect.stringContaining(String(20 - i)),
				author: { following: true },
			});
		});
	});

	it("honors limit parameter", async () => {
		const r = await apiCall<ArticlesResponse>({
			url: "/api/articles/feed?limit=10",
			token: me.token,
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(21);

		expect(r.data?.articles.length).toBe(10);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				title: expect.stringContaining(String(20 - i)),
				author: { following: true },
			});
		});
	});

	it("doesn't allow limit to be greater than 20", async () => {
		const r = await apiCall<ArticlesResponse>({
			url: "/api/articles/feed?limit=50",
			token: me.token,
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(21);

		expect(r.data?.articles.length).toBe(20);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				title: expect.stringContaining(String(20 - i)),
				author: { following: true },
			});
		});
	});

	it("honors offset parameter", async () => {
		const r = await apiCall<ArticlesResponse>({
			url: "/api/articles/feed?offset=10",
			token: me.token,
		});

		expect(r.status).toBe(200);

		expect(r.data?.articlesCount).toBe(21);

		expect(r.data?.articles.length).toBe(11);

		r.data?.articles.forEach((article, i) => {
			expect(article).toMatchObject({
				title: expect.stringContaining(String(10 - i)),
				author: { following: true },
			});
		});
	});
});

const RANDOM_NAMES = [
	"Rosalee Dines",
	"Tamara Bizier",
	"Essie Brigance",
	"Dolly Massman",
	"Blythe Palomo",
	"Jodie Becher",
	"Caitlin Carney",
	"Zelma Mcbride",
	"Lakeisha Hane",
	"Latonya Mcmurtrie",
	"Shemika Tunison",
	"Karey Cray",
	"Noreen Jean",
	"Jack Jordon",
	"Colby Mieles",
	"Etha Burden",
	"Aracely Castilla",
	"Mona Arriola",
	"Bronwyn Mrozek",
	"Cheyenne Kube",
	"Mara Madia",
	"Muriel Sedgwick",
	"Dewitt Brakefield",
	"Carma Vachon",
	"Michal Hawks",
	"Donnetta Peterkin",
];
