import { User } from "lib/interfaces";
import { ConduitAuthClient, ConduitClient } from "lib/rest-client";
import { createContext } from "react";

export interface ConduitContext {
	auth: ConduitAuthClient;
	conduit: ConduitClient;
	user?: User;
}

export const ConduitContext = createContext<ConduitContext>(null as any);
