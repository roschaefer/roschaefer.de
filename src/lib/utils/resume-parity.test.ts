import { describe, expect, it } from "vitest";
import { validateResumeParity } from "$lib/utils/resume-parity";

describe("resume parity", () => {
	it("keeps localized resume files structurally aligned", () => {
		expect(() => validateResumeParity()).not.toThrow();
	});
});
