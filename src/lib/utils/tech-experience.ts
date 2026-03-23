import type { Locale } from "$lib/i18n";
import type { ResumeProject } from "$lib/types/resume";
import { formatMonthDuration } from "./duration";

export type TechExperience = {
	name: string;
	totalMonths: number;
	label: string;
	projects: ResumeProject[];
	projectCount: number;
	lastUsedMonth: number;
	lastUsedLabel: string;
	score: number;
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

const formatRelativeLastUsed = (
	lastUsedMonth: number,
	currentMonth: number,
	locale: Locale,
): string => {
	const monthsAgo = Math.max(0, currentMonth - lastUsedMonth);

	if (monthsAgo === 0) {
		return locale === "de" ? "Aktiv im aktuellen Projekt" : "Active in current work";
	}

	if (monthsAgo < 12) {
		const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
		return formatter.format(-monthsAgo, "month");
	}

	const date = new Date(Date.UTC(Math.floor(lastUsedMonth / 12), lastUsedMonth % 12, 1));
	return new Intl.DateTimeFormat(locale, {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
};

const createScore = (
	totalMonths: number,
	projectCount: number,
	monthsSinceLastUsed: number,
): number => totalMonths + projectCount * 8 + Math.max(0, 24 - monthsSinceLastUsed) * 2;

export const createTechExperience = (
	projects: ResumeProject[],
	locale: Locale,
	now = new Date(),
): TechExperience[] => {
	const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
	const entries = new Map<
		string,
		{ intervals: Interval[]; projects: ResumeProject[]; lastUsedMonth: number }
	>();

	for (const project of projects) {
		const keywords = project.keywords ?? [];
		const interval = {
			start: monthIndex(project.startDate),
			end: project.endDate ? monthIndex(project.endDate) : currentMonth,
		};

		for (const keyword of keywords) {
			const current = entries.get(keyword) ?? {
				intervals: [],
				projects: [],
				lastUsedMonth: interval.end,
			};
			current.intervals.push(interval);
			current.projects.push(project);
			current.lastUsedMonth = Math.max(current.lastUsedMonth, interval.end);
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
			const projectCount = projects.length;
			const monthsSinceLastUsed = Math.max(0, currentMonth - value.lastUsedMonth);

			return {
				name,
				totalMonths,
				label: formatMonthDuration(totalMonths, locale),
				projects,
				projectCount,
				lastUsedMonth: value.lastUsedMonth,
				lastUsedLabel: formatRelativeLastUsed(value.lastUsedMonth, currentMonth, locale),
				score: createScore(totalMonths, projectCount, monthsSinceLastUsed),
			};
		})
		.sort(
			(left, right) =>
				right.score - left.score ||
				right.totalMonths - left.totalMonths ||
				right.projectCount - left.projectCount ||
				right.lastUsedMonth - left.lastUsedMonth ||
				left.name.localeCompare(right.name),
		);
};
