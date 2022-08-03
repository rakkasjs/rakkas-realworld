import { startClient } from "rakkasjs";
import { parse, serialize } from "cookie";
import { ConduitAuthClient, ConduitClient } from "~/client";
import { User } from "~/client/interfaces";

const { apiUrl = "/api", authToken } = parse(document.cookie);

startClient({
	hooks: {
		extendPageContext(ctx) {
			const auth = new ConduitAuthClient(ctx.fetch, apiUrl, authToken);
			const conduit = new ConduitClient(ctx.fetch, apiUrl, authToken);

			ctx.locals.auth = auth;
			ctx.locals.conduit = conduit;

			// For test purposes
			(window as any).conduitLogin = async (user: User) => {
				auth.token = user.token;
				conduit.token = user.token;

				document.cookie = serialize("authToken", user.token, {
					maxAge: 60 * 60 * 24 * 30,
					path: "/",
					sameSite: true,
					secure: location.protocol === "https",
				});

				ctx.queryClient.invalidateQueries();
				ctx.queryClient.setQueryData("user", user);
				location.reload();
			};

			(window as any).conduitLogout = () => {
				auth.token = undefined;
				conduit.token = undefined;

				document.cookie = serialize("authToken", "", {
					maxAge: 0,
					path: "/",
				});

				ctx.queryClient.invalidateQueries();
				location.reload();
			};
		},
	},
});
