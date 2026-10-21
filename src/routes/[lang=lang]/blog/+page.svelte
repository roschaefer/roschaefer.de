<script lang="ts">
import { page } from "$app/state";
import { blogPath, blogRssPath, blogTopicPath, topicParam } from "$lib/blog/paths";
import { filterByTopics, getBlogTopics } from "$lib/blog/posts";
import BlogPostList from "$lib/components/BlogPostList.svelte";
import BlogShell from "$lib/components/BlogShell.svelte";
import { siteName, siteUrl } from "$lib/config/site";
import * as m from "$lib/paraglide/messages";
import { markUsed } from "$lib/utils/mark-used";

const { data } = $props();
const otherLocale = $derived(data.locale === "de" ? "en" : "de");
const pageUrl = $derived(`${siteUrl}${blogPath(data.locale)}`);
const topics = $derived(getBlogTopics(data.posts));
// Prerendered pages cannot read query parameters on the server, so the
// filter applies after hydration and the static HTML lists every post.
let selectedTopics = $state<string[]>([]);
$effect(() => {
	selectedTopics = page.url.searchParams.getAll(topicParam);
});
const posts = $derived(filterByTopics(data.posts, selectedTopics));
markUsed(() => [
	BlogPostList,
	BlogShell,
	siteName,
	siteUrl,
	m,
	data,
	otherLocale,
	pageUrl,
	topics,
	posts,
	blogPath,
	blogRssPath,
	blogTopicPath,
]);
</script>

<svelte:head>
	<title>{m.blog_page_title({}, { locale: data.locale })} | {siteName}</title>
	<meta name="description" content={m.blog_page_description({}, { locale: data.locale })} />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang="de" href={`${siteUrl}${blogPath("de")}`} />
	<link rel="alternate" hreflang="en" href={`${siteUrl}${blogPath("en")}`} />
	<link rel="alternate" hreflang="x-default" href={`${siteUrl}${blogPath("de")}`} />
	<link rel="alternate" type="application/rss+xml" title="RSS" href={blogRssPath(data.locale)} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.blog_page_title({}, { locale: data.locale })} />
	<meta property="og:description" content={m.blog_page_description({}, { locale: data.locale })} />
	<meta property="og:url" content={pageUrl} />
</svelte:head>

<BlogShell
	locale={data.locale}
	currentPath={blogPath(data.locale)}
	alternatePath={blogPath(otherLocale)}
>
	{#snippet children()}
		<header class="mb-12 border-b border-[var(--color-brand-line)] pb-10">
			<p class="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[var(--color-brand-cyan)]">
				{m.blog_kicker({}, { locale: data.locale })}
			</p>
			<h1 class="theme-heading text-5xl sm:text-7xl">{m.nav_blog({}, { locale: data.locale })}</h1>
			<p class="mt-6 text-xl text-[var(--color-brand-muted)]">
				{m.blog_page_description({}, { locale: data.locale })}
			</p>
		</header>

		{#if topics.length > 1}
			<nav class="mb-10" aria-label={m.blog_topics_label({}, { locale: data.locale })}>
				<ul class="flex list-none flex-wrap gap-3 p-0 text-sm">
					<li>
						<a aria-current={selectedTopics.length === 0 ? "page" : undefined} href={blogPath(data.locale)}>
							{m.blog_all_topics({}, { locale: data.locale })}
						</a>
					</li>
					{#each topics as topic}
						<li>
							<a aria-current={selectedTopics.includes(topic) ? "page" : undefined} href={blogTopicPath(data.locale, [topic])}>
								#{topic}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}

		{#if posts.length > 0}
			<BlogPostList locale={data.locale} {posts} showSeries />
		{:else if data.posts.length > 0}
			<p>{m.blog_no_topic_matches({}, { locale: data.locale })}</p>
		{:else}
			<p>{m.blog_empty({}, { locale: data.locale })}</p>
		{/if}
	{/snippet}
</BlogShell>
