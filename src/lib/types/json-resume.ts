// Faithful mirror of the canonical JSON Resume schema (v1.3.0, `@jsonresume/schema`).
// https://github.com/jsonresume/resume-schema/blob/v1.3.0/schema.json
// Every field is optional here, matching the schema itself, which sets
// `additionalProperties: true` and declares nothing as required. This module
// must only model what the schema defines — project-specific fields belong in
// `./resume.ts`, which extends these types with this site's own additions.

export type JsonResumeLocation = {
	address?: string;
	postalCode?: string;
	city?: string;
	countryCode?: string;
	region?: string;
};

export type JsonResumeProfile = {
	network?: string;
	username?: string;
	url?: string;
};

export type JsonResumeBasics = {
	name?: string;
	label?: string;
	image?: string;
	email?: string;
	phone?: string;
	url?: string;
	summary?: string;
	location?: JsonResumeLocation;
	profiles?: JsonResumeProfile[];
};

export type JsonResumeWork = {
	name?: string;
	location?: string;
	description?: string;
	position?: string;
	url?: string;
	startDate?: string;
	endDate?: string;
	summary?: string;
	highlights?: string[];
};

export type JsonResumeVolunteer = {
	organization?: string;
	position?: string;
	url?: string;
	startDate?: string;
	endDate?: string;
	summary?: string;
	highlights?: string[];
};

export type JsonResumeEducation = {
	institution?: string;
	url?: string;
	area?: string;
	studyType?: string;
	startDate?: string;
	endDate?: string;
	score?: string;
	courses?: string[];
};

export type JsonResumeAward = {
	title?: string;
	date?: string;
	awarder?: string;
	summary?: string;
};

export type JsonResumeCertificate = {
	name?: string;
	date?: string;
	url?: string;
	issuer?: string;
};

export type JsonResumePublication = {
	name?: string;
	publisher?: string;
	releaseDate?: string;
	url?: string;
	summary?: string;
};

export type JsonResumeSkill = {
	name?: string;
	level?: string;
	keywords?: string[];
};

export type JsonResumeLanguage = {
	language?: string;
	fluency?: string;
};

export type JsonResumeInterest = {
	name?: string;
	keywords?: string[];
};

export type JsonResumeReference = {
	name?: string;
	reference?: string;
};

export type JsonResumeProject = {
	name?: string;
	description?: string;
	highlights?: string[];
	keywords?: string[];
	startDate?: string;
	endDate?: string;
	url?: string;
	roles?: string[];
	entity?: string;
	type?: string;
};

export type JsonResumeMeta = {
	canonical?: string;
	version?: string;
	lastModified?: string;
};

export type JsonResume = {
	$schema?: string;
	basics?: JsonResumeBasics;
	work?: JsonResumeWork[];
	volunteer?: JsonResumeVolunteer[];
	education?: JsonResumeEducation[];
	awards?: JsonResumeAward[];
	certificates?: JsonResumeCertificate[];
	publications?: JsonResumePublication[];
	skills?: JsonResumeSkill[];
	languages?: JsonResumeLanguage[];
	interests?: JsonResumeInterest[];
	references?: JsonResumeReference[];
	projects?: JsonResumeProject[];
	meta?: JsonResumeMeta;
};
