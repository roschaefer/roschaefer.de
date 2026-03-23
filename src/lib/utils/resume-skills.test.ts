import { describe, expect, it } from "vitest";
import { getResume } from "$lib/data/resume";
import { createResumeSkills, formatSkillDuration, resumeSkillsAreInSync } from "./resume-skills";

describe("resume skills", () => {
	it("delegates duration formatting by locale", () => {
		expect(formatSkillDuration(26, "de")).toBe("2 Jahre, 2 Monate");
		expect(formatSkillDuration(26, "en")).toBe("2 years, 2 months");
	});

	it("keeps resume.de.json skills in sync with project keywords", () => {
		const resume = getResume("de");
		expect(resumeSkillsAreInSync(resume.projects, resume.skills, "de")).toBe(true);
	});

	it("keeps resume.en.json skills in sync with project keywords", () => {
		const resume = getResume("en");
		expect(resumeSkillsAreInSync(resume.projects, resume.skills, "en")).toBe(true);
	});

	it("derives locale-specific skills from the same project data", () => {
		const projects = [
			{
				name: "A",
				startDate: "2024-01-01",
				endDate: "2024-03-01",
				keywords: ["TypeScript"],
			},
		];

		expect(createResumeSkills(projects, "de")).toEqual([
			{
				name: "TypeScript",
				level: "Grundkenntnisse",
				keywords: ["3 Monate", "1 Projekt", "zuletzt März 2024"],
			},
		]);
		expect(createResumeSkills(projects, "en")).toEqual([
			{
				name: "TypeScript",
				level: "Basic exposure",
				keywords: ["3 months", "1 project", "last used Mar 2024"],
			},
		]);
	});

	it("uses projects and recency to influence ordering", () => {
		const skills = createResumeSkills(
			[
				{
					name: "Legacy",
					startDate: "2018-01-01",
					endDate: "2020-12-01",
					keywords: ["PHP"],
				},
				{
					name: "Recent A",
					startDate: "2024-01-01",
					endDate: "2024-06-01",
					keywords: ["Svelte"],
				},
				{
					name: "Recent B",
					startDate: "2024-09-01",
					keywords: ["Svelte"],
				},
			],
			"en",
			new Date("2025-03-01"),
		);

		expect(skills[0]).toEqual({
			name: "Svelte",
			level: "Practical experience",
			keywords: ["1 year, 1 month", "2 projects", "active now"],
		});
		expect(skills[1]?.name).toBe("PHP");
	});
});
