import type { Locale } from "$lib/i18n";

export const writingSegment = (_locale: Locale): "log" => "log";

export const writingPath = (locale: Locale) => `/${locale}/${writingSegment(locale)}/`;
export const writingPostPath = (locale: Locale, topic: string, slug: string) =>
	`${writingPath(locale)}${topic}/${slug}/`;
export const writingTopicPath = (locale: Locale, topic: string) =>
	`${writingPath(locale)}${topic}/`;
export const writingRssPath = (locale: Locale) => `${writingPath(locale)}rss.xml`;
