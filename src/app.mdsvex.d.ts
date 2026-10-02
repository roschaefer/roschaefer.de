declare module "*.svx" {
	import type { Component } from "svelte";

	export const metadata: unknown;
	const component: Component;
	export default component;
}

declare module "virtual:writing-drafts" {
	import type { Component } from "svelte";

	export const draftWritingModules: Record<string, { default: Component; metadata: unknown }>;
}
