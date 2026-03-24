import type { Locale } from "$lib/i18n";
import type { ResumeProject, ResumeSkill } from "$lib/types/resume";
import { formatMonthDuration } from "./duration.ts";
import { createTechnologyAggregates } from "./technology-aggregate.ts";

type SkillSignals = {
	name: string;
	totalMonths: number;
	projectCount: number;
	monthsSinceLastUsed: number;
	lastUsedMonth: number;
};

export const formatSkillDuration = (months: number, locale: Locale): string =>
	formatMonthDuration(months, locale);

const formatProjectCount = (count: number, locale: Locale): string => {
	if (locale === "de") {
		return `${count} ${count === 1 ? "Projekt" : "Projekte"}`;
	}

	return `${count} ${count === 1 ? "project" : "projects"}`;
};

const formatLastUsedKeyword = (
	lastUsedMonth: number,
	monthsSinceLastUsed: number,
	locale: Locale,
): string => {
	if (monthsSinceLastUsed === 0) {
		return locale === "de" ? "aktuell im Einsatz" : "active now";
	}

	if (monthsSinceLastUsed < 12) {
		const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
			-monthsSinceLastUsed,
			"month",
		);
		return locale === "de" ? `zuletzt ${relative}` : `last used ${relative}`;
	}

	const date = new Date(Date.UTC(Math.floor(lastUsedMonth / 12), lastUsedMonth % 12, 1));
	const formattedDate = new Intl.DateTimeFormat(locale, {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
	return locale === "de" ? `zuletzt ${formattedDate}` : `last used ${formattedDate}`;
};

const createSkillLevel = (
	totalMonths: number,
	projectCount: number,
	monthsSinceLastUsed: number,
	locale: Locale,
): string => {
	let tier = 0;

	if (totalMonths >= 60 && projectCount >= 4 && monthsSinceLastUsed <= 24) {
		tier = 3;
	} else if (totalMonths >= 24 && projectCount >= 2 && monthsSinceLastUsed <= 48) {
		tier = 2;
	} else if (totalMonths >= 6 || projectCount >= 2 || monthsSinceLastUsed <= 12) {
		tier = 1;
	}

	if (monthsSinceLastUsed > 60 && tier > 0) {
		tier -= 1;
	}

	const labels =
		locale === "de"
			? ["Grundkenntnisse", "Praxiserfahrung", "Souveräne Nutzung", "Langjährige Erfahrung"]
			: ["Basic exposure", "Practical experience", "Proficient use", "Long-term experience"];

	return labels[tier];
};

const createSortScore = (
	totalMonths: number,
	projectCount: number,
	monthsSinceLastUsed: number,
): number => totalMonths + projectCount * 8 + Math.max(0, 24 - monthsSinceLastUsed) * 2;

export const createResumeSkills = (
	projects: ResumeProject[] = [],
	locale: Locale,
	now = new Date(),
): ResumeSkill[] => {
	const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();

	return createTechnologyAggregates(projects, now)
		.map(({ name, totalMonths, projectCount, lastUsedMonth }) => {
			const monthsSinceLastUsed = Math.max(0, currentMonth - lastUsedMonth);

			const signals: SkillSignals = {
				name,
				totalMonths,
				projectCount,
				monthsSinceLastUsed,
				lastUsedMonth,
			};

			return {
				...signals,
				level: createSkillLevel(totalMonths, projectCount, monthsSinceLastUsed, locale),
				keywords: [
					formatSkillDuration(totalMonths, locale),
					formatProjectCount(projectCount, locale),
					formatLastUsedKeyword(lastUsedMonth, monthsSinceLastUsed, locale),
				],
				sortScore: createSortScore(totalMonths, projectCount, monthsSinceLastUsed),
			};
		})
		.sort(
			(left, right) =>
				right.sortScore - left.sortScore ||
				right.totalMonths - left.totalMonths ||
				right.projectCount - left.projectCount ||
				left.name.localeCompare(right.name),
		)
		.map(({ name, level, keywords }) => ({ name, level, keywords }));
};

export const resumeSkillsAreInSync = (
	projects: ResumeProject[] = [],
	skills: ResumeSkill[] = [],
	locale: Locale,
	now = new Date(),
): boolean => JSON.stringify(skills) === JSON.stringify(createResumeSkills(projects, locale, now));
