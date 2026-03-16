import { error, json } from "@sveltejs/kit";
import { getResume } from "$lib/data/resume";
import { isLocale } from "$lib/i18n";

export const prerender = true;

export const entries = () => [{ lang: "de" }, { lang: "en" }];

export const GET = ({ params }) => {
	if (!isLocale(params.lang)) {
		throw error(404, "Locale not found");
	}

	return json(getResume(params.lang));
};
