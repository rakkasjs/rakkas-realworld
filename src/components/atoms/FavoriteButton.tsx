import { ActionButton } from "~/components/atoms/ActionButton";
import { Article } from "~/client/interfaces";
import { Link, useMutation, usePageContext, useQuery } from "rakkasjs";
import { CSSProperties, FC } from "react";

export interface FavoriteButtonProps {
	article: Article;
	minimal?: boolean;
	style?: CSSProperties;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
	article,
	minimal,
	style,
}) => {
	const { data: user } = useQuery("user", (ctx) =>
		ctx.locals.conduit.getCurrentUser(),
	);

	const ctx = usePageContext();

	const favoriteMutation = useMutation(
		() =>
			article.favorited
				? ctx.locals.conduit.unfavoriteArticle(article.slug)
				: ctx.locals.conduit.favoriteArticle(article.slug),
		{
			onMutate() {
				// Optimistically update the article's favorited status
				ctx.queryClient.setQueryData(`article:${article.slug}`, {
					...article,
					favorited: !article.favorited,
					favoritesCount: article.favoritesCount + (article.favorited ? -1 : 1),
				});
			},
			onSuccess(data) {
				// Update the article's favorited status
				ctx.queryClient.setQueryData(`article:${article.slug}`, data);
				// Update all favorites
				ctx.queryClient.invalidateQueries((k) =>
					k.startsWith(`favorites:${user!.username}:`),
				);
			},
			onError() {
				// Revert the optimistic update
				ctx.queryClient.setQueryData(`article:${article.slug}`, {
					...article,
					favorited: article.favorited,
					favoritesCount: article.favoritesCount + (article.favorited ? -1 : 1),
				});
			},
		},
	);

	return user ? (
		<ActionButton
			key={`${user.token}:${article.slug}:${article.favorited}`}
			style={style}
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
			onClick={() => favoriteMutation.mutateAsync()}
		/>
	) : (
		<Link href="/register" className="btn btn-sm btn-outline-secondary">
			<i className="ion-heart"></i>
			&nbsp; Favorite Article{" "}
			<span className="counter">({article.favoritesCount})</span>
		</Link>
	);
};
