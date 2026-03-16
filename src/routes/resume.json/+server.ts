import { json } from "@sveltejs/kit";
import { getResume } from "$lib/data/resume";

export const prerender = true;

export const GET = () => json(getResume("de"));
