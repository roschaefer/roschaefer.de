import { error } from "@sveltejs/kit";
import { isLocale } from "$lib/i18n";
import { getWritingPosts, writingPostSummary } from "$lib/writing/posts";

export const entries = () => [{ lang: "de" }, { lang: "en" }];

export const load = ({ params }) => {
	if (!isLocale(params.lang)) throw error(404, "Locale not found");
	return {
		locale: params.lang,
		posts: getWritingPosts(params.lang).map(writingPostSummary),
	};
};
