import { error } from "@sveltejs/kit";
import { isLocale } from "$lib/i18n";
import {
	getPublishedWritingEntries,
	getSeriesPosts,
	getWritingPost,
	getWritingTranslation,
	writingPostSummary,
} from "$lib/writing/posts";
import { getWritingSeries } from "$lib/writing/series";

export const entries = getPublishedWritingEntries;

export const load = ({ params }) => {
	if (!isLocale(params.lang)) throw error(404, "Locale not found");
	const post = getWritingPost(params.lang, params.slug);
	if (!post) throw error(404, "Article not found");
	const translation = getWritingTranslation(post);
	const series = getWritingSeries(post.series);
	if (!translation || !series) throw error(500, "Invalid writing metadata");
	const seriesPosts = getSeriesPosts(params.lang, post.series);
	const index = seriesPosts.findIndex((candidate) => candidate.id === post.id);

	return {
		locale: params.lang,
		post: writingPostSummary(post),
		translation: writingPostSummary(translation),
		series: {
			id: series.id,
			title: series.title[params.lang],
			description: series.description[params.lang],
		},
		previous: index > 0 ? writingPostSummary(seriesPosts[index - 1]) : null,
		next:
			index >= 0 && index < seriesPosts.length - 1
				? writingPostSummary(seriesPosts[index + 1])
				: null,
	};
};
