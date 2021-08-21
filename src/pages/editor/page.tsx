import { StatusCodes } from "http-status-codes";
import { definePage, DefinePageTypes, navigate } from "rakkasjs";
import React from "react";
import { Helmet } from "react-helmet-async";
import { User } from "lib/api-types";
import { createArticle } from "lib/conduit-client";
import { ArticleEditor } from "./ArticleEditor";

type CreateArticlePageTypes = DefinePageTypes<{
	data: {
		user: User;
	};
}>;

export default definePage<CreateArticlePageTypes>({
	load({ context: { user } }) {
		if (!user) {
			return {
				status: StatusCodes.SEE_OTHER,
				location: "/register",
			};
		}

		return { data: { user } };
	},

	Component: function ArticleEditPage({ context: { apiUrl }, data: { user } }) {
		return (
			<>
				<Helmet title="Editor" />

				<ArticleEditor
					mode="create"
					onSubmit={async (article) => {
						const result = await createArticle(
							{ apiUrl, fetch, user },
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
