import { useLocation, Head, Page, useQuery } from "rakkasjs";
import { ArticlePreviewList } from "~/components/organisms/ArticlePreviewList";
import { Tags } from "~/components/organisms/Tags";
import NavItem from "~/components/atoms/NavItem";

const HomePage: Page = () => {
	const { data: user } = useQuery("user", (ctx) =>
		ctx.locals.conduit.getCurrentUser(),
	);
	const { current: currentUrl } = useLocation();
	const { tag, page, global } = parseQuery(currentUrl);
	const feed = !!(user && !global && !tag);

	const {
		data: { articles, articlesCount },
	} = useQuery(
		tag ? `tagged/${tag}/${page}` : feed ? `feed/${page}` : `articles/${page}`,
		async (ctx) => {
			const result = feed
				? await ctx.locals.conduit.feedArticles({
						offset: page === 1 ? 0 : 20 * (page - 1),
				  })
				: await ctx.locals.conduit.listArticles({
						tag: tag || undefined,
						offset: page === 1 ? 0 : 20 * (page - 1),
				  });

			for (const article of result.articles) {
				ctx.queryClient.setQueryData(`article:${article.slug}`, article);
			}

			return result;
		},
	);

	return (
		<div className="home-page">
			{!user && (
				<div className="banner">
					<div className="container">
						<h1 className="logo-font">conduit</h1>
						<p>A place to share your knowledge</p>
					</div>
				</div>
			)}

			<div className="container page">
				<div className="row">
					<div className="col-md-9">
						<div className="feed-toggle">
							<ul className="nav nav-pills outline-active">
								{user && <NavItem href="/">Your Feed</NavItem>}

								<NavItem href={user ? "/?global" : "/"}>Global Feed</NavItem>

								{tag && (
									<NavItem href={"/?tag=" + encodeURIComponent(tag)}>
										#{tag}
									</NavItem>
								)}
							</ul>
						</div>

						<ArticlePreviewList
							articles={articles}
							articlesCount={articlesCount}
							page={page}
						/>
					</div>

					<div className="col-md-3">
						<Tags currentTag={tag} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default HomePage;

HomePage.preload = () => ({ head: <Head title="Home" /> });

function parseQuery(url: URL) {
	const tag = url.searchParams.get("tag");
	let page = Number(url.searchParams.get("page"));
	if (!Number.isInteger(page) || !page) page = 1;
	return { tag, page, global: url.searchParams.has("global") };
}
