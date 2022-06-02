import { db } from "lib/db";
import { createUser } from "./create-user.api";
import type { Prisma } from "@prisma/client";
import { ConduitError } from "lib/conduit-error";
import slugify from "slugify";
import { createSignedToken } from "lib/auth-service";

export async function post(): Promise<Response> {
	try {
		const john = await createUser("John Doe");
		const jane = await createUser("Jane Foo");

		const articles: Prisma.ArticleCreateManyInput[] = [];
		const tags: Array<{ articleNo: number; name: string }> = [];

		db.article.create;

		for (let i = 0; i < 50; i++) {
			const user = i < 25 ? "John" : "Jane";
			articles.push({
				authorId: user === "John" ? john.id : jane.id,
				title: `${user}'s article #${i} title`,
				description: `${user}'s article #${i} description`,
				body: `${user}'s article #${i} body`,
			});

			tags.push({ articleNo: i, name: user });
			tags.push({ articleNo: i, name: `x${Math.floor(i / 10)}` });
			tags.push({ articleNo: i, name: `y${i % 10}` });
		}

		await db.article.createMany({ data: articles });

		const articleIds = (
			await db.article.findMany({
				select: { id: true },
				orderBy: { id: "asc" },
			})
		).map((article) => article.id);

		const slugs = articles.map((a, i) =>
			slugify(`${a.title}-${articleIds[i]}`, { lower: true, strict: true }),
		);

		await db.articleTags.createMany({
			data: tags.map((tag) => ({
				articleId: articleIds[tag.articleNo],
				tagName: tag.name,
			})),
		});

		return new Response(
			JSON.stringify({
				slugs,
				john: { ...john, token: await createSignedToken(john.id) },
				jane: { ...jane, token: await createSignedToken(jane.id) },
			}),
		);
	} catch (error) {
		if (error instanceof ConduitError) {
			return new Response(JSON.stringify(error.message), {
				status: error.status,
			});
		}

		throw error;
	}
}
