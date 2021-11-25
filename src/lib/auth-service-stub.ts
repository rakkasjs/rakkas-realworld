import { getEnv } from "lib/env";
import { SignJWT } from "jose";

export class ConduitAuthService {
	async register() {
		throw new Error("Not available in workers");
	}

	async login() {
		throw new Error("Not available in workers");
	}

	async updateUser() {
		throw new Error("Not available in workers");
	}
}

export async function createSignedToken(userId: number): Promise<string> {
	const { SERVER_SECRET } = getEnv();

	const secret =
		typeof atob === "function"
			? Uint8Array.from(atob(SERVER_SECRET), (c) => c.charCodeAt(0))
			: Buffer.from(SERVER_SECRET, "base64");

	return await new SignJWT({ id: userId })
		.setProtectedHeader({ alg: "HS256" })
		.sign(secret);
}
