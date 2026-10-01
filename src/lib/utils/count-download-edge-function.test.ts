import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resumePdfPath } from "$lib/data/resume-pdf";
import countDownload from "../../../netlify/edge-functions/count-download.ts";
import { goatcounterApiUrl } from "../../../netlify/edge-functions/goatcounter.ts";

const visitorIp = "203.0.113.7";
const firefox = "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0";
const pdfUrl = "https://roschaefer.de/en/robert-schaefer-resume.en.pdf";

const download = (url: string, headers: Record<string, string> = {}, method = "GET") =>
	new Request(url, {
		method,
		headers: { "user-agent": firefox, "accept-language": "en-US,en;q=0.9", ...headers },
	});

let fileResponse: Response;

const run = async (request: Request) => {
	const pending: Promise<unknown>[] = [];
	const response = await countDownload(request, {
		ip: visitorIp,
		next: async () => fileResponse,
		waitUntil: (promise) => pending.push(promise),
	});
	await Promise.all(pending);
	return response;
};

let token: string | undefined;
const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));

beforeEach(() => {
	token = "secret-token";
	fileResponse = new Response("%PDF-1.7", { headers: { "content-type": "application/pdf" } });
	vi.stubGlobal("Netlify", { env: { get: () => token } });
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	fetchMock.mockClear();
});

describe("count-download edge function", () => {
	it("counts a direct download that the JS beacon never sees, e.g. a CV link opened from a printout or email", async () => {
		const response = await run(download(pdfUrl, { referer: "https://mail.example.com/" }));

		expect(response).toBe(fileResponse);
		expect(fetchMock).toHaveBeenCalledOnce();
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe(goatcounterApiUrl);
		expect(init.headers).toMatchObject({ authorization: "Bearer secret-token" });
		expect(JSON.parse(init.body as string)).toEqual({
			hits: [
				{
					path: "/en/robert-schaefer-resume.en.pdf",
					title: "",
					ref: "https://mail.example.com/",
					event: false,
					size: "",
					query: "",
					bot: 0,
					user_agent: firefox,
					language: "en-US",
					ip: visitorIp,
				},
			],
		});
	});

	it("leaves bot detection to GoatCounter, whose API flags hits by the forwarded user agent", async () => {
		const googlebot = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

		await run(download(pdfUrl, { "user-agent": googlebot }));

		const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(JSON.parse(init.body as string).hits[0]).toMatchObject({
			user_agent: googlebot,
			bot: 0,
		});
	});

	it("does not count speculative prefetches", async () => {
		await run(download(pdfUrl, { "sec-purpose": "prefetch;prerender" }));

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("counts a PDF viewer's first byte range but not the follow-up ranges of the same download", async () => {
		await run(download(pdfUrl, { range: "bytes=0-65535" }));
		await run(download(pdfUrl, { range: "bytes=65536-131071" }));

		expect(fetchMock).toHaveBeenCalledOnce();
	});

	it("does not count HEAD requests", async () => {
		await run(download(pdfUrl, {}, "HEAD"));

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("does not count failed responses", async () => {
		fileResponse = new Response("Not found", { status: 404 });

		await run(download(pdfUrl));

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("still serves the file when the API token is not configured", async () => {
		token = undefined;
		vi.spyOn(console, "error").mockImplementation(() => {});

		const response = await run(download(pdfUrl));

		expect(response).toBe(fileResponse);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe("count-download routes in netlify.toml", () => {
	const countedPaths = readFileSync(resolve(process.cwd(), "netlify.toml"), "utf8")
		.split("[[edge_functions]]")
		.slice(1)
		.filter((block) => block.includes('function = "count-download"'))
		.map((block) => block.match(/path = "([^"]+)"/)?.[1]);

	it.each(
		(["de", "en"] as const).flatMap((locale) => [
			resumePdfPath(locale),
			resumePdfPath(locale, "ats"),
			`/${locale}/resume.json`,
		]),
	)("counts %s", (path) => {
		expect(countedPaths).toContain(path);
	});
});
