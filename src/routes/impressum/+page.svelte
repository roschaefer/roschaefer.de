<script lang="ts">
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import * as m from "$lib/paraglide/messages";
</script>

<svelte:head>
	<title>{m.imprint_page_title({}, { locale: "de" })}</title>
	<meta name="description" content={m.imprint_page_description({}, { locale: "de" })} />
	<link rel="canonical" href={`${siteUrl}/impressum`} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.imprint_page_title({}, { locale: "de" })} />
	<meta property="og:description" content={m.imprint_page_description({}, { locale: "de" })} />
	<meta property="og:url" content={`${siteUrl}/impressum`} />
	<meta property="og:image" content={siteImage} />
	<meta property="og:locale" content="de_DE" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.imprint_page_title({}, { locale: "de" })} />
	<meta name="twitter:description" content={m.imprint_page_description({}, { locale: "de" })} />
	<meta name="twitter:image" content={siteImage} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-12 sm:px-8">
	<header class="mb-8 space-y-3">
		<p class="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--color-brand-cyan)]">
			{m.imprint_kicker({}, { locale: "de" })}
		</p>
		<h1 class="text-white">{m.imprint_title({}, { locale: "de" })}</h1>
		<p>{m.imprint_intro({}, { locale: "de" })}</p>
	</header>

	<section class="space-y-4">
		<h2 class="text-white">{m.imprint_provider({}, { locale: "de" })}</h2>
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
			{m.imprint_email_label({}, { locale: "de" })}:
			<a href="mailto:hello@roschaefer.de">hello@roschaefer.de</a>
		</p>
		<p>
			{m.imprint_signal_label({}, { locale: "de" })}:
			<a href="https://signal.me/#eu/DI0Crg8ktbRKrFyKqMRVJeMO-ecjH3Xa9I6wu8QWkQRUUzGBm-lPwJh0xlrvFb00">
				{m.imprint_signal_link_label({}, { locale: "de" })}
			</a>
		</p>
	</section>
</main>
