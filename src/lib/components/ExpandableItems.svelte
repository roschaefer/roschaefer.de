<script module lang="ts">
export const shouldCollapseItems = (itemCount: number, previewLimit: number): boolean =>
	itemCount > previewLimit + 1;
</script>

<script lang="ts">
import { onMount, tick, type Snippet } from "svelte";
import RevealMoreButton from "$lib/components/RevealMoreButton.svelte";

interface Props {
	items: unknown[];
	previewLimit: number;
	controls: string;
	showMoreLabel: string;
	focusTargetId?: string;
	enhanced?: boolean;
	item: Snippet<[unknown, number]>;
	revealButton?: Snippet<[string, () => void, string]>;
}

let {
	items,
	previewLimit,
	controls,
	showMoreLabel,
	focusTargetId = controls,
	enhanced = false,
	item,
	revealButton,
}: Props = $props();

let expanded = $state(false);

const collapses = $derived(shouldCollapseItems(items.length, previewLimit));
const isExpanded = $derived(!enhanced || expanded || !collapses);
const visibleItems = $derived(isExpanded ? items : items.slice(0, previewLimit));

const expand = async () => {
	expanded = true;
	await tick();
	document.getElementById(focusTargetId)?.focus({ preventScroll: true });
};

onMount(() => {
	enhanced = true;
});
</script>

{#each visibleItems as visibleItem, index}
	{@render item(visibleItem, index)}
{/each}
{#if enhanced && collapses && !expanded}
	{#if revealButton}
		{@render revealButton(showMoreLabel, expand, controls)}
	{:else}
		<RevealMoreButton controls={controls} label={showMoreLabel} onReveal={expand} />
	{/if}
{/if}
