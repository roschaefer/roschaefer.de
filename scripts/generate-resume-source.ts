import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Locale } from "../src/lib/i18n.ts";
import { deriveResume } from "../src/lib/utils/derive-resume.ts";
import { resolveSopsEncryptedFields } from "../src/lib/utils/resolve-sops-fields.ts";

const locales: Locale[] = ["de", "en"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// "redacted" (default) is what every normal build/dev/test run uses - it reads
// the redacted client names committed by `pnpm redact-clients` and needs no sops
// key. "unredacted" decrypts the real values for local, personal use (e.g.
// printing your own real CV); it must never be the mode CI runs in.
const mode = process.env.RESUME_MODE === "unredacted" ? "unredacted" : "redacted";

const resumePath = path.join(rootDir, "resume.i18n.json");
const source = JSON.parse(
	mode === "unredacted"
		? execFileSync("sops", ["-d", resumePath], { encoding: "utf8" })
		: await fs.readFile(resumePath, "utf8"),
);
const { sops: _sops, ...sourceWithoutSops } = source;
const resolved = resolveSopsEncryptedFields(sourceWithoutSops, mode);

const outDir = path.join(rootDir, ".generated");
await fs.mkdir(outDir, { recursive: true });

await fs.writeFile(
	path.join(outDir, "resume-source.json"),
	`${JSON.stringify(resolved, null, "\t")}\n`,
);

await Promise.all(
	locales.map((locale) =>
		fs.writeFile(
			path.join(outDir, `resume.${locale}.json`),
			`${JSON.stringify(deriveResume(resolved, locale), null, "\t")}\n`,
		),
	),
);
