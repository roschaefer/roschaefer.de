import { draftWritingModules } from "virtual:writing-drafts";
import type { Component } from "svelte";
import type { Locale } from "$lib/i18n";
import { writingSegment } from "$lib/writing/paths";
import { getWritingSeries, type WritingSeriesId } from "$lib/writing/series";

export type WritingStatus = "draft" | "published";

export type WritingMetadata = {
	id: string;
	title: string;
	description: string;
	status: WritingStatus;
	publishedAt?: string;
	updatedAt?: string;
	series: WritingSeriesId;
	seriesOrder: number;
	topics: string[];
};

export type WritingPost = WritingMetadata & {
	locale: Locale;
	slug: string;
	component: Component;
};

export type WritingPostSummary = Omit<WritingPost, "component">;

type WritingModule = {
	default: Component;
	metadata: unknown;
};

const publishedModules = import.meta.glob<WritingModule>(
	"/src/content/writing/published/{de,en}/*.svx",
	{ eager: true },
);

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

export const validateWritingMetadata = (
	value: unknown,
	path: string,
	expectedStatus: WritingStatus,
): WritingMetadata => {
	if (!isRecord(value)) throw new Error(`${path}: frontmatter must be an object`);

	const status = requiredString(value, "status", path);
	if (status !== "draft" && status !== "published") {
		throw new Error(`${path}: status must be draft or published`);
	}
	if (status !== expectedStatus) {
		throw new Error(`${path}: ${status} content must live in the ${status} directory`);
	}

	const series = requiredString(value, "series", path);
	if (!getWritingSeries(series)) throw new Error(`${path}: unknown series ${series}`);

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
	if (status === "published" && !publishedAt) {
		throw new Error(`${path}: published articles require publishedAt`);
	}

	return {
		id: requiredString(value, "id", path),
		title: requiredString(value, "title", path),
		description: requiredString(value, "description", path),
		status,
		publishedAt,
		updatedAt: optionalDate(value, "updatedAt", path),
		series: series as WritingSeriesId,
		seriesOrder: seriesOrder as number,
		topics: [...topics] as string[],
	};
};

const parseModules = (modules: Record<string, WritingModule>): WritingPost[] =>
	Object.entries(modules).map(([path, module]) => {
		const match = path.match(/\/writing\/(drafts|published)\/(de|en)\/([^/]+)\.svx$/);
		if (!match) throw new Error(`Unexpected writing path: ${path}`);
		const [, directory, locale, slug] = match;
		const metadata = validateWritingMetadata(
			module.metadata,
			path,
			directory === "drafts" ? "draft" : "published",
		);
		return { ...metadata, locale: locale as Locale, slug, component: module.default };
	});

export const validateWritingCollection = (posts: WritingPost[]): void => {
	const paths = new Set<string>();
	const pairs = new Map<string, WritingPost[]>();

	for (const post of posts) {
		const pathKey = `${post.locale}/${post.slug}`;
		if (paths.has(pathKey)) throw new Error(`Duplicate writing slug: ${pathKey}`);
		paths.add(pathKey);
		pairs.set(post.id, [...(pairs.get(post.id) ?? []), post]);
	}

	for (const [id, translations] of pairs) {
		if (
			translations.length !== 2 ||
			!translations.some((post) => post.locale === "de") ||
			!translations.some((post) => post.locale === "en")
		) {
			throw new Error(`Writing ${id} must have exactly one German and one English version`);
		}
		const [first, second] = translations;
		for (const field of ["status", "publishedAt", "series", "seriesOrder"] as const) {
			if (first[field] !== second[field]) throw new Error(`Writing ${id} has mismatched ${field}`);
		}
	}
};

const allPosts = [...parseModules(publishedModules), ...parseModules(draftWritingModules)];
validateWritingCollection(allPosts);

const bySeriesOrder = (left: WritingPost, right: WritingPost) =>
	left.seriesOrder - right.seriesOrder || left.title.localeCompare(right.title);
const byPublishedDate = (left: WritingPost, right: WritingPost) =>
	(right.publishedAt ?? "").localeCompare(left.publishedAt ?? "") || bySeriesOrder(left, right);

export const writingPostSummary = ({
	component: _component,
	...summary
}: WritingPost): WritingPostSummary => summary;

export const getWritingPosts = (
	locale: Locale,
	includeDrafts = import.meta.env.DEV,
): WritingPost[] =>
	allPosts
		.filter((post) => post.locale === locale && (includeDrafts || post.status === "published"))
		.sort(byPublishedDate);

export const getPublishedWritingPosts = (locale: Locale): WritingPost[] =>
	getWritingPosts(locale, false);

export const getWritingPost = (
	locale: Locale,
	slug: string,
	includeDrafts = import.meta.env.DEV,
): WritingPost | undefined =>
	getWritingPosts(locale, includeDrafts).find((post) => post.slug === slug);

export const getWritingTranslation = (post: WritingPost): WritingPost | undefined =>
	allPosts.find((candidate) => candidate.id === post.id && candidate.locale !== post.locale);

export const getSeriesPosts = (
	locale: Locale,
	series: string,
	includeDrafts = import.meta.env.DEV,
): WritingPost[] =>
	getWritingPosts(locale, includeDrafts)
		.filter((post) => post.series === series)
		.sort(bySeriesOrder);

export const getPublishedWritingEntries = () =>
	allPosts
		.filter((post) => post.status === "published")
		.map(({ locale: lang, slug }) => ({ lang, writing: writingSegment(lang), slug }));
