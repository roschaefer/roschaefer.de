import { describe, expect, it } from "vitest";
import {
	createAtsExperienceProjects,
	createFeaturedEducation,
	createFeaturedProjects,
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

	it("normalizes missing featured config to empty arrays", () => {
		expect(getFeaturedConfig()).toEqual({
			projectIds: [],
			talkIds: [],
			educationIds: [],
		});
	});

	it("orders featured education by configured ids", () => {
		const education = [
			{ id: "abitur", institution: "Gymnasium Lohmar", area: "", studyType: "Abitur" },
			{ id: "msc", institution: "HPI", area: "IT-Systems Engineering", studyType: "M.Sc." },
			{ id: "bsc", institution: "HPI", area: "IT-Systems Engineering", studyType: "B.Sc." },
		];

		expect(createFeaturedEducation(education, ["msc", "bsc"]).map((entry) => entry.id)).toEqual([
			"msc",
			"bsc",
		]);
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
