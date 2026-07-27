<script lang="ts">
import ContactLinks from "$lib/components/ContactLinks.svelte";
import PageShell from "$lib/components/PageShell.svelte";
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
const privacyPath = $derived(locale === "de" ? "/de/datenschutz/" : "/en/privacy/");
markUsed(() => [
	siteImage,
	siteName,
	siteUrl,
	m,
	pageUrl,
	alternateUrl,
	ogLocale,
	privacyPath,
	PageShell,
	ContactLinks,
]);
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

<PageShell
	locale={locale}
	homeHref={`/${locale}/`}
	homeLabel="Robert Schäfer"
	currentPath={path}
	alternatePath={alternatePath}
	footerLinks={[
		{ href: `/${locale}/`, label: m.nav_cv({}, { locale }) },
		{ href: privacyPath, label: m.nav_privacy({}, { locale }) },
	]}
	mainClass="mx-auto max-w-3xl px-6 pb-12 pt-10 sm:px-8"
>
	{#snippet topNav()}
		<nav aria-label={m.nav_site_label({}, { locale })}>
			<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.22em]">
				<li><a href={`/${locale}/#projects`}>{m.nav_projects({}, { locale })}</a></li>
				<li><a href={`/${locale}/#experience`}>{m.nav_experience({}, { locale })}</a></li>
				<li><a href={`/${locale}/#contact`}>{m.nav_contact({}, { locale })}</a></li>
			</ul>
		</nav>
	{/snippet}

	{#snippet children()}
		<header class="mb-8 space-y-3">
			<p class="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--color-brand-cyan)]">
				{m.imprint_kicker({}, { locale })}
			</p>
			<h1 class="hero-heading theme-heading" lang={locale}>{m.imprint_title({}, { locale })}</h1>
			<p>{m.imprint_intro({}, { locale })}</p>
		</header>

		<section class="space-y-4">
			<h2 class="theme-heading">{m.imprint_provider({}, { locale })}</h2>
			<address class="not-italic">
				Robert Schäfer
				<br />
				Unterdorfstrasse 5
				<br />
				53797 Lohmar
				<br />
				{locale === "de" ? "Deutschland" : "Germany"}
			</address>
			<ContactLinks locale={locale} />
		</section>
	{/snippet}
</PageShell>
