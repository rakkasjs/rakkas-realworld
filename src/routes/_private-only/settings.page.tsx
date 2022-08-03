import {
	Head,
	navigate,
	Page,
	Redirect,
	useMutation,
	usePageContext,
	useQuery,
} from "rakkasjs";
import { serialize } from "cookie";
import { MutationButton } from "~/components/atoms/MutationButton";
import { UpdateUser } from "~/lib/validation";
import { ConduitError } from "~/lib/conduit-error";

const SettingsPage: Page = () => {
	const ctx = usePageContext();

	const { data: user } = useQuery("user", (ctx) =>
		ctx.locals.conduit.getCurrentUser(),
	);

	const updateSettingsMutation = useMutation(async (userData: UpdateUser) => {
		const updated = await ctx.locals.auth.updateUser(userData);

		(document.getElementsByName("password")[0] as HTMLInputElement).value = "";

		ctx.queryClient.setQueryData("user", updated);
	});

	const logoutMutation = useMutation(async () => {
		document.cookie = serialize("authToken", "", {
			maxAge: 0,
			path: "/",
		});

		await navigate("/");
		ctx.queryClient.invalidateQueries();
	});

	if (!user) {
		return <Redirect href="/login" />;
	}

	const updateErrors =
		(updateSettingsMutation.error instanceof ConduitError &&
			updateSettingsMutation.error.issues &&
			Object.entries(updateSettingsMutation.error.issues)) ||
		[];

	const logoutErrors =
		(logoutMutation.error instanceof ConduitError &&
			logoutMutation.error.issues &&
			Object.entries(logoutMutation.error.issues)) ||
		[];

	const errors = [...updateErrors, ...logoutErrors].map(([source, messages]) =>
		messages.map((message) => `${source}: ${message}`),
	);

	return (
		<div className="settings-page">
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
							method="POST"
							onSubmit={(e) => {
								e.preventDefault();

								const fd = new FormData(e.currentTarget);
								const object = Object.fromEntries([...fd.entries()]);
								if (!object.password) delete object.password;

								updateSettingsMutation.mutate(object);
							}}
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

								<MutationButton
									mutation={updateSettingsMutation}
									label="Update Settings"
									inProgressLabel="Updating Settings"
									failedLabel="Failed to update settings"
									finishedLabel="Settings Updated"
									type="primary"
									size="large"
									style={{ float: "right" }}
								/>
							</fieldset>
						</form>
						<hr />

						<button
							className="btn btn-outline-danger"
							onClick={() => logoutMutation.mutate()}
						>
							Or click here to logout
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;

SettingsPage.preload = () => ({ head: <Head title="Settings" /> });
