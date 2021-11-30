import { defineConfig } from "@rakkasjs/cli";
import path from "path";
import fs from "fs";
import alias from "esbuild-plugin-alias";

export default defineConfig(async ({ command, deploymentTarget }) => {
	const serverless = deploymentTarget !== "node";

	let prismaClientPath: string;
	let prismaRuntimePath: string;

	// Prisma client resolves to a stub for the browser.
	// We need to resolve the real entry point manually for Cloudflare Workers.
	if (serverless) {
		prismaClientPath = await fs.promises.realpath(
			"node_modules/@prisma/client/index.js",
		);
		prismaRuntimePath = await fs.promises.realpath(
			"node_modules/@prisma/client/runtime/proxy.js",
		);
	}

	return {
		vite: {
			resolve: {
				alias: {
					lib: path.resolve("src", "lib"),
					api: path.resolve("src", "api"),
				},
			},

			plugins: [
				serverless && {
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

			ssr: {
				// react-markdown is a module
				external: command === "dev" ? ["react-markdown"] : [],
			},
		},

		modifyEsbuildOptions: serverless
			? (options) => {
					// Prisma client resolves to a stub for the browser.
					// We need to resolve the real entry point manually for Cloudflare Workers.
					options.plugins = options.plugins || [];
					options.plugins.push(
						alias({
							"@prisma/client": prismaClientPath,
							"@prisma/client/runtime": prismaRuntimePath,
						}),
					);
			  }
			: undefined,
	};
});
