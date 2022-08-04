import { defineConfig } from "vite";
import rakkas from "rakkasjs/vite-plugin";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	resolve: {
		alias:
			process.env.RAKKAS_TARGET === "node"
				? {
						"@prisma/client/runtime": "@prisma/client/runtime/index",
				  }
				: {
						bcrypt: "bcryptjs",
						"@prisma/client/runtime": "@prisma/client/runtime/edge",
						"@prisma/client": "@prisma/client/edge",
				  },
	},

	plugins: [
		tsconfigPaths(),
		rakkas({
			adapter: (process.env.RAKKAS_TARGET as any) || "node",
		}),
		// TODO: Serverless
		process.env.RAKKAS_TARGET !== "node" && {
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
