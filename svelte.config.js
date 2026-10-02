import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

const markdownExtensions = [".svx"];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ...markdownExtensions],
	preprocess: [
		mdsvex({
			extensions: markdownExtensions,
			layoutPropForwarding: "runes",
		}),
		vitePreprocess(),
	],
	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: "warn",
			handleUnseenRoutes: "warn",
		},
	},
};

export default config;
