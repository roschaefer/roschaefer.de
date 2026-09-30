import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { shortLinks } from "$lib/data/short-links";

const netlifyToml = readFileSync(resolve(process.cwd(), "netlify.toml"), "utf8");

const redirectBlocks = netlifyToml
	.split("[[redirects]]")
	.slice(1)
	.map((block: string) => {
		const from = block.match(/from = "([^"]+)"/)?.[1];
		const to = block.match(/to = "([^"]+)"/)?.[1];

		return { from, to };
	})
	.filter((entry: { from?: string; to?: string }): entry is { from: string; to: string } =>
		Boolean(entry.from && entry.to),
	);

describe("short link redirects", () => {
	it("keeps all configured short links in netlify.toml", () => {
		const redirects = new Map(redirectBlocks.map((entry) => [entry.from, entry.to]));

		for (const [targetUrl, alias] of Object.entries(shortLinks)) {
			expect(redirects.get(alias), `missing redirect for ${alias}`).toBe(targetUrl);
		}
	});
});
