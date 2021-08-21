import { StatusCodes } from "http-status-codes";
import { definePage, DefinePageTypes, navigate } from "rakkasjs";
import React from "react";
import { Helmet } from "react-helmet-async";
import { Article, User } from "lib/api-types";
import { getArticle, updateArticle } from "lib/conduit-client";
import { ArticleEditor } from "./ArticleEditor";

type EditArticlePageTypes = DefinePageTypes<{
	params: {
		slug: string;
	};
	data: {
		article: Article;
		user: User;
	};
}>;

export default definePage<EditArticlePageTypes>({
	async load({ fetch, context: { apiUrl, user }, params: { slug } }) {
		if (!user) {
			return {
				status: StatusCodes.SEE_OTHER,
				location: "/register",
			};
		}

		const article = await getArticle({ apiUrl, user, fetch }, slug);

		if (article.slug !== slug) {
			return {
				status: StatusCodes.SEE_OTHER,
				location: `/editor/${encodeURIComponent(article.slug)}`,
			};
		}

		return { data: { article, user } };
	},

	Component: function ArticleEditPage({
		context: { apiUrl },
		data: { article, user },
		params: { slug },
	}) {
		return (
			<>
				<Helmet title="Editor" />

				<ArticleEditor
					mode="update"
					article={article}
					onSubmit={async (article) => {
						const result = await updateArticle(
							{ apiUrl, fetch, user },
							slug,
							article,
						);

						navigate("/article/" + encodeURIComponent(result.slug));

						return result;
					}}
				/>
			</>
		);
	},
});
