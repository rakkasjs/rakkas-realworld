import { RequestHandler } from "rakkasjs";
import { db } from "lib/db";

export const post: RequestHandler = async () => {
	// Create 26 random users with one article by each

	await db.user.createMany({
		data: USERS.map(([fullName, passwordHash]) => {
			const [name, surname] = fullName.split(" ");

			return {
				username: fullName,
				email: `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`,
				passwordHash,
				bio: `${fullName}'s bio`,
				image: `https://ui-avatars.com/api/?name=${name}+${surname}`,
			};
		}),
	});

	const userIds = await db.user.findMany({ select: { id: true } });

	await db.article.createMany({
		data: USERS.map(([fullName], i) => {
			return {
				authorId: userIds[i].id,
				title: `${fullName}'s article #${i} title`,
				description: `${fullName}'s article #${i} description`,
				body: `${fullName}'s article #${i} body`,
			};
		}),
	});

	const articleIds = await db.article.findMany({ select: { id: true } });
	await db.articleTags.createMany({
		data: articleIds
			.map((article, i) => [
				{ articleId: article.id, tagName: USERS[i][0] },
				{ articleId: article.id, tagName: `x${Math.floor(i / 10)}` },
				{ articleId: article.id, tagName: `y${i % 10}` },
			])
			.flat(),
	});

	/*
					tags: {
					create: [
						{ tagName: fullName },
						{ tagName: `x${Math.floor(i / 10)}` },
						{ tagName: `y${i % 10}` },
					],
				},
	*/

	return {};
};

// Prehashed passwords = "<Name> <Surname>'s password"
const USERS = [
	[
		"Rosalee Dines",
		"$2a$08$lcJogACrd4en2ALxjy0DzetR4g/vUxAIdvKACCosQrX9pU0tQJVBa",
	],
	[
		"Tamara Bizier",
		"$2a$08$f9v6N/w0Wzo/6zXeQOwZTO2ku2yPXQhrUiJTomCX2p7aXq8VKIcPm",
	],
	[
		"Essie Brigance",
		"$2a$08$YU2oo7Ea451vAYa6C6TxeOi/4wgaodgwsIAINhIIloxINF4Lbivyq",
	],
	[
		"Dolly Massman",
		"$2a$08$ZojgCuD.ffuzmZKV6umv2OLQ8DXnCxT9uJd.7peLhjVYI7nMXTOFW",
	],
	[
		"Blythe Palomo",
		"$2a$08$Ac3ZaihGNJ1CP.w/sGjC8uMBucwdBUjQHh249b2gphIGzTkl2ylBW",
	],
	[
		"Jodie Becher",
		"$2a$08$95dneAhZyET9d7SE23EK3.3sY97d1.nhTJAZQdSZolYwZ.vEt0ef6",
	],
	[
		"Caitlin Carney",
		"$2a$08$gXXCAU/Vkb2wJ5kD9OjHv.aEy9kQ.cFH/gDQUS1JVFVGzMYtiMvea",
	],
	[
		"Zelma Mcbride",
		"$2a$08$LUCPJLeq6/mPvDiJjjGg4uSECYI0PtyfCtQD77jrH3BoyHnYSrEBi",
	],
	[
		"Lakeisha Hane",
		"$2a$08$Y2A4Kx1vhz7T6wQkZhAX.O4JmKmODetXiWbSw8jOnlorPYiy7rBvO",
	],
	[
		"Latonya Mcmurtrie",
		"$2a$08$EjEBcb6VDriy.emXZma5we2k2Wbhl3q5Xhv9Cowm2DRpgrEhZFqxS",
	],
	[
		"Shemika Tunison",
		"$2a$08$jFmKK4.gn9F03WADy.zPk.IItvRabY74U/I.AGbgq9FXFvMKrcP56",
	],
	[
		"Karey Cray",
		"$2a$08$XdOWopQ6qdrZB7XkAoFe0eIFsN/1WNVZE.78ePthIHlfskpbUif1G",
	],
	[
		"Noreen Jean",
		"$2a$08$yCoWIU.mDWJE1qVnNaon3.c6JCdYkQtOEYh/MhWREuuIGRytfKx5S",
	],
	[
		"Jack Jordon",
		"$2a$08$gUVRlQ2OZ8bIa/oJq4V6Cu8TW/PzIpNB3JQe1IXNII0vE8ZwAEIiC",
	],
	[
		"Colby Mieles",
		"$2a$08$VQB6Gzeg38g8vV23y8QNO.djPQjCo.zt5l/nSrHrfN.TqAsuvxb7O",
	],
	[
		"Etha Burden",
		"$2a$08$8X/r/J4hXI8AF0mr6HPo2uOfwyUDy/VhJfgotzH6l99FCOOrT.lfe",
	],
	[
		"Aracely Castilla",
		"$2a$08$YhfPbqelyimMzCRitDvt2eHA4zQzGT/qp3iu2enwlKAtls39G5n..",
	],
	[
		"Mona Arriola",
		"$2a$08$i15w2Vwo9/ssrZuqOVivQOO4VXvqiYV/phicoc3t94W1lB7QN5I6S",
	],
	[
		"Bronwyn Mrozek",
		"$2a$08$OaQRQlrm7/wkeDWQECCD5.8HNdYRxA7BvEQDtK1JY89j/BfMHI9gi",
	],
	[
		"Cheyenne Kube",
		"$2a$08$DT9tp3rF5pZ2FxJXVPAQ7.TpNdzY1qbUoE28/5qD4MSukej84j/Wu",
	],
	[
		"Mara Madia",
		"$2a$08$p4TWzlZ1HzgFRP2ojEgT7OQ9yZxqZVGl4ERqCEbbdQELL8xn0rFWe",
	],
	[
		"Muriel Sedgwick",
		"$2a$08$izzaISXnNf/0vSLMQ9v3C.ZijEj/0UI8H1bdm5G3FbMrDck7eKdVG",
	],
	[
		"Dewitt Brakefield",
		"$2a$08$alBNMHyCUitqun9OfukLd.QJIQuqp.82yt7PNRzLjmvioUeUejceq",
	],
	[
		"Carma Vachon",
		"$2a$08$eUUmcuOUKKZdWZfVBdoMfuGST7c7UMK.7TGSb0Y6/dmbOBrY0ZIn6",
	],
	[
		"Michal Hawks",
		"$2a$08$XfD7OPq0vIqWD8/.L5CXW.Re6JV9.WW2lMMA6scnBTfh397iDuO8m",
	],
	[
		"Donnetta Peterkin",
		"$2a$08$QMHCUkz1KKu9gzWpjP.H5O1ktoNEMmqKglu0iX0lAH79oBo6TBN.S",
	],
];
