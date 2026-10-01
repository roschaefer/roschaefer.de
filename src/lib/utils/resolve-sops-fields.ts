import { redactEntity } from "./redact-entity.ts";

export type SopsFieldMode = "redacted" | "unredacted";

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

// A redacted value only makes sense as a short, human-readable partial reveal
// ("ta***bH") - that's only meaningful for a plain name. A URL has nowhere to
// point once redacted, and structured data (e.g. a links array) has no partial
// form at all, so both are simply omitted rather than replaced with anything.
const redactedValueFor = (value: unknown): unknown => {
	if (typeof value === "string" && !isUrl(value)) {
		return redactEntity(value);
	}

	return undefined;
};

const sopsEncryptedFieldName = (key: string): string | undefined => {
	const match = sopsEncryptedFieldPattern.exec(key);
	return match ? toFieldName(match[1]) : undefined;
};

// The plain fields that a sopsEncrypted* field stands in for, e.g. "entity"
// for "sopsEncryptedEntity". Their committed values are redacted.
const shadowedFieldNames = (value: Record<string, unknown>): Set<string> =>
	new Set(
		Object.keys(value)
			.map(sopsEncryptedFieldName)
			.filter((name) => name !== undefined),
	);

/**
 * Adds the redacted form of every sopsEncrypted*-prefixed field to an encrypted
 * resume.i18n.json tree, taking the real values from its decrypted
 * counterpart: e.g. sopsEncryptedEntity gets a plain `entity` ("ta***bH")
 * right before it, and the containing object is flagged `redacted: true`.
 * Values without a redacted form (URLs, links) get no plain field. Plain fields
 * from an earlier run are replaced, so this is safe to run repeatedly.
 */
export const addRedactedSopsFields = (encrypted: unknown, decrypted: unknown): unknown => {
	if (Array.isArray(encrypted)) {
		const decryptedEntries = Array.isArray(decrypted) ? decrypted : [];
		return encrypted.map((entry, index) => addRedactedSopsFields(entry, decryptedEntries[index]));
	}

	if (!isPlainObject(encrypted)) {
		return encrypted;
	}

	const decryptedObject = isPlainObject(decrypted) ? decrypted : {};
	const shadowed = shadowedFieldNames(encrypted);
	const isRedacted = shadowed.size > 0;

	const entries = Object.entries(encrypted)
		.filter(([key]) => !isRedacted || (key !== "redacted" && !shadowed.has(key)))
		.flatMap(([key, entry]) => {
			const fieldName = sopsEncryptedFieldName(key);
			if (fieldName === undefined) {
				return [[key, addRedactedSopsFields(entry, decryptedObject[key])]] as const;
			}

			const redactedValue = redactedValueFor(decryptedObject[key]);
			return redactedValue === undefined
				? ([[key, entry]] as const)
				: ([
						[fieldName, redactedValue],
						[key, entry],
					] as const);
		});

	return {
		...Object.fromEntries(entries),
		...(isRedacted ? { redacted: true } : {}),
	};
};

/**
 * Resolves every sopsEncrypted*-prefixed field (e.g. sopsEncryptedEntity ->
 * entity) in a resume.i18n.json tree. In "redacted" mode (the default, used by
 * every normal build), the input does not need to be decrypted: the encrypted
 * fields are dropped, leaving the redacted plain fields and `redacted: true`
 * that `addRedactedSopsFields` committed next to them. In "unredacted" mode, the
 * input must be decrypted, and the real values replace the redacted ones - only
 * ever for local, gitignored use. The field name being encrypted is what marks
 * it as sensitive, not any hardcoded knowledge of "entity" specifically.
 */
export const resolveSopsEncryptedFields = (value: unknown, mode: SopsFieldMode): unknown => {
	if (Array.isArray(value)) {
		return value.map((entry) => resolveSopsEncryptedFields(entry, mode));
	}

	if (!isPlainObject(value)) {
		return value;
	}

	const shadowed = shadowedFieldNames(value);
	if (shadowed.size > 0 && mode === "redacted" && value.redacted !== true) {
		throw new Error(
			`"${String(value.id ?? value.name)}" has encrypted fields but no redacted ones. Run \`pnpm redact-clients\`.`,
		);
	}

	const resolvedEntries = Object.entries(value)
		.filter(([key]) => mode === "redacted" || (key !== "redacted" && !shadowed.has(key)))
		.flatMap(([key, entry]) => {
			const fieldName = sopsEncryptedFieldName(key);
			if (fieldName === undefined) {
				return [[key, resolveSopsEncryptedFields(entry, mode)]] as const;
			}

			return mode === "unredacted" ? ([[fieldName, entry]] as const) : [];
		});

	const { redacted, ...rest } = Object.fromEntries(resolvedEntries);
	return redacted === undefined ? rest : { ...rest, redacted };
};
