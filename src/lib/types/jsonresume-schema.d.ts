declare module "@jsonresume/schema" {
	export type ResumeValidationError = {
		stack: string;
	};

	export const validate: (
		resume: unknown,
		callback: (errors: ResumeValidationError[] | null, valid: boolean) => void,
	) => void;
}
