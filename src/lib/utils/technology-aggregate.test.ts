import { describe, expect, it } from "vitest";
import { createTechnologyAggregates } from "$lib/utils/technology-aggregate";

describe("createTechnologyAggregates", () => {
	it("keeps distinct project entries with the same display name separate", () => {
		const result = createTechnologyAggregates(
			[
				{
					id: "foss-social-network",
					name: "FOSS social network",
					startDate: "2018-11-30",
					endDate: "2020-04-30",
					keywords: ["Kubernetes"],
				},
				{
					id: "foss-social-network-infra-migration",
					name: "FOSS social network",
					startDate: "2024-10-01",
					endDate: "2025-11-30",
					keywords: ["Kubernetes"],
				},
			],
			new Date("2026-01-01"),
		);

		const kubernetes = result.find((entry) => entry.name === "Kubernetes");
		expect(kubernetes?.projects.map((project) => project.id)).toEqual([
			"foss-social-network",
			"foss-social-network-infra-migration",
		]);
		expect(kubernetes?.projectCount).toBe(2);
	});

	it("falls back to name and dates for identity when id is missing", () => {
		const result = createTechnologyAggregates(
			[
				{
					name: "A",
					startDate: "2024-01-01",
					endDate: "2024-06-01",
					keywords: ["Svelte"],
				},
				{
					name: "A",
					startDate: "2024-01-01",
					endDate: "2024-06-01",
					keywords: ["Svelte"],
				},
			],
			new Date("2024-07-01"),
		);

		expect(result.find((entry) => entry.name === "Svelte")?.projects).toHaveLength(1);
	});
});
