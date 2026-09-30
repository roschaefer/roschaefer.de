import { isLocale } from "$lib/i18n";

export const match = (value: string) => isLocale(value);
