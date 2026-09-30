import type { Locale } from "$lib/i18n";
import type { Resume } from "$lib/types/resume";
import { sortResumeDatedSections } from "./resume-order.ts";
import { createResumeSkills } from "./resume-skills.ts";

const locales: Locale[] = ["de", "en"];

const resumeSchema =
	"https://raw.githubusercontent.com/jsonresume/resume-schema/v1.2.1/schema.json";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isLocalizedObject = (value: unknown): value is Record<string, unknown> =>
	isPlainObject(value) &&
	Object.keys(value).length > 0 &&
	Object.keys(value).every((key) => locales.includes(key as Locale));

const localizeValue = (value: unknown, locale: Locale): unknown => {
	if (Array.isArray(value)) {
		return value.map((entry) => localizeValue(entry, locale));
	}

	if (isLocalizedObject(value)) {
		if (!(locale in value)) {
			return undefined;
		}

		return localizeValue(value[locale], locale);
	}

	if (!isPlainObject(value)) {
		return value;
	}

	return Object.fromEntries(
		Object.entries(value)
			.map(([key, entry]) => [key, localizeValue(entry, locale)])
			.filter(([, entry]) => entry !== undefined),
	);
};

// Localizes an already-resolved (decrypted/masked or unredacted) resume tree
// into a single locale's JSON Resume data, sorts dated sections, and computes
// skills. Pure and redaction-agnostic - it has no idea whether the source it
// was handed is masked or real, it just localizes whatever it's given.
export const deriveResume = (source: unknown, locale: Locale): Resume => {
	const resume = localizeValue(source, locale) as Record<string, unknown>;
	const { featured: _featured, ...resumeWithoutFeatured } = resume;

	return sortResumeDatedSections({
		$schema: resumeSchema,
		...resumeWithoutFeatured,
		skills: createResumeSkills(
			(resumeWithoutFeatured.projects as Resume["projects"]) ?? [],
			locale,
		),
	} as unknown as Resume);
};
