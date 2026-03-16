import type { ResumeProject } from "$lib/types/resume";

export type TechExperience = {
	name: string;
	totalMonths: number;
	label: string;
	projects: ResumeProject[];
};

type Interval = {
	start: number;
	end: number;
};

const monthIndex = (value: string): number => {
	const date = new Date(value);
	return date.getUTCFullYear() * 12 + date.getUTCMonth();
};

const monthDiff = (start: number, end: number): number => Math.max(1, end - start + 1);

const formatDuration = (months: number): string => {
	const years = Math.floor(months / 12);
	const remainder = months % 12;

	if (years === 0) {
		return `${remainder} month${remainder === 1 ? "" : "s"}`;
	}

	if (remainder === 0) {
		return `${years} year${years === 1 ? "" : "s"}`;
	}

	return `${years} year${years === 1 ? "" : "s"}, ${remainder} month${remainder === 1 ? "" : "s"}`;
};

const mergeIntervals = (intervals: Interval[]): Interval[] => {
	const sorted = [...intervals].sort((left, right) => left.start - right.start);
	const merged: Interval[] = [];

	for (const interval of sorted) {
		const previous = merged.at(-1);
		if (!previous || interval.start > previous.end + 1) {
			merged.push({ ...interval });
			continue;
		}

		previous.end = Math.max(previous.end, interval.end);
	}

	return merged;
};

export const createTechExperience = (
	projects: ResumeProject[],
	now = new Date(),
): TechExperience[] => {
	const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
	const entries = new Map<string, { intervals: Interval[]; projects: ResumeProject[] }>();

	for (const project of projects) {
		const keywords = project.keywords ?? [];
		const interval = {
			start: monthIndex(project.startDate),
			end: project.endDate ? monthIndex(project.endDate) : currentMonth,
		};

		for (const keyword of keywords) {
			const current = entries.get(keyword) ?? { intervals: [], projects: [] };
			current.intervals.push(interval);
			current.projects.push(project);
			entries.set(keyword, current);
		}
	}

	return [...entries.entries()]
		.map(([name, value]) => {
			const merged = mergeIntervals(value.intervals);
			const totalMonths = merged.reduce(
				(sum, interval) => sum + monthDiff(interval.start, interval.end),
				0,
			);
			const projects = [
				...new Map(value.projects.map((project) => [project.name, project])).values(),
			];

			return {
				name,
				totalMonths,
				label: formatDuration(totalMonths),
				projects,
			};
		})
		.sort(
			(left, right) => right.totalMonths - left.totalMonths || left.name.localeCompare(right.name),
		);
};
