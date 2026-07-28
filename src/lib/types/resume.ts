import type {
	JsonResume,
	JsonResumeAward,
	JsonResumeBasics,
	JsonResumeEducation,
	JsonResumeInterest,
	JsonResumeLanguage,
	JsonResumeProfile,
	JsonResumeProject,
	JsonResumeSkill,
} from "./json-resume";

// This site's extensions to the canonical JSON Resume schema (see ./json-resume.ts).
// The JSON Resume spec allows `additionalProperties`, so these coexist fine at
// runtime (validated in resume-schema.test.ts) — this file just gives the
// custom fields real types and narrows canonical fields this codebase always
// expects to be present.

/** Not part of the JSON Resume schema — used to attach press/award coverage links. */
export type ResumeLink = {
	label: string;
	url: string;
	kind?: string;
};

export type ResumeProfile = JsonResumeProfile & {
	network: string;
	url: string;
};

export type ResumeBasics = Omit<JsonResumeBasics, "profiles"> & {
	name: string;
	label: string;
	email: string;
	url: string;
	summary: string;
	/** Not part of the JSON Resume schema — used for the Signal contact link. */
	signal?: string;
	profiles?: ResumeProfile[];
};

export type ResumeProject = JsonResumeProject & {
	/** Not part of the JSON Resume schema — used for stable anchor ids. */
	id?: string;
	name: string;
	startDate: string;
	/** Not part of the JSON Resume schema — press/award coverage for this entry. */
	links?: ResumeLink[];
	/** Not part of the JSON Resume schema — e.g. "independent", "employed". */
	engagement?: string;
	/** Not part of the JSON Resume schema — e.g. "open-source", "private". */
	codeVisibility?: string;
	redacted?: boolean;
};

export type ResumeAward = JsonResumeAward & {
	title: string;
	/** Not part of the JSON Resume schema — link to the award announcement/details. */
	url?: string;
};

export type ResumeEducation = JsonResumeEducation & {
	/** Not part of the JSON Resume schema — used for stable anchor ids. */
	id?: string;
	institution: string;
	area: string;
	studyType: string;
};

export type ResumeLanguage = JsonResumeLanguage & {
	language: string;
	fluency: string;
};

export type ResumeInterest = JsonResumeInterest & {
	name: string;
};

export type ResumeSkill = JsonResumeSkill & {
	name: string;
};

/** Fully custom — this site's curation config, has no equivalent in the JSON Resume schema. */
export type ResumeFeatured = {
	projectIds?: string[];
	talkIds?: string[];
	educationIds?: string[];
};

export type Resume = Omit<
	JsonResume,
	"basics" | "projects" | "awards" | "languages" | "education" | "interests" | "skills"
> & {
	basics: ResumeBasics;
	projects?: ResumeProject[];
	awards?: ResumeAward[];
	languages?: ResumeLanguage[];
	education?: ResumeEducation[];
	interests?: ResumeInterest[];
	skills?: ResumeSkill[];
	/** Fully custom — not part of the JSON Resume schema. */
	featured?: ResumeFeatured;
};
