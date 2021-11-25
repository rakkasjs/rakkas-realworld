import { RequestHandler } from "rakkasjs";
import { db } from "lib/db";
import { StatusCodes } from "http-status-codes";
import { ConduitError } from "lib/conduit-error";
import { User } from "lib/interfaces";
import { createSignedToken } from "lib/auth-service";

export const post: RequestHandler = async ({ url }) => {
	const username = url.searchParams.get("name") || "";

	return createUser(username)
		.then(async (u) => {
			const user: User = { ...u, token: await createSignedToken(u.id) };

			return { body: { user } };
		})
		.catch((error) => {
			if (error instanceof ConduitError) {
				return { status: error.status, body: error.message };
			}

			throw error;
		});
};

export async function createUser(username: string) {
	if (username !== "John Doe" && username !== "Jane Foo") {
		throw new ConduitError(
			StatusCodes.UNPROCESSABLE_ENTITY,
			"Unknown user name",
		);
	}

	const [name, surname] = username.split(" ");
	const email = `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`;

	return await db.user.create({
		data: {
			username,
			passwordHash: HASHES[username],
			email,
			bio: "",
			image: null,
		},
		select: {
			id: true,
			username: true,
			email: true,
			bio: true,
			image: true,
		},
	});
}

const HASHES = {
	"John Doe": "$2b$08$7l.jXYtWRRsrplLC4ZWB.u3aYZAByGZZUw43qWZgaKBVhhcWU/F4C",
	"Jane Foo": "$2b$08$K1yo.awIfYCWS5QOp1XtcOcttJ5oaDo/OzH5T0YjaQatp75LMCaW2",
};
