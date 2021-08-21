import { PrismaClient } from "@prisma/client";
import { getEnv } from "lib/env";

const { DATABASE_URL } = getEnv();

export const db = import.meta.env.DEV
	? (globalThis as any as { prismaClient: PrismaClient }).prismaClient ||
	  ((globalThis as any as { prismaClient: PrismaClient }).prismaClient =
			new PrismaClient({
				datasources: { db: { url: DATABASE_URL } },
			}))
	: new PrismaClient({
			datasources: { db: { url: DATABASE_URL } },
	  });
