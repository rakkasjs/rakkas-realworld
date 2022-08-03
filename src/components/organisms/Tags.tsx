import { StyledLink, useQuery } from "rakkasjs";

export function Tags(props: { currentTag: string | null }) {
	const { data: tags } = useQuery("tags", ({ locals: { conduit } }) =>
		conduit.getTags(),
	);

	return (
		<div className="sidebar">
			<p>Popular Tags</p>

			<div className="tag-list">
				{tags.length === 0 && (
					<span className="text-muted">No tags to show</span>
				)}
				{tags.map((t, i) => (
					<StyledLink
						href={"?tag=" + encodeURIComponent(t)}
						key={i}
						className={
							"tag-pill tag-default" +
							(t === props.currentTag ? " tag-primary" : "")
						}
						pendingStyle={{ backgroundColor: "#8b8" }}
					>
						{t}
					</StyledLink>
				))}
			</div>
		</div>
	);
}
