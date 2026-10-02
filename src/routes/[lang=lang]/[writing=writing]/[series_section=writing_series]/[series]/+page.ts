import { error } from "@sveltejs/kit";
import { isLocale } from "$lib/i18n";
import { writingSegment, writingSeriesSegment } from "$lib/writing/paths";
import { getPublishedWritingPosts, getSeriesPosts, writingPostSummary } from "$lib/writing/posts";
import { getWritingSeries, writingSeries } from "$lib/writing/series";

export const entries = () =>
	Object.keys(writingSeries).flatMap((series) =>
		(["de", "en"] as const)
			.filter((lang) => getPublishedWritingPosts(lang).some((post) => post.series === series))
			.map((lang) => ({
				lang,
				writing: writingSegment(lang),
				series_section: writingSeriesSegment(lang),
				series,
			})),
	);

export const load = ({ params }) => {
	if (!isLocale(params.lang)) throw error(404, "Locale not found");
	if (
		params.writing !== writingSegment(params.lang) ||
		params.series_section !== writingSeriesSegment(params.lang)
	) {
		throw error(404, "Series not found");
	}
	const series = getWritingSeries(params.series);
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
		posts: posts.map(writingPostSummary),
	};
};
