import React, { useEffect } from "react";
import { defineLayout } from "rakkasjs";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoadingBar } from "./LoadingBar";
import { ConduitContext } from "lib/ConduitContext";
import { Helmet } from "react-helmet-async";

export default defineLayout({
	getCacheKey: ({ context }) => context,

	Component: function RootLayout({
		error,
		children,
		context: { user, apiUrl },
	}) {
		useEffect(() => {
			// For testing purposes
			document.body.classList.add("hydrated");
		}, []);

		return (
			<ConduitContext.Provider value={{ user, apiUrl, fetch }}>
				<Helmet titleTemplate="%s — Conduit" />
				<LoadingBar />
				<Header user={user || null} />
				{error && (
					<div className="container page">
						<h1>{error.status}</h1>
						<p>{error.message}</p>
					</div>
				)}
				{children}
				<Footer />
			</ConduitContext.Provider>
		);
	},
});
