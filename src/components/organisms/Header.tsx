import { Link } from "rakkasjs";
import { User } from "~/client/interfaces";
import NavItem from "~/components/atoms/NavItem";
import { url } from "~/lib/utils";

interface HeaderProps {
	user: User | null;
}

export default function Header({ user }: HeaderProps) {
	return (
		<>
			<nav className="navbar navbar-light">
				<div className="container">
					<Link className="navbar-brand" href="/">
						conduit
					</Link>
					<ul className="nav navbar-nav pull-xs-right">
						<NavItem href="/">Home</NavItem>

						{user && (
							<>
								<NavItem href="/editor" icon="compose">
									New Article
								</NavItem>

								<NavItem href="/settings" icon="gear-a">
									Settings
								</NavItem>

								<NavItem href={url`/profile/${user.username}`}>
									{user.image && <img src={user.image} className="user-pic" />}
									{user.username}
								</NavItem>
							</>
						)}

						{!user && (
							<>
								<NavItem href="/login">Sign in</NavItem>
								<NavItem href="/register">Sign up</NavItem>
							</>
						)}
					</ul>
				</div>
			</nav>
		</>
	);
}
