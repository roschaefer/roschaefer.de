import { getResume } from "#lib/data/resume.ts";

export const prerender = true;

export const GET = () => Response.json(getResume("de"));
