declare module "*.svx" {
	import type { Component } from "svelte";

	export const metadata: unknown;
	const component: Component;
	export default component;
}

declare module "virtual:blog-modules" {
	import type { Component } from "svelte";

	export const blogModules: Record<string, { default: Component; metadata: unknown }>;
}
