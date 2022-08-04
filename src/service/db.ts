import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
	let prismaClient: PrismaClient | undefined;
}

export const db =
	globalThis.prismaClient ||
	(globalThis.prismaClient = new PrismaClient({
		datasources: { db: { url: process.env.DATABASE_URL } },
	}));
