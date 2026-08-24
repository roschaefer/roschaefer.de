import { getResume, getResumeFeatured } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import {
	createFeaturedEducation,
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
	// TechExperienceList defaults to sorting by recency (see its sortKey
	// initial state), not the score order createTechExperience returns - the
	// partition here has to match that exact ordering (including tie-breaks),
	// or a skill that's score-ranked into the "featured" set can still land
	// outside the table's actual default-visible rows, breaking anchor links
	// that expect PortfolioPage's remainingSkillIds to agree with what's shown.
	const techExperienceByRecency = [...techExperience].sort(
		(left, right) =>
			right.lastUsedMonth - left.lastUsedMonth ||
			right.score - left.score ||
			left.name.localeCompare(right.name),
	);
	const visibleTechExperienceCount = 10;
	const resolvedTechExperience = techExperienceByRecency.slice(0, visibleTechExperienceCount);
	const remainingTechExperience = techExperienceByRecency.slice(visibleTechExperienceCount);
	const featuredEducation = createFeaturedEducation(resume.education ?? [], featured.educationIds);
	const profiles = resume.basics.profiles ?? [];
	const press = sortedProjects
		.map((project) => ({
			project,
			links: (project.links ?? []).filter((link) => link.kind === "press"),
		}))
		.filter((entry) => entry.links.length > 0);

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
		press,
		languages: resume.languages ?? [],
		education: featuredEducation.length > 0 ? featuredEducation : (resume.education ?? []),
	};
};

export type SiteContent = ReturnType<typeof createSiteContent>;
