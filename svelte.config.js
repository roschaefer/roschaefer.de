import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";
import { localDocsSite, rehypeDocsLinks } from "./src/lib/blog/docs-links.js";

const markdownExtensions = [".svx"];
// Posts link to the published git-splice docs; `pnpm dev` links to the docs served locally instead.
const rehypePlugins =
	process.env.npm_lifecycle_event === "dev" ? [[rehypeDocsLinks, { site: localDocsSite }]] : [];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ...markdownExtensions],
	preprocess: [
		mdsvex({
			extensions: markdownExtensions,
			layoutPropForwarding: "runes",
			rehypePlugins,
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
