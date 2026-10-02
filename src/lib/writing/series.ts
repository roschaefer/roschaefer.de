import type { Locale } from "$lib/i18n";

export type WritingSeries = {
	id: string;
	title: Record<Locale, string>;
	description: Record<Locale, string>;
};

export const writingSeries = {
	"git-splice": {
		id: "git-splice",
		title: {
			de: "Git Splice entwickeln",
			en: "Building Git Splice",
		},
		description: {
			de: "Was ich beim Entwurf eines Git-Werkzeugs für sichere, reproduzierbare Teilrepository-Synchronisation gelernt habe.",
			en: "What I learned while designing a Git tool for safe, reproducible subrepository synchronization.",
		},
	},
} as const satisfies Record<string, WritingSeries>;

export type WritingSeriesId = keyof typeof writingSeries;

export const getWritingSeries = (id: string): WritingSeries | undefined =>
	writingSeries[id as WritingSeriesId];
