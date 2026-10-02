<script lang="ts">
import type { Locale } from "$lib/i18n";
import { markUsed } from "$lib/utils/mark-used";
import { writingPostPath } from "$lib/writing/paths";
import type { WritingPostSummary } from "$lib/writing/posts";

interface Props {
	locale: Locale;
	posts: WritingPostSummary[];
	showSeriesPosition?: boolean;
}

const { locale, posts, showSeriesPosition = false }: Props = $props();
const dateFormatter = $derived(
	new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}),
);

markUsed(() => [locale, posts, showSeriesPosition, dateFormatter, writingPostPath]);
</script>

<ol class="grid list-none gap-6 p-0">
	{#each posts as post}
		<li class="theme-card rounded-[1.5rem] p-6">
			<div class="mb-3 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-muted)]">
				{#if post.status === "draft"}<span class="text-[var(--color-brand-cyan)]">Draft</span>{/if}
				{#if showSeriesPosition}<span>{locale === "de" ? "Teil" : "Part"} {post.seriesOrder}</span>{/if}
				{#if post.publishedAt}<time datetime={post.publishedAt}>{dateFormatter.format(new Date(`${post.publishedAt}T00:00:00Z`))}</time>{/if}
			</div>
			<h2 class="theme-heading text-2xl normal-case tracking-normal">
				<a class="no-underline" href={writingPostPath(locale, post.series, post.slug)}>{post.title}</a>
			</h2>
			<p class="mt-3 text-[var(--color-brand-muted)]">{post.description}</p>
		</li>
	{/each}
</ol>
