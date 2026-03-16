<script lang="ts">
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import * as m from "$lib/paraglide/messages";
import { markUsed } from "$lib/utils/mark-used";

markUsed(siteImage, siteName, siteUrl, m);
</script>

<svelte:head>
	<title>{m.root_page_title({}, { locale: "de" })}</title>
	<meta name="description" content={m.root_page_description({}, { locale: "de" })} />
	<link rel="canonical" href={`${siteUrl}/`} />
	<meta http-equiv="refresh" content="0; url=/de/" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={m.root_page_title({}, { locale: "de" })} />
	<meta property="og:description" content={m.root_page_description({}, { locale: "de" })} />
	<meta property="og:url" content={`${siteUrl}/`} />
	<meta property="og:image" content={siteImage} />
	<meta property="og:locale" content="de_DE" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.root_page_title({}, { locale: "de" })} />
	<meta name="twitter:description" content={m.root_page_description({}, { locale: "de" })} />
	<meta name="twitter:image" content={siteImage} />
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16 sm:px-8">
	<section class="rounded-[2rem] border border-[var(--color-brand-line)] bg-[rgba(13,17,23,0.78)] p-8 backdrop-blur">
		<p class="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--color-brand-cyan)]">
			{m.root_kicker({}, { locale: "en" })}
		</p>
		<h1 class="mt-4 text-white">{m.root_title({}, { locale: "de" })}</h1>
		<p class="mt-6">
			{m.root_lead_de({}, { locale: "de" })}
		</p>
		<p class="mt-3">
			{m.root_lead_en({}, { locale: "en" })}
		</p>
		<nav aria-label={m.root_title({}, { locale: "en" })} class="mt-8">
			<ul class="flex list-none flex-wrap gap-4 p-0">
				<li>
					<a
						class="inline-flex rounded-full border-4 border-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan)] px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black no-underline transition hover:scale-105 hover:text-white focus-visible:scale-105"
						href="/de/"
					>
						{m.root_german({}, { locale: "de" })}
					</a>
				</li>
				<li>
					<a
						class="inline-flex rounded-full border-4 border-white px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white no-underline transition hover:scale-105 hover:bg-white hover:text-black focus-visible:scale-105"
						href="/en/"
					>
						{m.root_english({}, { locale: "en" })}
					</a>
				</li>
			</ul>
		</nav>
	</section>
</main>
