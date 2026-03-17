[![Netlify Status](https://api.netlify.com/api/v1/badges/52ed3916-b0ff-40cd-a343-3b35e8e5d4c7/deploy-status)](https://app.netlify.com/projects/roschaefer/deploys)

# Robert Schäfer Portfolio

Personal portfolio and printable CV built with `SvelteKit`, `Tailwind CSS`, `Paraglide`, `Typst`, and prerendering.

The site is bilingual (`de`, `en`), privacy-conscious, screen-reader friendly, and designed to print cleanly as a CV.

## Stack

- `SvelteKit` with `@sveltejs/adapter-static`
- `Tailwind CSS`
- `Paraglide` for UI i18n
- `Typst` for PDF generation
- `Biome` for linting and formatting
- `Vitest` for unit tests
- `Netlify` for hosting, edge locale redirects, and short-link redirects

## Content Model

- `resume.de.json`
- `resume.en.json`

These two files are the canonical localized resume sources.

The downloadable PDFs are generated from the same localized JSON sources through a dedicated `Typst` pipeline.

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

Build production output including PDFs:

```bash
pnpm build:prod
```

Build PDFs only:

```bash
pnpm pdf:build
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

The deployed PDFs are published as:

- `/de/robert-schaefer-resume.de.pdf`
- `/en/robert-schaefer-resume.en.pdf`

Important deployment behavior:

- `/` redirects to `/de` or `/en` via a Netlify edge function based on `Accept-Language`
- `/resume.json` redirects to `/de/resume.json` or `/en/resume.json`
- human-readable short links like `/linkedin` or `/oss-contributors-35c3` are defined in `netlify.toml`

## PDF Build And Deploy

- `Typst` is not assumed to be available in Netlify builds.
- GitHub Actions builds the PDFs and the final static site.
- GitHub Actions deploys the finished `build/` directory to Netlify.
- Netlify should be configured to use the GitHub Actions deployment path rather than relying on its own repository build if you want the PDFs to stay part of every deploy.
- Vendored `ttf` or `otf` fonts under `typst/fonts/` are required for the PDF build. See [`typst/README.md`](/home/robert/Development/schaefer-development/roschaefer.de/typst/README.md).

Required GitHub repository secrets for deployment:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

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
