import { getResume } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import { createTechExperience } from "$lib/utils/tech-experience";

export const createSiteContent = (locale: Locale) => {
	const resume = getResume(locale);
	const projects = resume.projects ?? [];
	const sortedProjects = [...projects].sort((left, right) =>
		right.startDate.localeCompare(left.startDate),
	);
	const profiles = resume.basics.profiles ?? [];

	return {
		basics: resume.basics,
		projects: sortedProjects,
		featuredProjects: sortedProjects.filter((project) => project.type !== "talk").slice(0, 6),
		talks: sortedProjects.filter((project) => project.type === "talk"),
		techExperience: createTechExperience(projects, locale).slice(0, 12),
		profiles,
		awards: resume.awards ?? [],
		languages: resume.languages ?? [],
		education: resume.education ?? [],
		interests: resume.interests ?? [],
	};
};

export type SiteContent = ReturnType<typeof createSiteContent>;
