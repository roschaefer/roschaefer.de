<script lang="ts">
import { onMount } from "svelte";

import {
	applyTheme,
	getPreferredTheme,
	getStoredTheme,
	getSystemTheme,
	getThemePreference,
	setSystemThemePreference,
	setThemePreference,
	THEME_STORAGE_KEY,
	type ThemePreference,
} from "$lib/theme";
import { markUsed } from "$lib/utils/mark-used";

interface Props {
	label: string;
	systemLabel: string;
	lightLabel: string;
	darkLabel: string;
	useSystem: string;
	useLight: string;
	useDark: string;
	class?: string;
}

const {
	label,
	systemLabel,
	lightLabel,
	darkLabel,
	useSystem,
	useLight,
	useDark,
	class: className = "",
}: Props = $props();

let preference = $state<ThemePreference>("system");

const options = $derived<
	{
		value: ThemePreference;
		label: string;
		ariaLabel: string;
	}[]
>([
	{ value: "system", label: systemLabel, ariaLabel: useSystem },
	{ value: "light", label: lightLabel, ariaLabel: useLight },
	{ value: "dark", label: darkLabel, ariaLabel: useDark },
]);

const syncTheme = () => {
	preference = getThemePreference();
	applyTheme(getPreferredTheme());
};

const selectThemePreference = (nextPreference: ThemePreference) => {
	preference = nextPreference;

	if (nextPreference === "system") {
		setSystemThemePreference();
		return;
	}

	setThemePreference(nextPreference);
};

onMount(() => {
	syncTheme();

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const handleChange = () => {
		if (getStoredTheme() !== null) {
			return;
		}

		applyTheme(getSystemTheme());
	};
	const handleStorage = (event: StorageEvent) => {
		if (event.key !== THEME_STORAGE_KEY) {
			return;
		}

		syncTheme();
	};

	mediaQuery.addEventListener("change", handleChange);
	window.addEventListener("storage", handleStorage);

	return () => {
		mediaQuery.removeEventListener("change", handleChange);
		window.removeEventListener("storage", handleStorage);
	};
});

markUsed(() => [
	label,
	systemLabel,
	lightLabel,
	darkLabel,
	useSystem,
	useLight,
	useDark,
	className,
	options,
	preference,
	selectThemePreference,
]);
</script>

<fieldset
	class={`inline-flex rounded-full border border-[var(--color-brand-line)] bg-[var(--color-brand-panel-soft)] p-1 text-xs font-bold uppercase tracking-[0.14em] shadow-[0_10px_30px_-20px_var(--color-brand-shadow)] ${className}`.trim()}
>
	<legend class="sr-only">{label}</legend>
	{#each options as option}
		<label
			class={`relative inline-flex h-8 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full transition-all duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[var(--color-brand-cyan)] ${
				preference === option.value
					? "min-w-24 bg-[var(--color-brand-cyan)] px-3 text-[var(--color-brand-button-primary-text)]"
					: "w-8 bg-transparent text-[var(--color-brand-muted)] hover:text-[var(--color-brand-heading)]"
			}`.trim()}
			title={option.ariaLabel}
		>
			<input
				class="sr-only"
				type="radio"
				name="theme-preference"
				value={option.value}
				checked={preference === option.value}
				aria-label={option.ariaLabel}
				oninput={() => selectThemePreference(option.value)}
			/>
			<span aria-hidden="true" class="flex h-4 w-4 shrink-0 items-center justify-center">
				{#if option.value === "system"}
					<svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current stroke-[1.7]">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M4.75 6.25h14.5a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H4.75a1.5 1.5 0 0 1-1.5-1.5v-8.5a1.5 1.5 0 0 1 1.5-1.5ZM9 20.25h6M12 17.75v2.5"
						/>
					</svg>
				{:else if option.value === "light"}
					<svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current stroke-[1.7]">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 3.5v2.25M12 18.25v2.25M5.99 5.99l1.59 1.59M16.42 16.42l1.59 1.59M3.5 12h2.25M18.25 12h2.25M5.99 18.01l1.59-1.59M16.42 7.58l1.59-1.59M15.5 12A3.5 3.5 0 1 1 8.5 12a3.5 3.5 0 0 1 7 0Z"
						/>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" class="h-4 w-4 fill-none stroke-current stroke-[1.7]">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M18.5 14.25A7.25 7.25 0 0 1 9.75 5.5a.5.5 0 0 0-.69-.54A8.25 8.25 0 1 0 19.04 14.94a.5.5 0 0 0-.54-.69Z"
						/>
					</svg>
				{/if}
			</span>
			{#if preference === option.value}
				<span class="whitespace-nowrap">{option.label}</span>
			{/if}
		</label>
	{/each}
</fieldset>
