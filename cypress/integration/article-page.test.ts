import {
	installAssertions,
	registerJohnDoe,
	registerUser,
	resetDb,
	waitForJs,
} from "../support/lib";

installAssertions();

describe("Editor", () => {
	beforeEach(() => resetDb());

	it("shows article page for the author", () => {
		// When I sign up and create an article
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
						body: "My article *body*",
						tagList: ["aaa", "bbb", "ccc"],
					},
				},
			});
		});

		// And I visit the article's page
		cy.visit("/?global");
		waitForJs();
		cy.contains("My article description").click();

		// Then the title should contain the article title
		cy.title().should("eq", "My article title — Conduit");

		// And the article's title and its body shoud be visible
		cy.contains("My article title");
		cy.contains("My article body");

		// And the article's body should render Markdown
		cy.contains("body").should("have.css", "font-style", "italic");

		// When I post a comment
		cy.get("[name=body]").type("This is a comment");
		cy.contains("Post Comment").click();

		// Then the comment should be visible
		cy.contains("This is a comment");

		// When I click the delete comment button
		cy.get("[title='Delete comment']").click();

		// Then the comment should disappear
		cy.contains("This is a comment").should("not.exist");

		// When I click on the edit article button
		cy.contains("Edit article").click();

		// Then I should see the editor page
		cy.title().should("contain", "Editor");

		// When I go back and click the delete article button
		cy.go("back");
		cy.contains("Delete article").click();

		// Then I should see the home page
		cy.title().should("contain", "Home");

		// When I go back
		cy.go("back");

		// Then I should see “not found” on the page
		cy.contains("not found", { matchCase: false });
	});

	it.only("shows article page for others", () => {
		// When I sign up and create an article
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
						body: "My article *body*",
						tagList: ["aaa", "bbb", "ccc"],
					},
				},
			});
		});

		// And I visit the article's page
		cy.visit("/?global");
		waitForJs();
		cy.contains("My article description").click();

		// And I post a comment
		cy.get("[name=body]").type("This is a comment");
		cy.contains("Post Comment").click();

		// And I sign up as a different user
		registerUser({
			username: "Jane Foo",
			email: "jane.foo@example.com",
			password: "nopeeky!",
		});
		cy.reload();
		waitForJs();

		// And I post a comment
		cy.get("[name=body]").type("This is another comment");
		cy.contains("Post Comment").click();

		// And I click on the delete button for my comment
		cy.contains("This is another comment")
			.parent()
			.parent()
			.find("[title='Delete comment']")
			.click();

		// Then my comment should disappear
		cy.contains("This is another comment").should("not.exist");

		// And I should not see a delete button for the first user's comment
		cy.contains("This is a comment")
			.parent()
			.parent()
			.find("[title='Delete comment']")
			.should("not.exist");

		// And I should not see a delete article button
		cy.contains("Delete article").should("not.exist");

		// And I should not see an edit article button
		cy.contains("Edit article").should("not.exist");

		// When I click on the Follow John Doe button
		cy.contains("Follow John Doe").click();

		// Then I should see the article on my feed
		cy.contains("Home").click();
		cy.contains("My article description");

		// When I go back and click on the favorite button
		cy.go("back");
		cy.contains("Favorite Article").click();

		// Then I should see the article on my favorites page
		cy.contains("Jane Foo").click();
		cy.contains("Favorited Articles").click();
		cy.contains("My article description");
	});
});
