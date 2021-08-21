const fs = require("fs");
const path = require("path");
const { hashSync } = require("bcrypt");

// Find the smallest number of rounds where hashing takes more than 250ms
let rounds;
for (rounds = 8; rounds < 30; ++rounds) {
	const start = process.hrtime();
	hashSync("topsecret", rounds);
	const elapsed = process.hrtime(start)[1] / 1_000_000;
	if (elapsed >= 250) break;
}

const output = `HOST=localhost
PORT=3000
DATABASE_URL="file://${path
	.join(__dirname, "db.sqlite")
	.split(path.sep)
	.join(path.posix.sep)}"
SERVER_SECRET="${require("crypto").randomBytes(48).toString("hex")}"
SALT_ROUNDS=${rounds}
`;

fs.promises.writeFile(".env", output, { encoding: "utf-8" });
