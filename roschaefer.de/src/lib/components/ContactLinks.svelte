<script lang="ts">
import { getResume } from "$lib/data/resume";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	locale: Locale;
}

const { locale }: Props = $props();
const basics = $derived(getResume(locale).basics);
markUsed(() => [m, locale, basics]);
</script>

<ul class="flex flex-wrap gap-x-8 gap-y-2 list-none p-0">
	<li>
		{m.contact_email_label({}, { locale })}:
		<a
			class="print-url print-mailto"
			href={`mailto:${basics.email}`}
			data-print-label={basics.email}
		>
			{basics.email}
		</a>
	</li>
	{#if basics.signal}
		<li>
			{m.contact_signal_label({}, { locale })}:
			<a
				class="print-url"
				href={basics.signal}
				data-print-label={m.contact_signal_link_label({}, { locale })}
			>
				{m.contact_signal_link_label({}, { locale })}
			</a>
		</li>
	{/if}
</ul>
