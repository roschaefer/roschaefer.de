export const resumePdfFilename = (locale: "de" | "en"): string =>
	`robert-schaefer-resume.${locale}.pdf`;

export const resumePdfPath = (locale: "de" | "en"): string =>
	`/${locale}/${resumePdfFilename(locale)}`;
