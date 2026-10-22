<script module lang="ts">
import type { Theme } from "$lib/theme";

export type GiscusConfig = {
	repo: string;
	repoId: string;
	category: string;
	categoryId: string;
};

export const giscusOrigin = "https://giscus.app";

export const giscusAttributes = (
	config: GiscusConfig,
	term: string,
	locale: string,
	theme: Theme,
): Record<string, string> => ({
	src: `${giscusOrigin}/client.js`,
	"data-repo": config.repo,
	"data-repo-id": config.repoId,
	"data-category": config.category,
	"data-category-id": config.categoryId,
	"data-mapping": "specific",
	"data-term": term,
	"data-strict": "1",
	"data-reactions-enabled": "1",
	"data-emit-metadata": "0",
	"data-input-position": "top",
	"data-theme": theme,
	"data-lang": locale,
	crossorigin: "anonymous",
	async: "",
});
</script>

<script lang="ts">
import { onDestroy } from "svelte";
import { giscus } from "$lib/config/site";
import type { Locale } from "$lib/i18n";
import * as m from "$lib/paraglide/messages";
import { getPreferredTheme, type Theme as CurrentTheme } from "$lib/theme";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	locale: Locale;
	term: string;
	config?: GiscusConfig;
}

const { locale, term, config = giscus }: Props = $props();

let container = $state<HTMLElement>();
let loaded = $state(false);
let themeObserver: MutationObserver | undefined;

const discussionsUrl = $derived(`https://github.com/${config.repo}/discussions`);

const load = () => {
	if (!container) return;
	const script = document.createElement("script");
	for (const [name, value] of Object.entries(
		giscusAttributes(config, term, locale, getPreferredTheme()),
	)) {
		script.setAttribute(name, value);
	}
	container.append(script);
	loaded = true;

	themeObserver = new MutationObserver(() => {
		const theme = document.documentElement.dataset.theme as CurrentTheme;
		container
			?.querySelector<HTMLIFrameElement>("iframe.giscus-frame")
			?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, giscusOrigin);
	});
	themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme"] });
};

onDestroy(() => themeObserver?.disconnect());

markUsed(() => [container, loaded, discussionsUrl, load, m]);
</script>

{#if config.categoryId}
	<section class="mt-16 border-t border-[var(--color-brand-line)] pt-8" aria-labelledby="comments-heading">
		<h2 id="comments-heading" class="theme-heading text-2xl normal-case tracking-normal">
			{m.blog_comments_title({}, { locale })}
		</h2>
		{#if !loaded}
			<p class="mt-4 text-[var(--color-brand-muted)]">
				{m.blog_comments_notice({}, { locale })}
				<a href={discussionsUrl}>{m.blog_comments_on_github({}, { locale })}</a>
			</p>
			<button
				type="button"
				class="theme-button-secondary mt-5 rounded-full border px-5 py-2 font-semibold"
				onclick={load}
			>
				{m.blog_comments_load({}, { locale })}
			</button>
		{/if}
		<div bind:this={container} class="giscus mt-6"></div>
	</section>
{/if}
