import {
	convertResponse,
	FormSubmitRequestHandler,
	paramsToObject,
} from "api/form/middleware";
import { put as updateUser } from "api/_rest/user.endpoint";

export const post: FormSubmitRequestHandler = async (req) => {
	return convertResponse(
		await updateUser({
			...req,
			type: "json",
			body: { user: paramsToObject(req.body) },
		}),
		"/settings",
		"/settings",
	);
};
