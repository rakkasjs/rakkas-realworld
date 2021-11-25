import "rakkasjs";
import { ConduitInterface, User } from "lib/interfaces";

declare module "rakkasjs" {
	interface RootContext {
		user?: User;
		test?: boolean;
	}

	interface LoadHelpers {
		conduit: ConduitInterface;
	}
}
