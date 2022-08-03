import { login, resetDb, waitForJs } from "../support/lib";

describe("Profile page", () => {
	beforeEach(() => {
		resetDb();
		cy.request({
			url: "/api/test/populate",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});
	});

	it("shows profile pages", () => {
		// When I login as Donetta
		login({
			email: "donnetta.peterkin@example.com",
			password: "Donnetta Peterkin's password",
		});

		// And I visit Michal's profile page
		cy.visit("/profile/Michal%20Hawks");
		waitForJs();

		// Then the title should contain his name
		cy.title().should("contain", "Michal Hawks");

		// Then I should see his bio
		cy.contains("Michal Hawks's bio");

		// And I should see his article
		cy.contains("Michal Hawks's article");

		// When I favorite his article
		cy.get("[title='Favorite article']").click();

		// When I login as Dewitt
		login({
			email: "dewitt.brakefield@example.com",
			password: "Dewitt Brakefield's password",
		});

		// And I visit Donetta's profile
		cy.visit("/profile/Donnetta%20Peterkin");
		waitForJs();

		// Then I should see her article
		cy.contains("Donnetta Peterkin's article");

		// When I visit her favorited articles
		cy.contains("Favorited Articles").click();

		// Then I should see Michak's article
		cy.contains("Michal Hawks's article");
	});
});
1;
