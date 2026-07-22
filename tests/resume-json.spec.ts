import { expect, test } from "@playwright/test";
import { validateResumeSchema } from "../src/lib/utils/validate-resume-schema";

const routes = ["/de/resume.json", "/en/resume.json"];

for (const route of routes) {
	test(`${route} is valid JSON Resume data`, async ({ request }) => {
		const response = await request.get(route);
		expect(response.ok()).toBeTruthy();

		const resume = await response.json();
		await expect(validateResumeSchema(resume)).resolves.toBeUndefined();
	});
}
