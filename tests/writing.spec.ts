import { expect, test } from "@playwright/test";

test("production writing indexes do not expose drafts", async ({ page, request }) => {
	await page.goto("/en/writing/");
	await expect(page.getByRole("heading", { level: 1, name: "Writing" })).toBeVisible();
	await expect(page.getByText("The first articles are being prepared.")).toBeVisible();
	await expect(page.getByText("Where sync state lives")).toHaveCount(0);

	const draft = await request.get("/en/writing/where-sync-state-lives/");
	expect(draft.status()).toBe(404);
});

test("localized RSS feeds contain no draft entries", async ({ request }) => {
	for (const locale of ["de", "en"]) {
		const response = await request.get(`/${locale}/writing/rss.xml`);
		expect(response.ok()).toBe(true);
		expect(response.headers()["content-type"]).toContain("xml");
		const body = await response.text();
		expect(body).toContain(`<language>${locale}</language>`);
		expect(body).not.toContain("<item>");
	}
});

test("portfolio hides writing discovery until something is published", async ({ page }) => {
	await page.goto("/en/");
	await expect(
		page.getByRole("navigation", { name: "Site navigation" }).getByText("Writing"),
	).toHaveCount(0);
	await expect(page.getByRole("heading", { name: "Latest writing" })).toHaveCount(0);
});
