import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import ProjectKeywordPills, { shouldCollapseKeywordPills } from "./ProjectKeywordPills.svelte";

const keywords = (count: number) =>
	Array.from({ length: count }, (_, index) => `Skill ${index + 1}`);

describe("ProjectKeywordPills", () => {
	it("does not collapse when only one keyword would be hidden", () => {
		const { body } = render(ProjectKeywordPills, {
			props: {
				keywords: keywords(9),
				listId: "project-keywords-test",
				locale: "en",
				visibleSkillIds: new Set<string>(),
				enhanced: true,
			},
		});

		expect(shouldCollapseKeywordPills(9)).toBe(false);
		expect(body).not.toContain("+1 more");
		expect(body.match(/<li/g)).toHaveLength(9);
		expect(body).toContain("Skill 9");
	});

	it("collapses when at least two keywords are hidden", () => {
		const { body } = render(ProjectKeywordPills, {
			props: {
				keywords: keywords(10),
				listId: "project-keywords-test",
				locale: "en",
				visibleSkillIds: new Set<string>(),
				enhanced: true,
			},
		});

		expect(shouldCollapseKeywordPills(10)).toBe(true);
		expect(body).toContain("+2 more");
		expect(body.match(/<li/g)).toHaveLength(9);
		expect(body).toContain("Skill 8");
		expect(body).not.toContain("Skill 9");
	});

	it("links keywords that have visible skill targets", () => {
		const { body } = render(ProjectKeywordPills, {
			props: {
				keywords: ["TypeScript", "Does Not Exist"],
				listId: "project-keywords-test",
				locale: "en",
				visibleSkillIds: new Set(["skill-typescript"]),
				enhanced: true,
			},
		});

		expect(body).toContain('href="#skill-typescript"');
		expect(body).toContain(">TypeScript</a>");
		expect(body).toContain("Does Not Exist");
	});
});
