import { registerJohnDoe, resetDb, waitForJs } from "../support/lib";

describe("Home page", () => {
	beforeEach(() => {
		resetDb();
		cy.request({ url: "/api/test/populate", method: "POST" });
	});

	it("displays title", () => {
		cy.visit("/");
		waitForJs();
		cy.title().should("eq", "Home — Conduit");
	});

	it("lists tags", () => {
		cy.visit("/");
		waitForJs();

		cy.contains("Popular Tags")
			.parent()
			.then((p) => {
				expect(p).to.contain("x1");
				expect(p).to.contain("x0");
				expect(p).to.contain("x2");
				expect(p).to.contain("y0");
				expect(p).to.contain("y1");
				expect(p).to.contain("y2");
				expect(p).to.contain("y3");
				expect(p).to.contain("y4");
				expect(p).to.contain("y5");
				expect(p).to.contain("y6");
				expect(p).to.contain("y7");
				expect(p).to.contain("y8");
				expect(p).to.contain("y9");
			});
	});

	it("shows latest articles globally", () => {
		cy.visit("/");
		waitForJs();
		cy.contains("Donnetta Peterkin's article #25 title");
		cy.contains("Caitlin Carney's article #6 title");
	});

	it("goes to the article when clicked", () => {
		cy.visit("/");
		waitForJs();
		cy.contains("Donnetta Peterkin's article #25 title").click();
		cy.contains("Donnetta Peterkin's article #25 body");
	});

	it("paginates articles", () => {
		cy.visit("/");
		waitForJs();
		cy.contains(">").click();
		cy.contains("Jodie Becher's article #5 title");
		cy.contains("Rosalee Dines's article #0 title");
	});

	it("lists feed", () => {
		registerJohnDoe().then((token) => {
			cy.request({
				url: "/api/profiles/Rosalee%20Dines/follow",
				method: "POST",
				headers: { authorization: `Token ${token}` },
			});
			cy.request({
				url: "/api/profiles/Tamara%20Bizier/follow",
				method: "POST",
				headers: { authorization: `Token ${token}` },
			});
		});
		cy.visit("/");
		waitForJs();
		cy.contains("Rosalee Dines's article #0 title");
		cy.contains("Tamara Bizier's article #1 title");
	});

	it("lists by tag", () => {
		cy.visit("/");
		waitForJs();
		cy.contains("Popular Tags").parent().contains("x0").click();
		cy.contains("Latonya Mcmurtrie's article #9 title");
		cy.contains("Rosalee Dines's article #0 title");
	});

	it.only("favorites articles from the preview", () => {
		registerJohnDoe();
		cy.visit("/?global");
		waitForJs();
		cy.get(".article-preview").first().find("button").click();
		cy.get(".article-preview .ion-load-c").should("not.exist");

		cy.visit("/profile/John%20Doe?favorites");
		waitForJs();
		cy.contains("Donnetta Peterkin's article #25 title");
	});
});
