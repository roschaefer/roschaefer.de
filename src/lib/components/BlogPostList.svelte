<script lang="ts">
import { blogPostPath, blogSeriesPath, blogTopicPath } from "$lib/blog/paths";
import type { BlogPostSummary } from "$lib/blog/posts";
import { getBlogSeries } from "$lib/blog/series";
import type { Locale } from "$lib/i18n";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	locale: Locale;
	posts: BlogPostSummary[];
	showSeries?: boolean;
	showSeriesPosition?: boolean;
}

const { locale, posts, showSeries = false, showSeriesPosition = false }: Props = $props();
const dateFormatter = $derived(
	new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}),
);

markUsed(() => [
	locale,
	posts,
	showSeries,
	showSeriesPosition,
	dateFormatter,
	getBlogSeries,
	blogPostPath,
	blogSeriesPath,
	blogTopicPath,
]);
</script>

<ol class="grid list-none gap-6 p-0">
	{#each posts as post}
		<li class="theme-card rounded-[1.5rem] p-6">
			<div class="mb-3 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-muted)]">
				{#if post.status === "draft"}<span class="text-[var(--color-brand-cyan)]">Draft</span>{/if}
				{#if showSeries}
					<span>
						{locale === "de" ? "Serie" : "Series"}:
						<a href={blogSeriesPath(locale, post.series)}>{getBlogSeries(post.series)?.title[locale]}</a>
					</span>
				{/if}
				{#if showSeriesPosition}<span>{locale === "de" ? "Teil" : "Part"} {post.seriesOrder}</span>{/if}
				{#if post.publishedAt}<time datetime={post.publishedAt}>{dateFormatter.format(new Date(`${post.publishedAt}T00:00:00Z`))}</time>{/if}
				{#if post.updatedAt}
					<span>
						{locale === "de" ? "Bearbeitet" : "Edited"}
						<time datetime={post.updatedAt}>{dateFormatter.format(new Date(`${post.updatedAt}T00:00:00Z`))}</time>
					</span>
				{/if}
			</div>
			<h2 class="theme-heading text-2xl normal-case tracking-normal">
				<a class="no-underline" href={blogPostPath(locale, post.slug)}>{post.title}</a>
			</h2>
			<p class="mt-3 text-[var(--color-brand-muted)]">{post.description}</p>
			<ul class="mt-4 flex list-none flex-wrap gap-3 p-0 text-sm" aria-label={locale === "de" ? "Themen" : "Topics"}>
				{#each post.topics as topic}
					<li><a href={blogTopicPath(locale, [topic])}>#{topic}</a></li>
				{/each}
			</ul>
		</li>
	{/each}
</ol>
