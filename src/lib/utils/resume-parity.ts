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

export const validateResumeParity = () => {
	assertNoGeneratedFieldsInSource(source);
	assertValidLocalizedNodes(source);
	assertDatedEntriesHaveRequiredDates(source);
};
