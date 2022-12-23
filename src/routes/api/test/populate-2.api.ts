import type { Prisma } from "@prisma/client";
import { json } from "@hattip/response";
import slugify from "slugify";
import { db } from "~/service/db";
import { createSignedToken } from "~/service";
import { createUser } from "./create-user.api";

export async function post(): Promise<Response> {
	const john = await createUser("John Doe");
	const jane = await createUser("Jane Foo");

	const articles: Prisma.ArticleCreateInput[] = [];
	const tags: Array<{ articleNo: number; name: string }> = [];

	db.article.create;

	for (let i = 0; i < 50; i++) {
		const user = i < 25 ? "John" : "Jane";
		articles.push({
			author:
				user === "John"
					? { connect: { id: john.id } }
					: { connect: { id: jane.id } },
			title: `${user}'s article #${i} title`,
			description: `${user}'s article #${i} description`,
			body: `${user}'s article #${i} body`,
		});

		tags.push({ articleNo: i, name: user });
		tags.push({ articleNo: i, name: `x${Math.floor(i / 10)}` });
		tags.push({ articleNo: i, name: `y${i % 10}` });
	}

	for (const article of articles) {
		await db.article.create({ data: article });
	}

	const articleIds = (
		await db.article.findMany({
			select: { id: true },
			orderBy: { id: "asc" },
		})
	).map((article) => article.id);

	const slugs = articles.map((a, i) =>
		slugify(`${a.title}-${articleIds[i]}`, { lower: true, strict: true }),
	);

	for (const tag of tags) {
		await db.articleTags.create({
			data: {
				articleId: articleIds[tag.articleNo],
				tagName: tag.name,
			},
		});
	}

	return json({
		slugs,
		john: {
			...john,
			token: await createSignedToken(john.id, process.env.SERVER_SECRET!),
		},
		jane: {
			...jane,
			token: await createSignedToken(jane.id, process.env.SERVER_SECRET!),
		},
	});
}
