import { error } from "@sveltejs/kit";
import { isLocale } from "$lib/i18n";
import { createSiteContent } from "$lib/utils/content";
import { getWritingPosts, writingPostSummary } from "$lib/writing/posts";

export const entries = () => [{ lang: "de" }, { lang: "en" }];

export const load = ({ params }) => {
	if (!isLocale(params.lang)) {
		throw error(404, "Locale not found");
	}

	return {
		content: createSiteContent(params.lang),
		locale: params.lang,
		recentWriting: getWritingPosts(params.lang)
			.filter((post) => post.series === "git-splice")
			.slice(0, 1)
			.map(writingPostSummary),
	};
};
