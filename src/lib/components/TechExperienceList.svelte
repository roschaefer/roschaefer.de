<script lang="ts">
import { onMount, tick } from "svelte";
import SkillProjectMentions from "$lib/components/SkillProjectMentions.svelte";
import { projectEntryId, skillEntryId } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import type { SiteContent } from "$lib/utils/content";
import { markUsed } from "$lib/utils/mark-used";

type Entry = SiteContent["techExperience"][number];
type SortKey = "name" | "totalMonths" | "projectCount" | "lastUsedMonth";

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
// Default to sorting by recency (descending) so the sort affordance is visible
// immediately, instead of landing on an ambiguous "no column is active" state.
let sortKey = $state<SortKey>("lastUsedMonth");
let sortDir = $state<"asc" | "desc">("desc");

const visibleCount = $derived(featured.length);
const allEntries = $derived([...featured, ...remaining]);
const sortedEntries = $derived.by(() => {
	const key = sortKey;
	const dir = sortDir === "asc" ? 1 : -1;
	return [...allEntries].sort((left, right) => {
		const primary = key === "name" ? left.name.localeCompare(right.name) : left[key] - right[key];
		if (primary !== 0) return dir * primary;
		// Ties (e.g. many entries share "active in current work") fall back to the
		// same blended relevance score used for the default ranking, so the order
		// within a tie is meaningful rather than arbitrary insertion order.
		return right.score - left.score || left.name.localeCompare(right.name);
	});
});
const hiddenCount = $derived(sortedEntries.length - visibleCount);
const collapses = $derived(hiddenCount > 0);
const isExpanded = $derived(!enhanced || expanded || !collapses);
const visibleEntries = $derived(isExpanded ? sortedEntries : sortedEntries.slice(0, visibleCount));

// PortfolioPage hands over a hash target as soon as it's known valid, before
// knowing whether the *current* sort hides it - only this list knows that, so
// it decides here whether to expand rather than trusting a static partition
// computed against the default sort.
$effect(() => {
	if (!enhanced || !activeAnchorTargetId) {
		return;
	}
	const isHiddenUnderCurrentSort = sortedEntries
		.slice(visibleCount)
		.some((entry) => skillEntryId(entry.name) === activeAnchorTargetId);
	if (isHiddenUnderCurrentSort) {
		expanded = true;
	}
});

const t = (message: (inputs: Record<string, never>, options?: { locale?: Locale }) => string) =>
	message({}, { locale });
const skillProjectListId = (skillName: string) => `${skillEntryId(skillName)}-projects`;

// Below `sm`, the table collapses to one stacked card per row (CSS-only, via
// max-sm: variants) - these labels reappear as data-label/::before content on
// each cell there, since the header row itself is hidden at that width.
const durationLabel = $derived(t(m.tech_experience_duration));
const projectsLabel = $derived(t(m.tech_experience_projects));
const recencyLabel = $derived(t(m.tech_experience_recency));

// The desktop header exposes sort direction to screen readers via aria-sort
// on each <th> - the mobile pills aren't columnheaders, so the direction has
// to be spelled out in their accessible name instead of relying on the
// (aria-hidden) arrow glyph alone.
const sortDirectionLabel = $derived(
	sortDir === "asc" ? t(m.tech_experience_sort_ascending) : t(m.tech_experience_sort_descending),
);

// On mobile the inline, comma-separated project list wrapped awkwardly next
// to other fields - instead show just the count as a native <details> toggle
// that reveals the full list on tap, no separate truncation logic needed.
const projectCountLabel = (count: number): string =>
	locale === "de"
		? `${count} ${count === 1 ? "Projekt" : "Projekte"}`
		: `${count} ${count === 1 ? "project" : "projects"}`;

const toggleSort = (key: SortKey) => {
	if (sortKey === key) {
		sortDir = sortDir === "desc" ? "asc" : "desc";
	} else {
		sortKey = key;
		sortDir = key === "name" ? "asc" : "desc";
	}
};

const ariaSortFor = (key: SortKey): "ascending" | "descending" | "none" =>
	sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none";

const rowClass = (entry: Entry) =>
	[
		"scroll-mt-8 border-b border-[var(--color-brand-line)] motion-safe:transition motion-safe:duration-300 sm:last:border-b-0",
		"focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-cyan)]",
		// Below sm, each row becomes its own bordered card (border-b above supplies
		// the bottom edge already, so only the other three sides are added here).
		"max-sm:mb-3 max-sm:block max-sm:rounded-[1rem] max-sm:border-t max-sm:border-x max-sm:border-[var(--color-brand-line)] max-sm:p-3 max-sm:last:mb-0",
		activeAnchorTargetId === skillEntryId(entry.name)
			? "bg-[color:color-mix(in_srgb,var(--color-brand-cyan)_14%,transparent)]"
			: "",
	].join(" ");

const expand = async () => {
	const firstRevealedId = skillEntryId(sortedEntries[visibleCount].name);
	expanded = true;
	await tick();
	document.getElementById(firstRevealedId)?.focus({ preventScroll: true });
};

let cardContainer = $state<HTMLDivElement | undefined>();

const scrollBehavior = (): ScrollBehavior =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const collapse = async () => {
	expanded = false;
	// Rows 11+ vanish above the fold, so without this the viewport is left
	// wherever it happened to be scrolled - usually past the end of the
	// now-much-shorter table. Bring the card's bottom edge back to the bottom
	// of the screen instead, so the whole collapsed list is visible above it.
	await tick();
	cardContainer?.scrollIntoView({ block: "end", behavior: scrollBehavior() });
};

onMount(() => {
	enhanced = true;
});

markUsed(() => [
	linkableProjectIds,
	visibleEntries,
	t,
	expand,
	collapse,
	m,
	skillProjectListId,
	SkillProjectMentions,
	toggleSort,
	ariaSortFor,
	rowClass,
	durationLabel,
	projectsLabel,
	recencyLabel,
	sortDirectionLabel,
	projectCountLabel,
	projectEntryId,
]);
</script>

{#snippet sortButton(key: SortKey, label: string)}
	{#if enhanced}
		<button
			type="button"
			class="hidden w-full cursor-pointer text-left text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-cyan)] focus-visible:text-[var(--color-brand-cyan)] sm:block"
			onclick={() => toggleSort(key)}
		>
			{label}
			{#if sortKey === key}
				<span aria-hidden="true" class="text-[var(--color-brand-cyan)]">
					{sortDir === "asc" ? "▲" : "▼"}
				</span>
			{/if}
		</button>
		<!-- Below sm, the mobile pill toolbar is the only interactive sort control -
		     this stays a plain label so the column header text survives for
		     assistive tech without adding a second, hidden-but-focusable button. -->
		<span class="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-muted)] sm:hidden">
			{label}
		</span>
	{:else}
		<span class="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-muted)]">
			{label}
		</span>
	{/if}
{/snippet}

{#snippet mobileSortPill(key: SortKey, label: string)}
	<button
		type="button"
		class="cursor-pointer rounded-full border border-[var(--color-brand-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-muted)] aria-pressed:border-[var(--color-brand-cyan)] aria-pressed:text-[var(--color-brand-cyan)]"
		aria-pressed={sortKey === key}
		aria-label={sortKey === key ? `${label}, ${sortDirectionLabel}` : label}
		onclick={() => toggleSort(key)}
	>
		{label}
		{#if sortKey === key}
			<span aria-hidden="true">{sortDir === "asc" ? "▲" : "▼"}</span>
		{/if}
	</button>
{/snippet}

<div bind:this={cardContainer} class="theme-card overflow-x-auto rounded-[1.5rem] p-2 sm:p-4">
	{#if enhanced}
		<div
			class="mb-3 flex flex-wrap gap-2 sm:hidden"
			role="group"
			aria-label={t(m.tech_experience_sort_label)}
		>
			{@render mobileSortPill("name", t(m.tech_experience_name))}
			{@render mobileSortPill("totalMonths", t(m.tech_experience_duration))}
			{@render mobileSortPill("projectCount", t(m.tech_experience_projects))}
			{@render mobileSortPill("lastUsedMonth", t(m.tech_experience_recency))}
		</div>
	{/if}
	<table class="w-full min-w-[36rem] max-sm:block max-sm:min-w-0 table-fixed border-collapse text-left text-sm">
		<colgroup>
			<col class="w-[16%]" />
			<col class="w-[14%]" />
			<col />
			<col class="w-[22%]" />
		</colgroup>
		<thead class="max-sm:sr-only">
			<tr class="border-b border-[var(--color-brand-line)]">
				<th scope="col" class="p-3" aria-sort={ariaSortFor("name")}>
					{@render sortButton("name", t(m.tech_experience_name))}
				</th>
				<th scope="col" class="p-3" aria-sort={ariaSortFor("totalMonths")}>
					{@render sortButton("totalMonths", t(m.tech_experience_duration))}
				</th>
				<th scope="col" class="p-3" aria-sort={ariaSortFor("projectCount")}>
					{@render sortButton("projectCount", t(m.tech_experience_projects))}
				</th>
				<th scope="col" class="p-3" aria-sort={ariaSortFor("lastUsedMonth")}>
					{@render sortButton("lastUsedMonth", t(m.tech_experience_recency))}
				</th>
			</tr>
		</thead>
		<tbody class="max-sm:block">
			{#each visibleEntries as entry (entry.name)}
				<tr id={skillEntryId(entry.name)} tabindex="-1" class={rowClass(entry)}>
					<th
						scope="row"
						class="theme-heading p-3 font-semibold max-sm:block max-sm:px-0 max-sm:pt-0 max-sm:pb-2 max-sm:text-base"
					>
						{entry.name}
					</th>
					<td
						data-label={durationLabel}
						class="p-3 whitespace-nowrap text-[var(--color-brand-text)] max-sm:block max-sm:whitespace-normal max-sm:px-0 max-sm:py-1.5 max-sm:before:mb-0.5 max-sm:before:block max-sm:before:text-[0.65rem] max-sm:before:font-semibold max-sm:before:uppercase max-sm:before:tracking-[0.18em] max-sm:before:text-[var(--color-brand-muted)] max-sm:before:content-[attr(data-label)]"
					>
						{entry.label}
					</td>
					<td
						data-label={projectsLabel}
						class="p-3 text-[var(--color-brand-text)] max-sm:block max-sm:px-0 max-sm:py-1.5 max-sm:before:mb-0.5 max-sm:before:block max-sm:before:text-[0.65rem] max-sm:before:font-semibold max-sm:before:uppercase max-sm:before:tracking-[0.18em] max-sm:before:text-[var(--color-brand-muted)] max-sm:before:content-[attr(data-label)]"
					>
						<span class="max-sm:hidden">
							<span class="tabular-nums text-[var(--color-brand-muted)]">{entry.projectCount}</span>
							<span aria-hidden="true"> · </span>
							<SkillProjectMentions
								projects={entry.projects}
								listId={skillProjectListId(entry.name)}
								{locale}
								{linkableProjectIds}
							/>
						</span>
						<details class="hidden max-sm:block">
							<summary class="cursor-pointer text-[var(--color-brand-text)] marker:text-[var(--color-brand-cyan)]">
								{projectCountLabel(entry.projectCount)}
							</summary>
							<ul class="mt-2 list-none space-y-1 p-0 pl-1 text-sm">
								{#each entry.projects as project}
									<li>
										{#if linkableProjectIds.has(projectEntryId(project))}
											<a href={`#${projectEntryId(project)}`}>{project.name}</a>
										{:else}
											{project.name}
										{/if}
									</li>
								{/each}
							</ul>
						</details>
					</td>
					<td
						data-label={recencyLabel}
						class="p-3 whitespace-nowrap text-[var(--color-brand-text)] max-sm:block max-sm:whitespace-normal max-sm:px-0 max-sm:py-1.5 max-sm:before:mb-0.5 max-sm:before:block max-sm:before:text-[0.65rem] max-sm:before:font-semibold max-sm:before:uppercase max-sm:before:tracking-[0.18em] max-sm:before:text-[var(--color-brand-muted)] max-sm:before:content-[attr(data-label)]"
					>
						{entry.lastUsedLabel}
					</td>
				</tr>
			{/each}
		</tbody>
		{#if enhanced && collapses}
			<tfoot class="max-sm:block">
				<tr class="max-sm:block">
					<td colspan="4" class="p-3 text-center max-sm:block">
						<button
							type="button"
							class="cursor-pointer text-sm font-semibold text-[var(--color-brand-cyan)]"
							onclick={expanded ? collapse : expand}
						>
							{expanded
								? t(m.show_fewer_technologies)
								: `${t(m.show_all_technologies)} (${hiddenCount})`}
						</button>
					</td>
				</tr>
			</tfoot>
		{/if}
	</table>
</div>
