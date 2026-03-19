import type { Locale } from "$lib/i18n";
import type { Resume, ResumeFeatured, ResumeProject } from "$lib/types/resume";
import de from "../../../resume.de.json";
import en from "../../../resume.en.json";
import source from "../../../resume.i18n.json";

const resumes: Record<Locale, Resume> = {
	de: de as Resume,
	en: en as Resume,
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
