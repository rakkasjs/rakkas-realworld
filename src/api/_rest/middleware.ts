import { RakkasMiddleware, RakkasRequest, RakkasResponse } from "rakkasjs";
import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import { db } from "lib/db";
import { getEnv } from "lib/env";
import { PrismaClient, User } from "@prisma/client";

export type ConduitRequest = RakkasRequest & {
	context: {
		db: PrismaClient;
		token?: string;
		user?: User;
	};
};

export type ConduitRequestHandler = (
	request: ConduitRequest,
) => RakkasResponse | Promise<RakkasResponse>;

const conduitMiddleware: RakkasMiddleware = async (request, next) => {
	if (request.type !== "empty" && request.type !== "json") {
		return {
			status: StatusCodes.NOT_ACCEPTABLE,
			body: { errors: { body: ["should be JSON"] } },
		};
	}

	const conduitRequest: ConduitRequest = {
		...request,
		context: {
			db,
			...(await getUser(request)),
		},
	};

	const response = await next(conduitRequest);

	return {
		...response,
		headers: { ...response.headers, "Content-Type": "application/json" },
	};
};

export default conduitMiddleware;

async function getUser(
	request: RakkasRequest,
): Promise<{ user: User; token: string } | null> {
	const auth = request.headers.get("authorization");

	if (!auth || !auth.startsWith("Token ")) {
		return null;
	}

	const token = auth.slice("Token ".length);

	const { SERVER_SECRET } = getEnv();

	try {
		const verified = verify(token, SERVER_SECRET, { algorithms: ["HS256"] });

		if (
			typeof verified !== "object" ||
			!verified ||
			!Number.isInteger(verified.id)
		) {
			return null;
		}

		const id: number = verified.id;

		const user = await db.user.findUnique({
			where: { id },
		});

		if (!user) return null;

		return { user, token };
	} catch (err) {
		return null;
	}
}
