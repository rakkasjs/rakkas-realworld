import { Link, StyledLink, useRouter } from "rakkasjs";
import React, { FC } from "react";
import { Helmet } from "react-helmet-async";
import { User } from "lib/interfaces";

interface HeaderProps {
	user?: User;
}

export const Header: FC<HeaderProps> = ({ user }) => {
	const { currentUrl } = useRouter();

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
									"nav-link" + (currentUrl.pathname === "/" ? " active" : "")
								}
							>
								Home
							</Link>
						</li>

						{user && (
							<>
								<li className="nav-item">
									<StyledLink
										href="/editor"
										className="nav-link"
										activeClass="active"
									>
										<i className="ion-compose"></i>&nbsp;New Article
									</StyledLink>
								</li>

								<li className="nav-item">
									<StyledLink
										href="/settings"
										className="nav-link"
										activeClass="active"
									>
										<i className="ion-gear-a"></i>&nbsp;Settings
									</StyledLink>
								</li>

								<li className="nav-item">
									<StyledLink
										href={`/profile/${encodeURIComponent(user.username)}`}
										className="nav-link"
										activeClass="active"
									>
										{user.image && (
											<img src={user.image} className="user-pic" />
										)}
										{user.username}
									</StyledLink>
								</li>
							</>
						)}

						{!user && (
							<>
								<li className="nav-item">
									<StyledLink
										href="/login"
										className="nav-link"
										activeClass="active"
									>
										Sign in
									</StyledLink>
								</li>

								<li className="nav-item">
									<StyledLink
										href="/register"
										className="nav-link"
										activeClass="active"
									>
										Sign up
									</StyledLink>
								</li>
							</>
						)}
					</ul>
				</div>
			</nav>
		</>
	);
};
