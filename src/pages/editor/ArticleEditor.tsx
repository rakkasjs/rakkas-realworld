import React, { FC, useEffect, useRef, useState } from "react";
import { Article, NewArticle } from "lib/interfaces";
import { ConduitError } from "lib/conduit-error";
import { useRouter } from "rakkasjs";
import { ActionButton } from "lib/ActionButton";

interface ArticleEditorProps {
	mode: "create" | "update";
	article?: Article;
	onSubmit(article: NewArticle): Promise<Article>;
}

export const ArticleEditor: FC<ArticleEditorProps> = ({
	mode,
	onSubmit,
	article,
}) => {
	const form = useRef<HTMLFormElement>(null);

	const { currentUrl } = useRouter();

	const [errors, setErrors] = useState<string[]>(
		currentUrl.searchParams.getAll("error"),
	);

	const mountedRef = useRef(true);
	useEffect(() => {
		return () => {
			mountedRef.current = false;
		};
	}, []);

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
									label={
										mode === "create" ? "Publish Article" : "Update Article"
									}
									inProgressLabel={
										mode === "create"
											? "Publishing Article"
											: "Updating Article"
									}
									failedLabel={
										mode === "create" ? "Failed to Publish" : "Update Failed"
									}
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

										await onSubmit(article).catch((error: ConduitError) => {
											setErrors(error.messages);
											throw error;
										});
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
