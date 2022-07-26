import React, { useState } from "react";
import { definePage, StyledLink, DefinePageTypes } from "rakkasjs";
import { ArticlePreviewList } from "../ArticlePreviewList";
import { Profile, Article } from "~/client/interfaces";
import { FollowButton } from "lib/FollowButton";
import { Helmet } from "react-helmet-async";
import NavItem from "~/components/atoms/NavItem";

type ProfilePageTypes = DefinePageTypes<{
	params: { userName: string };
	data: { profile: Profile; articles: Article[]; articlesCount: number };
}>;

export default definePage<ProfilePageTypes>({
	async load({ url, helpers, params: { userName } }) {
		const { page, favorites } = parseQuery(url);

		const [profile, articles] = await Promise.all([
			helpers.conduit.getProfile(userName),
			helpers.conduit.listArticles({
				offset: page === 1 ? undefined : ARTICLES_PER_PAGE * (page - 1),
				author: favorites ? undefined : userName,
				favorited: favorites ? userName : undefined,
			}),
		]);

		return { data: { profile, ...articles } };
	},

	Component: function ProfilePage({
		url,
		data: { profile: originalProfile, articles, articlesCount },
		context: { user },
		params: { userName },
	}) {
		const [profile, setProfile] = useState(originalProfile);
		const { page, favorites } = parseQuery(url);

		return (
			<div className="profile-page">
				<Helmet title={"@" + userName} />
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
									<FollowButton
										author={profile}
										onComplete={(author) => setProfile(author)}
										style={{ float: "right" }}
									/>
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
										{user && user.username === userName
											? "My"
											: `${userName}'s`}{" "}
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
											href={`/profile/${encodeURIComponent(
												userName,
											)}?favorites`}
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
								removeWhenUnfavorited={favorites}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	},
});

const ARTICLES_PER_PAGE = 20;

function parseQuery(url: URL) {
	let page = Number(url.searchParams.get("page"));
	if (!Number.isInteger(page) || !page) page = 1;
	return { page, favorites: url.searchParams.has("favorites") };
}
