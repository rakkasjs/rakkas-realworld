import { ConduitRequestHandler } from "api/_rest/middleware";

export const del: ConduitRequestHandler = async ({
	context,
	params: { slug, commentId },
}) => {
	await context.conduit.deleteComment(slug, Number(commentId));

	return {};
};
