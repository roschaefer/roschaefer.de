<script lang="ts">
import { onMount, tick } from "svelte";
import NewspaperIcon from "$lib/components/NewspaperIcon.svelte";
import ProjectKeywordPills from "$lib/components/ProjectKeywordPills.svelte";
import { pressEntryId, projectEntryId } from "$lib/data/resume";
import { printLinkLabel } from "$lib/data/short-links";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import type { SiteContent } from "$lib/utils/content";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	featured:
		| SiteContent["featuredProjects"]
		| SiteContent["mentoringProjects"]
		| SiteContent["volunteeringProjects"];
	remaining: SiteContent["remainingProjects"] | SiteContent["remainingMentoringProjects"];
	locale: Locale;
	linkableSkillIds: Set<string>;
	activeAnchorTargetId: string | null;
	showAllLabel?: string;
	expanded?: boolean;
}

let {
	featured,
	remaining,
	locale,
	linkableSkillIds,
	activeAnchorTargetId,
	showAllLabel,
	expanded = $bindable(false),
}: Props = $props();

let enhanced = $state(false);

const collapses = $derived(remaining.length > 0);
const isExpanded = $derived(!enhanced || expanded || !collapses);
const redactedClientPath = $derived(locale === "de" ? "/de/auf-anfrage/" : "/en/on-request/");
const t = (message: (inputs: Record<string, never>, options?: { locale?: Locale }) => string) =>
	message({}, { locale });
type ProjectListEntry = Props["featured"][number] | Props["remaining"][number];

const projectKeywordListId = (project: ProjectListEntry, index: number) =>
	`project-keywords-${project.id ?? `${project.name}-${project.startDate}-${index}`}`;

const expand = async () => {
	const firstRevealedId = projectEntryId(remaining[0]);
	expanded = true;
	await tick();
	document.getElementById(firstRevealedId)?.focus({ preventScroll: true });
};

onMount(() => {
	enhanced = true;
});

markUsed(() => [
	featured,
	linkableSkillIds,
	activeAnchorTargetId,
	isExpanded,
	redactedClientPath,
	t,
	projectKeywordListId,
	expand,
	showAllLabel,
	ProjectKeywordPills,
	NewspaperIcon,
	pressEntryId,
	printLinkLabel,
	m,
]);
</script>

<div class="grid gap-6 lg:grid-cols-2">
	{#each featured as project, index}
		{@render projectCard(project, index)}
	{/each}
	{#if isExpanded}
		{#each remaining as project, index}
			{@render projectCard(project, featured.length + index)}
		{/each}
	{/if}
	{#if enhanced && collapses && !expanded}
		<button
			type="button"
			class="theme-card col-span-full flex cursor-pointer items-center justify-center rounded-[1.75rem] p-6 text-sm font-semibold text-[var(--color-brand-cyan)]"
			onclick={expand}
		>
			{`${showAllLabel ?? t(m.show_all_projects)} (${remaining.length})`}
		</button>
	{/if}
</div>

{#snippet projectCard(project: ProjectListEntry, projectIndex: number)}
	{@const keywordListId = projectKeywordListId(project, projectIndex)}
	{@const projectKeywords = project.keywords ?? []}
	{@const pressLinks = (project.links ?? []).filter((link) => link.kind === "press")}
	<article
		id={projectEntryId(project)}
		tabindex="-1"
		class="anchor-target-card theme-card scroll-mt-8 rounded-[1.75rem] p-6 transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-cyan)]"
		class:anchor-target-card-active={activeAnchorTargetId === projectEntryId(project)}
	>
		<header class="space-y-3">
			<p class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
				{project.roles?.join(", ") ?? t(m.project_fallback)}
			</p>
			{#if project.redacted}
				<h3 class="theme-heading">
					<a class="no-underline" href={redactedClientPath} aria-label={t(m.redacted_link_label)}>
						{project.entity}
					</a>
				</h3>
			{:else}
				<h3 class="theme-heading">{project.entity ?? t(m.independent)}</h3>
			{/if}
			<p class="text-sm font-semibold text-[var(--color-brand-text)]">
				{#if project.url}
					<a
						class="print-url no-underline"
						href={project.url}
						data-print-label={printLinkLabel(project.url)}
					>
						{project.name}
					</a>
				{:else}
					{project.name}
				{/if}
			</p>
			<p class="text-sm text-[var(--color-brand-muted)]">
				{project.startDate}
				{#if project.endDate}
					- {project.endDate}
				{:else}
					- {t(m.present)}
				{/if}
			</p>
		</header>
		{#if project.description}
			<p class="mt-4 text-[var(--color-brand-text)]">{project.description}</p>
		{/if}
		{#if projectKeywords.length}
			<ProjectKeywordPills
				keywords={projectKeywords}
				listId={keywordListId}
				{locale}
				visibleSkillIds={linkableSkillIds}
			/>
		{/if}
		{#if pressLinks.length}
			<a
				href={`#${pressEntryId(project)}`}
				class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-line)] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[var(--color-brand-cyan-soft)] no-underline transition hover:border-[var(--color-brand-cyan)]"
			>
				<NewspaperIcon class="h-3.5 w-3.5 shrink-0" />
				{t(m.press_coverage_label)} ({pressLinks.length})
			</a>
		{/if}
	</article>
{/snippet}
