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
	for (const [locale, path] of [
		["de", "/de/artikel/rss.xml"],
		["en", "/en/writing/rss.xml"],
	] as const) {
		const response = await request.get(path);
		expect(response.ok()).toBe(true);
		expect(response.headers()["content-type"]).toContain("xml");
		const body = await response.text();
		expect(body).toContain(`<language>${locale}</language>`);
		expect(body).not.toContain("<item>");
	}
});

test("portfolio links to writing and shows the current focus before publication", async ({
	page,
}) => {
	await page.goto("/en/");
	await expect(
		page.getByRole("navigation", { name: "Site navigation" }).getByText("Writing"),
	).toHaveAttribute("href", "/en/writing/");
	await expect(page.getByRole("heading", { name: "Building Git Splice" })).toBeVisible();
	await expect(page.getByText("A five-part bilingual series is currently in draft.")).toBeVisible();

	await page.goto("/de/");
	await expect(
		page.getByRole("navigation", { name: "Seitennavigation" }).getByText("Artikel"),
	).toHaveAttribute("href", "/de/artikel/");
	await expect(page.getByRole("heading", { name: "Git Splice entwickeln" })).toBeVisible();
});
