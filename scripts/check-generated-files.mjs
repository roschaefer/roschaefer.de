import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const generatedPaths = ["resume.de.json", "resume.en.json", "src/lib/paraglide"];

try {
	await execFileAsync("git", ["diff", "--exit-code", "--", ...generatedPaths], {
		cwd: process.cwd(),
	});
} catch (error) {
	throw new Error(
		`Generated files are out of date. Run the generators and commit the result.\n${error.stdout ?? ""}${error.stderr ?? ""}`.trim(),
	);
}
