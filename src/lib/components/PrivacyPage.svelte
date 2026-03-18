<script lang="ts">
import ThemeToggle from "$lib/components/ThemeToggle.svelte";
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	locale: Locale;
	path: string;
	alternatePath: string;
}

const { locale, path, alternatePath }: Props = $props();
const pageUrl = $derived(`${siteUrl}${path}`);
const alternateUrl = $derived(`${siteUrl}${alternatePath}`);
const ogLocale = $derived(locale === "de" ? "de_DE" : "en_US");
markUsed(() => [siteImage, siteName, siteUrl, m, pageUrl, alternateUrl, ogLocale, ThemeToggle]);
</script>

<svelte:head>
	<title>{m.privacy_page_title({}, { locale })}</title>
	<meta name="description" content={m.privacy_page_description({}, { locale })} />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang={locale} href={pageUrl} />
	<link rel="alternate" hreflang={locale === "de" ? "en" : "de"} href={alternateUrl} />
	<link rel="alternate" hreflang="x-default" href={`${siteUrl}/de/datenschutz/`} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.privacy_page_title({}, { locale })} />
	<meta property="og:description" content={m.privacy_page_description({}, { locale })} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:image" content={siteImage} />
	<meta property="og:locale" content={ogLocale} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.privacy_page_title({}, { locale })} />
	<meta name="twitter:description" content={m.privacy_page_description({}, { locale })} />
	<meta name="twitter:image" content={siteImage} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-12 sm:px-8">
	<div class="mb-8 flex justify-end">
		<ThemeToggle
			label={m.theme_switch_label({}, { locale })}
			switchToDark={m.theme_switch_to_dark({}, { locale })}
			switchToLight={m.theme_switch_to_light({}, { locale })}
		/>
	</div>
	<header class="mb-8 space-y-3">
		<p class="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--color-brand-cyan)]">
			{m.privacy_kicker({}, { locale })}
		</p>
		<h1 class="theme-heading">{m.privacy_title({}, { locale })}</h1>
		<p>{m.privacy_intro({}, { locale })}</p>
	</header>

	<section class="space-y-6">
		<article class="space-y-3">
			<h2 class="theme-heading">{m.privacy_controller({}, { locale })}</h2>
			<address class="not-italic">
				Robert Schäfer
				<br />
				Unterdorfstrasse 5
				<br />
				53797 Lohmar
				<br />
				Germany
			</address>
			<p>
				{m.imprint_email_label({}, { locale })}:
				<a href="mailto:hello@roschaefer.de">hello@roschaefer.de</a>
			</p>
		</article>

		<article class="space-y-3">
			<h2 class="theme-heading">{m.privacy_hosting_title({}, { locale })}</h2>
			<p>{m.privacy_hosting_body({}, { locale })}</p>
		</article>

		<article class="space-y-3">
			<h2 class="theme-heading">{m.privacy_contact_title({}, { locale })}</h2>
			<p>{m.privacy_contact_body({}, { locale })}</p>
		</article>

		<article class="space-y-3">
			<h2 class="theme-heading">{m.privacy_external_title({}, { locale })}</h2>
			<p>{m.privacy_external_body({}, { locale })}</p>
		</article>
	</section>
</main>
