import { locales } from "$lib/paraglide/runtime";

export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);
