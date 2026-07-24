import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import { shouldCollapseItems } from "./ExpandableItems.svelte";
import ExpandableItemsFixture from "./ExpandableItemsFixture.svelte";

const items = (count: number) => Array.from({ length: count }, (_, index) => `Item ${index + 1}`);

describe("ExpandableItems", () => {
	it("renders every item when only one item would be hidden", () => {
		const { body } = render(ExpandableItemsFixture, {
			props: { items: items(4), previewLimit: 3, enhanced: true },
		});

		expect(shouldCollapseItems(4, 3)).toBe(false);
		expect(body).not.toContain("show more");
		expect(body.match(/data-testid="fixture-item"/g)).toHaveLength(4);
		expect(body).toContain("Item 4");
	});

	it("renders a reveal button when more than one item would be hidden", () => {
		const { body } = render(ExpandableItemsFixture, {
			props: { items: items(5), previewLimit: 3, enhanced: true },
		});

		expect(shouldCollapseItems(5, 3)).toBe(true);
		expect(body).toContain("show more");
		expect(body.match(/data-testid="fixture-item"/g)).toHaveLength(3);
		expect(body).not.toContain("Item 4");
	});

	it("renders every item before JavaScript enhancement", () => {
		const { body } = render(ExpandableItemsFixture, {
			props: { items: items(5), previewLimit: 3, enhanced: false },
		});

		expect(body).not.toContain("show more");
		expect(body.match(/data-testid="fixture-item"/g)).toHaveLength(5);
		expect(body).toContain("Item 5");
	});
});
