import React, { useContext, useEffect } from "react";
import { defineLayout } from "rakkasjs";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoadingBar } from "./LoadingBar";
import { Helmet } from "react-helmet-async";
import { ConduitContext } from "lib/ConduitContext";

export default defineLayout({
	getCacheKey: ({ context }) => context,

	Component: function RootLayout({ error, children, context: { user } }) {
		const ctx = useContext(ConduitContext);

		useEffect(() => {
			// For testing purposes
			document.body.classList.add("hydrated");
		}, []);

		return (
			<ConduitContext.Provider value={{ ...ctx, user }}>
				<Helmet titleTemplate="%s — Conduit" />
				<LoadingBar />
				<Header user={user} />
				{error && (
					<div className="container page">
						<h1>{error.status}</h1>
						<p>{error.message}</p>
						{import.meta.env.NODE_ENV !== "production" && (
							<pre>{error.stack}</pre>
						)}
					</div>
				)}
				{children}
				<Footer />
			</ConduitContext.Provider>
		);
	},
});
