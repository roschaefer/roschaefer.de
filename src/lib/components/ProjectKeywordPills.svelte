<script module lang="ts">
export const projectKeywordPreviewLimit = 8;

export const shouldCollapseKeywordPills = (
	keywordCount: number,
	previewLimit = projectKeywordPreviewLimit,
): boolean => keywordCount > previewLimit + 1;
</script>

<script lang="ts">
import { onMount, tick } from "svelte";
import { skillEntryId } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";

interface Props {
	keywords: string[];
	listId: string;
	locale: Locale;
	visibleSkillIds: Set<string>;
	enhanced?: boolean;
}

let { keywords, listId, locale, visibleSkillIds, enhanced = false }: Props = $props();

let expanded = $state(false);

const collapses = $derived(shouldCollapseKeywordPills(keywords.length));
const isExpanded = $derived(!enhanced || expanded || !collapses);
const visibleKeywords = $derived(
	isExpanded ? keywords : keywords.slice(0, projectKeywordPreviewLimit),
);
const hiddenKeywordCount = $derived(keywords.length - projectKeywordPreviewLimit);

const expand = async () => {
	expanded = true;
	await tick();
	document.getElementById(listId)?.focus({ preventScroll: true });
};

onMount(() => {
	enhanced = true;
});
</script>

<ul
	id={listId}
	data-testid="project-keywords"
	tabindex="-1"
	class="mt-5 flex list-none flex-wrap gap-2 p-0"
>
	{#each visibleKeywords as keyword}
		{@const skillId = skillEntryId(keyword)}
		<li class="rounded-full border border-[var(--color-brand-line)] px-3 py-1 text-sm text-[var(--color-brand-cyan-soft)]">
			{#if visibleSkillIds.has(skillId)}
				<a class="no-underline" href={`#${skillId}`}>{keyword}</a>
			{:else}
				{keyword}
			{/if}
		</li>
	{/each}
	{#if enhanced && collapses && !expanded}
		<li>
			<button
				type="button"
				class="rounded-full border border-dashed border-[var(--color-brand-line)] px-3 py-1 text-sm text-[var(--color-brand-muted)] transition hover:border-[var(--color-brand-cyan)] hover:text-[var(--color-brand-link-hover)] focus-visible:border-[var(--color-brand-cyan)] focus-visible:text-[var(--color-brand-link-hover)]"
				aria-controls={listId}
				aria-expanded="false"
				onclick={expand}
			>
				{m.project_keywords_show_more({ count: hiddenKeywordCount }, { locale })}
			</button>
		</li>
	{/if}
</ul>
