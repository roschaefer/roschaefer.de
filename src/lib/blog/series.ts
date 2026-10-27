import type { Locale } from "$lib/i18n";
import generatedSeries from "./series.json";

export type BlogSeries = {
	id: string;
	title: Record<Locale, string>;
	description: Record<Locale, string>;
};

/** Written by the episodes' build, see episodes/README.md. */
export const blogSeries: Record<string, BlogSeries> = generatedSeries;

export type BlogSeriesId = string;

export const getBlogSeries = (id: string): BlogSeries | undefined => blogSeries[id];
