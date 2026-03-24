export type ResumeProfile = {
	network: string;
	username?: string;
	url: string;
};

export type ResumeLink = {
	label: string;
	url: string;
	kind?: string;
};

export type ResumeBasics = {
	name: string;
	label: string;
	email: string;
	url: string;
	summary: string;
	signal?: string;
	location?: {
		city?: string;
		region?: string;
		countryCode?: string;
	};
	profiles?: ResumeProfile[];
};

export type ResumeProject = {
	id?: string;
	name: string;
	entity?: string;
	roles?: string[];
	startDate: string;
	endDate?: string;
	keywords?: string[];
	description?: string;
	url?: string;
	links?: ResumeLink[];
	type?: string;
};

export type ResumeAward = {
	title: string;
	date?: string;
	summary?: string;
	awarder?: string;
	links?: ResumeLink[];
};

export type ResumeLanguage = {
	language: string;
	fluency: string;
};

export type ResumeEducation = {
	institution: string;
	area: string;
	studyType: string;
	startDate?: string;
	endDate?: string;
	score?: string;
};

export type ResumeInterest = {
	name: string;
	keywords?: string[];
};

export type ResumeSkill = {
	name: string;
	level?: string;
	keywords?: string[];
};

export type ResumeFeatured = {
	projectIds?: string[];
	skillNames?: string[];
};

export type Resume = {
	basics: ResumeBasics;
	projects?: ResumeProject[];
	awards?: ResumeAward[];
	languages?: ResumeLanguage[];
	education?: ResumeEducation[];
	interests?: ResumeInterest[];
	skills?: ResumeSkill[];
	featured?: ResumeFeatured;
};
