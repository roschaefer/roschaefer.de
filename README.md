# Robert Schäfer Portfolio

Personal portfolio and printable CV built with `SvelteKit`, `Tailwind CSS`, `Paraglide`, and prerendering.

The site is bilingual (`de`, `en`), privacy-conscious, screen-reader friendly, and designed to print cleanly as a CV.

## Stack

- `SvelteKit` with `@sveltejs/adapter-static`
- `Tailwind CSS`
- `Paraglide` for UI i18n
- `Biome` for linting and formatting
- `Vitest` for unit tests
- `Netlify` for hosting, edge locale redirects, and short-link redirects

## Content Model

- `resume.de.json`
- `resume.en.json`

These two files are the canonical localized resume sources.

UI translations live in:

- `messages/de.json`
- `messages/en.json`

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

The app runs with Paraglide compilation as part of the dev workflow.

## Useful Commands

Compile Paraglide messages:

```bash
pnpm paraglide:compile
```

Lint:

```bash
pnpm lint
```

Typecheck:

```bash
pnpm check
```

Test:

```bash
pnpm test
```

Build:

```bash
pnpm build
```

Format:

```bash
pnpm format
```

## Tests

The repo currently checks:

- tech-experience derivation
- locale preference parsing
- localized resume parity
- short-link parity between `src/lib/data/short-links.ts` and `netlify.toml`

## Deployment

Target hosting is `Netlify`.

Important deployment behavior:

- `/` redirects to `/de` or `/en` via a Netlify edge function based on `Accept-Language`
- `/resume.json` redirects to `/de/resume.json` or `/en/resume.json`
- human-readable short links like `/linkedin` or `/oss-contributors-35c3` are defined in `netlify.toml`

## SEO / Social Metadata

The site includes:

- localized `<title>` and meta description tags
- canonical URLs
- `hreflang` tags for the localized portfolio pages
- Open Graph tags
- Twitter card tags

The current social preview image is:

- `static/roschaefer.jpg`

## Project Notes

- Print output is optimized primarily for Firefox.
- The web version and print version share the same content source.
- Generated Paraglide files in `src/lib/paraglide` are expected to be committed.
- CI verifies that `pnpm paraglide:compile` does not leave generated changes uncommitted.
