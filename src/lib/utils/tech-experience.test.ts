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
			label: "1¼ years",
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

		expect(result.find((entry) => entry.name === "Svelte")).toMatchObject({
			projectCount: 1,
			lastUsedLabel: "Current",
		});
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

		expect(result[0]?.label).toBe("1¼ Jahre");
	});

	it("boosts technologies used more recently and across more projects", () => {
		const result = createTechExperience(
			[
				{
					name: "Legacy app",
					startDate: "2018-01-01",
					endDate: "2021-12-01",
					keywords: ["PHP"],
				},
				{
					name: "Client A",
					startDate: "2024-01-01",
					endDate: "2024-06-01",
					keywords: ["Svelte"],
				},
				{
					name: "Client B",
					startDate: "2024-08-01",
					endDate: "2025-02-01",
					keywords: ["Svelte"],
				},
			],
			"en",
			new Date("2025-03-15"),
		);

		expect(result.map((entry) => entry.name)).toEqual(["Svelte", "PHP"]);
		expect(result[0]).toMatchObject({
			projectCount: 2,
			lastUsedLabel: "last month",
		});
	});
});
