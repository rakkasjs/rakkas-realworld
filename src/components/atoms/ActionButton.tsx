import { ReactNode, CSSProperties, FC, useState } from "react";
import css from "./ActionButton.module.css";

interface ActionButtonProps {
	onClick(): Promise<unknown>;
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
}

const enum ActionState {
	INITIAL,
	IN_PROGRESS,
	FINISHED,
	FAILED,
}

export const ActionButton: FC<ActionButtonProps> = ({
	outline,
	type = "secondary",
	size,
	icon,
	label,
	inProgressLabel = label,
	finishedLabel,
	failedLabel = "Operation failed",
	style,
	title,
	onClick,
}) => {
	const [state, setState] = useState<ActionState>(ActionState.INITIAL);

	if (state === ActionState.FINISHED) {
		type = "primary";
		outline = false;
	} else if (state === ActionState.FAILED) {
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

	const btn = (
		<button
			className={classes}
			style={style}
			title={title}
			disabled={state !== ActionState.INITIAL}
			onClick={(e) => {
				e.currentTarget.blur();
				setState(ActionState.IN_PROGRESS);
				onClick()
					.then(() => {
						setState(
							finishedLabel ? ActionState.FINISHED : ActionState.INITIAL,
						);
					})
					.catch(() => {
						setState(ActionState.FAILED);
					})
					.then(() => {
						setTimeout(() => {
							setState(ActionState.INITIAL);
						}, 2000);
					});
			}}
		>
			<i
				className={
					{
						[ActionState.INITIAL]: "ion-" + icon,
						[ActionState.IN_PROGRESS]: "ion-load-c " + css.spinning,
						[ActionState.FINISHED]: "ion-checkmark",
						[ActionState.FAILED]: "ion-close",
					}[state]
				}
			></i>
			&nbsp;{" "}
			{
				{
					[ActionState.INITIAL]: label,
					[ActionState.IN_PROGRESS]: inProgressLabel,
					[ActionState.FINISHED]: finishedLabel,
					[ActionState.FAILED]: failedLabel,
				}[state]
			}
		</button>
	);

	return btn;
};
