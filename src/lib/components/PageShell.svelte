<script lang="ts">
import type { Snippet } from "svelte";

import ThemeToggle from "$lib/components/ThemeToggle.svelte";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import { markUsed } from "$lib/utils/mark-used";

type FooterLink = {
	href: string;
	label: string;
};

interface Props {
	locale: Locale;
	homeHref: string;
	homeLabel: string;
	currentPath: string;
	alternatePath: string;
	footerLinks: FooterLink[];
	mainClass: string;
	topNav?: Snippet;
	children: Snippet;
}

const {
	locale,
	homeHref,
	homeLabel,
	currentPath,
	alternatePath,
	footerLinks,
	mainClass,
	topNav,
	children,
}: Props = $props();

const otherLocale = $derived<Locale>(locale === "de" ? "en" : "de");

markUsed(() => [
	m,
	locale,
	homeHref,
	homeLabel,
	currentPath,
	alternatePath,
	footerLinks,
	mainClass,
	topNav,
	children,
	otherLocale,
	ThemeToggle,
]);
</script>

<div class="min-h-screen">
	<div class="print-screen">
		<header class="mx-auto max-w-6xl px-6 py-6 sm:px-8 lg:px-12">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<a class="theme-heading font-semibold uppercase tracking-[0.28em] no-underline" href={homeHref}>
					{homeLabel}
				</a>
				<div class="ml-auto flex flex-wrap items-center justify-end gap-6 text-right">
					{#if topNav}
						{@render topNav()}
					{/if}
					<nav aria-label={m.lang_switch({}, { locale })}>
						<ul class="flex list-none gap-3 p-0 text-sm uppercase tracking-[0.2em]">
							<li>
								<a
									aria-current="page"
									class="rounded-full border border-[var(--color-brand-line)] px-3 py-1 no-underline"
									href={currentPath}
								>
									{locale.toUpperCase()}
								</a>
							</li>
							<li>
								<a
									class="rounded-full border border-transparent px-3 py-1 no-underline"
									href={alternatePath}
								>
									{otherLocale.toUpperCase()}
								</a>
							</li>
						</ul>
					</nav>
					<ThemeToggle
						label={m.theme_switch_label({}, { locale })}
						switchToDark={m.theme_switch_to_dark({}, { locale })}
						switchToLight={m.theme_switch_to_light({}, { locale })}
					/>
				</div>
			</div>
		</header>

		<main class={mainClass}>
			{@render children()}
		</main>

		<footer class="border-t border-[var(--color-brand-line)]">
			<div class="mx-auto max-w-6xl px-6 py-8 sm:px-8 lg:px-12">
				<nav aria-label={m.nav_primary_label({}, { locale })}>
					<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.2em]">
						{#each footerLinks as link}
							<li><a href={link.href}>{link.label}</a></li>
						{/each}
					</ul>
				</nav>
			</div>
		</footer>
	</div>
</div>
