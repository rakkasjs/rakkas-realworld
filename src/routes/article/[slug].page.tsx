import { Head, Page } from "rakkasjs";
import { Article } from "~/client/interfaces";
import { ArticleView } from "~/components/templates/ArticleView";

const ArticlePage: Page<{ slug: string }> = ({ params: { slug } }) => {
	return <ArticleView slug={slug} />;
};

export default ArticlePage;

ArticlePage.preload = async (ctx) => {
	const { slug } = ctx.params;

	if (!ctx.queryClient.getQueryData(`article:${slug}`)) {
		await ctx.queryClient.setQueryData(
			`article:${slug}`,
			await ctx.locals.conduit.getArticle(slug),
		);
	}

	const article: Article = ctx.queryClient.getQueryData(`article:${slug}`);

	if (!ctx.queryClient.getQueryData(`comments:${slug}`)) {
		ctx.queryClient.prefetchQuery(
			`comments:${slug}`,
			ctx.locals.conduit.getComments(slug),
		);
	}

	return {
		head: <Head title={article.title} />,
	};
};
