import { Head, Page } from "rakkasjs";
import { Auth } from "~/components/templates/Auth";

const RegisterPage: Page = () => <Auth type="signup" />;

export default RegisterPage;

RegisterPage.preload = () => ({ head: <Head title="Sign up" /> });
