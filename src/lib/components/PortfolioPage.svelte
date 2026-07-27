<script lang="ts">
import { onMount, tick } from "svelte";
import ContactLinks from "$lib/components/ContactLinks.svelte";
import NewspaperIcon from "$lib/components/NewspaperIcon.svelte";
import PageShell from "$lib/components/PageShell.svelte";
import ProjectsList from "$lib/components/ProjectsList.svelte";
import TechExperienceList from "$lib/components/TechExperienceList.svelte";
import { siteImage, siteName, siteUrl } from "$lib/config/site";
import { pressEntryId, projectEntryId, skillEntryId } from "$lib/data/resume";
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

let activeAnchorTargetId = $state<string | null>(null);
let projectsExpanded = $state(false);
let technologiesExpanded = $state(false);

const linkableProjectIds = $derived(
	new Set(
		[...content.featuredProjects, ...content.remainingProjects].map((project) =>
			projectEntryId(project),
		),
	),
);
const linkableSkillIds = $derived(
	new Set(
		[...content.techExperience, ...content.remainingTechExperience].map((entry) =>
			skillEntryId(entry.name),
		),
	),
);
const pressAnchorIds = $derived(new Set(content.press.map((entry) => pressEntryId(entry.project))));
const anchorTargetIds = $derived(
	new Set([...linkableProjectIds, ...linkableSkillIds, ...pressAnchorIds]),
);
const remainingProjectIds = $derived(
	new Set(content.remainingProjects.map((project) => projectEntryId(project))),
);
const remainingSkillIds = $derived(
	new Set(content.remainingTechExperience.map((entry) => skillEntryId(entry.name))),
);
const scrollBehavior = (): ScrollBehavior =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
const currentHashTarget = () => {
	try {
		return decodeURIComponent(window.location.hash.slice(1));
	} catch {
		return "";
	}
};
const activateAnchorTarget = (targetId: string) => {
	activeAnchorTargetId = targetId;

	const targetElement = document.getElementById(targetId);
	if (!targetElement) {
		return;
	}

	targetElement.focus({ preventScroll: true });
	targetElement.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
};
onMount(() => {
	const activateHashTarget = async () => {
		const targetId = currentHashTarget();
		if (!targetId) {
			activeAnchorTargetId = null;
			return;
		}

		if (!anchorTargetIds.has(targetId)) {
			activeAnchorTargetId = null;
			// Collapsing the lists above shrinks the page, so a section hash
			// the browser already scrolled to (against the full SSR markup)
			// needs to be re-aligned once the collapse has taken effect.
			await tick();
			document.getElementById(targetId)?.scrollIntoView({ behavior: "auto" });
			return;
		}

		if (remainingProjectIds.has(targetId)) {
			projectsExpanded = true;
		}
		if (remainingSkillIds.has(targetId)) {
			technologiesExpanded = true;
		}

		await tick();
		activateAnchorTarget(targetId);
	};

	activateHashTarget();
	window.addEventListener("hashchange", activateHashTarget);

	return () => window.removeEventListener("hashchange", activateHashTarget);
});

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
const atsPdfPath = $derived(resumePdfPath(locale, "ats"));
const atsPdfFilename = $derived(resumePdfFilename(locale, "ats"));
const pdfDownloadLinkClass =
	"flex items-center gap-4 rounded-[1.5rem] border border-[color:color-mix(in_srgb,var(--color-brand-cyan)_35%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-brand-cyan)_16%,transparent),color-mix(in_srgb,var(--color-brand-panel)_85%,transparent))] px-4 py-4 no-underline transition hover:border-[var(--color-brand-cyan)] focus-visible:border-[var(--color-brand-cyan)]";
const legalLinks = $derived(
	locale === "de"
		? { imprint: "/de/impressum/", privacy: "/de/datenschutz/" }
		: { imprint: "/en/imprint/", privacy: "/en/privacy/" },
);
const educationDateFormatter = $derived(
	new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", { year: "numeric" }),
);
const formatYear = (value?: string) => {
	if (!value) {
		return "";
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : educationDateFormatter.format(date);
};
const formatEducationPeriod = (entry: SiteContent["education"][number]) => {
	const start = formatYear(entry.startDate);
	const end = entry.endDate ? formatYear(entry.endDate) : t(m.present);
	return [start, end].filter(Boolean).join(" - ");
};
markUsed(() => [
	projectsExpanded,
	technologiesExpanded,
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
	atsPdfPath,
	atsPdfFilename,
	pdfDownloadLinkClass,
	legalLinks,
	educationDateFormatter,
	formatYear,
	formatEducationPeriod,
	PageShell,
	ContactLinks,
	NewspaperIcon,
	ProjectsList,
	TechExperienceList,
	linkableProjectIds,
	linkableSkillIds,
	pressAnchorIds,
	pressEntryId,
	activeAnchorTargetId,
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
		<nav aria-label={t(m.nav_site_label)}>
			<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.22em]">
				<li><a href={`/${locale}/#projects`}>{t(m.nav_projects)}</a></li>
				<li><a href={`/${locale}/#experience`}>{t(m.nav_experience)}</a></li>
				<li><a href={`/${locale}/#contact`}>{t(m.nav_contact)}</a></li>
			</ul>
		</nav>
	{/snippet}

	{#snippet children()}
		<section
			aria-labelledby="intro-title"
			class="grid gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(24rem,0.9fr)]"
		>
			<div class="min-w-0 space-y-8">
				<h1 id="intro-title" class="theme-heading max-w-4xl xl:text-[5.4rem]">
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
				aria-label={content.basics.name}
				class="theme-panel min-w-0 rounded-[2rem] p-6"
			>
				<figure class="mb-6 flex items-center justify-between gap-4">
					<figcaption class="min-w-0">
						<p class="theme-heading text-2xl">{content.basics.name}</p>
						<p class="mt-2 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-cyan)]">
							{content.basics.label}
						</p>
					</figcaption>
					<img
						class="aspect-square w-28 rounded-[1.5rem] border border-[var(--color-brand-line)] bg-[var(--color-brand-photo-bg)] object-cover shadow-[0_0_40px_var(--color-brand-shadow)]"
						src="/roschaefer.jpg"
						alt="Portrait of Robert Schäfer"
					/>
				</figure>
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
				<ul class="mt-8 grid list-none gap-3 p-0">
					<li>
						<a
							class={pdfDownloadLinkClass}
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
									{t(m.cv_pdf_download)}
								</span>
								<span class="mt-1 block text-sm text-[var(--color-brand-text)]">
									{t(m.cv_pdf_download_hint)}
								</span>
							</span>
						</a>
					</li>
					<li>
						<a
							class={pdfDownloadLinkClass}
							href={atsPdfPath}
							download={atsPdfFilename}
						>
							<span
								aria-hidden="true"
								class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--color-brand-line)] bg-[var(--color-brand-photo-bg)] text-[var(--color-brand-cyan)]"
							>
								<svg viewBox="0 0 24 24" class="h-6 w-6 fill-none stroke-current" stroke-width="1.7">
									<path d="M4.75 5.75h14.5" />
									<path d="M4.75 9.75h14.5" />
									<path d="M4.75 13.75h8.5" />
									<path d="M4.75 17.75h6.5" />
								</svg>
							</span>
							<span class="min-w-0">
								<span class="block text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-brand-link)]">
									{t(m.cv_ats_download)}
								</span>
								<span class="mt-1 block text-sm text-[var(--color-brand-text)]">
									{t(m.cv_ats_download_hint)}
								</span>
							</span>
						</a>
					</li>
				</ul>
				<a
					class="print-url mt-3 block text-sm"
					href={`/${locale}/resume.json`}
					target="_blank"
					rel="noopener noreferrer"
				>
					{t(m.resume_json_link_label)}
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

			<TechExperienceList
				featured={content.techExperience}
				remaining={content.remainingTechExperience}
				{locale}
				{linkableProjectIds}
				{activeAnchorTargetId}
				bind:expanded={technologiesExpanded}
			/>
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

			<ProjectsList
				featured={content.featuredProjects}
				remaining={content.remainingProjects}
				{locale}
				{linkableSkillIds}
				{activeAnchorTargetId}
				bind:expanded={projectsExpanded}
			/>
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
					{@const pressLinks = (talk.links ?? []).filter((link) => link.kind === "press")}
					<li>
						<article class="theme-card rounded-[1.5rem] p-5">
							<h3 class="theme-heading">
								<a
									class="print-url"
									href={talk.url}
									data-print-label={talk.url ? printLinkLabel(talk.url) : ""}
								>
									{talk.entity}
								</a>
							</h3>
							<p class="mt-2 text-sm text-[var(--color-brand-text)]">{talk.name}</p>
							<p class="mt-2 text-sm text-[var(--color-brand-muted)]">
								{talk.startDate}
							</p>
							{#if pressLinks.length}
								<a
									href={`#${pressEntryId(talk)}`}
									class="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-line)] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[var(--color-brand-cyan-soft)] no-underline transition hover:border-[var(--color-brand-cyan)]"
								>
									<NewspaperIcon class="h-3.5 w-3.5 shrink-0" />
									{t(m.press_coverage_label)} ({pressLinks.length})
								</a>
							{/if}
						</article>
					</li>
				{/each}
			</ul>
		</section>

		{#if content.education.length > 0}
			<section
				aria-labelledby="education-title"
				id="education"
				class="space-y-8"
			>
				<div class="space-y-3">
					<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
						{t(m.education_eyebrow)}
					</p>
					<h2 id="education-title" class="theme-heading">{t(m.education_title)}</h2>
					<p>{t(m.education_intro)}</p>
				</div>

				<ol class="grid list-none gap-4 p-0 md:grid-cols-2">
					{#each content.education as education}
						<li>
							<article class="theme-card rounded-[1.5rem] p-5">
								<header class="space-y-2">
									<p class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
										{formatEducationPeriod(education)}
									</p>
									<h3 class="theme-heading">{education.studyType}</h3>
									<p class="font-semibold text-[var(--color-brand-text)]">{education.area}</p>
									<p class="text-sm text-[var(--color-brand-muted)]">
										{#if education.url}
											<a
												class="print-url"
												href={education.url}
												data-print-label={printLinkLabel(education.url)}
											>
												{education.institution}
											</a>
										{:else}
											{education.institution}
										{/if}
									</p>
								</header>
								{#if education.score}
									<dl class="mt-4 rounded-[1rem] border border-[var(--color-brand-line)] bg-[color:color-mix(in_srgb,var(--color-brand-panel)_76%,transparent)] p-3">
										<div class="flex items-start justify-between gap-4">
											<dt class="pt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-muted)]">
												{t(m.education_score)}
											</dt>
											<dd class="text-right text-sm font-semibold leading-tight text-[var(--color-brand-text)]">
												{education.score}
											</dd>
										</div>
									</dl>
								{/if}
							</article>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if content.awards.length > 0}
			<section
				aria-labelledby="awards-title"
				id="awards"
				class="space-y-8"
			>
				<div class="space-y-3">
					<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
						{t(m.awards_eyebrow)}
					</p>
					<h2 id="awards-title" class="theme-heading">{t(m.awards_title)}</h2>
					<p>{t(m.awards_intro)}</p>
				</div>

				<ol class="grid list-none gap-4 p-0 md:grid-cols-2">
					{#each content.awards as award}
						<li>
							<article class="theme-card rounded-[1.5rem] p-5">
								<header class="space-y-2">
									<p class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
										{formatYear(award.date)}
									</p>
									<h3 class="theme-heading">
										{#if award.url}
											<a class="print-url" href={award.url} data-print-label={printLinkLabel(award.url)}>
												{award.title}
											</a>
										{:else}
											{award.title}
										{/if}
									</h3>
									{#if award.awarder}
										<p class="font-semibold text-[var(--color-brand-text)]">{award.awarder}</p>
									{/if}
								</header>
								{#if award.summary}
									<p class="mt-4 text-sm text-[var(--color-brand-muted)]">{award.summary}</p>
								{/if}
							</article>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if content.press.length > 0}
			<section
				aria-labelledby="press-title"
				id="press"
				class="space-y-8"
			>
				<div class="space-y-3">
					<p class="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-brand-cyan)]">
						{t(m.press_eyebrow)}
					</p>
					<h2 id="press-title" class="theme-heading">{t(m.press_title)}</h2>
					<p>{t(m.press_intro)}</p>
				</div>

				<ol class="grid list-none gap-4 p-0 md:grid-cols-2">
					{#each content.press as feature}
						<li class="flex">
							<article
								id={pressEntryId(feature.project)}
								tabindex="-1"
								class="anchor-target-card theme-card flex h-full w-full scroll-mt-8 flex-col rounded-[1.5rem] p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-cyan)]"
								class:anchor-target-card-active={activeAnchorTargetId === pressEntryId(feature.project)}
							>
								<header class="space-y-2">
									<p class="text-xs uppercase tracking-[0.28em] text-[var(--color-brand-muted)]">
										{formatYear(feature.project.startDate)}
									</p>
									<h3 class="theme-heading">
										<a href={`#${projectEntryId(feature.project)}`}>
											{feature.project.name}
										</a>
									</h3>
									{#if feature.project.entity}
										<p class="font-semibold text-[var(--color-brand-text)]">
											{feature.project.entity}
										</p>
									{/if}
								</header>
								<ul class="mt-4 flex flex-wrap gap-2 text-sm">
									{#each feature.links as link}
										<li>
											<a
												class="print-url inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-line)] px-3 py-1.5 text-[var(--color-brand-cyan-soft)] no-underline transition hover:border-[var(--color-brand-cyan)]"
												href={link.url}
												data-print-label={printLinkLabel(link.url)}
											>
												<NewspaperIcon class="h-4 w-4 shrink-0" />
												{link.label}
											</a>
										</li>
									{/each}
								</ul>
							</article>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		<section id="contact" aria-labelledby="contact-title" class="border-t border-[var(--color-brand-line)] pt-10">
			<div class="flex flex-col gap-6">
				<div class="space-y-4">
					<h2 id="contact-title" class="theme-heading">{t(m.contact_title)}</h2>
					<ContactLinks locale={locale} />
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
