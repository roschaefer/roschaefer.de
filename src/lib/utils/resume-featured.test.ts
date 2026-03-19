import { describe, expect, it } from "vitest";
import {
	createFeaturedEntriesByName,
	createFeaturedProjects,
	createFeaturedSkills,
	getFeaturedConfig,
} from "./resume-featured";

describe("resume featured", () => {
	it("orders featured projects by configured ids", () => {
		const projects = [
			{ id: "b", name: "Beta", startDate: "2024-01-01" },
			{ id: "a", name: "Alpha", startDate: "2024-01-01" },
		];

		expect(createFeaturedProjects(projects, ["a", "b"]).map((project) => project.id)).toEqual([
			"a",
			"b",
		]);
	});

	it("orders featured skills by configured names", () => {
		const skills = [
			{ name: "TypeScript", level: "5 years" },
			{ name: "Ruby", level: "9 years" },
		];

		expect(createFeaturedSkills(skills, ["Ruby", "TypeScript"]).map((skill) => skill.name)).toEqual(
			["Ruby", "TypeScript"],
		);
	});

	it("orders arbitrary named entries by configured names", () => {
		const entries = [
			{ name: "Vue", label: "6 years" },
			{ name: "TypeScript", label: "5 years" },
		];

		expect(
			createFeaturedEntriesByName(entries, ["TypeScript", "Vue"]).map((entry) => entry.name),
		).toEqual(["TypeScript", "Vue"]);
	});

	it("normalizes missing featured config to empty arrays", () => {
		expect(getFeaturedConfig()).toEqual({ projectIds: [], skillNames: [] });
	});
});
