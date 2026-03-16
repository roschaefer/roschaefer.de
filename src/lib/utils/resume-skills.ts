import type { Locale } from "$lib/i18n";
import type { ResumeProject, ResumeSkill } from "$lib/types/resume";
import { formatMonthDuration } from "./duration.ts";

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

export const formatSkillDuration = (months: number, locale: Locale): string =>
	formatMonthDuration(months, locale);

export const createResumeSkills = (
	projects: ResumeProject[] = [],
	locale: Locale,
	now = new Date(),
): ResumeSkill[] => {
	const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
	const entries = new Map<string, Interval[]>();

	for (const project of projects) {
		const keywords = project.keywords ?? [];
		const interval = {
			start: monthIndex(project.startDate),
			end: project.endDate ? monthIndex(project.endDate) : currentMonth,
		};

		for (const keyword of keywords) {
			const intervals = entries.get(keyword) ?? [];
			intervals.push(interval);
			entries.set(keyword, intervals);
		}
	}

	return [...entries.entries()]
		.map(([name, intervals]) => {
			const totalMonths = mergeIntervals(intervals).reduce(
				(sum, interval) => sum + monthDiff(interval.start, interval.end),
				0,
			);

			return {
				name,
				level: formatSkillDuration(totalMonths, locale),
				totalMonths,
			};
		})
		.sort(
			(left, right) => right.totalMonths - left.totalMonths || left.name.localeCompare(right.name),
		)
		.map(({ name, level }) => ({ name, level }));
};

export const resumeSkillsAreInSync = (
	projects: ResumeProject[] = [],
	skills: ResumeSkill[] = [],
	locale: Locale,
	now = new Date(),
): boolean => JSON.stringify(skills) === JSON.stringify(createResumeSkills(projects, locale, now));
