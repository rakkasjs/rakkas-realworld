import { RequestHandler } from "rakkasjs";
import { db } from "lib/db";

export const post: RequestHandler = async () => {
	// Create 26 random users with one article by each

	for (const [i, [fullName, passwordHash]] of USERS.entries()) {
		const [name, surname] = fullName.split(" ");
		await db.user.create({
			data: {
				username: fullName,
				email: `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`,
				passwordHash,
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

// Prehashed passwords = "<Name> <Surname>'s password"
const USERS = [
	[
		"Rosalee Dines",
		"$2a$08$gK8uuhSgv8kArE3gNyoDxuRLBZteVivds63cq.FX7rLiPMsKknDSC",
	],
	[
		"Tamara Bizier",
		"$2a$08$7eg4M0qg6MfvkZdIW1GR6etFOpE.LWrVBJ0aBQZROsIZquKQ342cW",
	],
	[
		"Essie Brigance",
		"$2a$08$y.43fqxW9k1r8LdBzyb7b.jO25zNon.TOD0HyBUKxHG8fgn1JDGji",
	],
	[
		"Dolly Massman",
		"$2a$08$kuIx4OjwvCgMqgp0sdP.ZOdWDqV1hwMiUP78Ove5RM2K5rEJl8z.a",
	],
	[
		"Blythe Palomo",
		"$2a$08$cnF.OR8Eh2BNqFsOzLvvVedSuPtuN4MI/dy7BtjTBstpm8znjTS8m",
	],
	[
		"Jodie Becher",
		"$2a$08$AQIBNhrqyTHgFn/jU9qRs.eLEl3V8I52O.dbUpX3zEHJUvyCozfL2",
	],
	[
		"Caitlin Carney",
		"$2a$08$1qo0tXDC7gFLjgaUKsAun.QoisA3.XghqnCoa5cmKvIc57ter.lTG",
	],
	[
		"Zelma Mcbride",
		"$2a$08$BdAeCdryhrdS5QbghUcMM.DyAEEE9j3pVk2DhTd6cHkxm.t/RPpXG",
	],
	[
		"Lakeisha Hane",
		"$2a$08$SONyxduwFhUA6trk/.mlk.DV9N6zM4muvhN97xRVF4AKHreZZOXJW",
	],
	[
		"Latonya Mcmurtrie",
		"$2a$08$ewpJ9ZYVpZQZ/KnhNPgMsOzaSnmVjlxxfal6KIP7rLuG5kP4nLAR.",
	],
	[
		"Shemika Tunison",
		"$2a$08$peSi2zhoQ5ciQ1GiQx9raubyUh1Wp9qBgP6qVXDA9CqHcri9CUGQq",
	],
	[
		"Karey Cray",
		"$2a$08$oIf8pffO7zODmXqXPdkJAuIvZzyUrL2EmK9cbM.g0o4ibAwRGJ.Xu",
	],
	[
		"Noreen Jean",
		"$2a$08$RkBPxIyM7AsLyu9nvmDkIOfblROE4.y7AV2MNl27Binw4ybzeKy1S",
	],
	[
		"Jack Jordon",
		"$2a$08$HDbs21jG.OZcfNTfHeadaOsYycF1N6pWwxzMb/861CPjRGbbHBrJq",
	],
	[
		"Colby Mieles",
		"$2a$08$Ui7uJTtKU11sXTx6F7WhvevPL/Djmn4McEUlnWJDrmX4noCIVeeYG",
	],
	[
		"Etha Burden",
		"$2a$08$Gd5iI7PkRtmk1QEklGEXIeXxtI1Vcr8vZaTn9bB2YZ.jfop96LYGK",
	],
	[
		"Aracely Castilla",
		"$2a$08$xXA1irT0lu0JEPMRe506J.y4jmwif6CwpzCv1NXE/0oQWEgN1iP9C",
	],
	[
		"Mona Arriola",
		"$2a$08$OpD0lEek60i3eoZ6D9Eqj.VTUuumOtGoHAquOdnXwOFrM2RKYmRku",
	],
	[
		"Bronwyn Mrozek",
		"$2a$08$uVLUKgKiYvXBTboqUXHbquGT7vA4LXpRuoZGmZSAuAF5itNi.YaWC",
	],
	[
		"Cheyenne Kube",
		"$2a$08$VFFVCnI8Xo6Cbkh7.4zfXeIc2PedHPmVG8SoPIh.ZsOM6rGOhFdxe",
	],
	[
		"Mara Madia",
		"$2a$08$0vL9JvlkFLDlLKDeL8P1NeTNKr/uq1VlFY9AD0sUl9k2KqcClJKtS",
	],
	[
		"Muriel Sedgwick",
		"$2a$08$GEwV6XFkn0M5/W.M8s5Qbe2imuC9Ym1/dx3nfEWyPnV0antAr1Hp.",
	],
	[
		"Dewitt Brakefield",
		"$2a$08$DcJk4qY.pYCKz/lR7CtP2uuiDy1hpoZtK24EW2EX0w77.hAhZN7zC",
	],
	[
		"Carma Vachon",
		"$2a$08$nyfwMmiNBOZTh4F.Soyd8.vl2s2Rk/kkCQ8mLtaH1TI2VVg30YLbi",
	],
	[
		"Michal Hawks",
		"$2a$08$hRjU/elcewF05ysJBXorguoC3dRzsVkyIFJsoeljMSpFne3vYou9e",
	],
	[
		"Donnetta Peterkin",
		"$2a$08$1nU/07k68Tx9Y4wgvJ47X.j8qKpdmglAl2nrdRGT9yiXxJk/keMTO",
	],
];
