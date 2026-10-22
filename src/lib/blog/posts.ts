import { blogModules } from "virtual:blog-modules";
import type { Component } from "svelte";
import { plannedPosition } from "$lib/blog/plan";
import { type BlogSeriesId, getBlogSeries } from "$lib/blog/series";
import type { Locale } from "$lib/i18n";

export type BlogStatus = "draft" | "published";

export type BlogMetadata = {
	id: string;
	title: string;
	description: string;
	status: BlogStatus;
	publishedAt?: string;
	updatedAt?: string;
	series: BlogSeriesId;
	seriesOrder: number;
	topics: string[];
};

export type BlogPost = BlogMetadata & {
	locale: Locale;
	slug: string;
	component: Component;
};

export type BlogPostSummary = Omit<BlogPost, "component">;

type BlogModule = {
	default: Component;
	metadata: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const requiredString = (metadata: Record<string, unknown>, field: string, path: string): string => {
	const value = metadata[field];
	if (typeof value !== "string" || value.trim() === "") {
		throw new Error(`${path}: ${field} must be a non-empty string`);
	}
	return value;
};

const optionalDate = (
	metadata: Record<string, unknown>,
	field: string,
	path: string,
): string | undefined => {
	const value = metadata[field];
	if (value === undefined) return undefined;
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new Error(`${path}: ${field} must use YYYY-MM-DD`);
	}
	return value;
};

export const validateBlogMetadata = (value: unknown, path: string): BlogMetadata => {
	if (!isRecord(value)) throw new Error(`${path}: frontmatter must be an object`);
	if (value.status !== undefined) {
		throw new Error(`${path}: status is derived from publishedAt and must be omitted`);
	}

	const series = requiredString(value, "series", path);
	if (!getBlogSeries(series)) throw new Error(`${path}: unknown series ${series}`);

	const seriesOrder = value.seriesOrder;
	if (!Number.isInteger(seriesOrder) || (seriesOrder as number) < 1) {
		throw new Error(`${path}: seriesOrder must be a positive integer`);
	}

	const topics = value.topics;
	if (
		!Array.isArray(topics) ||
		topics.length === 0 ||
		topics.some((topic) => typeof topic !== "string")
	) {
		throw new Error(`${path}: topics must be a non-empty string array`);
	}

	const publishedAt = optionalDate(value, "publishedAt", path);
	const updatedAt = optionalDate(value, "updatedAt", path);
	if (updatedAt && !publishedAt) {
		throw new Error(`${path}: updatedAt requires publishedAt`);
	}
	if (updatedAt && publishedAt && updatedAt <= publishedAt) {
		throw new Error(`${path}: updatedAt must be later than publishedAt`);
	}

	return {
		id: requiredString(value, "id", path),
		title: requiredString(value, "title", path),
		description: requiredString(value, "description", path),
		status: publishedAt ? "published" : "draft",
		publishedAt,
		updatedAt,
		series: series as BlogSeriesId,
		seriesOrder: seriesOrder as number,
		topics: [...topics] as string[],
	};
};

const parseModules = (modules: Record<string, BlogModule>): BlogPost[] =>
	Object.entries(modules).map(([path, module]) => {
		const match = path.match(/\/blog\/(de|en)\/([^/]+)\.svx$/);
		if (!match) throw new Error(`Unexpected blog post path: ${path}`);
		const [, locale, slug] = match;
		const metadata = validateBlogMetadata(module.metadata, path);
		return { ...metadata, locale: locale as Locale, slug, component: module.default };
	});

const reservedSlugs = new Set(["series", "rss.xml"]);

export const validateBlogCollection = (posts: BlogPost[]): void => {
	const paths = new Set<string>();
	const pairs = new Map<string, BlogPost[]>();

	for (const post of posts) {
		if (reservedSlugs.has(post.slug)) {
			throw new Error(`Blog post slug ${post.locale}/${post.slug} collides with a blog route`);
		}
		const pathKey = `${post.locale}/${post.slug}`;
		if (paths.has(pathKey)) throw new Error(`Duplicate blog post slug: ${pathKey}`);
		paths.add(pathKey);
		pairs.set(post.id, [...(pairs.get(post.id) ?? []), post]);
	}

	for (const [id, translations] of pairs) {
		if (
			translations.length !== 2 ||
			!translations.some((post) => post.locale === "de") ||
			!translations.some((post) => post.locale === "en")
		) {
			throw new Error(`Blog post ${id} must have exactly one German and one English version`);
		}
		const [first, second] = translations;
		for (const field of ["status", "publishedAt", "series", "seriesOrder"] as const) {
			if (first[field] !== second[field])
				throw new Error(`Blog post ${id} has mismatched ${field}`);
		}
	}
};

const allPosts = parseModules(blogModules);
validateBlogCollection(allPosts);

const bySeriesOrder = (left: BlogPost, right: BlogPost) =>
	left.seriesOrder - right.seriesOrder || left.title.localeCompare(right.title);
const byPlannedPosition = (left: BlogPost, right: BlogPost) =>
	plannedPosition(left.id) - plannedPosition(right.id) || bySeriesOrder(left, right);
const byPublishedDate = (left: BlogPost, right: BlogPost) =>
	(right.publishedAt ?? "").localeCompare(left.publishedAt ?? "") || byPlannedPosition(left, right);

export const blogPostSummary = ({ component: _component, ...summary }: BlogPost): BlogPostSummary =>
	summary;

export const getBlogPosts = (locale: Locale, includeDrafts = import.meta.env.DEV): BlogPost[] =>
	allPosts
		.filter((post) => post.locale === locale && (includeDrafts || post.status === "published"))
		.sort(byPublishedDate);

export const getPublishedBlogPosts = (locale: Locale): BlogPost[] => getBlogPosts(locale, false);

export const getBlogPost = (
	locale: Locale,
	slug: string,
	includeDrafts = import.meta.env.DEV,
): BlogPost | undefined => getBlogPosts(locale, includeDrafts).find((post) => post.slug === slug);

export const getBlogTranslation = (post: BlogPost): BlogPost | undefined =>
	allPosts.find((candidate) => candidate.id === post.id && candidate.locale !== post.locale);

export const getSeriesPosts = (
	locale: Locale,
	series: string,
	includeDrafts = import.meta.env.DEV,
): BlogPost[] =>
	getBlogPosts(locale, includeDrafts)
		.filter((post) => post.series === series)
		.sort(bySeriesOrder);

export const getPublishedBlogEntries = () =>
	allPosts
		.filter((post) => post.status === "published")
		.map(({ locale: lang, slug }) => ({ lang, slug }));

export const getBlogTopics = (posts: BlogPostSummary[]): string[] =>
	[...new Set(posts.flatMap((post) => post.topics))].sort();

export const filterByTopics = <Post extends BlogPostSummary>(
	posts: Post[],
	topics: string[],
): Post[] =>
	topics.length === 0
		? posts
		: posts.filter((post) => post.topics.some((topic) => topics.includes(topic)));
