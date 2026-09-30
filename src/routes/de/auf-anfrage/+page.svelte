<script lang="ts">
import RedactedClientPage from "$lib/components/RedactedClientPage.svelte";
import { markUsed } from "$lib/utils/mark-used";

markUsed(RedactedClientPage);
</script>

<RedactedClientPage locale="de" path="/de/auf-anfrage/" alternatePath="/en/on-request/" />
