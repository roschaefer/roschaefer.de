import { describe, expect, it } from "vitest";
import de from "../../../resume.de.json";
import en from "../../../resume.en.json";
import { validateResumeSchema } from "./validate-resume-schema";

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
		["resume.de.json", de],
		["resume.en.json", en],
	])("validates %s against the JSON Resume schema", async (_fileName, resume) => {
		await expect(validateResumeSchema(resume)).resolves.toBeUndefined();
	});

	it.each([
		["resume.de.json", de],
		["resume.en.json", en],
	])("keeps %s free of inline markdown links", (_fileName, resume) => {
		expect(collectMarkdownLinks(resume)).toEqual([]);
	});
});
