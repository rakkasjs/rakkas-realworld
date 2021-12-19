import { useRouter } from "rakkasjs";
import React, { FC } from "react";
import css from "./LoadingBar.module.css";

export const LoadingBar: FC = () => {
	const { pendingUrl } = useRouter();

	return <div className={css.main + (pendingUrl ? " " + css.loading : "")} />;
};
