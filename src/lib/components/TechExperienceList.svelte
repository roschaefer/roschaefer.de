<script lang="ts">
import { onMount, tick } from "svelte";
import { projectEntryId, skillEntryId } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import type { SiteContent } from "$lib/utils/content";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	featured: SiteContent["techExperience"];
	remaining: SiteContent["remainingTechExperience"];
	locale: Locale;
	linkableProjectIds: Set<string>;
	activeAnchorTargetId: string | null;
	expanded?: boolean;
}

let {
	featured,
	remaining,
	locale,
	linkableProjectIds,
	activeAnchorTargetId,
	expanded = $bindable(false),
}: Props = $props();

let enhanced = $state(false);

const collapses = $derived(remaining.length > 0);
const isExpanded = $derived(!enhanced || expanded || !collapses);
const t = (message: (inputs: Record<string, never>, options?: { locale?: Locale }) => string) =>
	message({}, { locale });

const expand = async () => {
	const firstRevealedId = skillEntryId(remaining[0].name);
	expanded = true;
	await tick();
	document.getElementById(firstRevealedId)?.focus({ preventScroll: true });
};

onMount(() => {
	enhanced = true;
});

markUsed(() => [
	featured,
	linkableProjectIds,
	activeAnchorTargetId,
	isExpanded,
	t,
	expand,
	m,
	projectEntryId,
]);
</script>

<ol class="grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
	{#each featured as entry}
		{@render techExperienceCard(entry)}
	{/each}
	{#if isExpanded}
		{#each remaining as entry}
			{@render techExperienceCard(entry)}
		{/each}
	{/if}
	{#if enhanced && collapses && !expanded}
		<li class="contents">
			<button
				type="button"
				class="theme-card col-span-full flex cursor-pointer items-center justify-center rounded-[1.5rem] p-5 text-sm font-semibold text-[var(--color-brand-cyan)]"
				onclick={expand}
			>
				{`${t(m.show_all_technologies)} (${remaining.length})`}
			</button>
		</li>
	{/if}
</ol>

{#snippet techExperienceCard(entry: SiteContent["techExperience"][number])}
	<li
		id={skillEntryId(entry.name)}
		tabindex="-1"
		class="anchor-target-card theme-card scroll-mt-8 rounded-[1.5rem] p-5 transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-cyan)]"
		class:anchor-target-card-active={activeAnchorTargetId === skillEntryId(entry.name)}
	>
		<article>
			<h3 class="theme-heading">{entry.name}</h3>
			<dl class="mt-4 space-y-2 rounded-[1rem] border border-[var(--color-brand-line)] bg-[color:color-mix(in_srgb,var(--color-brand-panel)_76%,transparent)] p-3">
				<div class="flex items-start justify-between gap-4">
					<dt class="pt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-muted)]">
						{t(m.tech_experience_projects)}
					</dt>
					<dd class="text-right text-sm font-semibold leading-tight text-[var(--color-brand-text)]">
						{entry.projectCount}
					</dd>
				</div>
				<div class="flex items-start justify-between gap-4">
					<dt class="pt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-muted)]">
						{t(m.tech_experience_duration)}
					</dt>
					<dd class="text-right text-sm font-semibold leading-tight text-[var(--color-brand-text)]">
						{entry.label}
					</dd>
				</div>
				<div class="flex items-start justify-between gap-4">
					<dt class="pt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-muted)]">
						{t(m.tech_experience_recency)}
					</dt>
					<dd class="text-right text-sm font-semibold leading-tight text-[var(--color-brand-text)]">
						{entry.lastUsedLabel}
					</dd>
				</div>
			</dl>
			<p class="mt-4 text-sm text-[var(--color-brand-muted)]">
				{t(m.used_in)}
				{#each entry.projects.slice(0, 3) as project, index}
					{@const projectId = projectEntryId(project)}
					{#if index > 0}{", "}{/if}{#if linkableProjectIds.has(projectId)}<a
							href={`#${projectId}`}
						>
							{project.name}
						</a>{:else}{project.name}{/if}
				{/each}
				{#if entry.projects.length > 3}
					{" "}{t(m.and_more)}
				{/if}
			</p>
		</article>
	</li>
{/snippet}
