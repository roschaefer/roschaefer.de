import type { Locale } from "$lib/i18n";
import type { ResumeProject } from "$lib/types/resume";
import { formatMonthDuration } from "./duration.ts";
import { createTechnologyAggregates } from "./technology-aggregate.ts";

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

	return createTechnologyAggregates(projects, now)
		.map(({ name, totalMonths, projects, projectCount, lastUsedMonth }) => {
			const monthsSinceLastUsed = Math.max(0, currentMonth - lastUsedMonth);

			return {
				name,
				totalMonths,
				label: formatMonthDuration(totalMonths, locale),
				projects,
				projectCount,
				lastUsedMonth,
				lastUsedLabel: formatRelativeLastUsed(lastUsedMonth, currentMonth, locale),
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
