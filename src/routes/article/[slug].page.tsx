import { Head, Page } from "rakkasjs";
import { Article } from "~/client/interfaces";
import { ArticleView } from "~/components/templates/ArticleView";

const ArticlePage: Page<{ slug: string }> = ({ params: { slug } }) => {
	return <ArticleView slug={slug} />;
};

export default ArticlePage;

ArticlePage.preload = async (ctx) => {
	const { slug } = ctx.params;

	// Start fetching comments in parallel
	if (!ctx.queryClient.getQueryData(`comments:${slug}`)) {
		ctx.queryClient.prefetchQuery(
			`comments:${slug}`,
			ctx.locals.conduit.getComments(slug),
		);
	}

	if (!ctx.queryClient.getQueryData(`article:${slug}`)) {
		await ctx.queryClient.setQueryData(
			`article:${slug}`,
			await ctx.locals.conduit.getArticleSafe(slug),
		);
	}

	const article: Article | null = ctx.queryClient.getQueryData(
		`article:${slug}`,
	);

	return {
		head: <Head title={article?.title || "Not found"} />,
	};
};
