import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { maskSopsEncryptedFields } from "../src/lib/utils/mask-sops-fields.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const decrypted = JSON.parse(
	execFileSync("sops", ["-d", path.join(rootDir, "resume.i18n.json")], { encoding: "utf8" }),
);
const { sops: _sops, ...sourceWithoutSops } = decrypted;
const masked = maskSopsEncryptedFields(sourceWithoutSops);

const outDir = path.join(rootDir, ".generated");
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(
	path.join(outDir, "resume-source.json"),
	`${JSON.stringify(masked, null, "\t")}\n`,
);
