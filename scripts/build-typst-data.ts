import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import source from "../.generated/resume-source.json" with { type: "json" };
import { siteUrl } from "../src/lib/config/site.ts";
import { printLinkLabel } from "../src/lib/data/short-links.ts";
import type {
	ResumeAward,
	ResumeEducation,
	ResumeProfile,
	ResumeProject,
} from "../src/lib/types/resume.ts";
import { deriveResume } from "../src/lib/utils/derive-resume.ts";
import {
	createAtsExperienceProjects,
	createFeaturedEducation,
	createFeaturedEntriesByName,
	createFeaturedProjects,
	createFeaturedSkills,
	getFeaturedConfig,
} from "../src/lib/utils/resume-featured.ts";
import type { TechExperience } from "../src/lib/utils/tech-experience.ts";
import { createTechExperience } from "../src/lib/utils/tech-experience.ts";

type Locale = "de" | "en";
type LocaleConfig = {
	dateLocale: string;
	labels: Record<string, string>;
	redactedClientUrl: string;
};

type DatedEntry = { startDate?: string; endDate?: string };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "typst", "content");

const localeConfigs: Record<Locale, LocaleConfig> = {
	de: {
		dateLocale: "de-DE",
		labels: {
			skills: "Technologien",
			languages: "Sprachen",
			education: "Ausbildung",
			awards: "Auszeichnungen",
			profiles: "Profile",
			email: "E-Mail",
			website: "Website",
			present: "Heute",
			selectedProjects: "Ausgewählte aktuelle Projekte",
			experience: "Berufserfahrung",
			selectedTalks: "Ausgewählte Vorträge",
			redactedClient: "Name auf Anfrage",
		},
		redactedClientUrl: `${siteUrl}/de/auf-anfrage/`,
	},
	en: {
		dateLocale: "en-US",
		labels: {
			skills: "Technologies",
			languages: "Languages",
			education: "Education",
			awards: "Awards",
			profiles: "Profiles",
			email: "Email",
			website: "Website",
			present: "Present",
			selectedProjects: "Selected Recent Projects",
			experience: "Experience",
			selectedTalks: "Selected Talks",
			redactedClient: "Name on request",
		},
		redactedClientUrl: `${siteUrl}/en/on-request/`,
	},
};

const formatters = Object.fromEntries(
	Object.entries(localeConfigs).map(([locale, config]) => [
		locale,
		new Intl.DateTimeFormat(config.dateLocale, { month: "short", year: "numeric" }),
	]),
);

const stripMarkdownLinks = (value: string): string =>
	value
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
		.replace(/\s+/g, " ")
		.trim();

const formatDate = (value: string | undefined, locale: Locale): string => {
	if (!value) {
		return "";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return formatters[locale].format(date);
};

const formatDateRange = (
	{ startDate, endDate }: DatedEntry,
	locale: Locale,
	presentLabel: string,
): string => {
	const start = formatDate(startDate, locale);
	const end = endDate ? formatDate(endDate, locale) : presentLabel;
	return [start, end].filter(Boolean).join(" - ");
};

const pickProfiles = (profiles: ResumeProfile[] = []): ResumeProfile[] =>
	profiles.filter((profile) =>
		["Github", "LinkedIn", "Mastodon", "YouTube"].includes(profile.network),
	);

const projectRole = (project: ResumeProject): string => project.roles?.join(", ") ?? "";

// entity is already resolved (real or masked) by the time source is loaded -
// this only adds PDF-specific display rules: a defensive label for the rare
// case entity is somehow still empty, and swapping the link target to the
// redacted-client explanation page (the website does the equivalent via a
// hardcoded relative path in a component; this one needs a full URL since a
// PDF has no notion of "relative to the current page"). Computed once per
// project here rather than left to every call site that builds an output
// shape, since the same project can appear in experience, experienceFull,
// and one or more technologies[].projects.
type DisplayProject = Omit<ResumeProject, "entity"> & {
	entity: string;
	linkUrl: string | null;
	suffixUrl: string | null;
};

type DisplayTechExperience = Omit<TechExperience, "projects"> & { projects: DisplayProject[] };

const toDisplayProject = (project: ResumeProject, config: LocaleConfig): DisplayProject => ({
	...project,
	entity: project.redacted
		? (project.entity ?? config.labels.redactedClient)
		: (project.entity ?? ""),
	// Redacted entries link the entity heading to the redacted-client
	// explanation page instead of the project's own (unrelated) URL. When a
	// redacted entry still has a real, safe-to-show project URL, that link
	// moves to the project name (the suffix) instead of being dropped.
	linkUrl: project.redacted ? config.redactedClientUrl : (project.url ?? null),
	suffixUrl: project.redacted ? (project.url ?? null) : null,
});

// createFeaturedProjects/createAtsExperienceProjects/createTechExperience only
// filter, group, or reorder the exact objects passed in - they never clone or
// replace fields - so casting their ResumeProject[]-typed output back to
// DisplayProject[] is safe as long as DisplayProject[] was what went in.
const asDisplayProjects = (projects: ResumeProject[]): DisplayProject[] =>
	projects as DisplayProject[];
const asDisplayTechExperience = (entries: TechExperience[]): DisplayTechExperience[] =>
	entries as DisplayTechExperience[];

const createProjectEntry = (project: DisplayProject, locale: Locale, config: LocaleConfig) => ({
	name: project.name,
	entity: project.entity,
	role: projectRole(project),
	period: formatDateRange(project, locale, config.labels.present),
	description: stripMarkdownLinks(project.description ?? ""),
	keywords: (project.keywords ?? []).slice(0, 6),
	url: project.linkUrl,
	suffixUrl: project.suffixUrl,
	printLabel: project.url ? printLinkLabel(project.url) : null,
});

const createTalkEntry = (project: DisplayProject, locale: Locale) => ({
	name: project.name,
	entity: project.entity,
	period: formatDate(project.startDate, locale),
	url: project.url ?? null,
	printLabel: project.url ? printLinkLabel(project.url) : null,
});

const createEducationEntry = (entry: ResumeEducation, locale: Locale, config: LocaleConfig) => ({
	title: [entry.studyType, entry.area].filter(Boolean).join(", "),
	institution: entry.institution,
	period: formatDateRange(entry, locale, config.labels.present),
	score: entry.score ?? "",
});

const createAwardEntry = (entry: ResumeAward, locale: Locale) => ({
	title: entry.title,
	awarder: entry.awarder ?? "",
	period: formatDate(entry.date, locale),
	summary: stripMarkdownLinks(entry.summary ?? ""),
});

const createTechnologyEntry = (entry: DisplayTechExperience) => ({
	name: entry.name,
	duration: entry.label,
	projectCount: entry.projectCount,
	lastUsedLabel: entry.lastUsedLabel,
	projects: entry.projects.map((project) => ({
		name: project.name,
		entity: project.entity,
		url: project.linkUrl,
		printLabel: project.url ? printLinkLabel(project.url) : null,
	})),
});

await fs.mkdir(outputDir, { recursive: true });
const featured = getFeaturedConfig(source.featured);

for (const [locale, config] of Object.entries(localeConfigs) as [Locale, LocaleConfig][]) {
	const resume = deriveResume(source, locale);
	const projects = [...(resume.projects ?? [])]
		.sort((left, right) => right.startDate.localeCompare(left.startDate))
		.map((project) => toDisplayProject(project, config));
	const featuredProjects = asDisplayProjects(
		createFeaturedProjects(projects, featured.projectIds),
	).filter((project) => project.type !== "presentation");
	const atsExperienceProjects = asDisplayProjects(createAtsExperienceProjects(projects));
	const featuredTalks = asDisplayProjects(
		createFeaturedProjects(projects, featured.talkIds),
	).filter((project) => project.type === "presentation");
	const featuredSkills = createFeaturedSkills(resume.skills ?? [], featured.skillNames);
	const featuredEducation = createFeaturedEducation(resume.education ?? [], featured.educationIds);
	const techExperience = asDisplayTechExperience(createTechExperience(projects, locale));
	const featuredTechExperience = createFeaturedEntriesByName(techExperience, featured.skillNames);
	const typstTechExperience =
		featuredTechExperience.length > 0 ? featuredTechExperience : techExperience.slice(0, 12);

	const payload = {
		locale,
		labels: config.labels,
		basics: {
			name: resume.basics.name,
			label: resume.basics.label,
			summary: resume.basics.summary,
			email: resume.basics.email,
			websiteUrl: resume.basics.url,
			websiteLabel: printLinkLabel(resume.basics.url),
		},
		profiles: pickProfiles(resume.basics.profiles).map((profile) => ({
			network: profile.network,
			url: profile.url,
			printLabel: printLinkLabel(profile.url),
		})),
		skills: (featuredSkills.length > 0 ? featuredSkills : (resume.skills ?? []).slice(0, 12)).map(
			(skill) => skill.name,
		),
		technologies: typstTechExperience.map((entry) => createTechnologyEntry(entry)),
		languages: (resume.languages ?? []).map((language) => ({
			name: language.language,
			fluency: language.fluency,
		})),
		education: (featuredEducation.length > 0 ? featuredEducation : (resume.education ?? [])).map(
			(entry) => createEducationEntry(entry, locale, config),
		),
		educationFull: (resume.education ?? []).map((entry) =>
			createEducationEntry(entry, locale, config),
		),
		awards: (resume.awards ?? []).slice(0, 4).map((entry) => createAwardEntry(entry, locale)),
		experience: (featuredProjects.length > 0
			? featuredProjects
			: projects.filter((project) => project.type !== "presentation").slice(0, 6)
		).map((project) => createProjectEntry(project, locale, config)),
		experienceFull: atsExperienceProjects.map((project) =>
			createProjectEntry(project, locale, config),
		),
		talks: (featuredTalks.length > 0
			? featuredTalks.slice(0, 3)
			: projects.filter((project) => project.type === "presentation").slice(0, 3)
		).map((project) => createTalkEntry(project, locale)),
	};

	await fs.writeFile(
		path.join(outputDir, `${locale}.typ.json`),
		`${JSON.stringify(payload, null, "\t")}\n`,
	);
}
