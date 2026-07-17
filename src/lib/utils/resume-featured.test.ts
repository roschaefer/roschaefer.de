import { describe, expect, it } from "vitest";
import {
	createAtsExperienceProjects,
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
		expect(getFeaturedConfig()).toEqual({ projectIds: [], talkIds: [], skillNames: [] });
	});

	it("includes every non-presentation project regardless of featured config", () => {
		const projects = [
			{ id: "a", name: "Alpha", startDate: "2024-01-01" },
			{ id: "b", name: "Beta", startDate: "2020-01-01", type: "presentation" },
			{ id: "c", name: "Gamma", startDate: "2018-01-01" },
		];

		expect(createAtsExperienceProjects(projects).map((project) => project.id)).toEqual(["a", "c"]);
	});

	it("preserves incoming order instead of applying featured curation", () => {
		const projects = [
			{ id: "old", name: "Old", startDate: "2015-01-01" },
			{ id: "new", name: "New", startDate: "2024-01-01" },
		];

		expect(createAtsExperienceProjects(projects).map((project) => project.id)).toEqual([
			"old",
			"new",
		]);
	});

	it("defaults to an empty array when no projects are given", () => {
		expect(createAtsExperienceProjects()).toEqual([]);
	});
});
