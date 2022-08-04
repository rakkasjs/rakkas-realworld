/* eslint-disable import/no-named-as-default-member */
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import findFreePort from "find-free-port";
import url from "url";
import crypto from "crypto";
import readline from "readline";

export async function go() {
	const prod = process.env.NODE_ENV === "production";

	const HOST = process.env.HOST || (prod ? "0.0.0.0" : "localhost");
	const PORT = prod
		? await findFreePort(3000)
		: process.env.PORT || (await findFreePort(3000));
	const DATABASE_URL =
		process.env.DATABASE_URL ||
		(prod
			? url.pathToFileURL(await getDbFileName())
			: url.pathToFileURL(path.join(__dirname, "db.sqlite")));
	const SERVER_SECRET =
		process.env.SERVER_SECRET || crypto.randomBytes(48).toString("hex");
	const SALT_ROUNDS =
		process.env.SALT_ROUNDS || (prod ? calculateSaltRounds() : "8");

	let output = `HOST=${HOST}
PORT=${PORT}
DATABASE_URL=${DATABASE_URL}
SERVER_SECRET=${SERVER_SECRET}
SALT_ROUNDS=${SALT_ROUNDS}
`;

	if (prod) output += "TRUST_FORWARDED_ORIGIN=1";

	await fs.promises.writeFile(".env", output, { encoding: "utf-8" });
}

function calculateSaltRounds() {
	let rounds;
	for (rounds = 8; rounds < 30; ++rounds) {
		const start = process.hrtime();
		bcrypt.hashSync("topsecret", rounds);
		const elapsed = process.hrtime(start)[1] / 1_000_000;
		if (elapsed >= 250) break;
	}

	return rounds;
}

async function getDbFileName(): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question("Absolute file path for the database? ", (answer) => {
			resolve(answer);
			rl.close();
		});
	});
}
