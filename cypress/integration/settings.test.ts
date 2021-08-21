import {
	installAssertions,
	login,
	registerJohnDoe,
	resetDb,
	waitForJs,
} from "../support/lib";

installAssertions();

describe("Settings page", () => {
	beforeEach(() => resetDb());

	it("logs out", () => {
		registerJohnDoe();
		cy.visit("/");
		waitForJs();

		cy.get("a").contains("Settings").click();

		cy.title().should("eq", "Settings — Conduit");

		cy.contains("Or click here to logout").click();
		// Sign in menu item should be visible
		cy.contains("Sign in");
	});

	it("updates user info", () => {
		registerJohnDoe();
		cy.visit("/settings");
		waitForJs();

		cy.get("[name=image]").clear().type("https://www.cyco130.com/pp.jpeg");
		cy.get("[name=username]").clear().type("John Doe Updated");
		cy.get("[name=bio]").clear().type("This is my bio!");
		cy.get("[name=email]").clear().type("john.doe.updated@example.com");
		cy.get("[name=password]").clear().type("a new secret");

		cy.contains("Update Settings").click();
		cy.contains("Updating Settings");
		cy.contains("Settings Updated");
		cy.contains("Update Settings");

		// Logout
		cy.contains("Or click here to logout").click();

		// Login with new e-mail and password
		login({ email: "john.doe.updated@example.com", password: "a new secret" });

		cy.visit("/settings");
		waitForJs();

		// Check the updated info
		cy.get("[name=image]")
			.invoke("val")
			.should("eq", "https://www.cyco130.com/pp.jpeg");
		cy.get("[name=username]").invoke("val").should("eq", "John Doe Updated");
		cy.get("[name=bio]").invoke("val").should("eq", "This is my bio!");
		cy.get("[name=email]")
			.invoke("val")
			.should("eq", "john.doe.updated@example.com");
	});

	it("reports validation errors", () => {
		registerJohnDoe();
		cy.visit("/settings");
		waitForJs();

		cy.get("[name=image]").clear().type("not a url");
		cy.get("[name=username]").clear();
		cy.get("[name=email]").clear().type("invalid email");
		cy.get("[name=password]").clear().type("short");

		cy.contains("Update Settings").click();

		cy.contains("email is invalid").should("be.red");
		cy.contains("password is too short (minimum is 8 characters)").should(
			"be.red",
		);
		cy.contains("username can't be blank").should("be.red");
		cy.contains("image is invalid").should("be.red");
	});
});
