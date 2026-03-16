<script lang="ts">
import ImprintPage from "$lib/components/ImprintPage.svelte";
import { markUsed } from "$lib/utils/mark-used";

markUsed(ImprintPage);
</script>

<ImprintPage locale="en" path="/en/imprint/" alternatePath="/de/impressum/" />
