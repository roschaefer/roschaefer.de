<script lang="ts">
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import * as m from "$lib/paraglide/messages";
</script>

<svelte:head>
	<title>{m.privacy_page_title({}, { locale: "de" })}</title>
	<meta name="description" content={m.privacy_page_description({}, { locale: "de" })} />
	<link rel="canonical" href={`${siteUrl}/datenschutz`} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.privacy_page_title({}, { locale: "de" })} />
	<meta property="og:description" content={m.privacy_page_description({}, { locale: "de" })} />
	<meta property="og:url" content={`${siteUrl}/datenschutz`} />
	<meta property="og:image" content={siteImage} />
	<meta property="og:locale" content="de_DE" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.privacy_page_title({}, { locale: "de" })} />
	<meta name="twitter:description" content={m.privacy_page_description({}, { locale: "de" })} />
	<meta name="twitter:image" content={siteImage} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-12 sm:px-8">
	<header class="mb-8 space-y-3">
		<p class="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--color-brand-cyan)]">
			{m.privacy_kicker({}, { locale: "de" })}
		</p>
		<h1 class="text-white">{m.privacy_title({}, { locale: "de" })}</h1>
		<p>
			{m.privacy_intro({}, { locale: "de" })}
		</p>
	</header>

	<section class="space-y-6">
		<article class="space-y-3">
			<h2 class="text-white">{m.privacy_controller({}, { locale: "de" })}</h2>
			<address class="not-italic">
				Robert Schäfer
				<br />
				Unterdorfstrasse 5
				<br />
				53797 Lohmar
				<br />
				Deutschland
			</address>
			<p>
				E-Mail:
				<a href="mailto:hello@roschaefer.de">hello@roschaefer.de</a>
			</p>
		</article>

		<article class="space-y-3">
			<h2 class="text-white">{m.privacy_hosting_title({}, { locale: "de" })}</h2>
			<p>{m.privacy_hosting_body({}, { locale: "de" })}</p>
		</article>

		<article class="space-y-3">
			<h2 class="text-white">{m.privacy_contact_title({}, { locale: "de" })}</h2>
			<p>{m.privacy_contact_body({}, { locale: "de" })}</p>
		</article>

		<article class="space-y-3">
			<h2 class="text-white">{m.privacy_external_title({}, { locale: "de" })}</h2>
			<p>{m.privacy_external_body({}, { locale: "de" })}</p>
		</article>
	</section>
</main>
