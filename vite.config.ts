import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const workspaceRoot = new URL(".", import.meta.url).pathname;

export default defineConfig(({ command }) => ({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: [
			{
				find: "virtual:writing-drafts",
				replacement: new URL(
					command === "build"
						? "./src/lib/writing/empty-draft-modules.ts"
						: "./src/lib/writing/draft-modules.ts",
					import.meta.url,
				).pathname,
			},
		],
	},
	server: {
		fs: {
			allow: [workspaceRoot],
		},
	},
	test: {
		include: ["src/**/*.{test,spec}.{ts,js}"],
	},
}));
