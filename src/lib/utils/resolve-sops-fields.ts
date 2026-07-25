import { maskEntity } from "./mask-entity.ts";

export type SopsFieldMode = "masked" | "unredacted";

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
 * entity) in an already-decrypted resume.i18n.json object. In "masked" mode
 * (the default, used by every normal build), sensitive values are replaced
 * with a partial reveal or dropped, and the containing object is flagged
 * `redacted: true`. In "unredacted" mode, the real decrypted values are
 * restored verbatim - only ever for local, gitignored use. The field name
 * being encrypted is what marks it as sensitive, not any hardcoded knowledge
 * of "entity" specifically.
 */
export const resolveSopsEncryptedFields = (value: unknown, mode: SopsFieldMode): unknown => {
	if (Array.isArray(value)) {
		return value.map((entry) => resolveSopsEncryptedFields(entry, mode));
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
			return [[key, resolveSopsEncryptedFields(entry, mode)]] as const;
		}

		const resolvedValue = mode === "unredacted" ? entry : maskedValueFor(entry);
		return resolvedValue === undefined ? [] : ([[toFieldName(match[1]), resolvedValue]] as const);
	});

	return {
		...Object.fromEntries(resolvedEntries),
		...(mode === "masked" && hasSopsEncryptedFields ? { redacted: true } : {}),
	};
};
