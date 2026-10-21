import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const workspaceRoot = new URL(".", import.meta.url).pathname;
const blogContentRoot = join(workspaceRoot, "src/content/blog");
const virtualBlogModules = "virtual:blog-modules";
const resolvedVirtualBlogModules = `\0${virtualBlogModules}`;

const hasPublicationDate = (path: string) => {
	const source = readFileSync(path, "utf8");
	const frontmatterEnd = source.indexOf("\n---", 4);
	const frontmatter = frontmatterEnd === -1 ? source : source.slice(0, frontmatterEnd);
	return /^publishedAt:\s*["']?\d{4}-\d{2}-\d{2}["']?\s*$/m.test(frontmatter);
};

const blogModulesPlugin = (includeDrafts: boolean) => ({
	name: "blog-modules",
	resolveId(id: string) {
		if (id === virtualBlogModules) return resolvedVirtualBlogModules;
	},
	load(id: string) {
		if (id !== resolvedVirtualBlogModules) return;
		const paths = (["de", "en"] as const).flatMap((locale) =>
			readdirSync(join(blogContentRoot, locale))
				.filter((name) => name.endsWith(".svx"))
				.map((name) => ({
					filePath: join(blogContentRoot, locale, name),
					modulePath: `/src/content/blog/${locale}/${name}`,
				})),
		);
		const included = includeDrafts
			? paths
			: paths.filter(({ filePath }) => hasPublicationDate(filePath));
		const imports = included.map(
			({ modulePath }, index) =>
				`import * as blogModule${index} from ${JSON.stringify(modulePath)};`,
		);
		const entries = included.map(
			({ modulePath }, index) => `${JSON.stringify(modulePath)}: blogModule${index}`,
		);
		return `${imports.join("\n")}\nexport const blogModules = {${entries.join(",")}};`;
	},
});

export default defineConfig(({ command }) => ({
	plugins: [blogModulesPlugin(command !== "build"), tailwindcss(), sveltekit()],
	server: {
		fs: {
			allow: [workspaceRoot],
		},
	},
	test: {
		include: ["src/**/*.{test,spec}.{ts,js}"],
	},
}));
