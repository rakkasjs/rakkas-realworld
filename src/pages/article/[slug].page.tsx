import React from "react";
import { definePage, DefinePageTypes } from "rakkasjs";
import { getArticle, getComments } from "lib/conduit-client";
import { ArticleView } from "../ArticleView";
import { Article, Comment } from "lib/api-types";
import { Helmet } from "react-helmet-async";

type ArticlePageTypes = DefinePageTypes<{
	params: { slug: string };
	data: { article: Article; comments: Comment[] };
}>;

export default definePage<ArticlePageTypes>({
	async load({ context: { apiUrl, user }, fetch, params: { slug } }) {
		const ctx = { apiUrl, user, fetch };
		const [article, comments] = await Promise.all([
			getArticle(ctx, slug),
			getComments(ctx, slug),
		]);

		return { data: { article, comments } };
	},

	Component: function ArticlePage({ data: { article, comments }, reload }) {
		return (
			<>
				<Helmet title={article.title} />
				<ArticleView article={article} comments={comments} reload={reload} />
			</>
		);
	},
});
