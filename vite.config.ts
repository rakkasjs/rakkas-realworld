import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

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
			adapter: (target as any) || "node",
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
