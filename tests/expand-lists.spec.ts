import { expect, test } from "@playwright/test";

test("show all projects focuses the first newly revealed project", async ({ page }) => {
	await page.goto("/en/");

	const projectsSection = page.locator("#projects");
	const initialCount = await projectsSection.locator("article").count();
	const showAllButton = projectsSection.getByRole("button", { name: /show all projects/i });

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
	const initialCount = await experienceSection.locator("li:has(article)").count();
	const showAllButton = experienceSection.getByRole("button", { name: /show all technologies/i });

	await showAllButton.click();

	await expect(showAllButton).toHaveCount(0);
	const revealedCount = await experienceSection.locator("li:has(article)").count();
	expect(revealedCount).toBeGreaterThan(initialCount);

	const firstRevealedEntry = experienceSection.locator("li:has(article)").nth(initialCount);
	await expect(firstRevealedEntry).toBeFocused();
});
