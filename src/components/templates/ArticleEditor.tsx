import { FC, useRef, useState } from "react";
import {
	navigate,
	useLocation,
	useMutation,
	usePageContext,
	useQuery,
} from "rakkasjs";
import { ActionButton } from "~/components/atoms/ActionButton";
import { NewArticle, UpdateArticle } from "~/lib/validation";
import { ConduitError } from "~/lib/conduit-error";

interface ArticleEditorProps {
	slug?: string;
}

export const ArticleEditor: FC<ArticleEditorProps> = ({ slug }) => {
	const articleResult = useQuery(slug ? `article:${slug}` : undefined, (ctx) =>
		ctx.locals.conduit.getArticle(slug!),
	);

	const article = articleResult?.data;

	const { current: currentUrl } = useLocation();

	const [errors, setErrors] = useState<string[]>(
		currentUrl.searchParams.getAll("error"),
	);

	const ctx = usePageContext();
	const saveMutation = useMutation(
		async (article: NewArticle | UpdateArticle) => {
			if (slug) {
				return ctx.locals.conduit.updateArticle(slug!, article);
			} else {
				return ctx.locals.conduit.createArticle(article as NewArticle);
			}
		},
		{
			onSuccess(data) {
				ctx.queryClient.setQueryData(`article:${data.slug}`, data);
				navigate(`/article/${data.slug}`);
			},
			onError(error) {
				if (error instanceof ConduitError) {
					setErrors(error.messages);
				}
			},
		},
	);

	const form = useRef<HTMLFormElement>(null);

	return (
		<div className="editor-page">
			<div className="container page">
				<div className="row">
					<div className="col-md-10 offset-md-1 col-xs-12">
						{errors.length > 0 && (
							<ul className="error-messages">
								{errors.map((message, i) => (
									<li key={i}>{message}</li>
								))}
							</ul>
						)}

						<form
							ref={form}
							method="POST"
							action={
								article
									? `/api/form/article/${encodeURIComponent(article.slug)}`
									: "/api/form/article"
							}
							onSubmit={(e) => e.preventDefault()}
						>
							<fieldset>
								<fieldset className="form-group">
									<input
										type="text"
										className="form-control form-control-lg"
										placeholder="Article Title"
										name="title"
										defaultValue={article && article.title}
									/>
								</fieldset>
								<fieldset className="form-group">
									<input
										type="text"
										className="form-control"
										placeholder="What's this article about?"
										name="description"
										defaultValue={article && article.description}
									/>
								</fieldset>
								<fieldset className="form-group">
									<textarea
										className="form-control"
										rows={8}
										placeholder="Write your article (in markdown)"
										name="body"
										defaultValue={article && article.body}
									/>
								</fieldset>
								<fieldset className="form-group">
									<input
										type="text"
										className="form-control"
										placeholder="Enter tags"
										name="tagList"
										defaultValue={article && article.tagList.join(" ")}
									/>
									<div className="tag-list"></div>
								</fieldset>

								<ActionButton
									type="primary"
									size="large"
									style={{ float: "right" }}
									label={!article ? "Publish Article" : "Update Article"}
									inProgressLabel={
										!article ? "Publishing Article" : "Updating Article"
									}
									failedLabel={!article ? "Failed to Publish" : "Update Failed"}
									onClick={async () => {
										if (!form.current)
											throw new Error("Could not find the form element");

										const fd = new FormData(form.current);
										const values = Object.fromEntries([...fd.entries()]) as {
											title: string;
											description: string;
											body: string;
											tagList: string;
										};

										const article = {
											...values,
											tagList: values.tagList
												.split(" ")
												.filter(Boolean)
												.map((s) => s.trim()),
										};

										await saveMutation.mutate(article);
									}}
								/>
							</fieldset>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
