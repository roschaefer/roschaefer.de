import type { ResumeValidationError } from "@jsonresume/schema";
import { validate } from "@jsonresume/schema";
import { describe, expect, it } from "vitest";
import de from "../../../resume.de.json";
import en from "../../../resume.en.json";

const validateResume = async (resume: unknown) =>
	new Promise<void>((resolve, reject) => {
		validate(resume, (errors: ResumeValidationError[] | null) => {
			if (errors) {
				reject(new Error(errors.map((error: ResumeValidationError) => error.stack).join("\n")));
				return;
			}

			resolve();
		});
	});

describe("resume schema", () => {
	it.each([
		["resume.de.json", de],
		["resume.en.json", en],
	])("validates %s against the JSON Resume schema", async (_fileName, resume) => {
		await expect(validateResume(resume)).resolves.toBeUndefined();
	});
});
