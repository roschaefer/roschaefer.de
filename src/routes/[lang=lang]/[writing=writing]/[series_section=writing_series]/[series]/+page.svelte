<script lang="ts">
import WritingPostList from "$lib/components/WritingPostList.svelte";
import WritingShell from "$lib/components/WritingShell.svelte";
import { siteName, siteUrl } from "$lib/config/site";
import { markUsed } from "$lib/utils/mark-used";
import { writingSeriesPath } from "$lib/writing/paths";

const { data } = $props();
const otherLocale = $derived(data.locale === "de" ? "en" : "de");
const pageUrl = $derived(`${siteUrl}${writingSeriesPath(data.locale, data.series.id)}`);
markUsed(() => [WritingPostList, WritingShell, siteName, siteUrl, data, otherLocale, pageUrl]);
</script>

<svelte:head>
	<title>{data.series.title} | {siteName}</title>
	<meta name="description" content={data.series.description} />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang="de" href={`${siteUrl}${writingSeriesPath("de", data.series.id)}`} />
	<link rel="alternate" hreflang="en" href={`${siteUrl}${writingSeriesPath("en", data.series.id)}`} />
	<link rel="alternate" hreflang="x-default" href={`${siteUrl}${writingSeriesPath("de", data.series.id)}`} />
</svelte:head>

<WritingShell
	locale={data.locale}
	currentPath={writingSeriesPath(data.locale, data.series.id)}
	alternatePath={writingSeriesPath(otherLocale, data.series.id)}
>
	{#snippet children()}
		<header class="mb-12 border-b border-[var(--color-brand-line)] pb-10">
			<p class="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[var(--color-brand-cyan)]">{data.locale === "de" ? "Serie" : "Series"}</p>
			<h1 class="theme-heading text-4xl normal-case tracking-normal sm:text-6xl">{data.series.title}</h1>
			<p class="mt-6 text-xl text-[var(--color-brand-muted)]">{data.series.description}</p>
		</header>
		<WritingPostList locale={data.locale} posts={data.posts} showSeriesPosition />
	{/snippet}
</WritingShell>
