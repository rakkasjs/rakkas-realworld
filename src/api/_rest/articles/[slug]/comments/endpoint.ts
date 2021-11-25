import { ConduitRequestHandler } from "api/_rest/middleware";

export const get: ConduitRequestHandler = async ({
	context,
	params: { slug },
}) => {
	const comments = await context.conduit.getComments(slug);

	return { body: { comments } };
};

export const post: ConduitRequestHandler = async ({
	context,
	params: { slug },
	body,
}) => {
	const comment = await context.conduit.addComment(slug, body?.comment?.body);

	return { body: { comment } };
};
