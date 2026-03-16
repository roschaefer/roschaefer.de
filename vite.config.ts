import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const workspaceRoot = new URL(".", import.meta.url).pathname;

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		fs: {
			allow: [workspaceRoot],
		},
	},
	test: {
		include: ["src/**/*.{test,spec}.{ts,js}"],
	},
});
