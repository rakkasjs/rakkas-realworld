import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { bundleForDeno } from "./bundle-for-deno";

const target = process.env.RAKKAS_TARGET || "node";

export default defineConfig({
	resolve: {
		alias:
			target === "node"
				? {
						// ESM/CJS compatibility issues
						"@prisma/client/runtime": "@prisma/client/runtime/index",
				  }
				: {
						// Serverless-compatible replacements
						bcrypt: "bcryptjs",
						"@prisma/client/runtime": "@prisma/client/runtime/edge",
						"@prisma/client": "@prisma/client/edge",
				  },
	},

	plugins: [
		tsconfigPaths(),
		rakkas({
			adapter:
				target === "deno"
					? {
							// This special bundler is needed
							// for Deno Deploy compatibility
							// Rakkas will soon support this
							// out of the box.
							name: "Deno",
							bundle: bundleForDeno,
					  }
					: (target as any),
		}),
		// Stub for serverless
		target !== "node" && {
			enforce: "pre",
			name: "rakkasjs-realowrld-auth-stub",
			resolveId(id) {
				if (id === path.resolve("src/lib/auth-service")) {
					return path.resolve("src/lib/auth-service-stub.ts");
				}

				return undefined;
			},
		},
	],
});
