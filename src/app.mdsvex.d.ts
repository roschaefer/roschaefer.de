declare module "*.svx" {
	import type { Component } from "svelte";

	export const metadata: unknown;
	const component: Component;
	export default component;
}

declare module "virtual:log-modules" {
	import type { Component } from "svelte";

	export const logModules: Record<string, { default: Component; metadata: unknown }>;
}
