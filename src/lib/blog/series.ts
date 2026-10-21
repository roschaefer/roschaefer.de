import type { Locale } from "$lib/i18n";

export type BlogSeries = {
	id: string;
	title: Record<Locale, string>;
	description: Record<Locale, string>;
};

export const blogSeries = {
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
} as const satisfies Record<string, BlogSeries>;

export type BlogSeriesId = keyof typeof blogSeries;

export const getBlogSeries = (id: string): BlogSeries | undefined => blogSeries[id as BlogSeriesId];
