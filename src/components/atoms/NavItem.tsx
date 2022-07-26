import { StyledLink } from "rakkasjs";
import { ReactNode } from "react";

interface NavItemProps {
	href: string;
	icon?: string;
	children: ReactNode;
}

export default function NavItem({ href, icon, children }: NavItemProps) {
	return (
		<li className="nav-item">
			<StyledLink
				className="nav-link"
				href={href}
				activeClass="active"
				pendingStyle={{
					borderBottom: "2px solid #777",
					color: "#777",
				}}
			>
				{icon && (
					<>
						<i className={`ion-${icon}`}></i>&nbsp;
					</>
				)}
				{children}
			</StyledLink>
		</li>
	);
}
