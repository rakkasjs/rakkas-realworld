import { StyledLink, useLocation } from "rakkasjs";
import { FC } from "react";
import css from "./Pagination.module.css";

interface PaginationProps {
	current: number;
	total: number;
}

export const Pagination: FC<PaginationProps> = ({ current, total }) => {
	const { current: currentUrl } = useLocation();

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
						<StyledLink
							className={css.paginationLink}
							href={pageLink(1)}
							activeClass="bg-primary"
							pendingStyle={{ backgroundColor: "#ded" }}
						>
							&lt;&lt;
						</StyledLink>
					</li>
				)}

				{current !== 1 && (
					<li className={css.paginationItem}>
						<StyledLink
							className={css.paginationLink}
							href={pageLink(current - 1)}
							activeClass="bg-primary"
							pendingStyle={{ backgroundColor: "#ded" }}
						>
							&lt;
						</StyledLink>
					</li>
				)}

				{pages.map((page) => (
					<li key={page} className={css.paginationItem}>
						<StyledLink
							className={css.paginationLink}
							href={pageLink(page)}
							activeClass="bg-primary"
							pendingStyle={{ backgroundColor: "#ded" }}
						>
							{page}
						</StyledLink>
					</li>
				))}

				{current !== total && (
					<li className={css.paginationItem}>
						<StyledLink
							className={css.paginationLink}
							href={pageLink(current + 1)}
							activeClass="bg-primary"
							pendingStyle={{ backgroundColor: "#ded" }}
						>
							&gt;
						</StyledLink>
					</li>
				)}

				{last !== total && (
					<li className={css.paginationItem}>
						<StyledLink
							className={css.paginationLink}
							href={pageLink(total)}
							activeClass="bg-primary"
							pendingStyle={{ backgroundColor: "#ded" }}
						>
							&gt;&gt;
						</StyledLink>
					</li>
				)}
			</ul>
		</nav>
	);
};
