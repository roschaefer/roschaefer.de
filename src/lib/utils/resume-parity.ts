import { getResume, projectEntryId } from "$lib/data/resume";
import type { ResumeAward, ResumeEducation, ResumeProject } from "$lib/types/resume";

const assertSameKeys = (label: string, left: string[], right: string[]) => {
	const leftOnly = left.filter((value) => !right.includes(value));
	const rightOnly = right.filter((value) => !left.includes(value));

	if (leftOnly.length || rightOnly.length) {
		throw new Error(
			`${label} mismatch. Only in left: ${leftOnly.join(", ") || "none"}. Only in right: ${
				rightOnly.join(", ") || "none"
			}.`,
		);
	}
};

const projectIds = (projects: ResumeProject[] = []) => projects.map(projectEntryId);
const awardKeys = (awards: ResumeAward[] = []) =>
	awards.map((award) => `${award.date ?? "no-date"}-${award.awarder ?? "no-awarder"}`);
const educationKeys = (entries: ResumeEducation[] = []) =>
	entries.map(
		(entry) =>
			`${entry.institution}-${entry.area ?? "no-area"}-${entry.startDate ?? "no-start"}-${
				entry.endDate ?? "no-end"
			}`,
	);

export const validateResumeParity = () => {
	const de = getResume("de");
	const en = getResume("en");

	assertSameKeys("Top-level keys", Object.keys(de).sort(), Object.keys(en).sort());

	assertSameKeys("Project IDs", projectIds(de.projects).sort(), projectIds(en.projects).sort());

	assertSameKeys("Awards", awardKeys(de.awards).sort(), awardKeys(en.awards).sort());

	assertSameKeys(
		"Education entries",
		educationKeys(de.education).sort(),
		educationKeys(en.education).sort(),
	);
};
