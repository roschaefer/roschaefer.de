import type { ResumeValidationError } from "@jsonresume/schema";
import { validate } from "@jsonresume/schema";

export const validateResumeSchema = async (resume: unknown): Promise<void> =>
	new Promise<void>((resolve, reject) => {
		validate(resume, (errors: ResumeValidationError[] | null) => {
			if (errors) {
				reject(new Error(errors.map((error: ResumeValidationError) => error.stack).join("\n")));
				return;
			}

			resolve();
		});
	});
