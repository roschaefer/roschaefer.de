import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePath = path.join(rootDir, "resume.i18n.json");
const outDir = path.join(rootDir, ".generated");
const outPath = path.join(outDir, "resume-source.json");

await fs.mkdir(outDir, { recursive: true });
await fs.copyFile(sourcePath, outPath);
