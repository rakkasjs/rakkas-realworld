import {
	installAssertions,
	registerJohnDoe,
	resetDb,
	waitForJs,
} from "../support/lib";

installAssertions();

describe("Editor", () => {
	beforeEach(() => resetDb());

	it("creates article", () => {
		cy.visit("/");

		registerJohnDoe();

		cy.visit("/");
		waitForJs();
		cy.contains("New Article").click();

		cy.title().should("eq", "Editor — Conduit");

		cy.get("[name=title]").type("My article title");
		cy.get("[name=description]").type("My article description");
		cy.get("[name=body]").type("My article body");
		cy.get("[name=tagList]").type("react vite rakkas RealWorld");

		cy.contains("Publish Article").click();

		cy.contains("My article title");
		cy.contains("My article body");

		// Description and tags is only visible in the preview
		cy.visit("/?global");
		waitForJs();
		cy.contains("My article description");
		cy.contains("react");
		cy.contains("vite");
		cy.contains("rakkas");
		cy.contains("RealWorld");
	});

	it("edits article", () => {
		registerJohnDoe().then((token) => {
			cy.request({
				url: "/api/articles",
				method: "POST",
				headers: {
					authorization: `Token ${token}`,
					"Content-Type": "application/json",
				},
				body: {
					article: {
						title: "My article title",
						description: "My article description",
						body: "My article body",
						tagList: ["aaa", "bbb", "ccc"],
					},
				},
			});
		});

		cy.visit("/?global");
		waitForJs();
		cy.contains("My article title").click();
		cy.contains("Edit article").click();

		cy.get("[name=title]").clear().type("My updated article title");
		cy.get("[name=description]").clear().type("My updated article description");
		cy.get("[name=body]").clear().type("My updated article body");
		cy.get("[name=tagList]").clear().type("aaa yyy zzz");

		cy.contains("Update Article").click();

		cy.contains("My updated article title");
		cy.contains("My updated article body");

		// Description and tags is only visible in the preview
		cy.visit("/?global");
		waitForJs();
		cy.contains("My updated article description");
		cy.contains("aaa");
		cy.contains("yyy");
		cy.contains("zzz");
	});

	it("reports validation errors while creating", () => {
		registerJohnDoe();
		cy.visit("/editor");
		waitForJs();

		cy.contains("Publish Article").click();

		cy.contains("title can't be blank").should("be.red");
		cy.contains("description can't be blank").should("be.red");
		cy.contains("body can't be blank").should("be.red");
	});

	it("reports validation errors while updating", () => {
		registerJohnDoe().then((token) => {
			cy.request({
				url: "/api/articles",
				method: "POST",
				headers: {
					authorization: `Token ${token}`,
					"Content-Type": "application/json",
					headers: {
						"Content-Type": "application/json",
					},
				},
				body: {
					article: {
						title: "My article title",
						description: "My article description",
						body: "My article body",
						tagList: ["aaa", "bbb", "ccc"],
					},
				},
			});
		});

		cy.visit("/?global");
		waitForJs();
		cy.contains("My article title").click();
		cy.contains("Edit article").click();

		cy.get("[name=title]").clear();
		cy.get("[name=description]").clear();
		cy.get("[name=body]").clear();

		cy.contains("Update Article").click();

		cy.contains("title can't be blank").should("be.red");
		cy.contains("description can't be blank").should("be.red");
		cy.contains("body can't be blank").should("be.red");
	});
});
