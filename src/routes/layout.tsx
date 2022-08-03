import { useEffect } from "react";
import Header from "~/components/organisms/Header";
import Footer from "~/components/organisms/Footer";
import LoadingBar from "~/components/atoms/LoadingBar";
import { ErrorBoundary, Head, Layout, useQuery } from "rakkasjs";

const RootLayout: Layout = (props) => {
	const { data: user } = useQuery(
		"user",
		(ctx) => ctx.locals.conduit.getCurrentUser(),
		{
			// Check once in a while to see if the user is still logged in
			refetchInterval: 15_000,
			refetchOnReconnect: true,
			refetchOnWindowFocus: true,
		},
	);

	// For testing purposes
	if (process.env.NODE_ENV === "test") {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			document.body.classList.add("hydrated");
		}, []);
	}

	return (
		<>
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
		</>
	);
};

RootLayout.preload = () => {
	return {
		head: (
			<Head titleTemplate="%s — Conduit">
				<meta charSet="utf-8" />
				{/* Import Ionicon icons & Google Fonts that the Bootstrap theme relies on */}
				<link
					href="//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css"
					rel="stylesheet"
					type="text/css"
				/>
				<link
					href="//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic"
					rel="stylesheet"
					type="text/css"
				/>
				{/* Import the custom Bootstrap 4 theme from the hosted CDN */}
				<link
					rel="stylesheet"
					href="https://demo.productionready.io/main.css"
				/>
			</Head>
		),
	};
};

export default RootLayout;
