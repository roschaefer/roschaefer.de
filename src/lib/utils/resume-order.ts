import type { Resume } from "../types/resume";

type ResumeEntryIdentity = {
	id?: string;
	name?: string;
	title?: string;
	institution?: string;
	area?: string;
	url?: string;
};

type ResumeRangeDatedEntry = ResumeEntryIdentity & {
	startDate?: string;
	endDate?: string;
	date?: never;
};

type ResumePointDatedEntry = ResumeEntryIdentity & {
	date?: string;
	startDate?: never;
	endDate?: never;
};

export type ResumeDatedEntry = ResumeRangeDatedEntry | ResumePointDatedEntry;

const resumeEntryId = (entry: { id?: string; name?: string; url?: string }): string => {
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

const isRangeDatedEntry = (entry: ResumeDatedEntry): entry is ResumeRangeDatedEntry =>
	"startDate" in entry || "endDate" in entry;

const isPointDatedEntry = (entry: ResumeDatedEntry): entry is ResumePointDatedEntry =>
	"date" in entry;

export const isDatedEntry = (value: unknown): value is ResumeDatedEntry =>
	value !== null &&
	typeof value === "object" &&
	("startDate" in value || "endDate" in value) !== "date" in value;

export const isDatedEntryArray = (value: unknown[]): value is ResumeDatedEntry[] =>
	value.every(isDatedEntry);

export const datedEntryId = (entry: ResumeDatedEntry): string => {
	if (entry.institution) {
		return `${entry.institution}-${entry.area ?? "no-area"}`
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-");
	}

	if (entry.title) {
		return resumeEntryId({ name: entry.title, url: entry.url, id: entry.id });
	}

	return resumeEntryId(entry);
};

export const datedEntrySortValue = (entry: ResumeDatedEntry, section: string): string => {
	if (isRangeDatedEntry(entry)) {
		if (!entry.startDate) {
			throw new Error(`${section} entry ${datedEntryId(entry)} is missing startDate.`);
		}

		return entry.endDate ?? entry.startDate;
	}

	if (isPointDatedEntry(entry)) {
		if (!entry.date) {
			throw new Error(`${section} entry ${datedEntryId(entry)} is missing date.`);
		}

		return entry.date;
	}

	throw new Error(`${section} entry ${datedEntryId(entry)} is not date-sortable.`);
};

export const sortResumeSection = (
	section: string,
	entries: ResumeDatedEntry[],
): ResumeDatedEntry[] =>
	[...entries].sort((left, right) =>
		datedEntrySortValue(right, section).localeCompare(datedEntrySortValue(left, section)),
	);

export const sortResumeDatedSections = (resume: Resume): Resume => {
	const nextResume = structuredClone(resume);
	const mutableResume = nextResume as Record<string, unknown>;

	for (const [section, value] of Object.entries(nextResume)) {
		if (!Array.isArray(value) || value.length === 0 || !isDatedEntryArray(value)) {
			continue;
		}

		mutableResume[section] = sortResumeSection(section, value);
	}

	return nextResume;
};
