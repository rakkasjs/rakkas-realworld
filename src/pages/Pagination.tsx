import { NavLink, useRouter } from "rakkasjs";
import React, { FC } from "react";
import css from "./Pagination.module.css";

interface PaginationProps {
	current: number;
	total: number;
}

export const Pagination: FC<PaginationProps> = ({ current, total }) => {
	const { current: currentUrl } = useRouter();

	if (total < 2) return null;

	const first = Math.max(1, current - 4);
	const last = Math.min(total, first + 8);

	const url = new URL(currentUrl.href);

	function pageLink(page: number) {
		if (page === 1) {
			url.searchParams.delete("page");
		} else {
			url.searchParams.set("page", String(page));
		}

		return url.href;
	}

	const pages = [...Array(last - first + 1)].map((_, i) => first + i);

	return (
		<nav>
			<ul className="pagination">
				{first > 1 && (
					<li className={css.paginationItem}>
						<NavLink
							className={css.paginationLink}
							href={pageLink(1)}
							currentRouteClass="bg-primary"
							nextRouteStyle={{ backgroundColor: "#ded" }}
						>
							&lt;&lt;
						</NavLink>
					</li>
				)}

				{current !== 1 && (
					<li className={css.paginationItem}>
						<NavLink
							className={css.paginationLink}
							href={pageLink(current - 1)}
							currentRouteClass="bg-primary"
							nextRouteStyle={{ backgroundColor: "#ded" }}
						>
							&lt;
						</NavLink>
					</li>
				)}

				{pages.map((page) => (
					<li key={page} className={css.paginationItem}>
						<NavLink
							className={css.paginationLink}
							href={pageLink(page)}
							currentRouteClass="bg-primary"
							nextRouteStyle={{ backgroundColor: "#ded" }}
						>
							{page}
						</NavLink>
					</li>
				))}

				{current !== total && (
					<li className={css.paginationItem}>
						<NavLink
							className={css.paginationLink}
							href={pageLink(current + 1)}
							currentRouteClass="bg-primary"
							nextRouteStyle={{ backgroundColor: "#ded" }}
						>
							&gt;
						</NavLink>
					</li>
				)}

				{last !== total && (
					<li className={css.paginationItem}>
						<NavLink
							className={css.paginationLink}
							href={pageLink(total)}
							currentRouteClass="bg-primary"
							nextRouteStyle={{ backgroundColor: "#ded" }}
						>
							&gt;&gt;
						</NavLink>
					</li>
				)}
			</ul>
		</nav>
	);
};
