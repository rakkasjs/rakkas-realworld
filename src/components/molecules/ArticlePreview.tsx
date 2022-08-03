import { Link, useQuery } from "rakkasjs";
import { FC } from "react";
import { FavoriteButton } from "~/components/atoms/FavoriteButton";
export interface ArticlePreviewProps {
	slug: string;
}

export const ArticlePreview: FC<ArticlePreviewProps> = ({ slug }) => {
	const { data: article } = useQuery(`article:${slug}`, (ctx) =>
		ctx.locals.conduit.getArticleSafe(slug),
	);

	if (!article) {
		return null;
	}

	return (
		<div className="article-preview">
			<div className="article-meta">
				<Link href={`/profile/${encodeURIComponent(article.author.username)}`}>
					<img src={article.author.image || undefined} />
				</Link>
				<div className="info">
					<Link
						href={`/profile/${encodeURIComponent(article.author.username)}`}
						className="author"
					>
						{article.author.username}
					</Link>
					<span className="date">
						{Intl.DateTimeFormat("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						}).format(new Date(article.createdAt))}
					</span>
				</div>
				<FavoriteButton article={article} minimal style={{ float: "right" }} />
			</div>
			<Link
				href={`/article/${encodeURIComponent(article.slug)}`}
				className="preview-link"
			>
				<h1>{article.title}</h1>
				<p>{article.description}</p>
				<span>Read more...</span>

				<ul
					className="tag-list"
					style={{ display: "inline-block", float: "right" }}
				>
					{article.tagList.map((tag) => (
						<li
							key={tag}
							className="tag-default tag-pill tag-outline"
							style={{
								fontWeight: 300,
								fontSize: ".8rem",
							}}
						>
							{tag}
						</li>
					))}
				</ul>
			</Link>
		</div>
	);
};
