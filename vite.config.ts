import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		rakkas(),
		// TODO: Serverless
		false && {
			enforce: "pre",
			name: "stub",
			resolveId(id) {
				if (id === path.resolve("src/lib/auth-service")) {
					return path.resolve("src/lib/auth-service-stub.ts");
				}

				return undefined;
			},
		},
	],
});
