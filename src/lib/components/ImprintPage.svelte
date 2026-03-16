<script lang="ts">
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";

interface Props {
	locale: Locale;
	path: string;
	alternatePath: string;
}

const { locale, path, alternatePath }: Props = $props();
const pageUrl = $derived(`${siteUrl}${path}`);
const alternateUrl = $derived(`${siteUrl}${alternatePath}`);
const ogLocale = $derived(locale === "de" ? "de_DE" : "en_US");
</script>

<svelte:head>
	<title>{m.imprint_page_title({}, { locale })}</title>
	<meta name="description" content={m.imprint_page_description({}, { locale })} />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang={locale} href={pageUrl} />
	<link rel="alternate" hreflang={locale === "de" ? "en" : "de"} href={alternateUrl} />
	<link rel="alternate" hreflang="x-default" href={`${siteUrl}/de/impressum/`} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.imprint_page_title({}, { locale })} />
	<meta property="og:description" content={m.imprint_page_description({}, { locale })} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:image" content={siteImage} />
	<meta property="og:locale" content={ogLocale} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.imprint_page_title({}, { locale })} />
	<meta name="twitter:description" content={m.imprint_page_description({}, { locale })} />
	<meta name="twitter:image" content={siteImage} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-12 sm:px-8">
	<header class="mb-8 space-y-3">
		<p class="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--color-brand-cyan)]">
			{m.imprint_kicker({}, { locale })}
		</p>
		<h1 class="text-white">{m.imprint_title({}, { locale })}</h1>
		<p>{m.imprint_intro({}, { locale })}</p>
	</header>

	<section class="space-y-4">
		<h2 class="text-white">{m.imprint_provider({}, { locale })}</h2>
		<address class="not-italic">
			Robert Schäfer
			<br />
			Unterdorfstrasse 5
			<br />
			53797 Lohmar
			<br />
			{locale === "de" ? "Deutschland" : "Germany"}
		</address>
		<p>
			{m.imprint_email_label({}, { locale })}:
			<a href="mailto:hello@roschaefer.de">hello@roschaefer.de</a>
		</p>
		<p>
			{m.imprint_signal_label({}, { locale })}:
			<a href="https://signal.me/#eu/DI0Crg8ktbRKrFyKqMRVJeMO-ecjH3Xa9I6wu8QWkQRUUzGBm-lPwJh0xlrvFb00">
				{m.imprint_signal_link_label({}, { locale })}
			</a>
		</p>
	</section>
</main>
