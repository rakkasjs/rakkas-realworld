import { StatusCodes } from "http-status-codes";
import { ConduitRequestHandler } from "../middleware";

export const post: ConduitRequestHandler = async ({ body, context }) => {
	const user = await context.auth.register(body?.user);

	return { body: { user }, status: StatusCodes.CREATED };
};
