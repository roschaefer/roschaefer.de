import type { Locale } from "$lib/i18n";

export const topicParam = "topic";

export const blogPath = (locale: Locale) => `/${locale}/blog/`;
export const blogPostPath = (locale: Locale, slug: string) => `${blogPath(locale)}${slug}/`;
export const blogSeriesPath = (locale: Locale, series: string) =>
	`${blogPath(locale)}series/${series}/`;
export const blogTopicPath = (locale: Locale, topics: string[]) => {
	const query = new URLSearchParams(topics.map((topic) => [topicParam, topic])).toString();
	return query ? `${blogPath(locale)}?${query}` : blogPath(locale);
};
export const blogRssPath = (locale: Locale) => `${blogPath(locale)}rss.xml`;
