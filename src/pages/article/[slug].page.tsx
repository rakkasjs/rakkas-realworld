import React from "react";
import { definePage, DefinePageTypes } from "rakkasjs";
import { ArticleView } from "../ArticleView";
import { Article, Comment } from "lib/interfaces";
import { Helmet } from "react-helmet-async";

type ArticlePageTypes = DefinePageTypes<{
	params: { slug: string };
	data: { article: Article; comments: Comment[] };
}>;

export default definePage<ArticlePageTypes>({
	async load({ helpers, params: { slug } }) {
		const [article, comments] = await Promise.all([
			helpers.conduit.getArticle(slug),
			helpers.conduit.getComments(slug),
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
