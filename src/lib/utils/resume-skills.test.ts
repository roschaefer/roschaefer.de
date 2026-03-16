import { describe, expect, it } from "vitest";
import { getResume } from "$lib/data/resume";
import { createResumeSkills, formatSkillDuration, resumeSkillsAreInSync } from "./resume-skills";

describe("resume skills", () => {
	it("formats German durations", () => {
		expect(formatSkillDuration(1, "de")).toBe("1 Monat");
		expect(formatSkillDuration(12, "de")).toBe("1 Jahr");
		expect(formatSkillDuration(26, "de")).toBe("2 Jahre, 2 Monate");
	});

	it("formats English durations", () => {
		expect(formatSkillDuration(1, "en")).toBe("1 month");
		expect(formatSkillDuration(12, "en")).toBe("1 year");
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

		expect(createResumeSkills(projects, "de")).toEqual([{ name: "TypeScript", level: "3 Monate" }]);
		expect(createResumeSkills(projects, "en")).toEqual([{ name: "TypeScript", level: "3 months" }]);
	});
});
