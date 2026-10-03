import { expect, test } from "@playwright/test";

test("production writing indexes do not expose drafts", async ({ page, request }) => {
	await page.goto("/en/log/");
	await expect(page.getByRole("heading", { level: 1, name: "Log" })).toBeVisible();
	await expect(page.getByText("The first entries are being prepared.")).toBeVisible();
	await expect(page.getByText("Where sync state lives")).toHaveCount(0);

	const draft = await request.get("/en/log/git-splice/why-i-built-git-subtrees/");
	expect(draft.status()).toBe(404);
});

test("localized RSS feeds contain no draft entries", async ({ request }) => {
	for (const [locale, path] of [
		["de", "/de/log/rss.xml"],
		["en", "/en/log/rss.xml"],
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
		page.getByRole("navigation", { name: "Site navigation" }).getByText("Log"),
	).toHaveAttribute("href", "/en/log/");
	await expect(page.getByRole("heading", { name: "Learning, logged." })).toBeVisible();
	await expect(
		page.getByText("In this log, I write about what I learn along the way", { exact: false }),
	).toBeVisible();
	await expect(page.getByRole("link", { name: "Building Git Splice" })).toHaveAttribute(
		"href",
		"/en/log/git-splice/",
	);
	await expect(page.getByText("A five-part bilingual series is currently in draft.")).toBeVisible();

	await page.goto("/de/");
	await expect(
		page.getByRole("navigation", { name: "Seitennavigation" }).getByText("Log"),
	).toHaveAttribute("href", "/de/log/");
	await expect(page.getByRole("heading", { name: "Gelernt. Geloggt." })).toBeVisible();
	await expect(page.getByRole("link", { name: "Git Splice entwickeln" })).toHaveAttribute(
		"href",
		"/de/log/git-splice/",
	);
});
