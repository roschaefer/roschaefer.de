import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { resumePdfFilename } from "../src/lib/data/resume-pdf.ts";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const vendoredFontDir = path.join(rootDir, "typst", "fonts");
const expectedFonts = ["Jost*", "Titillium"];

const pathExists = async (target) => {
	try {
		await fs.access(target);
		return true;
	} catch {
		return false;
	}
};

const hasVendoredFontFiles = async (target) => {
	if (!(await pathExists(target))) {
		return false;
	}

	const entries = await fs.readdir(target, { withFileTypes: true });

	for (const entry of entries) {
		const entryPath = path.join(target, entry.name);

		if (entry.isDirectory() && (await hasVendoredFontFiles(entryPath))) {
			return true;
		}

		if (entry.isFile() && /\.(ttf|otf)$/i.test(entry.name)) {
			return true;
		}
	}

	return false;
};

const quoteArg = (value) => {
	if (/^[A-Za-z0-9_./:=+-]+$/.test(value)) {
		return value;
	}

	return `'${value.replace(/'/g, `'\\''`)}'`;
};

const logCommand = (command, args) => {
	console.log(`$ ${[command, ...args].map(quoteArg).join(" ")}`);
};

const useVendoredFonts = await hasVendoredFontFiles(vendoredFontDir);
const fontListArgs = ["fonts"];

if (useVendoredFonts) {
	fontListArgs.push("--font-path", vendoredFontDir);
}

logCommand("typst", fontListArgs);
const { stdout: fontList } = await execFileAsync("typst", fontListArgs, {
	cwd: rootDir,
});

if (!useVendoredFonts) {
	throw new Error(
		[
			"Typst PDF build requires vendored font files.",
			`Expected .ttf or .otf files somewhere under: ${vendoredFontDir}`,
		].join("\n"),
	);
}

const missingFonts = expectedFonts.filter((fontName) => !fontList.includes(fontName));

if (missingFonts.length > 0) {
	throw new Error(
		[
			"Typst did not load the expected font families.",
			`Missing: ${missingFonts.join(", ")}`,
			`Configured font path: ${vendoredFontDir}`,
			"Run `typst fonts` to inspect what Typst can actually see.",
		].join("\n"),
	);
}

await execFileAsync("node", [path.join(rootDir, "scripts", "build-typst-data.mjs")], {
	cwd: rootDir,
});

await fs.mkdir(path.join(rootDir, "typst", "out"), { recursive: true });

const variants = [
	{ template: "resume.typ", variant: "default" },
	{ template: "resume-ats.typ", variant: "ats" },
];

for (const locale of ["de", "en"]) {
	for (const { template, variant } of variants) {
		const outputName = resumePdfFilename(locale, variant);
		const outputPath = path.join(rootDir, "typst", "out", outputName);
		const staticLocaleDir = path.join(rootDir, "static", locale);
		const args = [
			"compile",
			path.join(rootDir, "typst", template),
			outputPath,
			"--root",
			rootDir,
			"--input",
			`lang=${locale}`,
		];

		args.push("--font-path", vendoredFontDir);

		logCommand("typst", args);
		await execFileAsync("typst", args, { cwd: rootDir });
		await fs.mkdir(staticLocaleDir, { recursive: true });
		await fs.copyFile(outputPath, path.join(staticLocaleDir, outputName));
	}
}
