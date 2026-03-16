import { describe, expect, it } from "vitest";

import { defaultSiteLocale, pickPreferredLocale } from "./locale-preference";

describe("pickPreferredLocale", () => {
	it("prefers the highest quality supported locale", () => {
		expect(pickPreferredLocale("en-US,en;q=0.9,de;q=0.8")).toBe("en");
		expect(pickPreferredLocale("fr-FR, de-DE;q=0.9, en;q=0.8")).toBe("de");
	});

	it("falls back to German for unsupported or missing headers", () => {
		expect(pickPreferredLocale("fr-FR, es;q=0.8")).toBe(defaultSiteLocale);
		expect(pickPreferredLocale(undefined)).toBe(defaultSiteLocale);
		expect(pickPreferredLocale("*;q=0.5")).toBe(defaultSiteLocale);
	});
});
