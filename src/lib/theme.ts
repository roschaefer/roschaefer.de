const THEME_STORAGE_KEY = "roschaefer-theme";

export type Theme = "light" | "dark";

const isTheme = (value: string | null): value is Theme => value === "light" || value === "dark";

export const getSystemTheme = (): Theme =>
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const getStoredTheme = (): Theme | null => {
	if (typeof window === "undefined") {
		return null;
	}

	const value = window.localStorage.getItem(THEME_STORAGE_KEY);
	return isTheme(value) ? value : null;
};

export const getPreferredTheme = (): Theme => {
	if (typeof window === "undefined") {
		return "dark";
	}

	return getStoredTheme() ?? getSystemTheme();
};

export const applyTheme = (theme: Theme): void => {
	if (typeof document === "undefined") {
		return;
	}

	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
};

export const setThemePreference = (theme: Theme): void => {
	applyTheme(theme);

	if (typeof window !== "undefined") {
		window.localStorage.setItem(THEME_STORAGE_KEY, theme);
	}
};

export const clearThemePreference = (): void => {
	if (typeof window !== "undefined") {
		window.localStorage.removeItem(THEME_STORAGE_KEY);
	}
};
