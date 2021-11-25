import React from "react";
import { definePage } from "rakkasjs";
import { Auth } from "./Auth";
import { StatusCodes } from "http-status-codes";
import { Helmet } from "react-helmet-async";

export default definePage({
	load({ context: { user } }) {
		if (user) {
			return {
				status: StatusCodes.SEE_OTHER,
				location: "/",
				data: undefined,
			};
		}

		return { data: undefined };
	},

	Component: function LoginPage({ url }) {
		return (
			<>
				<Helmet title="Sign in" />
				<Auth type="signin" errorMessages={url.searchParams.getAll("error")} />
			</>
		);
	},
});
