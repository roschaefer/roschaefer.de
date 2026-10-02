<script lang="ts">
import WritingPostList from "$lib/components/WritingPostList.svelte";
import WritingShell from "$lib/components/WritingShell.svelte";
import { siteName, siteUrl } from "$lib/config/site";
import * as m from "$lib/paraglide/messages";
import { markUsed } from "$lib/utils/mark-used";
import { writingPath, writingRssPath } from "$lib/writing/paths";

const { data } = $props();
const otherLocale = $derived(data.locale === "de" ? "en" : "de");
const pageUrl = $derived(`${siteUrl}${writingPath(data.locale)}`);
markUsed(() => [
	WritingPostList,
	WritingShell,
	siteName,
	siteUrl,
	m,
	data,
	otherLocale,
	pageUrl,
	writingPath,
	writingRssPath,
]);
</script>

<svelte:head>
	<title>{m.writing_page_title({}, { locale: data.locale })} | {siteName}</title>
	<meta name="description" content={m.writing_page_description({}, { locale: data.locale })} />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang="de" href={`${siteUrl}${writingPath("de")}`} />
	<link rel="alternate" hreflang="en" href={`${siteUrl}/en/writing/`} />
	<link rel="alternate" hreflang="x-default" href={`${siteUrl}${writingPath("de")}`} />
	<link rel="alternate" type="application/rss+xml" title="RSS" href={writingRssPath(data.locale)} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.writing_page_title({}, { locale: data.locale })} />
	<meta property="og:description" content={m.writing_page_description({}, { locale: data.locale })} />
	<meta property="og:url" content={pageUrl} />
</svelte:head>

<WritingShell
	locale={data.locale}
	currentPath={writingPath(data.locale)}
	alternatePath={writingPath(otherLocale)}
>
	{#snippet children()}
		<header class="mb-12 border-b border-[var(--color-brand-line)] pb-10">
			<p class="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[var(--color-brand-cyan)]">
				{m.writing_kicker({}, { locale: data.locale })}
			</p>
			<h1 class="theme-heading text-5xl sm:text-7xl">{m.nav_writing({}, { locale: data.locale })}</h1>
			<p class="mt-6 text-xl text-[var(--color-brand-muted)]">
				{m.writing_page_description({}, { locale: data.locale })}
			</p>
		</header>

		{#if data.posts.length > 0}
			<WritingPostList locale={data.locale} posts={data.posts} />
		{:else}
			<p>{m.writing_empty({}, { locale: data.locale })}</p>
		{/if}
	{/snippet}
</WritingShell>
