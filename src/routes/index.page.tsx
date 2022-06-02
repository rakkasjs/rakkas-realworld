import { StyledLink, useQuery, useLocation, Head } from "rakkasjs";
import { ArticlePreviewList } from "./ArticlePreviewList";
import { ConduitClient } from "lib/rest-client";
import { User } from "lib/interfaces";

export default function HomePage() {
	const user: User | undefined = undefined;
	const { current: url } = useLocation();
	const { tag, page, global } = parseQuery(url);
	const feed = user && !global && !tag;

	const { value: data } = useQuery(
		JSON.stringify(["articles", tag, page, feed]),
		async (ctx) => {
			const client = new ConduitClient(ctx.fetch, new URL("/api", url).href);

			const [tags, articles] = await Promise.all([
				client.getTags(),
				feed
					? client.feedArticles({
							offset: page === 1 ? 0 : 20 * (page - 1),
					  })
					: client.listArticles({
							tag: tag || undefined,
							offset: page === 1 ? 0 : 20 * (page - 1),
					  }),
			]);

			return { tags, ...articles };
		},
	);

	return (
		<div className="home-page">
			<Head title="Home" />

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
										<StyledLink
											className="nav-link"
											href="/"
											activeClass="active"
											pendingStyle={{
												borderBottom: "2px solid #777",
												color: "#777",
											}}
										>
											Your Feed
										</StyledLink>
									</li>
								)}

								<li className="nav-item">
									<StyledLink
										className="nav-link"
										activeClass="active"
										pendingStyle={{
											borderBottom: "2px solid #777",
											color: "#777",
										}}
										href={user ? "/?global" : "/"}
									>
										Global Feed
									</StyledLink>
								</li>

								{tag && (
									<li className="nav-item">
										<StyledLink
											className="nav-link"
											activeClass="active"
											pendingStyle={{
												borderBottom: "2px solid #777",
												color: "#777",
											}}
											href={"/?tag=" + encodeURIComponent(tag)}
										>
											#{tag}
										</StyledLink>
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
									<StyledLink
										href={"?tag=" + encodeURIComponent(t)}
										key={i}
										className={
											"tag-pill tag-default" + (t === tag ? " tag-primary" : "")
										}
										pendingStyle={{ backgroundColor: "#8b8" }}
									>
										{t}
									</StyledLink>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function parseQuery(url: URL) {
	const tag = url.searchParams.get("tag");
	let page = Number(url.searchParams.get("page"));
	if (!Number.isInteger(page) || !page) page = 1;
	return { tag, page, global: url.searchParams.has("global") };
}
