import type { Locale } from "$lib/i18n";

export type BlogSeries = {
	id: string;
	title: Record<Locale, string>;
	description: Record<Locale, string>;
};

export const blogSeries = {
	"why-splicing": {
		id: "why-splicing",
		title: {
			de: "Warum Splicing",
			en: "Why splicing",
		},
		description: {
			de: "Was bei Submodulen und Subtrees schiefgeht, und warum ich ein eigenes Werkzeug geschrieben habe.",
			en: "What goes wrong with submodules and subtrees, and why I started writing my own tool.",
		},
	},
	"splicing-concepts": {
		id: "splicing-concepts",
		title: {
			de: "Die Idee des Splicings",
			en: "The idea of splicing",
		},
		description: {
			de: "Das Konzept hinter Splicing, Schritt für Schritt erklärt mit Diagrammen und einfachem Git.",
			en: "The concept behind splicing, explained step by step with diagrams and plain Git.",
		},
	},
	"git-splice": {
		id: "git-splice",
		title: {
			de: "git-splice: die Referenzimplementierung",
			en: "git-splice: the reference implementation",
		},
		description: {
			de: "Wie git-splice die Idee umsetzt.",
			en: "How git-splice implements the idea.",
		},
	},
	"building-git-splice": {
		id: "building-git-splice",
		title: {
			de: "Wie ich git-splice baue",
			en: "How I build git-splice",
		},
		description: {
			de: "Ausführbare Spezifikationen, getestete Diagramme und die Arbeit mit KI-Agenten.",
			en: "Executable specifications, tested diagrams, and working with AI agents.",
		},
	},
	"splicing-in-practice": {
		id: "splicing-in-practice",
		title: {
			de: "Splicing in der Praxis",
			en: "Splicing in practice",
		},
		description: {
			de: "Splicing an einem echten Projekt: Scrut.",
			en: "Splicing a real project: Scrut.",
		},
	},
	"other-tools": {
		id: "other-tools",
		title: {
			de: "Andere Werkzeuge",
			en: "Other tools",
		},
		description: {
			de: "Wie andere Werkzeuge und Versionskontrollsysteme dasselbe Problem angehen.",
			en: "How other tools and version control systems approach the same problem.",
		},
	},
} as const satisfies Record<string, BlogSeries>;

export type BlogSeriesId = keyof typeof blogSeries;

export const getBlogSeries = (id: string): BlogSeries | undefined => blogSeries[id as BlogSeriesId];
