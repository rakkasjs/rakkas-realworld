import { ConduitRequestHandler } from "../middleware";

export const post: ConduitRequestHandler = async ({ body, context }) => {
	const user = await context.auth.login(body?.user);

	return { body: { user }, status: 200 };
};
