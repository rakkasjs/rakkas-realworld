import "rakkasjs";
import { User } from "lib/api-types";

declare module "rakkasjs" {
	interface RootContext {
		apiUrl: string;
		user?: User;
	}
}
