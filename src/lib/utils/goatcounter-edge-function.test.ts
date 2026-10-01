import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import countPageview, { goatcounterApiUrl } from "../../../netlify/edge-functions/goatcounter.ts";

const visitorIp = "203.0.113.7";
const firefox = "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0";

const beacon = (query: string) =>
	new Request(`https://roschaefer.de/gc/count?${query}`, {
		method: "POST",
		headers: { "user-agent": firefox, "accept-language": "de-DE,de;q=0.9,en;q=0.8" },
	});

const run = async (request: Request) => {
	const pending: Promise<unknown>[] = [];
	const response = await countPageview(request, {
		ip: visitorIp,
		waitUntil: (promise) => pending.push(promise),
	});
	await Promise.all(pending);
	return response;
};

let token: string | undefined;
const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));

beforeEach(() => {
	token = "secret-token";
	vi.stubGlobal("Netlify", { env: { get: () => token } });
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	fetchMock.mockClear();
});

describe("goatcounter edge function", () => {
	it("reports the visitor's own IP and user agent, so GoatCounter does not see the proxy's datacenter IP and discard the hit as a bot", async () => {
		await run(beacon("p=%2Fen%2F&t=Robert&r=https%3A%2F%2Fexample.com%2F&s=1920&b=0&rnd=x"));

		expect(fetchMock).toHaveBeenCalledOnce();
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe(goatcounterApiUrl);
		expect(init.headers).toMatchObject({ authorization: "Bearer secret-token" });
		expect(JSON.parse(init.body as string)).toEqual({
			hits: [
				{
					path: "/en/",
					title: "Robert",
					ref: "https://example.com/",
					event: false,
					size: "1920",
					query: "",
					bot: 0,
					user_agent: firefox,
					language: "de-DE",
					ip: visitorIp,
				},
			],
		});
	});

	it("responds with a no-store GIF like GoatCounter's pixel endpoint", async () => {
		const response = await run(beacon("p=%2Fen%2F"));

		expect(response.headers.get("content-type")).toBe("image/gif");
		expect(response.headers.get("cache-control")).toBe("no-store");
	});

	it("forwards events and the script's own bot detection", async () => {
		await run(beacon("p=download-cv&e=true&b=150"));

		const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(JSON.parse(init.body as string).hits[0]).toMatchObject({
			path: "download-cv",
			event: true,
			bot: 150,
		});
	});

	it("does not call the API for requests without a path", async () => {
		await run(beacon("rnd=x"));

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("still responds when the API token is not configured", async () => {
		token = undefined;
		vi.spyOn(console, "error").mockImplementation(() => {});

		const response = await run(beacon("p=%2Fen%2F"));

		expect(response.status).toBe(200);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
