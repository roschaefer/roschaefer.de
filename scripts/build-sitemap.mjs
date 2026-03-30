import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { SitemapStream, streamToPromise } from "sitemap";
import { siteUrl } from "../src/lib/config/site.ts";
import { resumePdfPath } from "../src/lib/data/resume-pdf.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "build");

const pathExists = async (target) => {
	try {
		await fs.access(target);
		return true;
	} catch {
		return false;
	}
};

const walkFiles = async (target) => {
	const entries = await fs.readdir(target, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(target, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walkFiles(entryPath)));
		} else if (entry.isFile()) {
			files.push(entryPath);
		}
	}

	return files;
};

const normalizePath = (value) => {
	if (!value.startsWith("/")) {
		return null;
	}

	if (value.startsWith("//")) {
		return null;
	}

	const [pathname] = value.split("#");
	const [cleanPath] = pathname.split("?");
	if (!cleanPath) {
		return null;
	}

	return cleanPath;
};

const htmlPathToUrlPath = (filePath) => {
	const relative = path.relative(buildDir, filePath).replaceAll(path.sep, "/");

	if (relative === "index.html") {
		return "/";
	}

	if (relative.endsWith("/index.html")) {
		return `/${relative.slice(0, -"index.html".length)}`;
	}

	if (relative.endsWith(".html")) {
		return `/${relative}`;
	}

	return null;
};

const extractInternalLinks = (html) => {
	const matches = html.matchAll(/href="([^"]+)"/g);
	const links = new Set();

	for (const match of matches) {
		const href = match[1];
		if (
			!href ||
			href.startsWith("http://") ||
			href.startsWith("https://") ||
			href.startsWith("mailto:")
		) {
			continue;
		}

		const normalized = normalizePath(href);
		if (normalized) {
			links.add(normalized);
		}
	}

	return links;
};

if (!(await pathExists(buildDir))) {
	throw new Error(
		`Expected build output at ${buildDir}. Run the site build before generating sitemap.`,
	);
}

const files = await walkFiles(buildDir);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const discoveredPaths = new Set(["/"]);

for (const file of htmlFiles) {
	const pagePath = htmlPathToUrlPath(file);
	if (pagePath) {
		discoveredPaths.add(pagePath);
	}

	const html = await fs.readFile(file, "utf8");
	for (const link of extractInternalLinks(html)) {
		discoveredPaths.add(link);
	}
}

const atsPdfPaths = [resumePdfPath("de", "ats"), resumePdfPath("en", "ats")];
for (const atsPath of atsPdfPaths) {
	const buildPath = path.join(buildDir, atsPath.replace(/^\//, ""));
	if (await pathExists(buildPath)) {
		discoveredPaths.add(atsPath);
	}
}

const urls = [...discoveredPaths].sort((left, right) => left.localeCompare(right));

const sitemapStream = new SitemapStream({ hostname: siteUrl });
const sitemap = (await streamToPromise(Readable.from(urls).pipe(sitemapStream))).toString();

const robots = [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${siteUrl}/sitemap.xml`].join("\n");

await fs.writeFile(path.join(buildDir, "sitemap.xml"), `${sitemap}\n`);
await fs.writeFile(path.join(buildDir, "robots.txt"), `${robots}\n`);
