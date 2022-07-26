import { ActionButton } from "~/lib/ActionButton";
import { Article } from "~/client/interfaces";
import { Link } from "rakkasjs";
import { CSSProperties, FC } from "react";

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
	return null ? (
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
					? ctx.locals.conduit.unfavoriteArticle(article.slug)
					: ctx.locals.conduit.favoriteArticle(article.slug));
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
