import { getResume, getResumeFeatured } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import {
	createFeaturedEducation,
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
	const nonPresentationProjects = sortedProjects.filter(
		(project) => project.type !== "presentation",
	);
	const featuredProjects =
		createFeaturedProjects(sortedProjects, featured.projectIds).filter(
			(project) => project.type !== "presentation",
		) || [];
	const resolvedFeaturedProjects =
		featuredProjects.length > 0 ? featuredProjects : nonPresentationProjects.slice(0, 6);
	const featuredProjectIds = new Set(resolvedFeaturedProjects.map((project) => project.id));
	const remainingProjects = nonPresentationProjects.filter(
		(project) => !featuredProjectIds.has(project.id),
	);
	const featuredTalks =
		createFeaturedProjects(sortedProjects, featured.talkIds).filter(
			(project) => project.type === "presentation",
		) || [];
	const techExperience = createTechExperience(projects, locale);
	const featuredTechExperience = createFeaturedEntriesByName(techExperience, featured.skillNames);
	const resolvedTechExperience =
		featuredTechExperience.length > 0 ? featuredTechExperience : techExperience.slice(0, 12);
	const featuredTechExperienceNames = new Set(resolvedTechExperience.map((entry) => entry.name));
	const remainingTechExperience = techExperience.filter(
		(entry) => !featuredTechExperienceNames.has(entry.name),
	);
	const featuredEducation = createFeaturedEducation(resume.education ?? [], featured.educationIds);
	const profiles = resume.basics.profiles ?? [];

	return {
		basics: resume.basics,
		projects: sortedProjects,
		featuredProjects: resolvedFeaturedProjects,
		remainingProjects,
		talks:
			featuredTalks.length > 0
				? featuredTalks
				: sortedProjects.filter((project) => project.type === "presentation"),
		techExperience: resolvedTechExperience,
		remainingTechExperience,
		profiles,
		awards: resume.awards ?? [],
		languages: resume.languages ?? [],
		education: featuredEducation.length > 0 ? featuredEducation : (resume.education ?? []),
		interests: resume.interests ?? [],
	};
};

export type SiteContent = ReturnType<typeof createSiteContent>;
