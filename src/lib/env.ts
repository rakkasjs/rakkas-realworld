interface ConduitEnv {
	NODE_ENV?: string;
	DATABASE_URL: string;
	SALT_ROUNDS: number;
	SERVER_SECRET: string;
	AUTH_API_URL?: string;
}

export function getEnv(): ConduitEnv {
	const globalEnv = (globalThis as any).conduitEnv;
	if (globalEnv) return globalEnv;

	const env = process.env;

	const {
		DATABASE_URL,
		SALT_ROUNDS: SALT_ROUNDS_RAW,
		SERVER_SECRET,
		NODE_ENV,
		AUTH_API_URL,
	} = env;

	if (!DATABASE_URL) throw new Error("DATABASE_URL is not defined");

	if (!SALT_ROUNDS_RAW) throw new Error("SALT_ROUNDS is not defined");
	const SALT_ROUNDS = Number(SALT_ROUNDS_RAW);
	if (!Number.isInteger(SALT_ROUNDS)) {
		throw new Error("SALT_ROUNDS is not an integer");
	}

	if (!SERVER_SECRET) throw new Error("SERVER_SECRET is not defined");

	return ((globalThis as any).conduitEnv = {
		DATABASE_URL,
		SALT_ROUNDS,
		SERVER_SECRET,
		NODE_ENV,
		AUTH_API_URL,
	});
}
