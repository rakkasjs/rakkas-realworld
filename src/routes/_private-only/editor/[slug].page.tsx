import { Head, Page } from "rakkasjs";
import { ArticleEditor } from "~/components/templates/ArticleEditor";

const ArticleEditPage: Page<{ slug: string }> = ({ params: { slug } }) => {
	return <ArticleEditor slug={slug} />;
};

export default ArticleEditPage;

ArticleEditPage.preload = () => ({
	head: <Head title="Editor" />,
});
