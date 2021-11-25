import { ActionButton } from "lib/ActionButton";
import { Article } from "lib/interfaces";
import { ConduitContext } from "lib/ConduitContext";
import { Link } from "rakkasjs";
import React, { CSSProperties, FC, useContext } from "react";

export interface FavoriteButtonProps {
	article: Article;
	onChange?(article: Article): void;
	minimal?: boolean;
	style?: CSSProperties;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
	article,
	minimal,
	style,
	onChange,
}) => {
	const ctx = useContext(ConduitContext);

	return ctx.user ? (
		<ActionButton
			key={`${ctx.user.token}:${article.slug}:${article.favorited}`}
			style={style}
			action={
				"/api/form/article/" +
				encodeURIComponent(article.slug) +
				(article.favorited ? "/unfavorite" : "/favorite")
			}
			title="Favorite article"
			label={
				<>
					{minimal || (
						<>
							{article.favorited ? (
								<>Unfavorite Article </>
							) : (
								<>Favorite Article </>
							)}{" "}
						</>
					)}
					<span className="counter">
						{minimal || "("}
						{article.favoritesCount}
						{minimal || ")"}
					</span>
				</>
			}
			inProgressLabel={
				<>
					{minimal || (
						<>
							{article.favorited ? (
								<>Unfavorite Article </>
							) : (
								<>Favorite Article </>
							)}{" "}
						</>
					)}
					<span className="counter">({article.favoritesCount})</span>
				</>
			}
			icon="heart"
			type="primary"
			size="small"
			outline={!article.favorited}
			onClick={async () => {
				const newArticle = await (article.favorited
					? ctx.conduit.unfavoriteArticle(article.slug)
					: ctx.conduit.favoriteArticle(article.slug));
				onChange?.(newArticle);
			}}
		/>
	) : (
		<Link href="/register" className="btn btn-sm btn-outline-secondary">
			<i className="ion-heart"></i>
			&nbsp; Favorite Article{" "}
			<span className="counter">({article.favoritesCount})</span>
		</Link>
	);
};
