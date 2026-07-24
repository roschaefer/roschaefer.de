import type { Locale } from "$lib/i18n";
import type { Resume, ResumeFeatured, ResumeProject } from "$lib/types/resume";
import source from "../../../.generated/resume-source.json";
import { deriveResume } from "../utils/derive-resume.ts";

const resumes: Record<Locale, Resume> = {
	de: deriveResume(source, "de"),
	en: deriveResume(source, "en"),
};

const featured = (source as { featured?: ResumeFeatured }).featured;

export const getResume = (locale: Locale): Resume => resumes[locale];
export const getResumeFeatured = (): ResumeFeatured | undefined => featured;

export const resumeEntryId = (entry: { id?: string; name?: string; url?: string }): string => {
	if (entry.id) {
		return entry.id;
	}

	if (entry.url) {
		try {
			const url = new URL(entry.url);
			const path = `${url.hostname}${url.pathname}${url.search}`;
			return path
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
		} catch {
			// Fall back to the title-based key below.
		}
	}

	return (entry.name ?? "entry")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
};

export const projectEntryId = (project: ResumeProject): string => resumeEntryId(project);

export const skillEntryId = (skillName: string): string =>
	`skill-${resumeEntryId({ name: skillName })}`;
