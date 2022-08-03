import { Head, Page } from "rakkasjs";
import { Auth } from "~/components/templates/Auth";

const LoginPage: Page = () => <Auth type="signin" />;

export default LoginPage;

LoginPage.preload = () => ({ head: <Head title="Sign in" /> });
