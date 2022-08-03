import { ArticlePreview } from "../molecules/ArticlePreview";
import { Article } from "~/client/interfaces";
import { Pagination } from "~/components/molecules/Pagination";

export interface ArticlePreviewListProps {
	articles: Article[];
	articlesCount: number;
	page: number;
}

export function ArticlePreviewList({
	articles,
	articlesCount,
	page,
}: ArticlePreviewListProps) {
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
					slug={article.slug}
					// onChange={(newArticle) => {
					// 	void newArticle;
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
					// }}
				/>
			))}

			<Pagination
				current={page}
				total={Math.floor((articlesCount - 1) / 20) + 1}
			/>
		</>
	);
}
