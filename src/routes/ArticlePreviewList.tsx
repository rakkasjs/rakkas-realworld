import { ArticlePreview } from "./ArticlePreview";
import { Pagination } from "./Pagination";
import { useQuery } from "rakkasjs";

export interface ArticlePreviewListProps {
	tag: string | null;
	page: number;
	feed: boolean;
}

export function ArticlePreviewList({
	tag,
	page,
	feed,
}: ArticlePreviewListProps) {
	const {
		data: { articles, articlesCount },
	} = useQuery(
		tag ? `tagged/${tag}/${page}` : feed ? `feed/${page}` : `articles/${page}`,
		({ locals: { conduit } }) =>
			feed
				? conduit.feedArticles({
						offset: page === 1 ? 0 : 20 * (page - 1),
				  })
				: conduit.listArticles({
						tag: tag || undefined,
						offset: page === 1 ? 0 : 20 * (page - 1),
				  }),
	);

	return (
		<>
			{articles.length === 0 && (
				<div className="article-preview text-muted">
					No articles are here... yet.
				</div>
			)}

			{articles.map((article) => (
				<ArticlePreview
					key={article.slug}
					article={article}
					onChange={(newArticle) => {
						void newArticle;
						// TODO: Handle mutation
						// if (removeWhenUnfavorited && !newArticle.favorited) {
						// 	setCachedData((old) => ({
						// 		articles: old.articles.filter(
						// 			(a) => a.slug !== newArticle.slug,
						// 		),
						// 		articlesCount: old.articlesCount - 1,
						// 	}));
						// } else {
						// 	setCachedData((old) => ({
						// 		...old,
						// 		articles: old.articles.map((a) =>
						// 			a.slug === article.slug ? newArticle : a,
						// 		),
						// 	}));
						// }
					}}
				/>
			))}

			<Pagination
				current={page}
				total={Math.floor((articlesCount - 1) / 20) + 1}
			/>
		</>
	);
}
