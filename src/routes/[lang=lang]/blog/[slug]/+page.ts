import { error } from "@sveltejs/kit";
import {
	blogPostSummary,
	getBlogPost,
	getBlogTranslation,
	getPublishedBlogEntries,
	getSeriesPosts,
} from "$lib/blog/posts";
import { getBlogSeries } from "$lib/blog/series";
import { isLocale } from "$lib/i18n";

export const entries = getPublishedBlogEntries;

export const load = ({ params }) => {
	if (!isLocale(params.lang)) throw error(404, "Locale not found");
	const post = getBlogPost(params.lang, params.slug);
	if (!post) throw error(404, "Article not found");
	const translation = getBlogTranslation(post);
	const series = getBlogSeries(post.series);
	if (!translation || !series) throw error(500, "Invalid blog post metadata");
	const seriesPosts = getSeriesPosts(params.lang, post.series);
	const index = seriesPosts.findIndex((candidate) => candidate.id === post.id);

	return {
		locale: params.lang,
		post: blogPostSummary(post),
		translation: blogPostSummary(translation),
		series: {
			id: series.id,
			title: series.title[params.lang],
			description: series.description[params.lang],
		},
		previous: index > 0 ? blogPostSummary(seriesPosts[index - 1]) : null,
		next:
			index >= 0 && index < seriesPosts.length - 1 ? blogPostSummary(seriesPosts[index + 1]) : null,
	};
};
