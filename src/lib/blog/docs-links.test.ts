import { describe, expect, it } from "vitest";
import { localDocsSite, rehypeDocsLinks } from "./docs-links";

const link = (href: string) => ({
	type: "element",
	tagName: "a",
	properties: { href },
	children: [],
});

const rewritten = (href: string) => {
	const tree = {
		type: "root",
		children: [{ type: "element", tagName: "p", children: [link(href)] }],
	};
	rehypeDocsLinks({ site: localDocsSite })(tree);
	return tree.children[0].children[0].properties.href;
};

describe("links to the git-splice docs", () => {
	it("point at the local docs site, anchors included", () => {
		expect(
			rewritten("https://roschaefer.github.io/git-splice/docs/sandbox/#any-page-in-a-sandbox"),
		).toBe("http://localhost:3000/git-splice/docs/sandbox/#any-page-in-a-sandbox");
	});

	it("leave other links alone", () => {
		expect(rewritten("https://roschaefer.github.io/git-splicer/")).toBe(
			"https://roschaefer.github.io/git-splicer/",
		);
		expect(rewritten("https://github.com/roschaefer/git-splice")).toBe(
			"https://github.com/roschaefer/git-splice",
		);
	});
});
