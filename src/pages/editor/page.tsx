import { StatusCodes } from "http-status-codes";
import { definePage, DefinePageTypes, navigate } from "rakkasjs";
import React, { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { ArticleEditor } from "./ArticleEditor";
import { ConduitContext } from "lib/ConduitContext";

type CreateArticlePageTypes = DefinePageTypes<{
	data: { redirected: boolean };
}>;

export default definePage<CreateArticlePageTypes>({
	load({ context: { user } }) {
		if (!user) {
			return {
				status: StatusCodes.SEE_OTHER,
				location: "/register",
				data: { redirected: true },
			};
		}

		return { data: { redirected: false } };
	},

	Component: function ArticleEditPage({ data }) {
		const context = useContext(ConduitContext);

		if (data.redirected) return null;

		return (
			<>
				<Helmet title="Editor" />

				<ArticleEditor
					mode="create"
					onSubmit={async (article) => {
						const result = await context.conduit.createArticle(article);

						navigate("/article/" + encodeURIComponent(result.slug));

						return result;
					}}
				/>
			</>
		);
	},
});
