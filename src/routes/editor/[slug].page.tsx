import { StatusCodes } from "http-status-codes";
import { definePage, DefinePageTypes, navigate } from "rakkasjs";
import React, { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { Article } from "~/client/interfaces";
import { ArticleEditor } from "./ArticleEditor";
import { ConduitContext } from "lib/ConduitContext";

type EditArticlePageTypes = DefinePageTypes<{
	params: {
		slug: string;
	};
	data:
		| {
				article: Article;
		  }
		| undefined;
}>;

export default definePage<EditArticlePageTypes>({
	async load({ context: { user }, helpers, params: { slug } }) {
		if (!user) {
			return {
				status: StatusCodes.SEE_OTHER,
				redirect: "/register",
				data: undefined,
			};
		}

		const article = await helpers.conduit.getArticle(slug);

		if (article.slug !== slug) {
			return {
				status: StatusCodes.SEE_OTHER,
				redirect: `/editor/${encodeURIComponent(article.slug)}`,
				data: undefined,
			};
		}

		return { data: { article } };
	},

	Component: function ArticleEditPage({ data, params: { slug } }) {
		const context = useContext(ConduitContext);

		if (!data) return null;

		const { article } = data;

		return (
			<>
				<Helmet title="Editor" />

				<ArticleEditor
					mode="update"
					article={article}
					onSubmit={async (article) => {
						const result = await context.conduit.updateArticle(slug, article);

						navigate("/article/" + encodeURIComponent(result.slug));

						return result;
					}}
				/>
			</>
		);
	},
});
