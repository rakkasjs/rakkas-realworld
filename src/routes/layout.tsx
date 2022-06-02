import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoadingBar } from "./LoadingBar";
import { ConduitContext } from "lib/ConduitContext";
import { User } from "lib/interfaces";
import { ErrorBoundary, LayoutProps, Head } from "rakkasjs";

export default function RootLayout(props: LayoutProps) {
	useEffect(() => {
		// For testing purposes
		document.body.classList.add("hydrated");
	}, []);

	const user: User | undefined = undefined;
	const ctx = undefined;

	return (
		<ConduitContext.Provider value={{ ...ctx, user }}>
			<Head titleTemplate="%s — Conduit" />
			<LoadingBar />
			<Header user={user} />
			<ErrorBoundary
				fallbackRender={({ error }) => (
					<div className="container page">
						<h1>Error</h1>
						<p>{error.message}</p>
						{import.meta.env.NODE_ENV !== "production" && (
							<pre>{error.stack}</pre>
						)}
					</div>
				)}
			>
				{props.children}
			</ErrorBoundary>
			<Footer />
		</ConduitContext.Provider>
	);
}
