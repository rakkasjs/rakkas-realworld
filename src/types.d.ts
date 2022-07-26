import "rakkasjs";
import "zod";

import { ConduitAuthInterface, ConduitInterface } from "~/client/interfaces";

declare module "rakkasjs" {
	interface ServerSideLocals {
		auth: ConduitAuthInterface;
		conduit: ConduitInterface;
	}

	interface PageLocals {
		auth: ConduitAuthInterface;
		conduit: ConduitInterface;
	}
}
