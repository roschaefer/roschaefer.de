import type { ResumeProject } from "$lib/types/resume";

export type TechnologyAggregate = {
	name: string;
	totalMonths: number;
	projects: ResumeProject[];
	projectCount: number;
	lastUsedMonth: number;
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

export const createTechnologyAggregates = (
	projects: ResumeProject[] = [],
	now = new Date(),
): TechnologyAggregate[] => {
	const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
	const entries = new Map<
		string,
		{
			intervals: Interval[];
			projects: ResumeProject[];
			projectKeys: Set<string>;
			lastUsedMonth: number;
		}
	>();

	for (const project of projects) {
		const keywords = project.keywords ?? [];
		const interval = {
			start: monthIndex(project.startDate),
			end: project.endDate ? monthIndex(project.endDate) : currentMonth,
		};
		const projectKey = `${project.name}:${project.startDate}:${project.endDate ?? ""}`;

		for (const keyword of keywords) {
			const current = entries.get(keyword) ?? {
				intervals: [],
				projects: [],
				projectKeys: new Set<string>(),
				lastUsedMonth: interval.end,
			};
			current.intervals.push(interval);
			current.projects.push(project);
			current.projectKeys.add(projectKey);
			current.lastUsedMonth = Math.max(current.lastUsedMonth, interval.end);
			entries.set(keyword, current);
		}
	}

	return [...entries.entries()]
		.map(([name, value]) => ({
			name,
			totalMonths: mergeIntervals(value.intervals).reduce(
				(sum, interval) => sum + monthDiff(interval.start, interval.end),
				0,
			),
			projects: [...new Map(value.projects.map((project) => [project.name, project])).values()],
			projectCount: value.projectKeys.size,
			lastUsedMonth: value.lastUsedMonth,
		}))
		.sort(
			(left, right) => right.totalMonths - left.totalMonths || left.name.localeCompare(right.name),
		);
};
