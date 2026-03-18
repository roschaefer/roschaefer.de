<script lang="ts">
import { onMount } from "svelte";

import {
	applyTheme,
	getPreferredTheme,
	getStoredTheme,
	getSystemTheme,
	setThemePreference,
	type Theme,
} from "$lib/theme";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	label: string;
	switchToDark: string;
	switchToLight: string;
	class?: string;
}

const { label, switchToDark, switchToLight, class: className = "" }: Props = $props();

let theme = $state<Theme>("dark");

const syncTheme = () => {
	theme = getPreferredTheme();
	applyTheme(theme);
};

const toggleTheme = () => {
	const nextTheme = theme === "dark" ? "light" : "dark";
	theme = nextTheme;
	setThemePreference(nextTheme);
};

onMount(() => {
	syncTheme();

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const handleChange = () => {
		if (getStoredTheme() !== null) {
			return;
		}

		theme = getSystemTheme();
		applyTheme(theme);
	};

	mediaQuery.addEventListener("change", handleChange);

	return () => {
		mediaQuery.removeEventListener("change", handleChange);
	};
});

markUsed(() => [label, switchToDark, switchToLight, className, toggleTheme]);
</script>

<button
	type="button"
	class={`inline-flex cursor-pointer items-center bg-transparent p-0 text-[var(--color-brand-heading)] ${className}`.trim()}
	aria-label={theme === "dark" ? switchToLight : switchToDark}
	title={theme === "dark" ? switchToLight : switchToDark}
	onclick={toggleTheme}
>
	<span class="sr-only">{label}</span>
	<span
		aria-hidden="true"
		class="relative flex h-10 w-16 items-center rounded-full border border-[var(--color-brand-line)] bg-[var(--color-brand-panel-soft)] p-1 shadow-[0_10px_30px_-20px_var(--color-brand-shadow)]"
	>
		<span class="flex w-full items-center justify-between px-1 text-[var(--color-brand-muted)]">
			<svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current stroke-[1.7]">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 3.5v2.25M12 18.25v2.25M5.99 5.99l1.59 1.59M16.42 16.42l1.59 1.59M3.5 12h2.25M18.25 12h2.25M5.99 18.01l1.59-1.59M16.42 7.58l1.59-1.59M15.5 12A3.5 3.5 0 1 1 8.5 12a3.5 3.5 0 0 1 7 0Z"
				/>
			</svg>
			<svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current stroke-[1.7]">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M18.5 14.25A7.25 7.25 0 0 1 9.75 5.5a.5.5 0 0 0-.69-.54A8.25 8.25 0 1 0 19.04 14.94a.5.5 0 0 0-.54-.69Z"
				/>
			</svg>
		</span>
		<span
			class={`absolute left-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-cyan)] text-[var(--color-brand-button-primary-text)] shadow-[0_10px_25px_-18px_rgba(10,18,24,0.72)] transition-transform duration-300 ease-in-out ${
				theme === "dark" ? "translate-x-6" : "translate-x-0"
			}`.trim()}
		>
			{#if theme === "dark"}
				<svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current stroke-[1.7]">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M18.5 14.25A7.25 7.25 0 0 1 9.75 5.5a.5.5 0 0 0-.69-.54A8.25 8.25 0 1 0 19.04 14.94a.5.5 0 0 0-.54-.69Z"
					/>
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current stroke-[1.7]">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 3.5v2.25M12 18.25v2.25M5.99 5.99l1.59 1.59M16.42 16.42l1.59 1.59M3.5 12h2.25M18.25 12h2.25M5.99 18.01l1.59-1.59M16.42 7.58l1.59-1.59M15.5 12A3.5 3.5 0 1 1 8.5 12a3.5 3.5 0 0 1 7 0Z"
					/>
				</svg>
			{/if}
		</span>
	</span>
</button>
