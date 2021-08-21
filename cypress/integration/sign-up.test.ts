import { installAssertions, resetDb, waitForJs } from "../support/lib";

installAssertions();

describe("Signu up page", () => {
	beforeEach(() => resetDb());

	it("logs the registered user in", () => {
		cy.visit("/");
		waitForJs();

		cy.get("a").contains("Sign up").click();

		cy.title().should("eq", "Sign up — Conduit");

		cy.get("[placeholder='Your Name']").type("John Doe");
		cy.get("[placeholder='Email']").type("john.doe@example.com");
		cy.get("[placeholder='Password']").type("topsecret");
		cy.get("button").contains("Sign up").click();

		cy.get("button").should("contain", "Signing up...");

		cy.get("a[href='/profile/John%20Doe']").should("contain", "John Doe");
	});

	it("reports validation errors", () => {
		cy.visit("/register");
		waitForJs();
		cy.get("button").contains("Sign up").click();

		cy.contains("username can't be blank").should("be.red");
		cy.contains("email is invalid").should("be.red");
		cy.contains("password can't be blank").should("be.red");
		cy.contains("password is too short (minimum is 8 characters)").should(
			"be.red",
		);
	});
});
