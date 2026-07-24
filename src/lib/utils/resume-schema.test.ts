import { describe, expect, it } from "vitest";
import source from "../../../.generated/resume-source.json";
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
	it.each([de, en])("validates against the JSON Resume schema", async (resume) => {
		await expect(validateResumeSchema(resume)).resolves.toBeUndefined();
	});

	it.each([de, en])("keeps resume free of inline markdown links", (resume) => {
		expect(collectMarkdownLinks(resume)).toEqual([]);
	});
});
