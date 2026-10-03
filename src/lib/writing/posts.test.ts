import type { Component } from "svelte";
import { describe, expect, it } from "vitest";
import {
	getSeriesPosts,
	getWritingPost,
	getWritingTranslation,
	validateWritingCollection,
	validateWritingMetadata,
	type WritingPost,
} from "./posts";

const component = (() => undefined) as unknown as Component;
const post = (overrides: Partial<WritingPost>): WritingPost => ({
	id: "article",
	title: "Article",
	description: "Description",
	status: "draft",
	series: "git-splice",
	seriesOrder: 1,
	topics: ["git"],
	locale: "en",
	slug: "article",
	component,
	...overrides,
});

describe("writing metadata", () => {
	it("rejects published content without a publication date", () => {
		expect(() =>
			validateWritingMetadata(
				{
					id: "article",
					title: "Article",
					description: "Description",
					status: "published",
					series: "git-splice",
					seriesOrder: 1,
					topics: ["git"],
				},
				"article.svx",
				"published",
			),
		).toThrow("published articles require publishedAt");
	});

	it("requires matching bilingual pairs", () => {
		expect(() => validateWritingCollection([post({})])).toThrow(
			"must have exactly one German and one English version",
		);
		expect(() =>
			validateWritingCollection([
				post({}),
				post({ locale: "de", slug: "artikel", seriesOrder: 2 }),
			]),
		).toThrow("mismatched seriesOrder");
	});

	it("loads the five ordered draft pairs and resolves translated slugs", () => {
		const english = getSeriesPosts("en", "git-splice");
		expect(english).toHaveLength(5);
		expect(english.map(({ seriesOrder }) => seriesOrder)).toEqual([1, 2, 3, 4, 5]);
		const first = getWritingPost("en", "publishing-parts-of-a-monorepo-independently");
		expect(first).toBeDefined();
		expect(first && getWritingTranslation(first)?.slug).toBe(
			"teile-eines-monorepos-unabhaengig-veroeffentlichen",
		);
	});
});
