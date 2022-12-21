import { createMiddleware } from "rakkasjs/node-adapter";

export default createMiddleware((ctx) =>
	import("./entry-hattip").then((m) => m.default(ctx)),
);
