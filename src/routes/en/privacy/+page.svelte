<script lang="ts">
import PrivacyPage from "#lib/components/PrivacyPage.svelte";
import { markUsed } from "#lib/utils/mark-used.ts";

markUsed(PrivacyPage);
</script>

<PrivacyPage locale="en" path="/en/privacy/" alternatePath="/de/datenschutz/" />
