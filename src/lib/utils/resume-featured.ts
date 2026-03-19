import type { ResumeFeatured, ResumeProject, ResumeSkill } from "$lib/types/resume";

const unique = <T>(values: T[]): T[] => [...new Set(values)];

export const createFeaturedProjects = (
	projects: ResumeProject[] = [],
	projectIds: string[] = [],
): ResumeProject[] => {
	if (projectIds.length === 0) {
		return [];
	}

	const byId = new Map(
		projects
			.filter(
				(project): project is ResumeProject & { id: string } => typeof project.id === "string",
			)
			.map((project) => [project.id, project]),
	);

	return unique(projectIds)
		.map((id) => byId.get(id))
		.filter((project): project is ResumeProject => project !== undefined);
};

export const createFeaturedSkills = (
	skills: ResumeSkill[] = [],
	skillNames: string[] = [],
): ResumeSkill[] => {
	if (skillNames.length === 0) {
		return [];
	}

	const byName = new Map(skills.map((skill) => [skill.name, skill]));

	return unique(skillNames)
		.map((name) => byName.get(name))
		.filter((skill): skill is ResumeSkill => skill !== undefined);
};

export const getFeaturedConfig = (featured?: ResumeFeatured): Required<ResumeFeatured> => ({
	projectIds: featured?.projectIds ?? [],
	skillNames: featured?.skillNames ?? [],
});
