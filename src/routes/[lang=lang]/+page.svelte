<script lang="ts">
import PortfolioPage from "$lib/components/PortfolioPage.svelte";

const { data } = $props();
</script>

<PortfolioPage content={data.content} locale={data.locale} />
