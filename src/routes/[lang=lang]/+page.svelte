<script lang="ts">
import PortfolioPage from "$lib/components/PortfolioPage.svelte";
import { markUsed } from "$lib/utils/mark-used";

const { data } = $props();
markUsed(() => [PortfolioPage, data]);
</script>

<PortfolioPage content={data.content} locale={data.locale} />
