// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
	let conduitEnv: ConduitEnv | undefined;
}

interface ConduitEnv {
	DATABASE_URL: string;
	SALT_ROUNDS: number;
	SERVER_SECRET: string;
	AUTH_API_URL?: string;
}

export function getEnv(): ConduitEnv {
	const globalEnv = globalThis.conduitEnv;
	if (globalEnv) return globalEnv;

	const {
		DATABASE_URL,
		SALT_ROUNDS: SALT_ROUNDS_RAW,
		SERVER_SECRET,
		AUTH_API_URL,
	} = {
		DATABASE_URL: process.env.DATABASE_URL,
		SALT_ROUNDS: process.env.SALT_ROUNDS,
		SERVER_SECRET: process.env.SERVER_SECRET,
		AUTH_API_URL: process.env.AUTH_API_URL,
	};

	if (!DATABASE_URL) throw new Error("DATABASE_URL is not defined");

	if (!SALT_ROUNDS_RAW) throw new Error("SALT_ROUNDS is not defined");
	const SALT_ROUNDS = Number(SALT_ROUNDS_RAW);
	if (!Number.isInteger(SALT_ROUNDS)) {
		throw new Error("SALT_ROUNDS is not an integer");
	}

	if (!SERVER_SECRET) throw new Error("SERVER_SECRET is not defined");

	return (globalThis.conduitEnv = {
		DATABASE_URL,
		SALT_ROUNDS,
		SERVER_SECRET,
		AUTH_API_URL,
	});
}
