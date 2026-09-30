<script lang="ts">
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	class?: string;
}

const { class: className = "h-4 w-4" }: Props = $props();

markUsed(() => [className]);
</script>

<svg
	viewBox="0 0 24 24"
	class={`${className} fill-none stroke-current`}
	stroke-width="1.7"
	aria-hidden="true"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		d="M12 7.5h6.75a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5.25A1.5 1.5 0 0 1 3.75 18v-9a1.5 1.5 0 0 1 1.5-1.5H12Zm0 0V4.5A1.5 1.5 0 0 1 13.5 3h4.5A1.5 1.5 0 0 1 19.5 4.5v3.75"
	/>
	<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 10.5h6M6.75 13.5h6M6.75 16.5h3" />
</svg>
