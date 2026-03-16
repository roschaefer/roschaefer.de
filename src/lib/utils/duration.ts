import type { Locale } from "$lib/i18n";

const unitLabels = {
	de: {
		year: { one: "Jahr", other: "Jahre" },
		month: { one: "Monat", other: "Monate" },
	},
	en: {
		year: { one: "year", other: "years" },
		month: { one: "month", other: "months" },
	},
} as const;

const pluralRules = {
	de: new Intl.PluralRules("de"),
	en: new Intl.PluralRules("en"),
} as const;

const formatUnit = (
	value: number,
	unit: keyof (typeof unitLabels)["de"],
	locale: Locale,
): string => {
	const category = pluralRules[locale].select(value);
	const labels = unitLabels[locale][unit];
	const label = category === "one" ? labels.one : labels.other;
	return `${value} ${label}`;
};

export const formatMonthDuration = (months: number, locale: Locale): string => {
	const years = Math.floor(months / 12);
	const remainder = months % 12;
	const parts: string[] = [];

	if (years > 0) {
		parts.push(formatUnit(years, "year", locale));
	}

	if (remainder > 0 || parts.length === 0) {
		parts.push(formatUnit(remainder, "month", locale));
	}

	return parts.join(", ");
};
