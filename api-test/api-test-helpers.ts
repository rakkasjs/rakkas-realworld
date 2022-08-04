import { expect } from "vitest";
import { parse, Cookie } from "set-cookie-parser";
import { Profile, User } from "~/client/interfaces";
import nodeFetch, { RequestInit, Response } from "node-fetch";
import { serialize } from "cookie";

const BASE_URL = "http://localhost:3000";

export const DATE_REGEX =
	/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export async function fetch(
	url: string,
	init?: RequestInit,
): Promise<Response> {
	url = BASE_URL + url;
	return nodeFetch(url, init);
}

type SuccessfulApiResponse<T> = {
	ok: true;
	status: number;
	data: T;
	error?: undefined;
};

type UnsuccessfulApiResponse = {
	ok: false;
	status: number;
	data?: undefined;
	error?: { errors: Record<string, string[]> };
};

type ApiResponse<T> = SuccessfulApiResponse<T> | UnsuccessfulApiResponse;

export interface ApiCall {
	url: string;
	method?: string;
	data?: unknown;
	token?: string;
}

export async function apiCall<T>({
	url,
	method,
	data,
	token,
}: ApiCall): Promise<ApiResponse<T>> {
	const headers: Record<string, string> = {
		"content-type": "application/json",
	};

	if (token) {
		headers.authorization = `Token ${token}`;
	}

	return await fetch(url, {
		method,
		body: data === undefined ? data : JSON.stringify(data),
		headers,
	}).then(async (r) => {
		let json: any = undefined;
		try {
			json = await r.json();
		} catch {
			// Ignore JSON errors (for empty responses)
		}

		if (r.ok) {
			return { ok: true, status: r.status, data: json };
		} else {
			return { ok: false, status: r.status, error: json };
		}
	});
}

export interface FormSubmitCall {
	url: string;
	data?: Record<string, string>;
	token?: string;
	headers?: Record<string, string>;
}

export async function formSubmit({
	url,
	data,
	token,
	headers: extraHeaders,
}: FormSubmitCall): Promise<{ location: string; cookies: Cookie[] }> {
	const headers: Record<string, string> = {
		"content-type": "application/x-www-form-urlencoded",
		...extraHeaders,
	};

	if (token) {
		headers.cookie = serialize("authToken", token, {
			maxAge: 60 * 60 * 24 * 30,
			path: "/",
			sameSite: true,
		});
	}

	const params = new URLSearchParams(data);

	const r = await fetch(url, {
		method: "POST",
		body: data && params.toString(),
		headers,
		redirect: "manual",
	});

	const location = r.headers.get("location");

	if (r.status !== 303 || !location) {
		console.error(r);
		throw new Error("Form submit did not redirect");
	}

	const locUrl = new URL(location, BASE_URL);
	if (locUrl.origin !== BASE_URL) {
		throw new Error("Form submit redirected to external address: " + location);
	}

	return {
		location: locUrl.href.slice(BASE_URL.length),
		cookies: parse(r.headers.raw()["set-cookie"]),
	};
}

export async function resetDb(): Promise<void> {
	const r = await apiCall({ url: "/api/test/reset", method: "POST" });
	if (!r.ok) {
		console.error(r);
		throw new Error("Could not reset database");
	}
}

export async function registerJohnDoe(): Promise<User> {
	const r = await apiCall<{ user: User }>({
		url:
			"/api/test/create-user?" +
			new URLSearchParams({ name: "John Doe" }).toString(),
		method: "POST",
	});

	if (!r.ok) {
		console.error(r);
		throw new Error("Could not register John Doe");
	}

	return r.data.user;
}

export async function registerJaneFoo(): Promise<User> {
	const r = await apiCall<{ user: User }>({
		url:
			"/api/test/create-user?" +
			new URLSearchParams({ name: "Jane Foo" }).toString(),
		method: "POST",
	});

	if (!r.ok) {
		console.error(r);
		throw new Error("Could not register Jane Foo");
	}

	return r.data.user;
}

export function expectUser(subject: any, user?: Partial<User>): void {
	expect(subject).toMatchObject({
		email: user?.email ?? "john.doe@example.com",
		username: user?.username ?? "John Doe",
		bio: user?.bio ?? "",
		image: user?.image ?? null,
	});

	expect(typeof subject?.token).toBe("string");

	// Make sure these don't leak from the database
	expect(subject).not.toHaveProperty("password");
	expect(subject).not.toHaveProperty("passwordHash");
}

export function expectProfile(subject: any, profile?: Partial<Profile>): void {
	expect(subject).toMatchObject({
		username: profile?.username ?? "John Doe",
		bio: profile?.bio ?? "",
		image: profile?.image ?? null,
		following: profile?.following ?? false,
	});

	// Make sure these don't leak from the database
	expect(subject).not.toHaveProperty("email");
	expect(subject).not.toHaveProperty("password");
	expect(subject).not.toHaveProperty("passwordHash");
}
