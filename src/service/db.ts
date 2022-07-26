import { PrismaClient } from "@prisma/client";
import { getEnv } from "./env";

const { DATABASE_URL } = getEnv();

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
	let prismaClient: PrismaClient | undefined;
}

export const db =
	globalThis.prismaClient ||
	(globalThis.prismaClient = new PrismaClient({
		datasources: { db: { url: DATABASE_URL } },
	}));
