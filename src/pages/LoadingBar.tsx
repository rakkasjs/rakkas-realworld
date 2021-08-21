import { useRouter } from "rakkasjs";
import React, { FC } from "react";
import css from "./LoadingBar.module.css";

export const LoadingBar: FC = () => {
	const { next } = useRouter();

	return <div className={css.main + (next ? " " + css.loading : "")} />;
};
