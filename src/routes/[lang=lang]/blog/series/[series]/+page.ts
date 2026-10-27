import { error } from "@sveltejs/kit";
import { blogPostSummary, getPublishedBlogPosts, getSeriesPosts } from "$lib/blog/posts";
import { blogSeries, getBlogSeries } from "$lib/blog/series";
import { isLocale } from "$lib/i18n";

export const entries = () =>
	Object.keys(blogSeries).flatMap((series) =>
		(["de", "en"] as const)
			.filter((lang) => getPublishedBlogPosts(lang).some((post) => post.series === series))
			.map((lang) => ({ lang, series })),
	);

export const load = ({ params }) => {
	if (!isLocale(params.lang)) throw error(404, "Locale not found");
	const series = getBlogSeries(params.series);
	if (!series) throw error(404, "Series not found");
	const posts = getSeriesPosts(params.lang, params.series);
	if (posts.length === 0 && !import.meta.env.DEV) throw error(404, "Series not found");
	return {
		locale: params.lang,
		series: {
			id: series.id,
			title: series.title[params.lang],
			description: series.description[params.lang],
		},
		posts: posts.map(blogPostSummary),
	};
};
