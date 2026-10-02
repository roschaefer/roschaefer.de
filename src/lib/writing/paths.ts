import type { Locale } from "$lib/i18n";

export const writingSegment = (locale: Locale) => (locale === "de" ? "artikel" : "writing");
export const writingSeriesSegment = (locale: Locale) => (locale === "de" ? "serien" : "series");

export const writingPath = (locale: Locale) => `/${locale}/${writingSegment(locale)}/`;
export const writingPostPath = (locale: Locale, slug: string) => `${writingPath(locale)}${slug}/`;
export const writingSeriesPath = (locale: Locale, series: string) =>
	`${writingPath(locale)}${writingSeriesSegment(locale)}/${series}/`;
export const writingRssPath = (locale: Locale) => `${writingPath(locale)}rss.xml`;
