import { error } from "@sveltejs/kit";
import { isLocale } from "$lib/i18n";
import { writingSegment } from "$lib/writing/paths";
import { getWritingPosts, writingPostSummary } from "$lib/writing/posts";

export const entries = () => [
	{ lang: "de", writing: writingSegment("de") },
	{ lang: "en", writing: writingSegment("en") },
];

export const load = ({ params }) => {
	if (!isLocale(params.lang)) throw error(404, "Locale not found");
	if (params.writing !== writingSegment(params.lang)) throw error(404, "Writing section not found");
	return {
		locale: params.lang,
		posts: getWritingPosts(params.lang).map(writingPostSummary),
	};
};
