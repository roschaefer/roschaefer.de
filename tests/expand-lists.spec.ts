import { expect, test } from "@playwright/test";

test("show all projects focuses the first newly revealed project", async ({ page }) => {
	await page.goto("/en/");

	const projectsSection = page.locator("#projects");
	const showAllButton = projectsSection.getByRole("button", { name: /show all projects/i });
	// Wait for the button before counting: SSR renders every project, and JS
	// only collapses to the curated set once hydration finishes, so reading
	// the count too early would capture the pre-collapse (already full) list.
	await expect(showAllButton).toBeVisible();
	const initialCount = await projectsSection.locator("article").count();

	await showAllButton.click();

	await expect(showAllButton).toHaveCount(0);
	const revealedCount = await projectsSection.locator("article").count();
	expect(revealedCount).toBeGreaterThan(initialCount);

	const firstRevealedProject = projectsSection.locator("article").nth(initialCount);
	await expect(firstRevealedProject).toBeFocused();
});

test("show all technologies focuses the first newly revealed technology", async ({ page }) => {
	await page.goto("/en/");

	const experienceSection = page.locator("#experience");
	const showAllButton = experienceSection.getByRole("button", { name: /show all technologies/i });
	// See the "show all projects" test above for why this wait matters.
	await expect(showAllButton).toBeVisible();
	const initialCount = await experienceSection.locator("li:has(article)").count();

	await showAllButton.click();

	await expect(showAllButton).toHaveCount(0);
	const revealedCount = await experienceSection.locator("li:has(article)").count();
	expect(revealedCount).toBeGreaterThan(initialCount);

	const firstRevealedEntry = experienceSection.locator("li:has(article)").nth(initialCount);
	await expect(firstRevealedEntry).toBeFocused();
});

test("skill project mentions expand inline and focus the first newly revealed project", async ({
	page,
}) => {
	await page.goto("/en/");

	const moreButton = page
		.locator("#experience")
		.getByRole("button", { name: "and more projects" })
		.first();
	const listId = await moreButton.getAttribute("aria-controls");
	expect(listId).toBeTruthy();
	const mentionsList = page.locator(`#${listId}`);
	const initialMentionCount = await mentionsList.locator("span[tabindex='-1']").count();

	await moreButton.click();

	await expect(mentionsList.getByRole("button")).toHaveCount(0);
	const revealedMentionCount = await mentionsList.locator("span[tabindex='-1']").count();
	expect(revealedMentionCount).toBeGreaterThan(initialMentionCount);

	const firstRevealedMention = mentionsList.locator("span[tabindex='-1']").nth(initialMentionCount);
	await expect(firstRevealedMention).toBeFocused();
});

test("skill project mentions render fully without JavaScript", async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();

	await page.goto("/en/");

	const mentionCounts = await page
		.locator("#experience p")
		.evaluateAll((paragraphs) =>
			paragraphs.map((paragraph) => paragraph.querySelectorAll("span[tabindex='-1']").length),
		);

	await expect(
		page.locator("#experience").getByRole("button", { name: "and more projects" }),
	).toHaveCount(0);
	expect(Math.max(...mentionCounts)).toBeGreaterThan(3);

	await context.close();
});
