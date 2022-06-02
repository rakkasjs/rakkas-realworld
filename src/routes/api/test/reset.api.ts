import { RequestHandler } from "rakkasjs";
import { db } from "lib/db";

export const post: RequestHandler = async () => {
	await db.articleTags.deleteMany();
	await db.comment.deleteMany();
	await db.article.deleteMany();
	await db.user.deleteMany();

	return {};
};
