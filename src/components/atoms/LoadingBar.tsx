import { useLocation } from "rakkasjs";
import css from "./LoadingBar.module.css";

export default function LoadingBar() {
	const { pending: pendingUrl } = useLocation();

	return <div className={css.main + (pendingUrl ? " " + css.loading : "")} />;
}
