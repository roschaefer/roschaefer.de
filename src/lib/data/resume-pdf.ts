export type ResumePdfVariant = "default" | "ats";

export const resumePdfFilename = (
	locale: "de" | "en",
	variant: ResumePdfVariant = "default",
): string =>
	variant === "ats"
		? `robert-schaefer-resume-ats.${locale}.pdf`
		: `robert-schaefer-resume.${locale}.pdf`;

export const resumePdfPath = (locale: "de" | "en", variant: ResumePdfVariant = "default"): string =>
	`/${locale}/${resumePdfFilename(locale, variant)}`;
