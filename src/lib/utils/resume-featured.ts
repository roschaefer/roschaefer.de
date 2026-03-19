import type { ResumeFeatured, ResumeProject, ResumeSkill } from "$lib/types/resume";

const unique = <T>(values: T[]): T[] => [...new Set(values)];
const pickByKey = <T, K>(entries: T[], keys: K[], getKey: (entry: T) => K): T[] => {
	if (keys.length === 0) {
		return [];
	}

	const byKey = new Map(entries.map((entry) => [getKey(entry), entry]));

	return unique(keys)
		.map((key) => byKey.get(key))
		.filter((entry): entry is T => entry !== undefined);
};

export const createFeaturedProjects = (
	projects: ResumeProject[] = [],
	projectIds: string[] = [],
): ResumeProject[] => {
	return pickByKey(
		projects.filter(
			(project): project is ResumeProject & { id: string } => typeof project.id === "string",
		),
		projectIds,
		(project) => project.id,
	);
};

export const createFeaturedSkills = (
	skills: ResumeSkill[] = [],
	skillNames: string[] = [],
): ResumeSkill[] => pickByKey(skills, skillNames, (skill) => skill.name);

export const createFeaturedEntriesByName = <T extends { name: string }>(
	entries: T[] = [],
	names: string[] = [],
): T[] => pickByKey(entries, names, (entry) => entry.name);

export const getFeaturedConfig = (featured?: ResumeFeatured): Required<ResumeFeatured> => ({
	projectIds: featured?.projectIds ?? [],
	skillNames: featured?.skillNames ?? [],
});
