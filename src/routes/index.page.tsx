import { useLocation, Head } from "rakkasjs";
import { ArticlePreviewList } from "./ArticlePreviewList";
import { User } from "~/client/interfaces";
import { Tags } from "~/routes/Tags";
import NavItem from "~/components/atoms/NavItem";

export default function HomePage() {
	const user: User | undefined = undefined;
	const { current: currentUrl } = useLocation();
	const { tag, page, global } = parseQuery(currentUrl);
	const feed = !!(user && !global && !tag);

	return (
		<div className="home-page">
			<Head title="Home" />
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

						<ArticlePreviewList tag={tag} feed={feed} page={page} />
					</div>

					<div className="col-md-3">
						<Tags currentTag={tag} />
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
