<script lang="ts">
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	controls: string;
	label: string;
	onReveal: () => void;
	class?: string;
}

let { controls, label, onReveal, class: className = "" }: Props = $props();

markUsed(() => [controls, label, onReveal, className]);
</script>

<button
	type="button"
	class={className}
	aria-controls={controls}
	aria-expanded="false"
	onclick={onReveal}
>
	{label}
</button>
