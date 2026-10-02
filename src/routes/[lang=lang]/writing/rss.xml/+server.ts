import { error } from "@sveltejs/kit";
import { siteName, siteUrl } from "$lib/config/site";
import { isLocale } from "$lib/i18n";
import { getPublishedWritingPosts } from "$lib/writing/posts";

export const prerender = true;
export const entries = () => [{ lang: "de" }, { lang: "en" }];

const xml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");

export const GET = ({ params }) => {
	if (!isLocale(params.lang)) throw error(404, "Locale not found");
	const locale = params.lang;
	const title = locale === "de" ? `Artikel von ${siteName}` : `Writing by ${siteName}`;
	const description =
		locale === "de"
			? "Erkenntnisse aus Open Source, Softwareentwicklung und Werkzeugbau."
			: "Lessons from open source, software development, and building tools.";
	const items = getPublishedWritingPosts(locale)
		.map((post) => {
			const url = `${siteUrl}/${locale}/writing/${post.slug}/`;
			return `<item><title>${xml(post.title)}</title><link>${url}</link><guid>${url}</guid><description>${xml(post.description)}</description><pubDate>${new Date(`${post.publishedAt}T00:00:00Z`).toUTCString()}</pubDate></item>`;
		})
		.join("");
	const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(title)}</title><link>${siteUrl}/${locale}/writing/</link><description>${xml(description)}</description><language>${locale}</language>${items}</channel></rss>`;
	return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
