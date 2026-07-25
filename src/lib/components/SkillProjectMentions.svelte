<script module lang="ts">
export const skillProjectPreviewLimit = 3;

export const shouldCollapseSkillProjects = (
	projectCount: number,
	previewLimit = skillProjectPreviewLimit,
): boolean => projectCount > previewLimit + 1;
</script>

<script lang="ts">
import { onMount, tick } from "svelte";
import { projectEntryId } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import type { SiteContent } from "$lib/utils/content";

interface Props {
	projects: SiteContent["techExperience"][number]["projects"];
	listId: string;
	locale: Locale;
	linkableProjectIds: Set<string>;
	enhanced?: boolean;
}

let { projects, listId, locale, linkableProjectIds, enhanced = false }: Props = $props();

let expanded = $state(false);

const collapses = $derived(shouldCollapseSkillProjects(projects.length));
const isExpanded = $derived(!enhanced || expanded || !collapses);
const visibleProjects = $derived(
	isExpanded ? projects : projects.slice(0, skillProjectPreviewLimit),
);
const firstRevealedId = $derived(`${listId}-reveal-target`);

const expand = async () => {
	expanded = true;
	await tick();
	document.getElementById(firstRevealedId)?.focus({ preventScroll: true });
};

onMount(() => {
	enhanced = true;
});
</script>

<span id={listId}>
	{#each visibleProjects as project, index}
		{@const projectId = projectEntryId(project)}
		{@const isFirstRevealed = index === skillProjectPreviewLimit}
		{#if index > 0}{", "}{/if}<span
			id={isFirstRevealed ? firstRevealedId : undefined}
			tabindex="-1"
			class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-cyan)]"
			>{#if linkableProjectIds.has(projectId)}<a href={`#${projectId}`}>{project.name}</a
				>{:else}{project.name}{/if}</span
		>
	{/each}
	{#if enhanced && collapses && !expanded}
		{" "}<button
			type="button"
			class="border-0 bg-transparent p-0 text-inherit underline decoration-dotted decoration-[var(--color-brand-line)] decoration-1 underline-offset-4 transition hover:text-[var(--color-brand-cyan-soft)] hover:decoration-[var(--color-brand-cyan)] focus-visible:text-[var(--color-brand-cyan-soft)] focus-visible:decoration-[var(--color-brand-cyan)]"
			aria-controls={listId}
			aria-expanded="false"
			onclick={expand}
		>
			{m.and_more({}, { locale })}
		</button>
	{/if}
</span>
