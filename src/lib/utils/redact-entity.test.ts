import { describe, expect, it } from "vitest";
import { maskEntity } from "./mask-entity.ts";

// Synthetic fixtures covering the same edge cases the hand-authored
// `maskedEntity` values this function replaces used to exercise: long ASCII
// names, names at/under the 6-character threshold, unicode characters, and
// trailing punctuation. Never use real client names here - this file is public.
const fixtures: Array<[string, string]> = [
	["Acme Consulting GmbH", "Ac***bH"],
	["Example Ventures GmbH", "Ex***bH"],
	["ABCD", "***"],
	["Contoso Corporation", "Co***on"],
	["Björn Müller", "Bj***er"],
	["Sample Org e.V.", "Sa***V."],
	["Globex AG", "Gl***AG"],
	["Initech AG", "In***AG"],
	["ACME", "***"],
];

describe("maskEntity", () => {
	it.each(fixtures)("masks %s as %s", (realEntity, expected) => {
		expect(maskEntity(realEntity)).toBe(expected);
	});
});
