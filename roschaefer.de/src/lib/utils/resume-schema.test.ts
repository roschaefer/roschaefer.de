import { describe, expect, it } from "vitest";
import de from "../../../.generated/resume.de.json";
import en from "../../../.generated/resume.en.json";
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
	it.each([de, en])("validates against the JSON Resume schema", async (resume) => {
		await expect(validateResumeSchema(resume)).resolves.toBeUndefined();
	});

	it.each([de, en])("keeps resume free of inline markdown links", (resume) => {
		expect(collectMarkdownLinks(resume)).toEqual([]);
	});
});
