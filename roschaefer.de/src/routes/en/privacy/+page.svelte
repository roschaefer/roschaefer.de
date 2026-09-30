<script lang="ts">
import PrivacyPage from "$lib/components/PrivacyPage.svelte";
import { markUsed } from "$lib/utils/mark-used";

markUsed(PrivacyPage);
</script>

<PrivacyPage locale="en" path="/en/privacy/" alternatePath="/de/datenschutz/" />
