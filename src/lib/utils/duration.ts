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

const quarterFractions: Record<number, string> = { 3: "¼", 6: "½", 9: "¾" };

// Once there's at least a year of experience, month-level precision mostly
// adds noise (and width - "7 years, 4 months" doesn't fit a table column at
// tablet sizes where "7¼ years" does), so round the remainder to the nearest
// quarter year instead. Below a year, keep the exact month count.
export const formatMonthDuration = (months: number, locale: Locale): string => {
	const years = Math.floor(months / 12);
	const remainder = months % 12;

	if (years === 0) {
		return formatUnit(remainder, "month", locale);
	}

	const roundedRemainder = Math.round(remainder / 3) * 3;
	if (roundedRemainder === 12) {
		return formatUnit(years + 1, "year", locale);
	}

	const fraction = quarterFractions[roundedRemainder];
	if (!fraction) {
		return formatUnit(years, "year", locale);
	}

	return `${years}${fraction} ${unitLabels[locale].year.other}`;
};
