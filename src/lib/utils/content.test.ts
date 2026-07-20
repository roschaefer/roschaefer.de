import { describe, expect, it } from "vitest";
import { createSiteContent } from "./content";

describe("site content", () => {
	it("uses curated education entries when education ids are configured", () => {
		expect(createSiteContent("de").education.map((entry) => entry.id)).toEqual([
			"hpi-msc",
			"hpi-bsc",
		]);
	});
});
