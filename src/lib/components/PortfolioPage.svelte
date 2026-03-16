<script lang="ts">
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import { printLinkLabel } from "$lib/data/short-links";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import type { SiteContent } from "$lib/utils/content";

interface Props {
	content: SiteContent;
	locale: Locale;
}

const { content, locale }: Props = $props();

const primaryProfiles = $derived(
	content.profiles.filter((profile) =>
		["Github", "LinkedIn", "YouTube", "Mastodon"].includes(profile.network),
	),
);

const otherLocale = $derived<Locale>(locale === "de" ? "en" : "de");
const t = (message: (inputs: Record<string, never>, options?: { locale?: Locale }) => string) =>
	message({}, { locale });
const pageUrl = `${siteUrl}/${locale}`;
const ogLocale = locale === "de" ? "de_DE" : "en_US";
</script>

<svelte:head>
	<title>{t(m.site_title)}</title>
	<meta name="description" content={t(m.meta_description)} />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang="de" href="/de" />
	<link rel="alternate" hreflang="en" href="/en" />
	<link rel="alternate" hreflang="x-default" href="/de" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={t(m.site_title)} />
	<meta property="og:description" content={t(m.meta_description)} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:image" content={siteImage} />
	<meta property="og:locale" content={ogLocale} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={t(m.site_title)} />
	<meta name="twitter:description" content={t(m.meta_description)} />
	<meta name="twitter:image" content={siteImage} />
</svelte:head>

<div class="print-shell min-h-screen">
	<header class="print-hidden mx-auto max-w-6xl px-6 py-6 sm:px-8 lg:px-12">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<a
				class="font-semibold uppercase tracking-[0.28em] text-white no-underline"
				href={`/${locale}`}
			>
				{content.basics.name}
			</a>
			<div class="ml-auto flex flex-wrap items-center justify-end gap-6 text-right">
				<nav aria-label={t(m.nav_primary_label)}>
					<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.22em]">
						<li><a href={`/${locale}#projects`}>{t(m.nav_projects)}</a></li>
						<li><a href={`/${locale}#experience`}>{t(m.nav_experience)}</a></li>
						<li><a href={`/${locale}#talks`}>{t(m.nav_talks)}</a></li>
						<li><a href={`/${locale}#contact`}>{t(m.nav_contact)}</a></li>
					</ul>
				</nav>
				<nav aria-label={t(m.lang_switch)}>
					<ul class="flex list-none gap-3 p-0 text-sm uppercase tracking-[0.2em]">
						<li>
							<a
								aria-current="page"
								class="rounded-full border border-[var(--color-brand-line)] px-3 py-1 no-underline"
								href={`/${locale}`}
							>
								{locale.toUpperCase()}
							</a>
						</li>
						<li>
							<a
								class="rounded-full border border-transparent px-3 py-1 no-underline"
								href={`/${otherLocale}`}
							>
								{otherLocale.toUpperCase()}
							</a>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	</header>

	<main class="print-body mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-20 pt-10 sm:px-8 lg:px-12 print:gap-10">
		<section
			aria-labelledby="intro-title"
			class="print-section grid gap-10 lg:grid-cols-[1.35fr_0.9fr] print:gap-6"
		>
			<div class="space-y-8">
				<p class="text-sm font-semibold uppercase tracking-[0.36em] text-[var(--color-brand-cyan)]">
					{t(m.hero_role)}
				</p>
				<h1 id="intro-title" class="max-w-4xl text-white">
					{t(m.hero_title)}
					<br />
					<span class="text-[var(--color-brand-cyan)]">{t(m.hero_accent)}</span>
				</h1>
				<p class="text-lg text-[var(--color-brand-text)]">{content.basics.summary}</p>
				<ul class="print-hidden flex list-none flex-wrap gap-4 p-0">
					<li>
						<a
							class="inline-flex rounded-full border-4 border-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan)] px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black no-underline transition hover:scale-105 hover:text-white focus-visible:scale-105"
							href={`/${locale}#projects`}
						>
							{t(m.hero_browse_projects)}
						</a>
					</li>
					<li>
						<a
							class="inline-flex rounded-full border-4 border-white px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white no-underline transition hover:scale-105 hover:bg-white hover:text-black focus-visible:scale-105"
							href={`/${locale}#contact`}
						>
							{t(m.hero_contact)}
						</a>
					</li>
				</ul>
			</div>

			<aside
				aria-label={t(m.at_a_glance)}
				class="print-card rounded-[2rem] border border-[var(--color-brand-line)] bg-[rgba(13,17,23,0.78)] p-6 backdrop-blur print:rounded-none print:border print:border-black/20 print:bg-transparent print:p-4"
			>
				<figure class="mb-6">
					<img
						class="aspect-square w-28 rounded-[1.5rem] border border-[var(--color-brand-line)] object-cover shadow-[0_0_40px_rgba(51,187,255,0.12)]"
						src="/roschaefer.jpg"
						alt="Portrait of Robert Schäfer"
					/>
				</figure>
				<h2 class="mb-4 text-white">{t(m.at_a_glance)}</h2>
				<dl class="grid gap-4">
					<div>
						<dt class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
							{t(m.based_in)}
						</dt>
						<dd class="mt-1 text-white">
							{content.basics.location?.city}, {content.basics.location?.region}
						</dd>
					</div>
					<div>
						<dt class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
							{t(m.languages)}
						</dt>
						<dd class="mt-1 text-white">
							{content.languages.map((entry) => entry.language).join(" . ")}
						</dd>
					</div>
					<div>
						<dt class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
							{t(m.open_source)}
						</dt>
						<dd class="mt-1 text-white">{t(m.open_source_summary)}</dd>
					</div>
				</dl>
				<ul class="mt-6 flex list-none flex-wrap gap-4 p-0 print:mt-4">
					{#each primaryProfiles as profile}
						<li>
							<a
								class="print-url text-sm uppercase tracking-[0.18em]"
								href={profile.url}
								data-print-label={printLinkLabel(profile.url)}
							>
								{profile.network}
							</a>
						</li>
					{/each}
				</ul>
			</aside>
		</section>

		<section
			aria-labelledby="experience-title"
			id="experience"
			class="print-section space-y-8 print:space-y-4"
		>
			<div class="space-y-3">
				<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
					{t(m.tech_experience_eyebrow)}
				</p>
				<h2 id="experience-title" class="text-white">{t(m.tech_experience_title)}</h2>
				<p>{t(m.tech_experience_intro)}</p>
			</div>

			<ol class="grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-3">
				{#each content.techExperience as entry}
					<li class="print-card rounded-[1.5rem] border border-[var(--color-brand-line)] bg-[rgba(255,255,255,0.03)] p-5 print:rounded-none print:border-black/20 print:bg-transparent print:p-3">
						<article>
							<h3 class="text-white">{entry.name}</h3>
							<p class="mt-1 text-[var(--color-brand-cyan)]">{entry.label}</p>
							<p class="mt-3 text-sm text-[var(--color-brand-muted)]">
								{t(m.used_in)} {entry.projects.slice(0, 3).map((project) => project.name).join(", ")}
								{#if entry.projects.length > 3}
									, {t(m.and_more)}
								{/if}
							</p>
						</article>
					</li>
				{/each}
			</ol>
		</section>

		<section
			aria-labelledby="projects-title"
			id="projects"
			class="print-section space-y-8 print:space-y-4"
		>
			<div class="space-y-3">
				<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
					{t(m.selected_work_eyebrow)}
				</p>
				<h2 id="projects-title" class="text-white">{t(m.selected_work_title)}</h2>
			</div>

			<div class="grid gap-6 lg:grid-cols-2 print:grid-cols-1 print:gap-3">
				{#each content.featuredProjects as project}
					<article class="print-card rounded-[1.75rem] border border-[var(--color-brand-line)] bg-[rgba(255,255,255,0.025)] p-6 print:rounded-none print:border-black/20 print:bg-transparent print:p-4">
						<header class="space-y-3">
							<p class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
								{project.roles?.join(", ") ?? project.type ?? t(m.project_fallback)}
							</p>
							<h3 class="text-white">
								{#if project.url}
									<a
										class="print-url no-underline"
										href={project.url}
										data-print-label={printLinkLabel(project.url)}
									>
										{project.name}
									</a>
								{:else}
									{project.name}
								{/if}
							</h3>
							<p class="text-sm text-[var(--color-brand-muted)]">
								{project.entity ?? t(m.independent)} . {project.startDate}
								{#if project.endDate}
									- {project.endDate}
								{:else}
									- {t(m.present)}
								{/if}
							</p>
						</header>
						<p class="mt-4">{project.description}</p>
						{#if project.keywords?.length}
							<ul class="mt-5 flex list-none flex-wrap gap-2 p-0">
								{#each project.keywords.slice(0, 6) as keyword}
									<li class="rounded-full border border-[var(--color-brand-line)] px-3 py-1 text-sm text-[var(--color-brand-cyan-soft)] print:border-black/20 print:text-black">
										{keyword}
									</li>
								{/each}
							</ul>
						{/if}
					</article>
				{/each}
			</div>
		</section>

		<section
			aria-labelledby="talks-title"
			id="talks"
			class="print-section space-y-8 print:space-y-4"
		>
			<div class="space-y-3">
				<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
					{t(m.speaking_eyebrow)}
				</p>
				<h2 id="talks-title" class="text-white">{t(m.talks_title)}</h2>
				<p>{t(m.talks_intro)}</p>
			</div>

			<ul class="grid list-none gap-4 p-0 lg:grid-cols-2 print:grid-cols-1 print:gap-3">
				{#each content.talks.slice(0, 6) as talk}
					<li>
						<article class="print-card rounded-[1.5rem] border border-[var(--color-brand-line)] p-5 print:rounded-none print:border-black/20 print:p-4">
							<h3 class="text-white">
								<a
									class="print-url"
									href={talk.url}
									data-print-label={talk.url ? printLinkLabel(talk.url) : ""}
								>
									{talk.name}
								</a>
							</h3>
							<p class="mt-2 text-sm text-[var(--color-brand-muted)]">
								{talk.entity} . {talk.startDate}
							</p>
						</article>
					</li>
				{/each}
			</ul>
		</section>
	</main>

	<footer id="contact" class="print-section border-t border-[var(--color-brand-line)] print:border-black/20">
		<div class="print-body mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-12">
			<section aria-labelledby="contact-title" class="space-y-4">
				<h2 id="contact-title" class="text-white">{t(m.contact_title)}</h2>
				<address class="not-italic">
					<a
						class="print-url print-mailto"
						href={`mailto:${content.basics.email}`}
						data-print-label={content.basics.email}
					>
						{content.basics.email}
					</a>
				</address>
				<p>{t(m.contact_summary)}</p>
			</section>
			<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.2em]">
				{#each content.profiles as profile}
					<li>
						<a class="print-url" href={profile.url} data-print-label={printLinkLabel(profile.url)}>
							{profile.network}
						</a>
					</li>
				{/each}
			</ul>
			<nav aria-label="Legal" class="print-hidden">
				<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.2em]">
					<li><a href="/impressum">{t(m.nav_imprint)}</a></li>
					<li><a href="/datenschutz">{t(m.nav_privacy)}</a></li>
				</ul>
			</nav>
		</div>
	</footer>
</div>
