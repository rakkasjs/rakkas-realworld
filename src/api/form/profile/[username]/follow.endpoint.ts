import { convertResponse, FormSubmitRequestHandler } from "api/form/middleware";
import { post as follow } from "api/_rest/profiles/[username]/follow.endpoint";

export const post: FormSubmitRequestHandler = async (req) => {
	const username = req.params.username;

	return convertResponse(
		await follow({
			...req,
			context: {
				...req.context,
				username,
			},
			type: "json",
		}),
		`/profile/${encodeURIComponent(username)}`,
		`/profile/${encodeURIComponent(username)}`,
	);
};
