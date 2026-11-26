import { defineParams } from "@sveltejs/kit/params";
import { isLocale } from "#lib/i18n.ts";

export const params = defineParams({
	lang: (param) => (isLocale(param) ? param : undefined),
});
