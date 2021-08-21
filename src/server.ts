import { parse } from "cookie";
import { getCurrentUser } from "lib/conduit-client";
import { ServePageHook } from "rakkasjs";
import { User } from "lib/api-types";

export const servePage: ServePageHook = async (request, renderPage) => {
	const cookies = parse(request.headers.get("cookie") || "");

	const apiUrl = cookies.apiUrl || request.url.origin + "/api";
	// "https://conduit.productionready.io/api";
	const authToken = cookies.authToken || null;

	const user = authToken
		? await getCurrentUser({
				apiUrl,
				// Cheat a little to reuse this function
				user: { token: authToken } as User,
				fetch,
		  })
		: null;

	const response = await renderPage(request, {
		apiUrl,
		user: user || undefined,
	});

	return response;
};
