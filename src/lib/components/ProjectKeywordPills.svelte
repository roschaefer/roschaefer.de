<script module lang="ts">
import { shouldCollapseItems } from "$lib/components/ExpandableItems.svelte";

export const projectKeywordPreviewLimit = 8;
export const shouldCollapseKeywordPills = (
	keywordCount: number,
	previewLimit = projectKeywordPreviewLimit,
): boolean => shouldCollapseItems(keywordCount, previewLimit);
</script>

<script lang="ts">
import ExpandableItems from "$lib/components/ExpandableItems.svelte";
import RevealMoreButton from "$lib/components/RevealMoreButton.svelte";
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
const hiddenKeywordCount = $derived(keywords.length - projectKeywordPreviewLimit);
</script>

<ul
	id={listId}
	data-testid="project-keywords"
	tabindex="-1"
	class="mt-5 flex list-none flex-wrap gap-2 p-0"
>
	<ExpandableItems
		items={keywords}
		previewLimit={projectKeywordPreviewLimit}
		controls={listId}
		showMoreLabel={m.project_keywords_show_more({ count: hiddenKeywordCount }, { locale })}
		{enhanced}
	>
		{#snippet item(keyword)}
			{@const skillId = skillEntryId(String(keyword))}
			<li class="rounded-full border border-[var(--color-brand-line)] px-3 py-1 text-sm text-[var(--color-brand-cyan-soft)]">
				{#if visibleSkillIds.has(skillId)}
					<a class="no-underline" href={`#${skillId}`}>{keyword}</a>
				{:else}
					{keyword}
				{/if}
			</li>
		{/snippet}
		{#snippet revealButton(label, onReveal, controls)}
			<li>
				<RevealMoreButton
					{controls}
					{label}
					{onReveal}
					class="rounded-full border border-dashed border-[var(--color-brand-line)] px-3 py-1 text-sm text-[var(--color-brand-muted)] transition hover:border-[var(--color-brand-cyan)] hover:text-[var(--color-brand-cyan-soft)] focus-visible:border-[var(--color-brand-cyan)] focus-visible:text-[var(--color-brand-cyan-soft)]"
				/>
			</li>
		{/snippet}
	</ExpandableItems>
</ul>
