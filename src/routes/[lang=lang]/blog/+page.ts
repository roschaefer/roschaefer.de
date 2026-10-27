import { error } from "@sveltejs/kit";
import { blogPostSummary, getBlogPosts } from "$lib/blog/posts";
import { isLocale } from "$lib/i18n";

export const entries = () => [{ lang: "de" }, { lang: "en" }];

export const load = ({ params }) => {
	if (!isLocale(params.lang)) throw error(404, "Locale not found");
	return {
		locale: params.lang,
		posts: getBlogPosts(params.lang).map(blogPostSummary),
	};
};
