<script lang="ts">
import RedactedClientPage from "$lib/components/RedactedClientPage.svelte";
import { markUsed } from "$lib/utils/mark-used";

markUsed(RedactedClientPage);
</script>

<RedactedClientPage locale="en" path="/en/on-request/" alternatePath="/de/auf-anfrage/" />
