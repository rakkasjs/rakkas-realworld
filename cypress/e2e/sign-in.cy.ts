import {
	installAssertions,
	registerJohnDoe,
	resetDb,
	waitForJs,
} from "../support/lib";

installAssertions();

describe("Signu up page", () => {
	beforeEach(() => resetDb());

	it("logs in", () => {
		cy.visit("/");
		waitForJs();

		registerJohnDoe();
		cy.window().invoke("conduitLogout");

		cy.get("a").contains("Sign in").click();
		cy.title().should("eq", "Sign in — Conduit");

		cy.get("[placeholder='Email']").type("john.doe@example.com");
		cy.get("[placeholder='Password']").type("topsecret");
		cy.get("button").contains("Sign in").click();

		cy.get("button").should("contain", "Signing in...");

		cy.get("a[href='/profile/John%20Doe']").should("contain", "John Doe");
	});

	it("reports validation errors", () => {
		cy.visit("/login");
		waitForJs();
		cy.get("button").contains("Sign in").click();

		cy.contains("email or password is incorrect").should("be.red");
	});
});
