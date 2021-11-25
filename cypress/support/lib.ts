import { Article, NewArticle, User } from "../../src/lib/interfaces";

export function resetDb(): void {
	cy.request({
		url: "/api/test/reset",
		method: "POST",
	});
}

export function registerUser(user: {
	username: string;
	email: string;
	password: string;
}): Cypress.Chainable<string> {
	return cy
		.request<{ user: User }>({
			url: "/api/users",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: { user },
		})
		.then((r) => {
			return cy
				.window()
				.invoke("conduitLogin", r.body.user)
				.then(() => r.body.user.token);
		});
}

export function login(user: {
	email: string;
	password: string;
}): Cypress.Chainable<string> {
	return cy
		.request<{ user: User }>({
			url: "/api/users/login",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: { user },
		})
		.then((r) => {
			return cy
				.setCookie("authToken", r.body.user.token)
				.then(() => r.body.user.token);
		});
}

export function registerJohnDoe(): Cypress.Chainable<string> {
	return registerUser({
		username: "John Doe",
		email: "john.doe@example.com",
		password: "topsecret",
	});
}

export function loginAsJohnDoe(): Cypress.Chainable<string> {
	return login({
		email: "john.doe@example.com",
		password: "topsecret",
	});
}

export function createArticle(
	article: NewArticle,
	token: string,
): Cypress.Chainable<Cypress.Response<{ article: Article }>> {
	return cy.request({
		url: "/api/articles",
		method: "POST",
		headers: { authorization: `Token ${token}` },
		body: { article },
	});
}

export function installAssertions(): void {
	chai.Assertion.addMethod("red", function () {
		const $element = this._obj;

		new chai.Assertion($element).to.exist;

		const color = getComputedStyle($element[0]).color;

		const [r, g, b] = color
			.slice("rgb(".length, -1)
			.split(",")
			.map((s) => Number(s.trim()));

		this.assert(
			r - g > 90 && r - b > 90,
			"expected #{this} to be red",
			"expected #{this} not to be red",
			color,
			color,
		);
	});
}

export function waitForJs(): void {
	cy.document().its("body").should("have.class", "hydrated");
}
