import { pickPreferredLocale } from "../../src/lib/utils/locale-preference";

const localizedTarget = (pathname: string, locale: "de" | "en"): string => {
	if (pathname === "/resume.json") {
		return `/${locale}/resume.json`;
	}

	return `/${locale}`;
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
