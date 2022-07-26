import { ActionButton } from "lib/ActionButton";
import { Profile } from "~/client/interfaces";
import { ConduitContext } from "lib/ConduitContext";
import { Link } from "rakkasjs";
import React, { CSSProperties, FC, useContext } from "react";

export interface FollowButtonProps {
	author: Profile;
	onComplete?(newAuthor: Profile): void;
	style?: CSSProperties;
}

export const FollowButton: FC<FollowButtonProps> = ({
	author,
	onComplete,
	style,
}) => {
	const ctx = useContext(ConduitContext);
	const { user } = ctx;

	return user ? (
		<ActionButton
			style={style}
			key={`${user.token}:${author.username}:${author.following}`}
			action={
				author.following
					? "/api/form/profile/" +
					  encodeURIComponent(author.username) +
					  "/unfollow"
					: "/api/form/profile/" +
					  encodeURIComponent(author.username) +
					  "/follow"
			}
			label={
				author.following
					? "Unfollow " + author.username
					: "Follow " + author.username
			}
			inProgressLabel={
				author.following
					? "Unfollowing " + author.username
					: "Follow " + author.username
			}
			icon={author.following ? "minus-round" : "plus-round"}
			size="small"
			outline={!author.following}
			onClick={async () => {
				const newAuthor = await (author.following
					? ctx.conduit.unfollowUser(author.username)
					: ctx.conduit.followUser(author.username));

				onComplete?.(newAuthor);
			}}
		/>
	) : (
		<Link href="/register" className="btn btn-sm btn-outline-secondary">
			<i className="ion-plus-round"></i>
			&nbsp; Follow {author.username}
		</Link>
	);
};
