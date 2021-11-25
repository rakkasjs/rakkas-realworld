import React from "react";
import { Helmet } from "react-helmet-async";
import { definePage, NavLink, DefinePageTypes } from "rakkasjs";
import { ArticlePreviewList } from "./ArticlePreviewList";
import { Article } from "lib/interfaces";

type HomePageTypes = DefinePageTypes<{
	data: {
		tags: string[];
		articles: Article[];
		articlesCount: number;
	};
}>;

export default definePage<HomePageTypes>({
	async load({ helpers, url, context: { user } }) {
		const { tag, page, global } = parseQuery(url);

		const feed = user && !global && !tag;

		const [tags, articlesResponse] = await Promise.all([
			helpers.conduit.getTags(),
			feed
				? helpers.conduit.feedArticles({
						offset: page === 1 ? 0 : 20 * (page - 1),
				  })
				: helpers.conduit.listArticles({
						tag: tag || undefined,
						offset: page === 1 ? 0 : 20 * (page - 1),
				  }),
		]);

		return { data: { tags, ...articlesResponse } };
	},

	Component: function HomePage({ data, url, context: { user } }) {
		const { tag, page } = parseQuery(url);

		return (
			<div className="home-page">
				<Helmet title="Home" />

				{!user && (
					<div className="banner">
						<div className="container">
							<h1 className="logo-font">conduit</h1>
							<p>A place to share your knowledge.</p>
						</div>
					</div>
				)}

				<div className="container page">
					<div className="row">
						<div className="col-md-9">
							<div className="feed-toggle">
								<ul className="nav nav-pills outline-active">
									{user && (
										<li className="nav-item">
											<NavLink
												className="nav-link"
												href="/"
												currentRouteClass="active"
												nextRouteStyle={{
													borderBottom: "2px solid #777",
													color: "#777",
												}}
											>
												Your Feed
											</NavLink>
										</li>
									)}

									<li className="nav-item">
										<NavLink
											className="nav-link"
											currentRouteClass="active"
											nextRouteStyle={{
												borderBottom: "2px solid #777",
												color: "#777",
											}}
											href={user ? "/?global" : "/"}
										>
											Global Feed
										</NavLink>
									</li>

									{tag && (
										<li className="nav-item">
											<NavLink
												className="nav-link"
												currentRouteClass="active"
												nextRouteStyle={{
													borderBottom: "2px solid #777",
													color: "#777",
												}}
												href={"/?tag=" + encodeURIComponent(tag)}
											>
												#{tag}
											</NavLink>
										</li>
									)}
								</ul>
							</div>

							<ArticlePreviewList
								articles={data.articles}
								articlesCount={data.articlesCount}
								page={page}
							/>
						</div>

						<div className="col-md-3">
							<div className="sidebar">
								<p>Popular Tags</p>

								<div className="tag-list">
									{data.tags.length === 0 && (
										<span className="text-muted">No tags to show</span>
									)}
									{data.tags.map((t, i) => (
										<NavLink
											href={"?tag=" + encodeURIComponent(t)}
											key={i}
											className={
												"tag-pill tag-default" +
												(t === tag ? " tag-primary" : "")
											}
											nextRouteStyle={{ backgroundColor: "#8b8" }}
										>
											{t}
										</NavLink>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
});

function parseQuery(url: URL) {
	const tag = url.searchParams.get("tag");
	let page = Number(url.searchParams.get("page"));
	if (!Number.isInteger(page) || !page) page = 1;
	return { tag, page, global: url.searchParams.has("global") };
}
