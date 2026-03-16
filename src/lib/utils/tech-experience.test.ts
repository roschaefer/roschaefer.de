import { describe, expect, it } from "vitest";
import { createTechExperience } from "$lib/utils/tech-experience";

describe("createTechExperience", () => {
	it("merges overlapping project intervals for the same technology", () => {
		const result = createTechExperience(
			[
				{
					name: "A",
					startDate: "2020-01-01",
					endDate: "2020-12-01",
					keywords: ["TypeScript"],
				},
				{
					name: "B",
					startDate: "2020-06-01",
					endDate: "2021-03-01",
					keywords: ["TypeScript"],
				},
			],
			"en",
			new Date("2021-03-20"),
		);

		expect(result[0]).toMatchObject({
			name: "TypeScript",
			totalMonths: 15,
			label: "1 year, 3 months",
		});
	});

	it("keeps a unique list of projects per technology", () => {
		const result = createTechExperience(
			[
				{
					name: "A",
					startDate: "2024-01-01",
					keywords: ["Svelte", "TypeScript"],
				},
			],
			"en",
			new Date("2024-02-01"),
		);

		expect(result.find((entry) => entry.name === "Svelte")?.projects).toHaveLength(1);
	});

	it("formats labels for German locales", () => {
		const result = createTechExperience(
			[
				{
					name: "A",
					startDate: "2020-01-01",
					endDate: "2021-03-01",
					keywords: ["TypeScript"],
				},
			],
			"de",
			new Date("2021-03-20"),
		);

		expect(result[0]?.label).toBe("1 Jahr, 3 Monate");
	});
});
