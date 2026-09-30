import { describe, expect, it } from "vitest";
import {
	createExperienceProjects,
	createFeaturedEducation,
	createFeaturedProjects,
	createRemainingProjects,
	getFeaturedConfig,
	resolveFeaturedProjects,
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
			mentoringIds: [],
			volunteeringIds: [],
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

	it("includes every experience project regardless of featured config", () => {
		const projects = [
			{ id: "a", name: "Alpha", startDate: "2024-01-01", type: "experience" },
			{ id: "b", name: "Beta", startDate: "2020-01-01", type: "presentation" },
			{ id: "c", name: "Gamma", startDate: "2018-01-01", type: "volunteering" },
			{ id: "d", name: "Delta", startDate: "2017-01-01", type: "experience" },
		];

		expect(createExperienceProjects(projects).map((project) => project.id)).toEqual(["a", "d"]);
	});

	it("preserves incoming order instead of applying featured curation", () => {
		const projects = [
			{ id: "old", name: "Old", startDate: "2015-01-01", type: "experience" },
			{ id: "new", name: "New", startDate: "2024-01-01", type: "experience" },
		];

		expect(createExperienceProjects(projects).map((project) => project.id)).toEqual(["old", "new"]);
	});

	it("defaults to an empty array when no projects are given", () => {
		expect(createExperienceProjects()).toEqual([]);
	});

	it("resolves to the featured subset when configured ids match", () => {
		const projects = [
			{ id: "a", name: "Alpha", startDate: "2024-01-01" },
			{ id: "b", name: "Beta", startDate: "2023-01-01" },
			{ id: "c", name: "Gamma", startDate: "2022-01-01" },
		];

		expect(resolveFeaturedProjects(projects, ["c", "a"]).map((project) => project.id)).toEqual([
			"c",
			"a",
		]);
	});

	it("falls back to the full project list when no featured ids are configured", () => {
		const projects = [
			{ id: "a", name: "Alpha", startDate: "2024-01-01" },
			{ id: "b", name: "Beta", startDate: "2023-01-01" },
		];

		expect(resolveFeaturedProjects(projects, [])).toBe(projects);
	});

	it("falls back to a custom fallback list when given one", () => {
		const projects = [
			{ id: "a", name: "Alpha", startDate: "2024-01-01" },
			{ id: "b", name: "Beta", startDate: "2023-01-01" },
		];
		const fallback = [projects[0]];

		expect(resolveFeaturedProjects(projects, [], fallback)).toBe(fallback);
	});

	it("excludes only the resolved projects from the remaining list", () => {
		const projects = [
			{ id: "a", name: "Alpha", startDate: "2024-01-01" },
			{ id: "b", name: "Beta", startDate: "2023-01-01" },
			{ id: "c", name: "Gamma", startDate: "2022-01-01" },
		];
		const resolved = [projects[1]];

		expect(createRemainingProjects(projects, resolved).map((project) => project.id)).toEqual([
			"a",
			"c",
		]);
	});

	it("distinguishes id-less projects by identity instead of id", () => {
		const resolvedIdLess = { name: "Resolved", startDate: "2024-01-01" };
		const remainingIdLess = { name: "Remaining", startDate: "2023-01-01" };
		const projects = [resolvedIdLess, remainingIdLess];

		expect(createRemainingProjects(projects, [resolvedIdLess])).toEqual([remainingIdLess]);
	});
});
