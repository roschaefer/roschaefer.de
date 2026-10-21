import { error } from "@sveltejs/kit";
import { blogPostSummary, getBlogPosts } from "$lib/blog/posts";
import { isLocale } from "$lib/i18n";
import { createSiteContent } from "$lib/utils/content";

export const entries = () => [{ lang: "de" }, { lang: "en" }];

export const load = ({ params }) => {
	if (!isLocale(params.lang)) {
		throw error(404, "Locale not found");
	}

	return {
		content: createSiteContent(params.lang),
		locale: params.lang,
		recentPosts: getBlogPosts(params.lang)
			.filter((post) => post.series === "git-splice")
			.slice(0, 1)
			.map(blogPostSummary),
	};
};
