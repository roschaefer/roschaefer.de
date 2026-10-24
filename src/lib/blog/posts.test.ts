import type { Component } from "svelte";
import { describe, expect, it } from "vitest";
import { blogPostPath, blogSeriesPath, blogTopicPath } from "./paths";
import { publicationPlan } from "./plan";
import {
	type BlogPost,
	filterByTopics,
	getBlogPost,
	getBlogPosts,
	getBlogTopics,
	getBlogTranslation,
	getSeriesPosts,
	validateBlogCollection,
	validateBlogMetadata,
} from "./posts";

const component = (() => undefined) as unknown as Component;
const post = (overrides: Partial<BlogPost>): BlogPost => ({
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

describe("blog metadata", () => {
	const metadata = (dates: { publishedAt?: string; updatedAt?: string } = {}) => ({
		id: "article",
		title: "Article",
		description: "Description",
		series: "git-splice",
		seriesOrder: 1,
		topics: ["git"],
		...dates,
	});

	it("derives publication state from the dates", () => {
		expect(validateBlogMetadata(metadata(), "article.svx").status).toBe("draft");
		expect(
			validateBlogMetadata(metadata({ publishedAt: "2026-10-03" }), "article.svx").status,
		).toBe("published");
	});

	it("requires edits to follow publication", () => {
		expect(() =>
			validateBlogMetadata(metadata({ updatedAt: "2026-10-04" }), "article.svx"),
		).toThrow("updatedAt requires publishedAt");
		expect(() =>
			validateBlogMetadata(
				metadata({ publishedAt: "2026-10-03", updatedAt: "2026-10-03" }),
				"article.svx",
			),
		).toThrow("updatedAt must be later than publishedAt");
	});

	it("rejects explicit status metadata", () => {
		expect(() => validateBlogMetadata({ ...metadata(), status: "draft" }, "article.svx")).toThrow(
			"status is derived from publishedAt",
		);
	});

	it("requires matching bilingual pairs", () => {
		expect(() => validateBlogCollection([post({})])).toThrow(
			"must have exactly one German and one English version",
		);
		expect(() =>
			validateBlogCollection([post({}), post({ locale: "de", slug: "artikel", seriesOrder: 2 })]),
		).toThrow("mismatched seriesOrder");
	});

	it("rejects slugs that collide with blog routes", () => {
		expect(() =>
			validateBlogCollection([post({ slug: "series" }), post({ locale: "de", slug: "serie" })]),
		).toThrow("collides with a blog route");
	});

	it("plans every post exactly once", () => {
		const ids = [...new Set(getBlogPosts("en", true).map(({ id }) => id))];
		expect([...publicationPlan].sort()).toEqual(ids.sort());
	});

	const hasEpisodes = getBlogPosts("en", true).length > 0;

	it.skipIf(!hasEpisodes)(
		"lists drafts in planned order, starting with the problem, then submodules and subtree",
		() => {
			expect(
				getBlogPosts("en", true)
					.slice(0, 3)
					.map(({ id }) => id),
			).toEqual(["problem", "submodule-problems", "subtree-problems"]);
		},
	);

	it.skipIf(!hasEpisodes)("orders each series and resolves translated slugs", () => {
		const english = getSeriesPosts("en", "why-splicing");
		expect(english.map(({ seriesOrder }) => seriesOrder)).toEqual([1, 2, 3, 4, 5]);
		const first = getBlogPost("en", "publishing-parts-of-a-monorepo-independently");
		expect(first).toBeDefined();
		expect(first && getBlogTranslation(first)?.slug).toBe(
			"teile-eines-monorepos-unabhaengig-veroeffentlichen",
		);
	});
});

describe("blog paths", () => {
	it("keeps article URLs flat, independent of series and topics", () => {
		expect(blogPostPath("en", "remotes-are-the-wrong-boundary")).toBe(
			"/en/blog/remotes-are-the-wrong-boundary/",
		);
		expect(blogSeriesPath("de", "git-splice")).toBe("/de/blog/series/git-splice/");
	});

	it("encodes topic filters as repeated query parameters", () => {
		expect(blogTopicPath("en", [])).toBe("/en/blog/");
		expect(blogTopicPath("en", ["git"])).toBe("/en/blog/?topic=git");
		expect(blogTopicPath("en", ["git", "tool-design"])).toBe(
			"/en/blog/?topic=git&topic=tool-design",
		);
	});
});

describe("topic filter", () => {
	const posts = [
		post({ id: "a", topics: ["git", "safety"] }),
		post({ id: "b", topics: ["performance"] }),
		post({ id: "c", topics: ["git", "tool-design"] }),
	];

	it("shows all posts without a topic filter", () => {
		expect(filterByTopics(posts, [])).toEqual(posts);
	});

	it("shows posts matching any of the selected topics", () => {
		expect(filterByTopics(posts, ["safety"]).map(({ id }) => id)).toEqual(["a"]);
		expect(filterByTopics(posts, ["safety", "performance"]).map(({ id }) => id)).toEqual([
			"a",
			"b",
		]);
	});

	it("lists every topic once in alphabetical order", () => {
		expect(getBlogTopics(posts)).toEqual(["git", "performance", "safety", "tool-design"]);
	});
});
