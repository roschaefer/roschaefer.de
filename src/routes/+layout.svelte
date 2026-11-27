<script lang="ts">
import { onMount } from "svelte";
import { siteUrl } from "#lib/config/site.ts";
import { afterNavigate } from "$app/navigation";
import "../app.css";

type GoatCounter = { count: (opts: { path: string }) => void };

const productionHostname = new URL(siteUrl).hostname;

afterNavigate(({ from }) => {
	if (from !== null) {
		(window as { goatcounter?: GoatCounter }).goatcounter?.count({
			path: location.pathname + location.search + location.hash,
		});
	}
});

onMount(() => {
	if (window.location.hostname === productionHostname) {
		const script = document.createElement("script");
		script.setAttribute("data-goatcounter", "/gc/count");
		script.src = "/gc/count.js";
		document.head.appendChild(script);
	}

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
