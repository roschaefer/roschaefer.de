import { validateResumeParity } from "$lib/utils/resume-parity";
import { describe, expect, it } from "vitest";

describe("resume parity", () => {
	it("keeps localized resume files structurally aligned", () => {
		expect(() => validateResumeParity()).not.toThrow();
	});
});
