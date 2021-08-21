import { serialize } from "cookie";
import { Link, navigate, setRootContext } from "rakkasjs";
import React, { FC, useEffect, useRef, useState } from "react";
import { ConduitError, login, register } from "lib/conduit-client";

interface AuthProps {
	type: "signin" | "signup";
	apiUrl: string;
	errorMessages: string[];
}

export const Auth: FC<AuthProps> = ({ type, apiUrl, errorMessages }) => {
	const mounted = useRef(true);
	useEffect(
		() => () => {
			mounted.current = false;
		},
		[],
	);

	const signup = type === "signup";
	const [errors, setErrors] = useState<string[]>(errorMessages);
	const [submitLabel, setSubmitLabel] = useState(
		signup ? "Sign up" : "Sign in",
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

						{errors.length > 0 && (
							<ul className="error-messages">
								{errors.map((message, i) => (
									<li key={i}>{message}</li>
								))}
							</ul>
						)}

						<form
							method="POST"
							action={signup ? "/api/form/register" : "/api/form/login"}
							onSubmit={(e) => {
								e.preventDefault();
								setSubmitLabel(signup ? "Signing up..." : "Signing in...");
								const fd = new FormData(e.currentTarget);
								const json = Object.fromEntries([...fd.entries()]);

								(signup
									? register(
											{ apiUrl, fetch },
											json as {
												username: string;
												email: string;
												password: string;
											},
									  )
									: login(
											{ apiUrl, fetch },
											json as { email: string; password: string },
									  )
								)
									.then((user) => {
										if (!mounted.current) return;

										document.cookie = serialize("authToken", user.token, {
											maxAge: 60 * 60 * 24 * 30,
											path: "/",
											sameSite: true,
											secure: location.protocol === "https",
										});

										setRootContext((old) => ({
											...old,
											user,
										}));

										navigate("/");
									})
									.catch((err: ConduitError) => {
										if (!mounted.current) return;
										setSubmitLabel(signup ? "Sign up" : "Sign in");
										setErrors(err.messages);
									});
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
								{submitLabel}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
