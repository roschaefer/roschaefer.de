import { blogPostSummary, getBlogPosts } from "$lib/blog/posts";
import { createSiteContent } from "$lib/utils/content";

export const entries = () => [{ lang: "de" }, { lang: "en" }];

export const load = ({ params }) => ({
	content: createSiteContent(params.lang),
	locale: params.lang,
	recentPosts: getBlogPosts(params.lang).slice(0, 1).map(blogPostSummary),
});
