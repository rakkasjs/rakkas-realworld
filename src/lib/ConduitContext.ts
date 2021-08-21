import { ConduitRequestContext } from "lib/conduit-client";
import { createContext } from "react";

export const ConduitContext = createContext<ConduitRequestContext>({
	apiUrl: "/api",
	fetch,
});
