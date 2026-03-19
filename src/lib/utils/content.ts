import { getResume, getResumeFeatured } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import {
	createFeaturedEntriesByName,
	createFeaturedProjects,
	getFeaturedConfig,
} from "$lib/utils/resume-featured";
import { createTechExperience } from "$lib/utils/tech-experience";

export const createSiteContent = (locale: Locale) => {
	const resume = getResume(locale);
	const featured = getFeaturedConfig(getResumeFeatured());
	const projects = resume.projects ?? [];
	const sortedProjects = [...projects].sort((left, right) =>
		right.startDate.localeCompare(left.startDate),
	);
	const featuredProjects =
		createFeaturedProjects(sortedProjects, featured.projectIds).filter(
			(project) => project.type !== "talk",
		) || [];
	const techExperience = createTechExperience(projects, locale);
	const featuredTechExperience = createFeaturedEntriesByName(techExperience, featured.skillNames);
	const profiles = resume.basics.profiles ?? [];

	return {
		basics: resume.basics,
		projects: sortedProjects,
		featuredProjects:
			featuredProjects.length > 0
				? featuredProjects
				: sortedProjects.filter((project) => project.type !== "talk").slice(0, 6),
		talks: sortedProjects.filter((project) => project.type === "talk"),
		techExperience:
			featuredTechExperience.length > 0 ? featuredTechExperience : techExperience.slice(0, 12),
		profiles,
		awards: resume.awards ?? [],
		languages: resume.languages ?? [],
		education: resume.education ?? [],
		interests: resume.interests ?? [],
	};
};

export type SiteContent = ReturnType<typeof createSiteContent>;
