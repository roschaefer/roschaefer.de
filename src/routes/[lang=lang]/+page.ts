import { createSiteContent } from "#lib/utils/content.ts";

export const entries = () => [{ lang: "de" }, { lang: "en" }];

export const load = ({ params }) => ({
	content: createSiteContent(params.lang),
	locale: params.lang,
});
