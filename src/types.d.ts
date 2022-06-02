import "rakkasjs";
import { ConduitInterface } from "lib/interfaces";

declare module "rakkasjs" {
	interface RequestContext {
		conduit: ConduitInterface;
	}
}
