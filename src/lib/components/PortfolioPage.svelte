<script lang="ts">
import PageShell from "$lib/components/PageShell.svelte";
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import { resumePdfFilename, resumePdfPath } from "$lib/data/resume-pdf";
import { printLinkLabel } from "$lib/data/short-links";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import type { SiteContent } from "$lib/utils/content";
import { markUsed } from "$lib/utils/mark-used";

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
const pageUrl = $derived(`${siteUrl}/${locale}/`);
const ogLocale = $derived(locale === "de" ? "de_DE" : "en_US");
const pdfPath = $derived(resumePdfPath(locale));
const pdfFilename = $derived(resumePdfFilename(locale));
const pdfUrl = $derived(`${siteUrl}${pdfPath}`);
const legalLinks = $derived(
	locale === "de"
		? { imprint: "/de/impressum/", privacy: "/de/datenschutz/" }
		: { imprint: "/en/imprint/", privacy: "/en/privacy/" },
);
markUsed(() => [
	siteImage,
	siteName,
	siteUrl,
	printLinkLabel,
	m,
	primaryProfiles,
	otherLocale,
	t,
	pageUrl,
	ogLocale,
	pdfPath,
	pdfFilename,
	pdfUrl,
	legalLinks,
	PageShell,
]);
</script>

<svelte:head>
	<title>{t(m.site_title)}</title>
	<meta name="description" content={t(m.meta_description)} />
	<link rel="canonical" href={pageUrl} />
	<link rel="alternate" hreflang="de" href={`${siteUrl}/de/`} />
	<link rel="alternate" hreflang="en" href={`${siteUrl}/en/`} />
	<link rel="alternate" hreflang="x-default" href={`${siteUrl}/de/`} />
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

<section class="print-only print-fallback px-6 py-8">
	<h1>{content.basics.name}</h1>
	<p class="print-fallback-role">{content.basics.label}</p>
	<h2>{t(m.print_fallback_title)}</h2>
	<p>{t(m.print_fallback_body)}</p>
	<dl class="print-fallback-links">
		<div>
			<dt>{t(m.print_fallback_website)}</dt>
			<dd>
				<a class="print-fallback-url" href={pageUrl}>{pageUrl}</a>
			</dd>
		</div>
		<div>
			<dt>{t(m.print_fallback_pdf)}</dt>
			<dd>
				<a class="print-fallback-url" href={pdfUrl}>{pdfUrl}</a>
			</dd>
		</div>
	</dl>
</section>

<PageShell
	locale={locale}
	homeHref={`/${locale}/`}
	homeLabel={content.basics.name}
	currentPath={`/${locale}/`}
	alternatePath={`/${otherLocale}/`}
	footerLinks={[
		{ href: legalLinks.imprint, label: t(m.nav_imprint) },
		{ href: legalLinks.privacy, label: t(m.nav_privacy) },
	]}
	mainClass="mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-20 pt-10 sm:px-8 lg:px-12"
>
	{#snippet topNav()}
		<nav aria-label={t(m.nav_primary_label)}>
			<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.22em]">
				<li><a href={`/${locale}/#projects`}>{t(m.nav_projects)}</a></li>
				<li><a href={`/${locale}/#experience`}>{t(m.nav_experience)}</a></li>
				<li><a href={`/${locale}/#talks`}>{t(m.nav_talks)}</a></li>
				<li><a href={`/${locale}/#contact`}>{t(m.nav_contact)}</a></li>
			</ul>
		</nav>
	{/snippet}

	{#snippet children()}
		<section
			aria-labelledby="intro-title"
			class="grid gap-10 lg:grid-cols-[1.35fr_0.9fr]"
		>
			<div class="space-y-8">
				<p class="text-sm font-semibold uppercase tracking-[0.36em] text-[var(--color-brand-cyan)]">
					{t(m.hero_role)}
				</p>
				<h1 id="intro-title" class="theme-heading max-w-4xl">
					{t(m.hero_title)}
					<br />
					<span class="text-[var(--color-brand-cyan)]">{t(m.hero_accent)}</span>
				</h1>
				<p class="text-lg text-[var(--color-brand-text)]">{content.basics.summary}</p>
				<ul class="flex list-none flex-wrap gap-4 p-0">
					<li>
						<a
							class="theme-button-primary inline-flex rounded-full border-4 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] no-underline transition hover:scale-105 focus-visible:scale-105"
							href={`/${locale}/#projects`}
						>
							{t(m.hero_browse_projects)}
						</a>
					</li>
					<li>
						<a
							class="theme-button-secondary inline-flex rounded-full border-4 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] no-underline transition hover:scale-105 focus-visible:scale-105"
							href={`/${locale}/#contact`}
						>
							{t(m.hero_contact)}
						</a>
					</li>
				</ul>
			</div>

			<aside
				aria-label={t(m.at_a_glance)}
				class="theme-panel rounded-[2rem] p-6"
			>
				<figure class="mb-6">
					<img
						class="aspect-square w-28 rounded-[1.5rem] border border-[var(--color-brand-line)] bg-[var(--color-brand-photo-bg)] object-cover shadow-[0_0_40px_var(--color-brand-shadow)]"
						src="/roschaefer.jpg"
						alt="Portrait of Robert Schäfer"
					/>
					<figcaption class="sr-only">Robert Schäfer</figcaption>
				</figure>
				<h2 class="theme-heading mb-4">{t(m.at_a_glance)}</h2>
				<dl class="grid gap-4">
					<div>
						<dt class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
							{t(m.based_in)}
						</dt>
						<dd class="theme-heading mt-1">
							{content.basics.location?.city}, {content.basics.location?.region}
						</dd>
					</div>
					<div>
						<dt class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
							{t(m.languages)}
						</dt>
						<dd class="theme-heading mt-1">
							{content.languages.map((entry) => entry.language).join(" . ")}
						</dd>
					</div>
					<div>
						<dt class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
							{t(m.open_source)}
						</dt>
						<dd class="theme-heading mt-1">{t(m.open_source_summary)}</dd>
					</div>
				</dl>
				<ul class="mt-6 flex list-none flex-wrap gap-4 p-0">
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
				<a
					class="mt-8 flex items-center gap-4 rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--color-brand-cyan)_35%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-brand-cyan)_16%,transparent),color-mix(in_srgb,var(--color-brand-panel)_85%,transparent))] px-4 py-4 no-underline transition hover:border-[var(--color-brand-cyan)] focus-visible:border-[var(--color-brand-cyan)]"
					href={pdfPath}
					download={pdfFilename}
				>
					<span
						aria-hidden="true"
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--color-brand-line)] bg-[var(--color-brand-photo-bg)] text-[var(--color-brand-cyan)]"
					>
						<svg viewBox="0 0 24 24" class="h-6 w-6 fill-none stroke-current" stroke-width="1.7">
							<path d="M7 3.75h7.5L19 8.25V20.25a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20.25v-15A1.5 1.5 0 0 1 7.5 3.75Z" />
							<path d="M14.5 3.75v4.5H19" />
							<path d="M12 10.75v6.5" />
							<path d="m9.5 14.75 2.5 2.5 2.5-2.5" />
						</svg>
					</span>
					<span class="min-w-0">
						<span
							data-testid="pdf-cta-title"
							class="block text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-brand-link)]"
						>
							{t(m.at_a_glance_cv)}
						</span>
						<span class="mt-1 block text-sm text-[var(--color-brand-text)]">
							{t(m.at_a_glance_cv_hint)}
						</span>
						<span class="theme-heading mt-2 block font-mono text-sm">{pdfPath}</span>
					</span>
				</a>
			</aside>
		</section>

		<section
			aria-labelledby="experience-title"
			id="experience"
			class="space-y-8"
		>
			<div class="space-y-3">
				<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
					{t(m.tech_experience_eyebrow)}
				</p>
				<h2 id="experience-title" class="theme-heading">{t(m.tech_experience_title)}</h2>
				<p>{t(m.tech_experience_intro)}</p>
			</div>

			<ol class="grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
				{#each content.techExperience as entry}
					<li class="theme-card rounded-[1.5rem] p-5">
						<article>
							<h3 class="theme-heading">{entry.name}</h3>
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
			class="space-y-8"
		>
			<div class="space-y-3">
				<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
					{t(m.selected_work_eyebrow)}
				</p>
				<h2 id="projects-title" class="theme-heading">{t(m.selected_work_title)}</h2>
			</div>

			<div class="grid gap-6 lg:grid-cols-2">
				{#each content.featuredProjects as project}
					<article class="theme-card rounded-[1.75rem] p-6">
						<header class="space-y-3">
							<p class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
								{project.roles?.join(", ") ?? project.type ?? t(m.project_fallback)}
							</p>
							<h3 class="theme-heading">
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
									<li class="rounded-full border border-[var(--color-brand-line)] px-3 py-1 text-sm text-[var(--color-brand-cyan-soft)]">
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
			class="space-y-8"
		>
			<div class="space-y-3">
				<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
					{t(m.speaking_eyebrow)}
				</p>
				<h2 id="talks-title" class="theme-heading">{t(m.talks_title)}</h2>
				<p>{t(m.talks_intro)}</p>
			</div>

			<ul class="grid list-none gap-4 p-0 lg:grid-cols-2">
				{#each content.talks.slice(0, 6) as talk}
					<li>
						<article class="theme-card rounded-[1.5rem] p-5">
							<h3 class="theme-heading">
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

		<section id="contact" aria-labelledby="contact-title" class="border-t border-[var(--color-brand-line)] pt-10">
			<div class="flex flex-col gap-6">
				<div class="space-y-4">
					<h2 id="contact-title" class="theme-heading">{t(m.contact_title)}</h2>
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
				</div>
				<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.2em]">
					{#each content.profiles as profile}
						<li>
							<a class="print-url" href={profile.url} data-print-label={printLinkLabel(profile.url)}>
								{profile.network}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/snippet}
</PageShell>
