import { parse } from "cookie";
import { LoadHelpers, ServePageHook } from "rakkasjs";
import { ConduitService, verifyToken } from "lib/conduit-services";
import { ConduitClient } from "lib/rest-client";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { zodToConduitError } from "lib/zod-to-conduit-error";
import { ConduitError } from "lib/conduit-error";
import { getEnv } from "lib/env";
import { ConduitContext } from "lib/ConduitContext";
import React from "react";

export const servePage: ServePageHook = async (request, renderPage) => {
	const cookies = parse(request.headers.get("cookie") || "");

	const apiUrl = cookies.apiUrl || request.url.origin + "/api";
	const authToken = cookies.authToken || undefined;

	const user = await verifyToken(authToken);

	const { NODE_ENV } = getEnv();

	let helpers: LoadHelpers;

	if (apiUrl === request.url.origin + "/api") {
		// If the API URL hasn't been set, we can use the services directly
		helpers = {
			conduit: new ConduitService(Promise.resolve(user)),
		};
	} else {
		// Otherwise we'll use the REST clients
		helpers = {
			conduit: new ConduitClient(fetch.bind(globalThis), apiUrl, authToken),
		};
	}

	const response = await renderPage(
		request,
		{
			user: await helpers.conduit.getCurrentUser().catch(() => undefined),
			test: NODE_ENV === "test",
		},
		{
			createLoadHelpers() {
				return helpers;
			},

			wrap(page) {
				return (
					<ConduitContext.Provider value={{ user } as any}>
						{page}
					</ConduitContext.Provider>
				);
			},
		},
	).catch((error) => {
		if (error instanceof ZodError) {
			return {
				status: StatusCodes.UNPROCESSABLE_ENTITY,
				body: { errors: zodToConduitError(error) },
			};
		} else if (error instanceof ConduitError) {
			return {
				status: error.status,
				body: { errors: error.issues },
			};
		}

		throw error;
	});

	return response;
};
