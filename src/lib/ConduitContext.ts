import { User } from "~/client/interfaces";
import { ConduitAuthClient, ConduitClient } from "lib/rest-client";
import { createContext } from "react";

export interface ConduitContext {
	auth: ConduitAuthClient;
	api: ConduitClient;
	user?: User;
}

export const ConduitContext = createContext<ConduitContext>(null as any);
