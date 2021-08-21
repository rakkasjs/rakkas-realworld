import { ConduitRequestHandler } from "./middleware";

export const get: ConduitRequestHandler = async ({ context: { db } }) => {
	const tags = await db.articleTags.groupBy({
		by: ["tagName"],
		_count: { articleId: true },
		orderBy: { _count: { articleId: "desc" } },
		take: 20,
	});

	return {
		body: { tags: tags.map((tag) => tag.tagName) },
	};
};
