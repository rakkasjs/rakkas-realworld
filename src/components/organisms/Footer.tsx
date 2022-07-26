import { Link } from "rakkasjs";

export default function Footer() {
	return (
		<footer>
			<div className="container">
				<Link href="/" className="logo-font">
					conduit
				</Link>
				<span className="attribution">
					An interactive learning project from{" "}
					<a href="https://thinkster.io">Thinkster</a>. Code &amp; design
					licensed under MIT. Rakkas port by Fatih Aygün, under the same
					license.
				</span>
			</div>
		</footer>
	);
}
