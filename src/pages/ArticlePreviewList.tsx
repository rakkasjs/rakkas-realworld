import React, { FC, useEffect, useState } from "react";
import { Article } from "lib/api-types";
import { ArticlePreview } from "./ArticlePreview";
import { ARTICLES_PER_PAGE } from "lib/conduit-client";
import { Pagination } from "./Pagination";

export interface ArticlePreviewListProps {
	articles: Article[];
	articlesCount: number;
	removeWhenUnfavorited?: boolean;
	page: number;
}

export const ArticlePreviewList: FC<ArticlePreviewListProps> = ({
	articlesCount: originalArticlesCount,
	articles: originalArticles,
	page,
	removeWhenUnfavorited,
}) => {
	const [{ articles, articlesCount }, setCachedData] = useState({
		articles: originalArticles,
		articlesCount: originalArticlesCount,
	});

	useEffect(() => {
		setCachedData({
			articles: originalArticles,
			articlesCount: originalArticlesCount,
		});
	}, [originalArticles, originalArticlesCount]);

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
						if (removeWhenUnfavorited && !newArticle.favorited) {
							setCachedData((old) => ({
								articles: old.articles.filter(
									(a) => a.slug !== newArticle.slug,
								),
								articlesCount: old.articlesCount - 1,
							}));
						} else {
							setCachedData((old) => ({
								...old,
								articles: old.articles.map((a) =>
									a.slug === article.slug ? newArticle : a,
								),
							}));
						}
					}}
				/>
			))}

			<Pagination
				current={page}
				total={Math.floor((articlesCount - 1) / ARTICLES_PER_PAGE) + 1}
			/>
		</>
	);
};
