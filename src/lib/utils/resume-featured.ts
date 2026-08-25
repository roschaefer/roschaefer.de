import type { ResumeEducation, ResumeFeatured, ResumeProject } from "$lib/types/resume";

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

export const createFeaturedProjects = <T extends ResumeProject>(
	projects: T[] = [],
	projectIds: string[] = [],
): T[] => {
	return pickByKey(
		projects.filter((project): project is T & { id: string } => typeof project.id === "string"),
		projectIds,
		(project) => project.id,
	);
};

export const createExperienceProjects = <T extends ResumeProject>(projects: T[] = []): T[] =>
	projects.filter((project) => project.type === "experience");

export const createFeaturedEducation = (
	education: ResumeEducation[] = [],
	educationIds: string[] = [],
): ResumeEducation[] =>
	pickByKey(
		education.filter(
			(entry): entry is ResumeEducation & { id: string } => typeof entry.id === "string",
		),
		educationIds,
		(entry) => entry.id,
	);

export const getFeaturedConfig = (featured?: ResumeFeatured): Required<ResumeFeatured> => ({
	projectIds: featured?.projectIds ?? [],
	talkIds: featured?.talkIds ?? [],
	educationIds: featured?.educationIds ?? [],
	mentoringIds: featured?.mentoringIds ?? [],
});
