import { RequestHandler } from "rakkasjs";
import { db } from "lib/db";
import { hash } from "bcryptjs";
import { getEnv } from "lib/env";

export const post: RequestHandler = async () => {
	// Create 26 random users with one article by each
	for (const [i, fullName] of RANDOM_NAMES.entries()) {
		const [name, surname] = fullName.split(" ");

		const { SALT_ROUNDS } = getEnv();

		// Create 20 users and articles
		await db.user.create({
			data: {
				username: fullName,
				email: `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`,
				passwordHash: await hash(`${fullName}'s password`, SALT_ROUNDS),
				bio: `${fullName}'s bio`,
				image: `https://ui-avatars.com/api/?name=${name}+${surname}`,
				articles: {
					create: [
						{
							title: `${fullName}'s article #${i} title`,
							description: `${fullName}'s article #${i} description`,
							body: `${fullName}'s article #${i} body`,
							tags: {
								create: [
									{ tagName: fullName },
									{ tagName: `x${Math.floor(i / 10)}` },
									{ tagName: `y${i % 10}` },
								],
							},
						},
					],
				},
			},
		});
	}

	return {};
};

const RANDOM_NAMES = [
	"Rosalee Dines",
	"Tamara Bizier",
	"Essie Brigance",
	"Dolly Massman",
	"Blythe Palomo",
	"Jodie Becher",
	"Caitlin Carney",
	"Zelma Mcbride",
	"Lakeisha Hane",
	"Latonya Mcmurtrie",
	"Shemika Tunison",
	"Karey Cray",
	"Noreen Jean",
	"Jack Jordon",
	"Colby Mieles",
	"Etha Burden",
	"Aracely Castilla",
	"Mona Arriola",
	"Bronwyn Mrozek",
	"Cheyenne Kube",
	"Mara Madia",
	"Muriel Sedgwick",
	"Dewitt Brakefield",
	"Carma Vachon",
	"Michal Hawks",
	"Donnetta Peterkin",
];
