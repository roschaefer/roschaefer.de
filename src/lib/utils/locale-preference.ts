import type { Locale } from "$lib/i18n";

export const defaultSiteLocale: Locale = "de";

const scoreLocale = (value: string): { locale: string; quality: number } => {
	const [rawLocale, ...params] = value.trim().split(";");
	const qualityParam = params.find((param) => param.trim().startsWith("q="));
	const quality = qualityParam ? Number.parseFloat(qualityParam.trim().slice(2)) : 1;

	return {
		locale: rawLocale.toLowerCase(),
		quality: Number.isFinite(quality) ? quality : 0,
	};
};

export const pickPreferredLocale = (
	acceptLanguage: string | null | undefined,
	supportedLocales: readonly Locale[] = ["de", "en"],
	fallbackLocale: Locale = defaultSiteLocale,
): Locale => {
	if (!acceptLanguage) {
		return fallbackLocale;
	}

	const requestedLocales = acceptLanguage
		.split(",")
		.map(scoreLocale)
		.filter((entry) => entry.locale.length > 0)
		.sort((left, right) => right.quality - left.quality);

	for (const { locale } of requestedLocales) {
		const exactMatch = supportedLocales.find((supported) => supported === locale);
		if (exactMatch) {
			return exactMatch;
		}

		const languageMatch = supportedLocales.find((supported) => locale.startsWith(`${supported}-`));
		if (languageMatch) {
			return languageMatch;
		}

		if (locale === "*") {
			return fallbackLocale;
		}
	}

	return fallbackLocale;
};
