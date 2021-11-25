import "core-js/features/object/from-entries";

import { ConduitAuthClient, ConduitClient } from "lib/rest-client";
import React from "react";
import { setRootContext, defineClientHooks } from "rakkasjs";
import { ConduitContext } from "lib/ConduitContext";
import { serialize } from "cookie";
import { User } from "lib/interfaces";

let context: ConduitContext;

export default defineClientHooks({
	beforeStartClient(rootContext) {
		const apiUrl = "/api";

		const boundFetch: typeof fetch = (...args) => fetch(...args);

		context = {
			// FIXME: Use AUTH_API_URL
			auth: new ConduitAuthClient(boundFetch, apiUrl, rootContext.user?.token),
			conduit: new ConduitClient(boundFetch, apiUrl, rootContext.user?.token),
			user: rootContext.user,
		};

		if (rootContext.test) {
			(window as any).conduitLogin = async (user: User) => {
				context.auth.token = user.token;
				context.conduit.token = user.token;

				document.cookie = serialize("authToken", user.token, {
					maxAge: 60 * 60 * 24 * 30,
					path: "/",
					sameSite: true,
					secure: location.protocol === "https",
				});

				setRootContext((old) => ({
					...old,
					user,
				}));
			};

			(window as any).conduitLogout = () => {
				context.auth.token = undefined;
				context.conduit.token = undefined;

				document.cookie = serialize("authToken", "", {
					maxAge: 0,
					path: "/",
				});

				setRootContext((old) => ({
					...old,
					user: undefined,
				}));
			};
		}
	},

	createLoadHelpers() {
		return { conduit: context.conduit };
	},

	wrap(app: JSX.Element) {
		return (
			<ConduitContext.Provider value={context}>{app}</ConduitContext.Provider>
		);
	},
});
