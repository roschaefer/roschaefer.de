import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

type SopsEncryptedProject = Record<string, unknown> & {
	sopsEncryptedEntity?: string;
	sopsEncryptedUrl?: string;
	sopsEncryptedLinks?: unknown;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const decrypted: { projects?: SopsEncryptedProject[]; [key: string]: unknown } = JSON.parse(
	execFileSync("sops", ["-d", path.join(rootDir, "resume.i18n.json")], { encoding: "utf8" }),
);

const merged = {
	...decrypted,
	projects: (decrypted.projects ?? []).map(
		({ sopsEncryptedEntity, sopsEncryptedUrl, sopsEncryptedLinks, ...project }) => ({
			...project,
			...(sopsEncryptedEntity ? { entity: sopsEncryptedEntity } : {}),
			...(sopsEncryptedUrl ? { url: sopsEncryptedUrl } : {}),
			...(sopsEncryptedLinks ? { links: sopsEncryptedLinks } : {}),
		}),
	),
};

const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "resume-private-"));
const tmpFile = path.join(tmpDir, "resume.i18n.json");
await fs.writeFile(tmpFile, `${JSON.stringify(merged, null, "\t")}\n`);

process.stdout.write(`${tmpFile}\n`);
