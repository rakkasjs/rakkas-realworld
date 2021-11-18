import { defineConfig } from "@rakkasjs/cli";
import path from "path";

export default defineConfig({
	vite: {
		resolve: {
			alias: {
				lib: path.resolve("src", "lib"),
				api: path.resolve("src", "api"),
			},
		},
		optimizeDeps: {
			exclude: [
				"@prisma/client",
				"@prisma/client/runtime/index",
				"rakkasjs",
				"rakkasjs/server",
			],
		},
	},
});
