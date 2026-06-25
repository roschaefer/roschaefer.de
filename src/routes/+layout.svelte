<script lang="ts">
import { onMount } from "svelte";
import { afterNavigate } from "$app/navigation";
import "../app.css";

type GoatCounter = { count: (opts: { path: string }) => void };

afterNavigate(({ from }) => {
	if (from !== null) {
		(window as { goatcounter?: GoatCounter }).goatcounter?.count({
			path: location.pathname + location.search + location.hash,
		});
	}
});

onMount(() => {
	function onHashChange() {
		(window as { goatcounter?: GoatCounter }).goatcounter?.count({
			path: location.pathname + location.search + location.hash,
		});
	}
	window.addEventListener("hashchange", onHashChange);
	return () => window.removeEventListener("hashchange", onHashChange);
});
</script>

<slot />
