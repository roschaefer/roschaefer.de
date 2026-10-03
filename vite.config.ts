import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const workspaceRoot = new URL(".", import.meta.url).pathname;
const logContentRoot = join(workspaceRoot, "src/content/log");
const virtualLogModules = "virtual:log-modules";
const resolvedVirtualLogModules = `\0${virtualLogModules}`;

const hasPublicationDate = (path: string) => {
	const source = readFileSync(path, "utf8");
	const frontmatterEnd = source.indexOf("\n---", 4);
	const frontmatter = frontmatterEnd === -1 ? source : source.slice(0, frontmatterEnd);
	return /^publishedAt:\s*["']?\d{4}-\d{2}-\d{2}["']?\s*$/m.test(frontmatter);
};

const logModulesPlugin = (includeDrafts: boolean) => ({
	name: "log-modules",
	resolveId(id: string) {
		if (id === virtualLogModules) return resolvedVirtualLogModules;
	},
	load(id: string) {
		if (id !== resolvedVirtualLogModules) return;
		const paths = (["de", "en"] as const).flatMap((locale) =>
			readdirSync(join(logContentRoot, locale))
				.filter((name) => name.endsWith(".svx"))
				.map((name) => ({
					filePath: join(logContentRoot, locale, name),
					modulePath: `/src/content/log/${locale}/${name}`,
				})),
		);
		const included = includeDrafts
			? paths
			: paths.filter(({ filePath }) => hasPublicationDate(filePath));
		const imports = included.map(
			({ modulePath }, index) =>
				`import * as logModule${index} from ${JSON.stringify(modulePath)};`,
		);
		const entries = included.map(
			({ modulePath }, index) => `${JSON.stringify(modulePath)}: logModule${index}`,
		);
		return `${imports.join("\n")}\nexport const logModules = {${entries.join(",")}};`;
	},
});

export default defineConfig(({ command }) => ({
	plugins: [logModulesPlugin(command !== "build"), tailwindcss(), sveltekit()],
	server: {
		fs: {
			allow: [workspaceRoot],
		},
	},
	test: {
		include: ["src/**/*.{test,spec}.{ts,js}"],
	},
}));
