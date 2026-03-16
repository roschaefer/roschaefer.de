const defaultSiteLocale = "de" as const;

type Locale = "de" | "en";

const scoreLocale = (value: string): { locale: string; quality: number } => {
	const [rawLocale, ...params] = value.trim().split(";");
	const qualityParam = params.find((param) => param.trim().startsWith("q="));
	const quality = qualityParam ? Number.parseFloat(qualityParam.trim().slice(2)) : 1;

	return {
		locale: rawLocale.toLowerCase(),
		quality: Number.isFinite(quality) ? quality : 0,
	};
};

const pickPreferredLocale = (
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

const localizedTarget = (pathname: string, locale: Locale): string => {
	if (pathname === "/resume.json") {
		return `/${locale}/resume.json`;
	}

	return `/${locale}/`;
};

export default async (request: Request, context: { next: () => Promise<Response> }) => {
	const url = new URL(request.url);

	if (url.pathname !== "/" && url.pathname !== "/resume.json") {
		return context.next();
	}

	const locale = pickPreferredLocale(request.headers.get("accept-language"));
	const target = localizedTarget(url.pathname, locale);

	if (url.pathname === target) {
		return context.next();
	}

	return Response.redirect(new URL(`${target}${url.search}`, url), 307);
};
