import React, { useContext, useEffect, useRef, useState } from "react";
import {
	definePage,
	DefinePageTypes,
	navigate,
	setRootContext,
} from "rakkasjs";
import { StatusCodes } from "http-status-codes";
import { User } from "lib/interfaces";
import { serialize } from "cookie";
import { Helmet } from "react-helmet-async";
import { ActionButton } from "lib/ActionButton";
import { ConduitContext } from "lib/ConduitContext";
import { ConduitError } from "lib/conduit-error";

type SettingsPageTypes = DefinePageTypes<{
	data: User | undefined;
}>;

export default definePage<SettingsPageTypes>({
	async load({ context: { user }, helpers }) {
		if (!user)
			return {
				status: StatusCodes.SEE_OTHER,
				redirect: "/register",
				data: undefined,
			};

		return { data: await helpers.conduit.getCurrentUser() };
	},

	Component: function SettingsPage({ data: user, url }) {
		const mounted = useRef(true);
		const form = useRef<HTMLFormElement>(null);

		useEffect(
			() => () => {
				mounted.current = false;
			},
			[],
		);

		const ctx = useContext(ConduitContext);

		const [errors, setErrors] = useState<string[]>(
			url.searchParams.getAll("error"),
		);

		if (!user) return null;

		return (
			<div className="settings-page">
				<Helmet title="Settings" />

				<div className="container page">
					<div className="row">
						<div className="col-md-6 offset-md-3 col-xs-12">
							<h1 className="text-xs-center">Your Settings</h1>

							{errors.length > 0 && (
								<ul className="error-messages">
									{errors.map((message, i) => (
										<li key={i}>{message}</li>
									))}
								</ul>
							)}

							<form
								ref={form}
								method="POST"
								action="/api/form/settings"
								onSubmit={(e) => e.preventDefault()}
							>
								<fieldset>
									<fieldset className="form-group">
										<input
											className="form-control"
											type="text"
											placeholder="URL of profile picture"
											name="image"
											defaultValue={user.image || ""}
										/>
									</fieldset>
									<fieldset className="form-group">
										<input
											className="form-control form-control-lg"
											type="text"
											placeholder="Your Name"
											name="username"
											defaultValue={user.username}
										/>
									</fieldset>
									<fieldset className="form-group">
										<textarea
											className="form-control form-control-lg"
											rows={8}
											placeholder="Short bio about you"
											name="bio"
											defaultValue={user.bio || ""}
										/>
									</fieldset>
									<fieldset className="form-group">
										<input
											className="form-control form-control-lg"
											type="text"
											placeholder="Email"
											name="email"
											defaultValue={user.email || ""}
										/>
									</fieldset>
									<fieldset className="form-group">
										<input
											className="form-control form-control-lg"
											type="password"
											placeholder="Password"
											name="password"
										/>
									</fieldset>
									<ActionButton
										label="Update Settings"
										inProgressLabel="Updating Settings"
										failedLabel="Failed to update settings"
										finishedLabel="Settings Updated"
										type="primary"
										size="large"
										style={{ float: "right" }}
										onClick={async () => {
											if (!form.current)
												throw new Error("Could not find the form element");

											const fd = new FormData(form.current);
											const json = Object.fromEntries([...fd.entries()]);
											if (!json.password) delete json.password;

											const updated = await ctx.auth
												.updateUser(json)
												.catch((err) => {
													if (err instanceof ConduitError) {
														setErrors(err.messages);
													}

													throw err;
												});

											if (!mounted.current) return;

											(
												document.getElementsByName(
													"password",
												)[0] as HTMLInputElement
											).value = "";

											setRootContext((old) => ({ ...old, user: updated }));
										}}
									/>
								</fieldset>
							</form>
							<hr />
							<form
								method="POST"
								action="/api/form/logout"
								onSubmit={(e) => {
									e.preventDefault();
									document.cookie = serialize("authToken", user.token, {
										maxAge: 0,
										path: "/",
									});

									setRootContext((old) => ({ ...old, user: undefined }));

									navigate("/");
								}}
							>
								<button className="btn btn-outline-danger">
									Or click here to logout
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	},
});
