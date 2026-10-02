<script lang="ts">
import WritingShell from "$lib/components/WritingShell.svelte";
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import { markUsed } from "$lib/utils/mark-used";
import { writingPostPath, writingSeriesPath } from "$lib/writing/paths";
import { getWritingPost } from "$lib/writing/posts";

const { data } = $props();
const post = $derived(getWritingPost(data.locale, data.post.slug));
const PostComponent = $derived(post?.component);
const pageUrl = $derived(`${siteUrl}${writingPostPath(data.locale, data.post.slug)}`);
const alternateUrl = $derived(
	`${siteUrl}${writingPostPath(data.translation.locale, data.translation.slug)}`,
);
const dateFormatter = $derived(
	new Intl.DateTimeFormat(data.locale === "de" ? "de-DE" : "en-US", { dateStyle: "long" }),
);
markUsed(() => [
	WritingShell,
	siteImage,
	siteName,
	siteUrl,
	data,
	post,
	PostComponent,
	pageUrl,
	alternateUrl,
	dateFormatter,
	writingPostPath,
	writingSeriesPath,
]);
</script>

<svelte:head>
	<title>{data.post.title} | {siteName}</title>
	<meta name="description" content={data.post.description} />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang={data.locale} href={pageUrl} />
	<link rel="alternate" hreflang={data.translation.locale} href={alternateUrl} />
	<link rel="alternate" hreflang="x-default" href={data.locale === "de" ? pageUrl : alternateUrl} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.post.title} />
	<meta property="og:description" content={data.post.description} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:image" content={siteImage} />
	{#if data.post.publishedAt}<meta property="article:published_time" content={data.post.publishedAt} />{/if}
	{#if data.post.updatedAt}<meta property="article:modified_time" content={data.post.updatedAt} />{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.post.title} />
	<meta name="twitter:description" content={data.post.description} />
	<meta name="twitter:image" content={siteImage} />
</svelte:head>

<WritingShell
	locale={data.locale}
	currentPath={writingPostPath(data.locale, data.post.slug)}
	alternatePath={writingPostPath(data.translation.locale, data.translation.slug)}
>
	{#snippet children()}
		<article>
			<header class="mb-12 border-b border-[var(--color-brand-line)] pb-10">
				<a class="text-sm font-bold uppercase tracking-[0.2em]" href={writingSeriesPath(data.locale, data.series.id)}>
					{data.series.title} · {data.locale === "de" ? "Teil" : "Part"} {data.post.seriesOrder}
				</a>
				{#if data.post.status === "draft"}
					<p class="mt-5 inline-flex rounded-full border border-[var(--color-brand-cyan)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-cyan)]">Draft · local preview</p>
				{/if}
				<h1 class="theme-heading mt-5 text-4xl normal-case tracking-normal sm:text-6xl">{data.post.title}</h1>
				<p class="mt-6 text-xl text-[var(--color-brand-muted)]">{data.post.description}</p>
				{#if data.post.publishedAt}<time class="mt-5 block text-sm text-[var(--color-brand-muted)]" datetime={data.post.publishedAt}>{dateFormatter.format(new Date(`${data.post.publishedAt}T00:00:00Z`))}</time>{/if}
			</header>

			<div class="writing-prose">
				{#if PostComponent}<PostComponent />{/if}
			</div>

			<nav class="mt-16 grid gap-4 border-t border-[var(--color-brand-line)] pt-8 sm:grid-cols-2" aria-label={data.locale === "de" ? "Artikel der Serie" : "Articles in this series"}>
				{#if data.previous}<a class="theme-card rounded-2xl p-5 no-underline" href={writingPostPath(data.locale, data.previous.slug)}><span class="block text-xs uppercase tracking-[0.2em]">← {data.locale === "de" ? "Vorheriger Teil" : "Previous part"}</span><strong class="theme-heading mt-2 block">{data.previous.title}</strong></a>{/if}
				{#if data.next}<a class="theme-card rounded-2xl p-5 text-right no-underline sm:col-start-2" href={writingPostPath(data.locale, data.next.slug)}><span class="block text-xs uppercase tracking-[0.2em]">{data.locale === "de" ? "Nächster Teil" : "Next part"} →</span><strong class="theme-heading mt-2 block">{data.next.title}</strong></a>{/if}
			</nav>
		</article>
	{/snippet}
</WritingShell>
