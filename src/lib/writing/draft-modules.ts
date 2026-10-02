import type { Component } from "svelte";

export type DraftWritingModule = {
	default: Component;
	metadata: unknown;
};

export const draftWritingModules = import.meta.glob<DraftWritingModule>(
	"/src/content/writing/drafts/{de,en}/*.svx",
	{ eager: true },
);
