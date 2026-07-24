import { expect, test } from "@playwright/test";

test("project keyword pills expand without horizontal overflow", async ({ page }) => {
	await page.goto("/en/");

	const keywordList = page
		.getByTestId("project-keywords")
		.filter({ has: page.getByRole("button") })
		.first();
	const moreButton = keywordList.getByRole("button", { name: /\+\d+ more/ });
	const keywordListId = await moreButton.getAttribute("aria-controls");
	expect(keywordListId).toBeTruthy();
	const expandedKeywordList = page.locator(`#${keywordListId}`);
	const initialPillCount = await keywordList.locator("li").count();

	await moreButton.click();

	await expect(expandedKeywordList.getByRole("button")).toHaveCount(0);
	expect(await expandedKeywordList.locator("li").count()).toBeGreaterThan(initialPillCount);
	await expect(expandedKeywordList).toBeFocused();

	const layout = await page.evaluate(() => ({
		scrollWidth: document.documentElement.scrollWidth,
		clientWidth: document.documentElement.clientWidth,
	}));

	expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
});

test("project keyword pills render fully without JavaScript", async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();

	await page.goto("/en/");

	const keywordCounts = await page
		.getByTestId("project-keywords")
		.evaluateAll((lists) => lists.map((list) => list.querySelectorAll("li").length));

	await expect(page.getByTestId("project-keywords").getByRole("button")).toHaveCount(0);
	expect(Math.max(...keywordCounts)).toBeGreaterThan(8);

	await context.close();
});
