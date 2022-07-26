import { StatusCodes } from "http-status-codes";

export default function testMiddleware() {
	if (import.meta.env.PROD && process.env.NODE_ENV !== "test") {
		return new Response(null, { status: StatusCodes.NOT_FOUND });
	}
}
