import { Head, Page, StyledLink, usePageContext, useQuery } from "rakkasjs";
import { ArticlePreviewList } from "../../components/organisms/ArticlePreviewList";
import NavItem from "~/components/atoms/NavItem";
import { FollowButton } from "~/components/atoms/FollowButton";

const ProfilePage: Page<{ userName: string }> = ({
	url,
	params: { userName },
}) => {
	const { data: user } = useQuery("user", (ctx) =>
		ctx.locals.conduit.getCurrentUser(),
	);

	const { page, favorites } = parseQuery(url);

	const ctx = usePageContext();
	ctx.queryClient.getQueryData(`profile:${userName}`);

	const { data: profile } = useQuery(
		`profile:${userName}`,
		() => ctx.locals.conduit.getProfile(userName),
		{ refetchOnMount: true },
	);

	const articlesKey = favorites
		? `favorites:${userName}:${page}`
		: `articles-by:${userName}:${page}`;

	const {
		data: { articles, articlesCount },
	} = useQuery(
		articlesKey,
		() =>
			ctx.locals.conduit.listArticles({
				offset: page === 1 ? undefined : ARTICLES_PER_PAGE * (page - 1),
				author: favorites ? undefined : userName,
				favorited: favorites ? userName : undefined,
			}),
		{ refetchOnMount: true },
	);

	return (
		<div className="profile-page">
			<div className="user-info">
				<div className="container">
					<div className="row">
						<div className="col-xs-12 col-md-10 offset-md-1">
							<img src={profile.image || undefined} className="user-img" />
							<h4>{profile.username}</h4>
							<p>{profile.bio}</p>

							{user?.username === profile.username ? (
								<StyledLink
									className="btn btn-sm btn-outline-secondary action-btn"
									href="/settings"
								>
									<i className="ion-gear-a"></i>
									&nbsp; Profile settings
								</StyledLink>
							) : (
								<FollowButton author={profile} style={{ float: "right" }} />
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="container">
				<div className="row">
					<div className="col-xs-12 col-md-10 offset-md-1">
						<div className="articles-toggle">
							<ul className="nav nav-pills outline-active">
								<NavItem href={`/profile/${encodeURIComponent(userName)}`}>
									{user && user.username === userName ? "My" : `${userName}'s`}{" "}
									Articles
								</NavItem>
								<li className="nav-item">
									<StyledLink
										className="nav-link"
										activeClass="active"
										pendingStyle={{
											borderBottom: "2px solid #777",
											color: "#777",
										}}
										href={`/profile/${encodeURIComponent(userName)}?favorites`}
									>
										Favorited Articles
									</StyledLink>
								</li>
							</ul>
						</div>

						<ArticlePreviewList
							articles={articles}
							articlesCount={articlesCount}
							page={page}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;

ProfilePage.preload = (ctx) => {
	const userName = ctx.params.userName;
	const { page, favorites } = parseQuery(ctx.url);

	if (!ctx.queryClient.getQueryData(`profile:${userName}`)) {
		ctx.queryClient.prefetchQuery(
			`profile:${userName}`,
			ctx.locals.conduit.getProfile(userName),
		);
	}

	const articlesKey = favorites
		? `favorites:${userName}:${page}`
		: `articles-by:${userName}:${page}`;

	if (!ctx.queryClient.getQueryData(articlesKey)) {
		ctx.queryClient.prefetchQuery(
			articlesKey,
			ctx.locals.conduit.listArticles({
				offset: page === 1 ? undefined : ARTICLES_PER_PAGE * (page - 1),
				author: favorites ? undefined : userName,
				favorited: favorites ? userName : undefined,
			}),
		);
	}

	return {
		head: <Head title={"@" + userName} />,
	};
};

const ARTICLES_PER_PAGE = 20;

function parseQuery(url: URL) {
	let page = Number(url.searchParams.get("page"));
	if (!Number.isInteger(page) || !page) page = 1;
	return { page, favorites: url.searchParams.has("favorites") };
}
