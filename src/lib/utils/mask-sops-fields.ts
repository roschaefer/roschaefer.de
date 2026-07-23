import { maskEntity } from "./mask-entity.ts";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	Boolean(value) && typeof value === "object" && !Array.isArray(value);

const sopsEncryptedFieldPattern = /^sopsEncrypted([A-Z][A-Za-z]*)$/;

const toFieldName = (capitalized: string): string =>
	capitalized.charAt(0).toLowerCase() + capitalized.slice(1);

const isUrl = (value: string): boolean => {
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
};

// A masked value only makes sense as a short, human-readable partial reveal
// ("ta***bH") - that's only meaningful for a plain name. A URL has nowhere to
// point once masked, and structured data (e.g. a links array) has no partial
// form at all, so both are simply omitted rather than replaced with anything.
const maskedValueFor = (value: unknown): unknown => {
	if (typeof value === "string" && !isUrl(value)) {
		return maskEntity(value);
	}

	return undefined;
};

/**
 * Resolves every sopsEncrypted*-prefixed field (e.g. sopsEncryptedEntity ->
 * entity) in an already-decrypted resume.i18n.json object to a masked value
 * - the field name being encrypted is what marks it as sensitive, not any
 * hardcoded knowledge of "entity" specifically. Never returns real values.
 */
export const maskSopsEncryptedFields = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(maskSopsEncryptedFields);
	}

	if (!isPlainObject(value)) {
		return value;
	}

	const hasSopsEncryptedFields = Object.keys(value).some((key) =>
		sopsEncryptedFieldPattern.test(key),
	);

	const resolvedEntries = Object.entries(value).flatMap(([key, entry]) => {
		const match = sopsEncryptedFieldPattern.exec(key);
		if (!match) {
			return [[key, maskSopsEncryptedFields(entry)]] as const;
		}

		const maskedValue = maskedValueFor(entry);
		return maskedValue === undefined ? [] : ([[toFieldName(match[1]), maskedValue]] as const);
	});

	return {
		...Object.fromEntries(resolvedEntries),
		...(hasSopsEncryptedFields ? { redacted: true } : {}),
	};
};
