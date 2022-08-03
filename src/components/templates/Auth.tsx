import { Link, navigate, useMutation, usePageContext } from "rakkasjs";
import { serialize } from "cookie";
import { ConduitError } from "~/lib/conduit-error";

interface AuthProps {
	type: "signin" | "signup";
}

export function Auth({ type }: AuthProps) {
	const ctx = usePageContext();

	const signup = type === "signup";

	const loginMutation = useMutation(
		(json: { username: string; email: string; password: string }) =>
			(signup
				? ctx.locals.auth.register(json)
				: ctx.locals.auth.login(json as { email: string; password: string })
			).then(async (user) => {
				document.cookie = serialize("authToken", user.token, {
					maxAge: 60 * 60 * 24 * 30,
					path: "/",
					sameSite: true,
					secure: location.protocol === "https",
				});

				ctx.queryClient.setQueryData("user", user);

				await navigate("/", { replace: true });
			}),
	);

	return (
		<div className="auth-page">
			<div className="container page">
				<div className="row">
					<div className="col-md-6 offset-md-3 col-xs-12">
						<h1 className="text-xs-center">{signup ? "Sign up" : "Sign in"}</h1>
						<p className="text-xs-center">
							<Link href={signup ? "/login" : "/register"}>
								{signup ? "Have an account?" : "Need an account?"}
							</Link>
						</p>

						{!!loginMutation.error &&
							(loginMutation.error instanceof ConduitError ? (
								loginMutation.error.issues && (
									<ul className="error-messages">
										{Object.entries(loginMutation.error.issues).map(
											([source, messages], i) =>
												messages.map((message) => (
													<li key={i}>
														{source} {message}
													</li>
												)),
										)}
									</ul>
								)
							) : (
								<ul className="error-messages">
									<li>An error has occured</li>
								</ul>
							))}

						<form
							method="POST"
							action={signup ? "/api/form/register" : "/api/form/login"}
							onSubmit={(e) => {
								e.preventDefault();
								const fd = new FormData(e.currentTarget);
								const json = Object.fromEntries([...fd.entries()]);
								loginMutation.mutate(json as any);
							}}
						>
							{signup && (
								<fieldset className="form-group">
									<input
										name="username"
										className="form-control form-control-lg"
										type="text"
										placeholder="Your Name"
									/>
								</fieldset>
							)}
							<fieldset className="form-group">
								<input
									name="email"
									className="form-control form-control-lg"
									type="text"
									placeholder="Email"
								/>
							</fieldset>
							<fieldset className="form-group">
								<input
									name="password"
									className="form-control form-control-lg"
									type="password"
									placeholder="Password"
								/>
							</fieldset>
							<button className="btn btn-lg btn-primary pull-xs-right">
								{type === "signin"
									? loginMutation.isLoading
										? "Signing in"
										: "Sign in"
									: loginMutation.isLoading
									? "Signing up"
									: "Sign up"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
