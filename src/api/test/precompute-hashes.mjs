import bcrypt from "bcryptjs";

const NAMES = [
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

precomputePasswordHashes();

async function precomputePasswordHashes() {
	const output = [];
	for (const fullName of NAMES) {
		output.push([fullName, await bcrypt.hash(`${fullName}'s password`, 8)]);
	}

	console.log(output);
}
