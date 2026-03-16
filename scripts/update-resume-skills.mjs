import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createResumeSkills } from "../src/lib/utils/resume-skills.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const files = [
	{ file: "resume.de.json", locale: "de" },
	{ file: "resume.en.json", locale: "en" },
];

for (const entry of files) {
	const filePath = path.join(rootDir, entry.file);
	const source = await fs.readFile(filePath, "utf8");
	const resume = JSON.parse(source);
	resume.skills = createResumeSkills(resume.projects ?? [], entry.locale);
	await fs.writeFile(filePath, `${JSON.stringify(resume, null, "\t")}\n`);
}
