import { Link, NavLink, useRouter } from "rakkasjs";
import React, { FC } from "react";
import { Helmet } from "react-helmet-async";
import { User } from "lib/interfaces";

interface HeaderProps {
	user?: User;
}

export const Header: FC<HeaderProps> = ({ user }) => {
	const { current } = useRouter();

	return (
		<>
			<Helmet>
				<meta charSet="utf-8" />
				<title>Conduit</title>
				{/* Import Ionicon icons & Google Fonts our Bootstrap theme relies on */}
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
				{/* Import the custom Bootstrap 4 theme from our hosted CDN */}
				<link rel="stylesheet" href="//demo.productionready.io/main.css" />
			</Helmet>

			<nav className="navbar navbar-light">
				<div className="container">
					<Link className="navbar-brand" href="/">
						conduit
					</Link>
					<ul className="nav navbar-nav pull-xs-right">
						<li className="nav-item">
							<Link
								href="/"
								className={
									"nav-link" + (current.pathname === "/" ? " active" : "")
								}
							>
								Home
							</Link>
						</li>

						{user && (
							<>
								<li className="nav-item">
									<NavLink
										href="/editor"
										className="nav-link"
										currentRouteClass="active"
									>
										<i className="ion-compose"></i>&nbsp;New Article
									</NavLink>
								</li>

								<li className="nav-item">
									<NavLink
										href="/settings"
										className="nav-link"
										currentRouteClass="active"
									>
										<i className="ion-gear-a"></i>&nbsp;Settings
									</NavLink>
								</li>

								<li className="nav-item">
									<NavLink
										href={`/profile/${encodeURIComponent(user.username)}`}
										className="nav-link"
										currentRouteClass="active"
									>
										{user.image && (
											<img src={user.image} className="user-pic" />
										)}
										{user.username}
									</NavLink>
								</li>
							</>
						)}

						{!user && (
							<>
								<li className="nav-item">
									<NavLink
										href="/login"
										className="nav-link"
										currentRouteClass="active"
									>
										Sign in
									</NavLink>
								</li>

								<li className="nav-item">
									<NavLink
										href="/register"
										className="nav-link"
										currentRouteClass="active"
									>
										Sign up
									</NavLink>
								</li>
							</>
						)}
					</ul>
				</div>
			</nav>
		</>
	);
};
