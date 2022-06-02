import { getEnv } from "lib/env";
import { RakkasMiddleware } from "rakkasjs";

const testMiddleware: RakkasMiddleware = (request, next) => {
	if (getEnv().NODE_ENV !== "test") {
		return { status: 404 };
	}

	return next(request);
};

export default testMiddleware;
