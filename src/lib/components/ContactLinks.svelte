<script lang="ts">
import { contactEmail, signalLink } from "$lib/config/site";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	locale: Locale;
}

const { locale }: Props = $props();
markUsed(() => [m, locale, contactEmail, signalLink]);
</script>

<ul class="flex flex-wrap gap-x-8 gap-y-2 list-none p-0">
	<li>
		{m.contact_email_label({}, { locale })}:
		<a
			class="print-url print-mailto"
			href={`mailto:${contactEmail}`}
			data-print-label={contactEmail}
		>
			{contactEmail}
		</a>
	</li>
	<li>
		{m.contact_signal_label({}, { locale })}:
		<a class="print-url" href={signalLink} data-print-label={m.contact_signal_link_label({}, { locale })}>
			{m.contact_signal_link_label({}, { locale })}
		</a>
	</li>
</ul>
