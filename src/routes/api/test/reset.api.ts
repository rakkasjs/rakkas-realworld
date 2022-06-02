import { db } from "lib/db";

export async function post() {
	await db.articleTags.deleteMany();
	await db.comment.deleteMany();
	await db.article.deleteMany();
	await db.user.deleteMany();

	return new Response();
}
