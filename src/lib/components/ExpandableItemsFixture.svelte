<script lang="ts">
import ExpandableItems from "$lib/components/ExpandableItems.svelte";
import RevealMoreButton from "$lib/components/RevealMoreButton.svelte";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	items: string[];
	enhanced?: boolean;
	previewLimit?: number;
}

let { items, enhanced = true, previewLimit = 3 }: Props = $props();

markUsed(() => [items, enhanced, previewLimit, ExpandableItems, RevealMoreButton]);
</script>

<span id="expandable-items-fixture" tabindex="-1">
	<ExpandableItems
		{items}
		{previewLimit}
		controls="expandable-items-fixture"
		showMoreLabel="show more"
		{enhanced}
	>
		{#snippet item(item)}
			<span data-testid="fixture-item">{item}</span>
		{/snippet}
		{#snippet revealButton(label, onReveal, controls)}
			<RevealMoreButton {controls} {label} {onReveal} class="fixture-reveal" />
		{/snippet}
	</ExpandableItems>
</span>
