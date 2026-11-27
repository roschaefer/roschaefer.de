import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import BlogComments, { type GiscusConfig, giscusAttributes } from "./BlogComments.svelte";

const config: GiscusConfig = {
	repo: "roschaefer/roschaefer.de",
	repoId: "R_test",
	category: "Blog",
	categoryId: "DIC_test",
};

describe("BlogComments", () => {
	it("loads nothing from GitHub until the reader asks for the comments", () => {
		const { body } = render(BlogComments, {
			props: { locale: "en", term: "subtree-problems", config },
		});

		expect(body).toContain("Load comments");
		expect(body).toContain('href="https://github.com/roschaefer/roschaefer.de/discussions"');
		expect(body).not.toContain("<script");
		expect(body).not.toContain("<iframe");
	});

	it("renders nothing while no discussion category is configured", () => {
		const { body } = render(BlogComments, {
			props: { locale: "en", term: "subtree-problems", config: { ...config, categoryId: "" } },
		});

		expect(body).not.toContain("Load comments");
	});

	it("maps both translations of a post to one discussion, named by the post's id", () => {
		const english = giscusAttributes(config, "subtree-problems", "en", "dark");
		const german = giscusAttributes(config, "subtree-problems", "de", "light");

		expect(english["data-mapping"]).toBe("specific");
		expect(english["data-strict"]).toBe("1");
		expect(english["data-term"]).toBe(german["data-term"]);
		expect(german["data-lang"]).toBe("de");
		expect(german["data-theme"]).toBe("light");
	});
});
