import { ConduitRequestHandler } from "api/_rest/middleware";
import { Profile } from "lib/api-types";

export const get: ConduitRequestHandler = async ({
	params: { username },
	context: { user, db },
}) => {
	const rawProfile = await db.user.findUnique({
		where: {
			username,
		},
		select: {
			username: true,
			bio: true,
			image: true,
			followers: user ? { where: { id: user.id } } : false,
		},
	});

	if (!rawProfile) {
		return { status: 404 };
	}

	const profile: Profile = {
		username: rawProfile.username,
		bio: rawProfile.bio,
		image: rawProfile.image,
		following: rawProfile.followers ? rawProfile.followers.length > 0 : false,
	};

	return { body: { profile } };
};
