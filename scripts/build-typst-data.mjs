import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import source from "../resume.i18n.json" with { type: "json" };
import { printLinkLabel } from "../src/lib/data/short-links.ts";
import {
	createFeaturedEntriesByName,
	createFeaturedProjects,
	createFeaturedSkills,
	getFeaturedConfig,
} from "../src/lib/utils/resume-featured.ts";
import { createTechExperience } from "../src/lib/utils/tech-experience.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "typst", "content");

const localeConfigs = {
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
			selectedTalks: "Ausgewählte Vorträge",
		},
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
			selectedTalks: "Selected Talks",
		},
	},
};

const formatters = Object.fromEntries(
	Object.entries(localeConfigs).map(([locale, config]) => [
		locale,
		new Intl.DateTimeFormat(config.dateLocale, { month: "short", year: "numeric" }),
	]),
);

const stripMarkdownLinks = (value) =>
	value
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
		.replace(/\s+/g, " ")
		.trim();

const formatDate = (value, locale) => {
	if (!value) {
		return "";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return formatters[locale].format(date);
};

const formatDateRange = ({ startDate, endDate }, locale, presentLabel) => {
	const start = formatDate(startDate, locale);
	const end = endDate ? formatDate(endDate, locale) : presentLabel;
	return [start, end].filter(Boolean).join(" - ");
};

const pickProfiles = (profiles = []) =>
	profiles.filter((profile) =>
		["Github", "LinkedIn", "Mastodon", "YouTube"].includes(profile.network),
	);

const projectRole = (project) => project.roles?.join(", ") ?? "";

const createProjectEntry = (project, locale, config) => ({
	name: project.name,
	entity: project.entity ?? "",
	role: projectRole(project),
	period: formatDateRange(project, locale, config.labels.present),
	description: stripMarkdownLinks(project.description ?? ""),
	keywords: (project.keywords ?? []).slice(0, 6),
	url: project.url ?? null,
	printLabel: project.url ? printLinkLabel(project.url) : null,
});

const createTalkEntry = (project, locale) => ({
	name: project.name,
	entity: project.entity ?? "",
	period: formatDate(project.startDate, locale),
	url: project.url ?? null,
	printLabel: project.url ? printLinkLabel(project.url) : null,
});

const createEducationEntry = (entry, locale, config) => ({
	title: [entry.studyType, entry.area].filter(Boolean).join(", "),
	institution: entry.institution,
	period: formatDateRange(entry, locale, config.labels.present),
	score: entry.score ?? "",
});

const createAwardEntry = (entry, locale) => ({
	title: entry.title,
	awarder: entry.awarder ?? "",
	period: formatDate(entry.date, locale),
	summary: stripMarkdownLinks(entry.summary ?? ""),
});

const createTechnologyEntry = (entry) => ({
	name: entry.name,
	duration: entry.label,
	projectCount: entry.projectCount,
	lastUsedLabel: entry.lastUsedLabel,
	projects: entry.projects.map((project) => ({
		name: project.name,
		entity: project.entity ?? "",
		url: project.url ?? null,
		printLabel: project.url ? printLinkLabel(project.url) : null,
	})),
});

await fs.mkdir(outputDir, { recursive: true });
const featured = getFeaturedConfig(source.featured);

for (const [locale, config] of Object.entries(localeConfigs)) {
	const resume = JSON.parse(await fs.readFile(path.join(rootDir, `resume.${locale}.json`), "utf8"));
	const projects = [...(resume.projects ?? [])].sort((left, right) =>
		right.startDate.localeCompare(left.startDate),
	);
	const featuredProjects = createFeaturedProjects(projects, featured.projectIds).filter(
		(project) => project.type !== "presentation",
	);
	const featuredTalks = createFeaturedProjects(projects, featured.talkIds).filter(
		(project) => project.type === "presentation",
	);
	const featuredSkills = createFeaturedSkills(resume.skills ?? [], featured.skillNames);
	const techExperience = createTechExperience(projects, locale);
	const featuredTechExperience = createFeaturedEntriesByName(techExperience, featured.skillNames);
	const typstTechExperience =
		featuredTechExperience.length > 0
			? featuredTechExperience.slice(0, 12)
			: techExperience.slice(0, 12);

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
		skills: (featuredSkills.length > 0
			? featuredSkills.slice(0, 12)
			: (resume.skills ?? []).slice(0, 12)
		).map((skill) => skill.name),
		technologies: typstTechExperience.map((entry) => createTechnologyEntry(entry)),
		languages: (resume.languages ?? []).map((language) => ({
			name: language.language,
			fluency: language.fluency,
		})),
		education: (resume.education ?? []).map((entry) => createEducationEntry(entry, locale, config)),
		awards: (resume.awards ?? []).slice(0, 4).map((entry) => createAwardEntry(entry, locale)),
		experience: (featuredProjects.length > 0
			? featuredProjects.slice(0, 6)
			: projects.filter((project) => project.type !== "presentation").slice(0, 6)
		).map((project) => createProjectEntry(project, locale, config)),
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
