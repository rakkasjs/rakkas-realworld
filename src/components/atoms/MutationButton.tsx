import { UseMutationResult } from "rakkasjs";
import { ReactNode, CSSProperties, useState, useEffect, useRef } from "react";
import css from "./MutationButton.module.css";

interface MutationButtonProps {
	mutation: UseMutationResult<any, any>;
	outline?: boolean;
	type?: "primary" | "danger" | "secondary";
	size?: "small" | "large";
	icon?: string;
	label: ReactNode;
	inProgressLabel?: ReactNode;
	finishedLabel?: ReactNode;
	failedLabel?: ReactNode;
	style?: CSSProperties;
	title?: string;
	onClick?: () => void;
}

export function MutationButton({
	mutation,

	label,
	inProgressLabel = label,
	finishedLabel,
	failedLabel = "Operation failed",

	title,

	style,

	outline,
	type = "secondary",
	size,
	icon,
	onClick,
}: MutationButtonProps) {
	const previousStatus = useRef<"idle" | "loading" | "success" | "error">();
	const [isRecentlyUpdated, setIsRecentlyUpdated] = useState(false);

	let status = mutation.status;
	if ((status === "error" || status === "success") && !isRecentlyUpdated) {
		status = "idle";
	}

	// Reset isNewlyUpdated in 5 seconds
	useEffect(() => {
		if (previousStatus.current === mutation.status) {
			return;
		}

		if (mutation.status === "success" || mutation.status === "error") {
			setIsRecentlyUpdated(true);

			const timeout = setTimeout(() => {
				setIsRecentlyUpdated(false);
			}, 1500);

			return () => clearTimeout(timeout);
		}
	}, [mutation.status]);

	if (status === "idle" || status === "success") {
		type = "primary";
		outline = false;
	} else if (status === "error") {
		type = "danger";
		outline = false;
	}

	const classes = (
		[
			"btn",
			outline ? "btn-outline-" + type : "btn-" + type,
			size === "small" && "btn-sm",
			size === "large" && "btn-lg",
		].filter(Boolean) as string[]
	).join(" ");

	return (
		<button
			className={classes}
			style={style}
			title={title}
			disabled={status === "loading"}
			onClick={onClick}
		>
			<i
				className={
					{
						idle: "ion-" + icon,
						loading: "ion-load-c " + css.spinning,
						success: "ion-checkmark",
						error: "ion-close",
					}[status]
				}
			></i>
			&nbsp;{" "}
			{
				{
					idle: label,
					loading: inProgressLabel,
					success: finishedLabel,
					error: failedLabel,
				}[status]
			}
		</button>
	);
}
