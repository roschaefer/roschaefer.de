import { describe, expect, it } from "vitest";
import source from "../../../resume.i18n.json";
import { deriveResume } from "./derive-resume.ts";
import { validateResumeSchema } from "./validate-resume-schema";

const de = deriveResume(source, "de");
const en = deriveResume(source, "en");

const markdownLinkPattern = /\[[^\]]+\]\((https?:\/\/[^)]+)\)/;

const collectMarkdownLinks = (value: unknown, path: string[] = []): string[] => {
	if (typeof value === "string") {
		return markdownLinkPattern.test(value) ? [path.join(".")] : [];
	}

	if (Array.isArray(value)) {
		return value.flatMap((entry, index) => collectMarkdownLinks(entry, [...path, String(index)]));
	}

	if (value && typeof value === "object") {
		return Object.entries(value).flatMap(([key, entry]) =>
			collectMarkdownLinks(entry, [...path, key]),
		);
	}

	return [];
};

describe("resume schema", () => {
	it.each([
		["de", de],
		["en", en],
	])("validates %s against the JSON Resume schema", async (_locale, resume) => {
		await expect(validateResumeSchema(resume)).resolves.toBeUndefined();
	});

	it.each([
		["de", de],
		["en", en],
	])("keeps %s free of inline markdown links", (_locale, resume) => {
		expect(collectMarkdownLinks(resume)).toEqual([]);
	});
});
