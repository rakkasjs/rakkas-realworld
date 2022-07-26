import { startClient } from "rakkasjs";
import { parse } from "cookie";
import { ConduitAuthClient, ConduitClient } from "~/client";

const { apiUrl = "/api", authToken } = parse(document.cookie);

startClient({
	hooks: {
		extendPageContext(ctx) {
			ctx.locals.auth = new ConduitAuthClient(ctx.fetch, apiUrl, authToken);
			ctx.locals.conduit = new ConduitClient(ctx.fetch, apiUrl, authToken);
		},
	},
});
