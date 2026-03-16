import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sortResumeDatedSections } from "../src/lib/utils/resume-order.ts";
import { createResumeSkills } from "../src/lib/utils/resume-skills.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const locales = ["de", "en"];
const sourceFile = path.join(rootDir, "resume.i18n.json");
const resumeSchema =
	"https://raw.githubusercontent.com/jsonresume/resume-schema/v1.2.1/schema.json";

const isPlainObject = (value) =>
	Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isLocalizedObject = (value) =>
	isPlainObject(value) &&
	Object.keys(value).length > 0 &&
	Object.keys(value).every((key) => locales.includes(key));

const localizeValue = (value, locale, pathSegments = []) => {
	if (Array.isArray(value)) {
		return value.map((entry, index) =>
			localizeValue(entry, locale, [...pathSegments, String(index)]),
		);
	}

	if (isLocalizedObject(value)) {
		if (!(locale in value)) {
			return undefined;
		}

		return localizeValue(value[locale], locale, pathSegments);
	}

	if (!isPlainObject(value)) {
		return value;
	}

	return Object.fromEntries(
		Object.entries(value)
			.map(([key, entry]) => [key, localizeValue(entry, locale, [...pathSegments, key])])
			.filter(([, entry]) => entry !== undefined),
	);
};

const source = JSON.parse(await fs.readFile(sourceFile, "utf8"));

for (const locale of locales) {
	const resume = localizeValue(source, locale);
	const sortedResume = sortResumeDatedSections({
		$schema: resumeSchema,
		...resume,
		skills: createResumeSkills(resume.projects ?? [], locale),
	});
	await fs.writeFile(
		path.join(rootDir, `resume.${locale}.json`),
		`${JSON.stringify(sortedResume, null, "\t")}\n`,
	);
}
