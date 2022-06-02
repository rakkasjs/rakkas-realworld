import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import path from "path";

export default defineConfig({
	resolve: {
		alias: {
			lib: path.resolve("src", "lib"),
			api: path.resolve("src", "api"),
		},
	},

	plugins: [
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
