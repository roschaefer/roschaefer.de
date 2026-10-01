import { primaryLanguage, send } from "./goatcounter.ts";

declare const Netlify: { env: { get: (name: string) => string | undefined } };

type Context = {
	ip: string;
	next: () => Promise<Response>;
	waitUntil: (promise: Promise<unknown>) => void;
};

// GoatCounter's API trusts the hits it receives and skips the bot checks its
// own /count endpoint does, so crawlers, link previews and scripts are
// filtered here by user agent.
const botUserAgent =
	/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|curl|wget|python|go-http-client|okhttp|java\/|libwww|httpclient|axios|node-fetch|undici|headless|lighthouse|pingdom|uptime|monitor|scan/i;

const isBot = (userAgent: string | null): boolean => !userAgent || botUserAgent.test(userAgent);

const isPrefetch = (request: Request): boolean =>
	/prefetch|prerender/i.test(
		`${request.headers.get("sec-purpose") ?? ""} ${request.headers.get("purpose") ?? ""}`,
	);

// PDF viewers fetch large files in byte ranges after the first request; only
// the range that starts at the beginning counts as a download.
const isFollowUpRange = (request: Request): boolean => {
	const range = request.headers.get("range");
	return range !== null && !/^bytes=0-/.test(range.trim());
};

const shouldCount = (request: Request): boolean =>
	request.method === "GET" &&
	!isBot(request.headers.get("user-agent")) &&
	!isPrefetch(request) &&
	!isFollowUpRange(request);

export default async (request: Request, context: Context) => {
	const response = await context.next();

	if (!shouldCount(request) || response.status >= 400) {
		return response;
	}

	const token = Netlify.env.get("GOATCOUNTER_API_TOKEN");
	if (!token) {
		console.error("GOATCOUNTER_API_TOKEN is not set, not counting");
		return response;
	}

	const url = new URL(request.url);
	const hit = {
		path: url.pathname,
		title: "",
		ref: request.headers.get("referer") ?? "",
		event: false,
		size: "",
		query: url.search,
		bot: 0,
		user_agent: request.headers.get("user-agent") ?? "",
		language: primaryLanguage(request.headers.get("accept-language")),
		ip: context.ip,
	};
	context.waitUntil(send(hit, token).catch((error) => console.error(error)));

	return response;
};
