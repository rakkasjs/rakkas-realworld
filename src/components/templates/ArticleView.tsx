import {
	Link,
	navigate,
	useMutation,
	usePageContext,
	useQuery,
} from "rakkasjs";
import { FC } from "react";
import { Article, Comment, User } from "~/client/interfaces";
import ReactMarkdown from "react-markdown";
import css from "./ArticleView.module.css";
import { ActionButton } from "~/components/atoms/ActionButton";
import { FollowButton } from "~/components/atoms/FollowButton";
import { FavoriteButton } from "~/components/atoms/FavoriteButton";

export interface ArticleViewProps {
	slug: string;
}

export const ArticleView: FC<ArticleViewProps> = ({ slug }) => {
	const { data: user } = useQuery("user", (ctx) =>
		ctx.locals.conduit.getCurrentUser(),
	);

	const { data: article } = useQuery(`article:${slug}`, async (ctx) => {
		const article = await ctx.locals.conduit.getArticle(slug);
		ctx.queryClient.setQueryData(
			`profile:${article.author.username}`,
			article.author,
		);

		return article;
	});

	const { data: author } = useQuery(
		`profile:${article.author.username}`,
		(ctx) => ctx.locals.conduit.getProfile(article.author.username),
	);

	const { data: comments } = useQuery(`comments:${slug}`, (ctx) =>
		ctx.locals.conduit.getComments(slug),
	);

	const ctx = usePageContext();
	const deleteMutation = useMutation(
		() => ctx.locals.conduit.deleteArticle(slug),
		{
			onSuccess() {
				navigate("/");
			},
		},
	);

	const addCommentMutation = useMutation(
		(comment: string) => ctx.locals.conduit.addComment(slug, comment),
		{
			onSuccess() {
				ctx.queryClient.invalidateQueries(`comments:${slug}`);
				const textarea = document.querySelector(
					"[name=body]",
				) as HTMLTextAreaElement;
				textarea.value = "";
			},
		},
	);

	const deleteCommentMutation = useMutation(
		(id: number) => ctx.locals.conduit.deleteComment(slug, id),
		{
			onSuccess() {
				ctx.queryClient.invalidateQueries(`comments:${slug}`);
			},
		},
	);

	const self = author.username === user?.username;

	const articleMeta = (
		<div className="article-meta">
			<Link href={`/profile/${encodeURIComponent(author.username)}`}>
				<img src={author.image || undefined} />
			</Link>
			<div className="info">
				<Link
					href={`/profile/${encodeURIComponent(author.username)}`}
					className="author"
				>
					{author.username}
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
						label="Delete article"
						inProgressLabel="Deleting..."
						finishedLabel="Article deleted"
						failedLabel="Delete failed"
						icon="trash-a"
						size="small"
						outline
						type="danger"
						onClick={() => deleteMutation.mutateAsync()}
					/>
				</>
			) : (
				<>
					<FollowButton author={author} />
					&nbsp;&nbsp;
					<FavoriteButton article={article} />
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

											await addCommentMutation.mutateAsync(commentBody);
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
								user={user}
								key={comment.id}
								comment={comment}
								article={article}
								onDelete={() => deleteCommentMutation.mutateAsync(comment.id)}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

const CommentCard: FC<{
	user: User | null;
	article: Article;
	comment: Comment;
	onDelete(): void;
}> = ({ user, article, comment, onDelete }) => {
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
				{user?.username === comment.author.username && (
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
