import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
	"/de/",
	"/en/",
	"/de/impressum/",
	"/en/imprint/",
	"/de/datenschutz/",
	"/en/privacy/",
];
const colorSchemes = ["light", "dark"] as const;

type TokenContrastCase = {
	foreground: `--${string}`;
	background: `--${string}`;
	minRatio: number;
};

const tokenContrastCases: TokenContrastCase[] = [
	{ foreground: "--color-brand-link", background: "--color-brand-ink", minRatio: 4.5 },
	{ foreground: "--color-brand-link", background: "--color-brand-panel", minRatio: 4.5 },
	{ foreground: "--color-brand-cyan", background: "--color-brand-ink", minRatio: 4.5 },
	{ foreground: "--color-brand-cyan", background: "--color-brand-panel", minRatio: 4.5 },
	{ foreground: "--color-brand-cyan-soft", background: "--color-brand-panel", minRatio: 4.5 },
	{ foreground: "--color-brand-muted", background: "--color-brand-panel", minRatio: 4.5 },
];

for (const colorScheme of colorSchemes) {
	test.describe(`${colorScheme} mode`, () => {
		for (const route of routes) {
			test(`${route} has no WCAG A/AA violations`, async ({ page }) => {
				await page.emulateMedia({ colorScheme });
				await page.addInitScript(() => {
					window.localStorage.removeItem("roschaefer-theme");
				});
				await page.goto(route);

				const results = await new AxeBuilder({ page })
					.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
					.analyze();

				expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
			});
		}

		test("theme text tokens meet minimum contrast on core surfaces", async ({ page }) => {
			await page.emulateMedia({ colorScheme });
			await page.addInitScript(() => {
				window.localStorage.removeItem("roschaefer-theme");
			});
			await page.goto("/de/");

			const tokenRatios = await page.evaluate((cases) => {
				const parseHexColor = (value: string) => {
					const normalized = value.trim();
					const shortMatch = /^#([0-9a-f]{3})$/i.exec(normalized);
					const longMatch = /^#([0-9a-f]{6})$/i.exec(normalized);
					const hex = shortMatch
						? shortMatch[1]
								.split("")
								.map((character) => `${character}${character}`)
								.join("")
						: longMatch?.[1];

					if (!hex) {
						throw new Error(`Expected 6-digit hex color, received "${value}"`);
					}

					return [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
				};

				const srgbToLinear = (value: number) =>
					value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

				const luminance = (color: string) => {
					const [red, green, blue] = parseHexColor(color).map(srgbToLinear);
					return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
				};

				const contrast = (foreground: string, background: string) => {
					const first = luminance(foreground);
					const second = luminance(background);
					const [lighter, darker] = first > second ? [first, second] : [second, first];
					return (lighter + 0.05) / (darker + 0.05);
				};

				const styles = getComputedStyle(document.documentElement);

				return cases.map((testCase) => {
					const foregroundColor = styles.getPropertyValue(testCase.foreground).trim();
					const backgroundColor = styles.getPropertyValue(testCase.background).trim();
					const ratio = contrast(foregroundColor, backgroundColor);

					return {
						foregroundToken: testCase.foreground,
						backgroundToken: testCase.background,
						foregroundColor,
						backgroundColor,
						minRatio: testCase.minRatio,
						ratio,
					};
				});
			}, tokenContrastCases);

			for (const tokenCase of tokenRatios) {
				expect(
					tokenCase.ratio,
					`${tokenCase.foregroundToken} ${tokenCase.foregroundColor} on ${tokenCase.backgroundToken} ${tokenCase.backgroundColor} in ${colorScheme} mode`,
				).toBeGreaterThanOrEqual(tokenCase.minRatio);
			}
		});

		test("PDF CTA title meets minimum contrast", async ({ page }) => {
			await page.emulateMedia({ colorScheme });
			await page.addInitScript(() => {
				window.localStorage.removeItem("roschaefer-theme");
			});
			await page.goto("/de/");

			const pdfCtaContrast = await page.getByTestId("pdf-cta-title").evaluate((element) => {
				const parseColor = (value: string) => {
					const normalized = value.trim();
					const shortMatch = /^#([0-9a-f]{3})$/i.exec(normalized);
					const longMatch = /^#([0-9a-f]{6})$/i.exec(normalized);
					const rgbMatch = /^rgb\(\s*([0-9]+),\s*([0-9]+),\s*([0-9]+)\s*\)$/i.exec(normalized);
					const hex = shortMatch
						? shortMatch[1]
								.split("")
								.map((character) => `${character}${character}`)
								.join("")
						: longMatch?.[1];

					if (rgbMatch) {
						return rgbMatch.slice(1).map((channel) => Number.parseInt(channel, 10) / 255);
					}

					if (!hex) {
						throw new Error(`Expected rgb(...) or hex color, received "${value}"`);
					}

					return [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
				};

				const srgbToLinear = (value: number) =>
					value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

				const luminance = (color: string) => {
					const [red, green, blue] = parseColor(color).map(srgbToLinear);
					return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
				};

				const contrast = (foreground: string, background: string) => {
					const first = luminance(foreground);
					const second = luminance(background);
					const [lighter, darker] = first > second ? [first, second] : [second, first];
					return (lighter + 0.05) / (darker + 0.05);
				};

				const elementStyles = getComputedStyle(element);
				const rootStyles = getComputedStyle(document.documentElement);
				const foregroundColor = elementStyles.color;
				const backgroundColor = rootStyles.getPropertyValue("--color-brand-panel").trim();

				return {
					foregroundColor,
					backgroundColor,
					ratio: contrast(foregroundColor, backgroundColor),
				};
			});

			expect(
				pdfCtaContrast.ratio,
				`pdf CTA title ${pdfCtaContrast.foregroundColor} on panel ${pdfCtaContrast.backgroundColor} in ${colorScheme} mode`,
			).toBeGreaterThanOrEqual(4.5);
		});
	});
}
