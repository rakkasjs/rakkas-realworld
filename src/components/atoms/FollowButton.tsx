import { Link, useMutation, usePageContext, useQuery } from "rakkasjs";
import { CSSProperties } from "react";
import { Profile } from "~/client/interfaces";
import { ActionButton } from "~/components/atoms/ActionButton";

export interface FollowButtonProps {
	author: Profile;
	style?: CSSProperties;
}

export function FollowButton({ author, style }: FollowButtonProps) {
	const { data: user } = useQuery("user", (ctx) =>
		ctx.locals.conduit.getCurrentUser(),
	);

	const followMutation = useMutation(
		() =>
			author.following
				? ctx.locals.conduit.unfollowUser(author.username)
				: ctx.locals.conduit.followUser(author.username),
		{
			onMutate() {
				// Optimistically update the author's following status
				ctx.queryClient.setQueryData(`profile:${author.username}`, {
					...author,
					following: !author.following,
				});
			},
			onSuccess(data) {
				// Update the author's following status
				ctx.queryClient.setQueryData(`profile:${author.username}`, data);
			},
			onError() {
				// Revert the optimistic update
				ctx.queryClient.setQueryData(`profile:${author.username}`, {
					...author,
					following: author.following,
				});
			},
		},
	);

	const ctx = usePageContext();

	return user ? (
		<ActionButton
			style={style}
			key={`${user.token}:${author.username}:${author.following}`}
			label={
				author.following
					? "Unfollow " + author.username
					: "Follow " + author.username
			}
			icon={author.following ? "minus-round" : "plus-round"}
			size="small"
			outline={!author.following}
			onClick={() => followMutation.mutateAsync()}
		/>
	) : (
		<Link href="/register" className="btn btn-sm btn-outline-secondary">
			<i className="ion-plus-round"></i>
			&nbsp; Follow {author.username}
		</Link>
	);
}
