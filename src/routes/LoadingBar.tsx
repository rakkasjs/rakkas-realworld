import { useLocation } from "rakkasjs";
import { FC } from "react";
import css from "./LoadingBar.module.css";

export const LoadingBar: FC = () => {
	const { pending: pendingUrl } = useLocation();

	return <div className={css.main + (pendingUrl ? " " + css.loading : "")} />;
};
