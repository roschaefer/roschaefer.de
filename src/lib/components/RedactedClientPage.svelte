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
const imprintPath = $derived(locale === "de" ? "/de/impressum/" : "/en/imprint/");
const privacyPath = $derived(locale === "de" ? "/de/datenschutz/" : "/en/privacy/");
markUsed(() => [
	siteImage,
	siteName,
	siteUrl,
	m,
	pageUrl,
	alternateUrl,
	ogLocale,
	imprintPath,
	privacyPath,
	PageShell,
	ContactLinks,
]);
</script>

<svelte:head>
	<title>{m.redacted_page_title({}, { locale })}</title>
	<meta name="description" content={m.redacted_page_description({}, { locale })} />
	<meta name="robots" content="noindex" />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang={locale} href={pageUrl} />
	<link rel="alternate" hreflang={locale === "de" ? "en" : "de"} href={alternateUrl} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.redacted_page_title({}, { locale })} />
	<meta property="og:description" content={m.redacted_page_description({}, { locale })} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:image" content={siteImage} />
	<meta property="og:locale" content={ogLocale} />
</svelte:head>

<PageShell
	locale={locale}
	homeHref={`/${locale}/`}
	homeLabel="Robert Schäfer"
	currentPath={path}
	alternatePath={alternatePath}
	footerLinks={[
		{ href: `/${locale}/`, label: m.nav_cv({}, { locale }) },
		{ href: imprintPath, label: m.nav_imprint({}, { locale }) },
		{ href: privacyPath, label: m.nav_privacy({}, { locale }) },
	]}
	mainClass="mx-auto max-w-3xl px-6 pb-12 pt-10 sm:px-8"
>
	{#snippet children()}
		<header class="mb-8 space-y-3">
			<p class="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--color-brand-cyan)]">
				{m.redacted_kicker({}, { locale })}
			</p>
			<h1 class="theme-heading">{m.redacted_title({}, { locale })}</h1>
			<p>{m.redacted_intro({}, { locale })}</p>
		</header>

		<section class="space-y-4">
			<ContactLinks locale={locale} />
		</section>
	{/snippet}
</PageShell>
