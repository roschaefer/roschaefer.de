import source from "../../../resume.i18n.json";

const locales = ["de", "en"] as const;

type Locale = (typeof locales)[number];
type LocalizedValue = Partial<Record<Locale, unknown>>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	value !== null && typeof value === "object" && !Array.isArray(value);

const isLocalizedValue = (value: unknown): value is LocalizedValue => {
	if (!isPlainObject(value)) {
		return false;
	}

	const keys = Object.keys(value);
	return keys.length > 0 && keys.every((key) => locales.includes(key as Locale));
};

const assertValidLocalizedNodes = (value: unknown, path: string[] = []) => {
	if (Array.isArray(value)) {
		for (const [index, entry] of value.entries()) {
			assertValidLocalizedNodes(entry, [...path, String(index)]);
		}

		return;
	}

	if (!isPlainObject(value)) {
		return;
	}

	if (isLocalizedValue(value)) {
		for (const locale of locales) {
			if (!(locale in value)) {
				throw new Error(`Missing ${locale} translation at ${path.join(".") || "<root>"}.`);
			}
		}

		return;
	}

	for (const [key, entry] of Object.entries(value)) {
		assertValidLocalizedNodes(entry, [...path, key]);
	}
};

const assertNoGeneratedFieldsInSource = (value: Record<string, unknown>) => {
	if ("$schema" in value) {
		throw new Error('resume.i18n.json must not define "$schema".');
	}

	if ("skills" in value) {
		throw new Error('resume.i18n.json must not define "skills".');
	}
};

const assertDatedEntriesHaveRequiredDates = (value: unknown, path: string[] = []) => {
	if (Array.isArray(value)) {
		for (const [index, entry] of value.entries()) {
			assertDatedEntriesHaveRequiredDates(entry, [...path, String(index)]);
		}

		return;
	}

	if (!isPlainObject(value) || isLocalizedValue(value)) {
		return;
	}

	if ("startDate" in value || "endDate" in value) {
		if (typeof value.startDate !== "string" || value.startDate.length === 0) {
			throw new Error(`Missing startDate at ${path.join(".") || "<root>"}.`);
		}
	}

	if ("date" in value) {
		if (typeof value.date !== "string" || value.date.length === 0) {
			throw new Error(`Missing date at ${path.join(".") || "<root>"}.`);
		}
	}

	for (const [key, entry] of Object.entries(value)) {
		assertDatedEntriesHaveRequiredDates(entry, [...path, key]);
	}
};

const assertFeaturedReferencesAreValid = (value: Record<string, unknown>) => {
	const projects = Array.isArray(value.projects) ? value.projects : [];
	const projectIds = projects
		.map((entry) => (isPlainObject(entry) && typeof entry.id === "string" ? entry.id : null))
		.filter((entry): entry is string => entry !== null);

	if (projectIds.length !== new Set(projectIds).size) {
		throw new Error("Project ids in resume.i18n.json must be unique.");
	}

	const availableSkillNames = new Set(
		projects.flatMap((entry) => {
			if (!isPlainObject(entry) || !Array.isArray(entry.keywords)) {
				return [];
			}

			return entry.keywords.filter((keyword): keyword is string => typeof keyword === "string");
		}),
	);

	const featured = isPlainObject(value.featured) ? value.featured : null;
	if (!featured) {
		return;
	}

	if ("projectIds" in featured) {
		if (
			!Array.isArray(featured.projectIds) ||
			featured.projectIds.some((id) => typeof id !== "string")
		) {
			throw new Error("featured.projectIds must be an array of strings.");
		}

		if (featured.projectIds.length !== new Set(featured.projectIds).size) {
			throw new Error("featured.projectIds must not contain duplicates.");
		}

		for (const id of featured.projectIds) {
			if (!projectIds.includes(id)) {
				throw new Error(`featured.projectIds references unknown project id "${id}".`);
			}
		}
	}

	if ("skillNames" in featured) {
		if (
			!Array.isArray(featured.skillNames) ||
			featured.skillNames.some((name) => typeof name !== "string")
		) {
			throw new Error("featured.skillNames must be an array of strings.");
		}

		if (featured.skillNames.length !== new Set(featured.skillNames).size) {
			throw new Error("featured.skillNames must not contain duplicates.");
		}

		for (const name of featured.skillNames) {
			if (!availableSkillNames.has(name)) {
				throw new Error(`featured.skillNames references unknown skill "${name}".`);
			}
		}
	}
};

export const validateResumeParity = () => {
	assertNoGeneratedFieldsInSource(source);
	assertValidLocalizedNodes(source);
	assertDatedEntriesHaveRequiredDates(source);
	assertFeaturedReferencesAreValid(source);
};
