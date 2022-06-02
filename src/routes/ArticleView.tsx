import { Link, navigate } from "rakkasjs";
import React, { FC, useContext, useEffect, useState } from "react";
import { Article, Comment } from "lib/interfaces";
import ReactMarkdown from "react-markdown";
import { ActionButton } from "lib/ActionButton";
import { ConduitContext } from "lib/ConduitContext";
import { FavoriteButton } from "lib/FavoriteButton";
import { FollowButton } from "lib/FollowButton";
import css from "./ArticleView.module.css";

export interface ArticleViewProps {
	article: Article;
	comments: Comment[];
	reload(): void;
}

export const ArticleView: FC<ArticleViewProps> = ({
	article: fetchedArticle,
	comments: fetchedComments,
}) => {
	const ctx = useContext(ConduitContext);
	const { user } = ctx;

	const [article, setArticle] = useState(fetchedArticle);
	useEffect(() => {
		setArticle(fetchedArticle);
	}, [fetchedArticle]);

	const [comments, setComments] = useState(fetchedComments);
	useEffect(() => {
		setComments(fetchedComments);
	}, [fetchedComments]);

	const self = article.author.username === user?.username;

	const articleMeta = (
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

			{self ? (
				<>
					<Link
						className="btn btn-sm btn-outline-secondary"
						href={`/editor/${encodeURIComponent(article.slug)}`}
					>
						<i className="ion-edit"></i>
						&nbsp; Edit article
					</Link>
					&nbsp;&nbsp;
					<ActionButton
						action={
							"/api/form/article/" +
							encodeURIComponent(article.slug) +
							"/delete"
						}
						label="Delete article"
						inProgressLabel="Deleting..."
						finishedLabel="Article deleted"
						failedLabel="Delete failed"
						icon="trash-a"
						size="small"
						outline
						type="danger"
						onClick={() =>
							ctx.conduit.deleteArticle(article.slug).then(() => navigate("/"))
						}
					/>
				</>
			) : (
				<>
					<FollowButton
						author={article.author}
						onComplete={(author) => setArticle((old) => ({ ...old, author }))}
					/>
					&nbsp;&nbsp;
					<FavoriteButton
						article={article}
						onChange={() =>
							setArticle((old) => ({
								...old,
								favorited: !old.favorited,
								favoritesCount: old.favoritesCount + (old.favorited ? -1 : +1),
							}))
						}
					/>
				</>
			)}
		</div>
	);

	return (
		<div className="article-page">
			<div className="banner">
				<div className="container">
					<h1>{article.title}</h1>
					{articleMeta}
				</div>
			</div>

			<div className="container page">
				<div className="row article-content">
					<div className={"col-md-12 " + css.markdown}>
						<ReactMarkdown>{article.body}</ReactMarkdown>
					</div>
				</div>

				<hr />

				<div className="article-actions">{articleMeta}</div>

				<div className="row">
					<div className="col-xs-12 col-md-8 offset-md-2">
						{user && (
							<form
								className="card comment-form"
								method="POST"
								action={
									"/api/form/comment/" +
									encodeURIComponent(article.slug) +
									"/comment"
								}
								onSubmit={(e) => e.preventDefault()}
							>
								<div className="card-block">
									<textarea
										name="body"
										className="form-control"
										placeholder="Write a comment..."
										rows={3}
									/>
								</div>
								<div className="card-footer">
									<img
										src={user.image || undefined}
										className="comment-author-img"
									/>
									<ActionButton
										onClick={async () => {
											const textarea = document.querySelector(
												"[name=body]",
											) as HTMLTextAreaElement;
											const commentBody = textarea.value;

											if (commentBody) {
												const comment = await ctx.conduit.addComment(
													article.slug,
													commentBody,
												);
												textarea.value = "";
												setComments((old) => [comment, ...old]);
											}
										}}
										size="small"
										type="primary"
										label="Post Comment"
										inProgressLabel="Posting"
										finishedLabel="Comment posted"
										failedLabel="Failed to post comment"
									/>
								</div>
							</form>
						)}

						{comments.map((comment) => (
							<CommentCard
								key={comment.id}
								comment={comment}
								article={article}
								onDelete={() => {
									ctx.conduit
										.deleteComment(article.slug, comment.id)
										.then(() =>
											setComments((old) =>
												old.filter((c) => c.id !== comment.id),
											),
										);
								}}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

const CommentCard: FC<{
	article: Article;
	comment: Comment;
	onDelete(): void;
}> = ({ article, comment, onDelete }) => {
	const ctx = useContext(ConduitContext);

	return (
		<div className="card">
			<div className="card-block">
				<p className="card-text">{comment.body}</p>
			</div>
			<div className="card-footer">
				<a href="" className="comment-author">
					<img
						src={comment.author.image || undefined}
						className="comment-author-img"
					/>
				</a>{" "}
				&nbsp;{" "}
				<Link
					href={`/profiles/${encodeURIComponent(comment.author.username)}`}
					className="comment-author"
				>
					{comment.author.username}
				</Link>
				<span className="date-posted">
					{Intl.DateTimeFormat("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
					}).format(new Date(comment.createdAt))}
				</span>
				{ctx.user?.username === comment.author.username && (
					<form
						className="mod-options"
						method="POST"
						action={
							"/api/form/article/" +
							encodeURIComponent(article.slug) +
							"/delete-comment-" +
							comment.id
						}
						onSubmit={(e) => e.preventDefault()}
					>
						<button
							style={{ border: "none", background: "none", padding: 0 }}
							onClick={onDelete}
							title="Delete comment"
						>
							<i className="ion-trash-a" />
						</button>
					</form>
				)}
			</div>
		</div>
	);
};
