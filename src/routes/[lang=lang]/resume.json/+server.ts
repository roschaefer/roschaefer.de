import { getResume } from "#lib/data/resume.ts";

export const prerender = true;

export const entries = () => [{ lang: "de" }, { lang: "en" }];

export const GET = ({ params }) => Response.json(getResume(params.lang));
