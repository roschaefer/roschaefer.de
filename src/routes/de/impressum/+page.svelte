<script lang="ts">
import ImprintPage from "#lib/components/ImprintPage.svelte";
import { markUsed } from "#lib/utils/mark-used.ts";

markUsed(ImprintPage);
</script>

<ImprintPage locale="de" path="/de/impressum/" alternatePath="/en/imprint/" />
