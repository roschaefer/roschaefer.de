import { describe, expect, it } from "vitest";
import { params } from "./params.ts";

const matchLang = (value: string) => params.lang["~standard"].validate(value);

describe("lang param", () => {
	it.each(["de", "en"])("matches the site locale %s", (locale) => {
		expect(matchLang(locale)).toEqual({ value: locale });
	});

	it.each(["fr", "DE", ""])("rejects %j, so the route 404s before load runs", (value) => {
		expect(matchLang(value)).toHaveProperty("issues");
	});
});
