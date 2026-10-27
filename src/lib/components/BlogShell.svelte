<script lang="ts">
import type { Snippet } from "svelte";
import { blogPath } from "$lib/blog/paths";
import PageShell from "$lib/components/PageShell.svelte";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	locale: Locale;
	currentPath: string;
	alternatePath: string;
	children: Snippet;
}

const { locale, currentPath, alternatePath, children: content }: Props = $props();
const legalLinks = $derived(
	locale === "de"
		? { imprint: "/de/impressum/", privacy: "/de/datenschutz/" }
		: { imprint: "/en/imprint/", privacy: "/en/privacy/" },
);

markUsed(() => [PageShell, m, locale, currentPath, alternatePath, content, legalLinks, blogPath]);
</script>

<PageShell
	{locale}
	homeHref={`/${locale}/`}
	homeLabel="Robert Schäfer"
	{currentPath}
	{alternatePath}
	footerLinks={[
		{ href: `/${locale}/`, label: m.nav_cv({}, { locale }) },
		{ href: legalLinks.imprint, label: m.nav_imprint({}, { locale }) },
		{ href: legalLinks.privacy, label: m.nav_privacy({}, { locale }) },
	]}
	mainClass="mx-auto max-w-4xl px-6 pb-20 pt-10 sm:px-8 lg:px-12"
>
	{#snippet topNav()}
		<nav aria-label={m.nav_site_label({}, { locale })}>
			<ul class="flex list-none flex-wrap gap-6 p-0 text-sm uppercase tracking-[0.22em]">
				<li><a href={`/${locale}/`}>{m.nav_cv({}, { locale })}</a></li>
				<li><a aria-current="page" href={blogPath(locale)}>{m.nav_blog({}, { locale })}</a></li>
			</ul>
		</nav>
	{/snippet}

	{#snippet children()}
		{@render content()}
	{/snippet}
</PageShell>
