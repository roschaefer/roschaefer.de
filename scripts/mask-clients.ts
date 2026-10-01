import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addMaskedSopsFields } from "../src/lib/utils/resolve-sops-fields.ts";

// Writes the masked client names next to their encrypted fields in
// resume.i18n.json, so builds can read them without a sops key. Run this
// locally after editing the encrypted fields with `sops resume.i18n.json`.
// `mac_only_encrypted: true` in .sops.yaml keeps the file decryptable after
// these plain-field edits.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resumePath = path.resolve(__dirname, "..", "resume.i18n.json");

const encrypted = JSON.parse(await fs.readFile(resumePath, "utf8"));
const decrypted = JSON.parse(execFileSync("sops", ["-d", resumePath], { encoding: "utf8" }));

await fs.writeFile(
	resumePath,
	`${JSON.stringify(addMaskedSopsFields(encrypted, decrypted), null, "\t")}\n`,
);
