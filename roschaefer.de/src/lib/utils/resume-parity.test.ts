import { describe, expect, it } from "vitest";
import { validateResumeParity } from "$lib/utils/resume-parity";

describe("resume source", () => {
	it("keeps resume.i18n.json valid for generation", () => {
		expect(() => validateResumeParity()).not.toThrow();
	});
});
