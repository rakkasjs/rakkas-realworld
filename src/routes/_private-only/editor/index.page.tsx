import { Head, Page } from "rakkasjs";
import { ArticleEditor } from "~/components/templates/ArticleEditor";

const ArticleCreatePage: Page = () => {
	return <ArticleEditor />;
};

export default ArticleCreatePage;

ArticleCreatePage.preload = () => ({
	head: <Head title="Editor" />,
});
