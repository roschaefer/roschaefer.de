import { expect, test } from "@playwright/test";

test("production blog indexes do not expose drafts", async ({ page, request }) => {
	await page.goto("/en/blog/");
	await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();
	await expect(page.getByText("The first entries are being prepared.")).toBeVisible();
	await expect(page.getByText("Where sync state lives")).toHaveCount(0);

	const draft = await request.get("/en/blog/separate-histories-shared-files/");
	expect(draft.status()).toBe(404);
});

test("localized RSS feeds contain no draft entries", async ({ request }) => {
	for (const [locale, path] of [
		["de", "/de/blog/rss.xml"],
		["en", "/en/blog/rss.xml"],
	] as const) {
		const response = await request.get(path);
		expect(response.ok()).toBe(true);
		expect(response.headers()["content-type"]).toContain("xml");
		const body = await response.text();
		expect(body).toContain(`<language>${locale}</language>`);
		expect(body).not.toContain("<item>");
	}
});

test("portfolio links to the blog and shows the current focus before publication", async ({
	page,
}) => {
	await page.goto("/en/");
	await expect(
		page.getByRole("navigation", { name: "Site navigation" }).getByText("Blog"),
	).toHaveAttribute("href", "/en/blog/");
	await expect(page.getByRole("heading", { level: 2, name: "Blog" })).toBeVisible();
	await expect(page.getByText("Current series")).toBeVisible();
	await expect(page.getByRole("link", { name: "Why splicing" })).toHaveAttribute(
		"href",
		"/en/blog/series/why-splicing/",
	);
	await expect(
		page.getByText("A bilingual series about splicing is currently in draft."),
	).toBeVisible();

	await page.goto("/de/");
	await expect(
		page.getByRole("navigation", { name: "Seitennavigation" }).getByText("Blog"),
	).toHaveAttribute("href", "/de/blog/");
	await expect(page.getByText("Aktuelle Serie")).toBeVisible();
	await expect(page.getByRole("link", { name: "Warum Splicing" })).toHaveAttribute(
		"href",
		"/de/blog/series/why-splicing/",
	);
});
