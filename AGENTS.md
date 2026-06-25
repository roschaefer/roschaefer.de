# Agent Notes

This repository contains the current `roschaefer.de` portfolio site. Treat this file as durable project guidance for coding agents and automation. For human-facing setup and deployment details, start with `README.md`.

## Product Intent

The site serves two purposes:

1. A web portfolio for recruiters, hiring managers, engineering leads, peers, and collaborators.
2. A high-quality CV/PDF derived from the same resume content source.

Core goals:

- Clarify Robert's positioning quickly for hiring and collaboration contexts.
- Keep the web portfolio and downloadable CV consistent without duplicating content by hand.
- Support German and English, with German treated as the primary audience language.
- Keep the site privacy-conscious, accessible, static-first, and easy to maintain.
- Prefer test-driven changes for data transformations, rendering logic, and critical UI behavior.

Content should stay focused on value and evidence:

- About/bio
- Experience with impact
- Featured projects
- Skills and technology experience
- Open source
- Talks/media where relevant
- Contact
- Resume PDF
- Legal pages

Each section should answer "why this matters" or "what was built". Prefer concrete outcomes over buzzwords.

## Information Architecture

The main portfolio page should remain scannable and direct:

- Hero with name, role, positioning, and primary calls to action.
- Experience with role impact, scope, and relevant stack.
- Featured projects with problem, solution, stack, result, and links.
- Skills and technology experience, including derived years of experience where defensible.
- Open source as a first-class section, not just a link list.
- Talks/media with privacy-friendly behavior.
- Contact options.
- Footer navigation to legal pages.

Optional content can be added when it has enough substance:

- Writing
- Testimonials
- Current-focus/"now" content
- Project detail pages

## Visual And UX Direction

Preserve the current site's visual identity unless a change improves clarity, accessibility, responsiveness, or PDF/print output.

Current direction:

- Dark portfolio identity with cool blue/cyan accents.
- Strong display typography with readable body copy.
- Generous spacing and clear section hierarchy.
- Subtle motion only where it improves orientation or polish.
- Motion must respect `prefers-reduced-motion`.
- Interactive enhancements must degrade to readable static content.

Do not add visual changes just to restyle the site. Make departures intentional and explain the user-facing reason.

## Content Source Of Truth

The authored resume source is:

- `resume.i18n.json`

Generated localized resume files are:

- `resume.de.json`
- `resume.en.json`

The pipeline is:

- `resume.i18n.json` -> localized JSON Resume data
- localized JSON Resume data -> web rendering
- localized JSON Resume data -> Typst-ready data
- Typst-ready data -> PDFs

Guidelines:

- Edit resume content in `resume.i18n.json`, then run `pnpm resume:build`.
- Keep German and English resume structures aligned.
- Validate both localized files against the same TypeScript/schema model.
- Use stable `id` fields for translatable entries such as projects and talks.
- IDs should not change just because a title or URL changes.
- Derive technology durations from project date ranges, merging overlapping intervals so "years of experience" remains defensible.
- Derive reverse links from each technology to the projects where it appears.

## PDF And Print

The PDF is a dedicated document output, not a browser printout of the website.

PDF priorities:

- Consistent pagination.
- Strong typography.
- Stable link presentation.
- Predictable output in CI.
- Locale-specific output matching the localized route.

Stable public PDF URLs:

- `/de/robert-schaefer-resume.de.pdf`
- `/en/robert-schaefer-resume.en.pdf`

Browser print is only a fallback. It should not try to reproduce the full CV layout once the Typst PDF exists.

PDF implementation rules:

- Keep Typst layout code separate from the SvelteKit app.
- Generate Typst data, not Typst template code.
- Keep checked-in Typst templates hand-written and modular.
- Do not use GitHub Actions artifacts as canonical public PDF URLs.
- Treat workflow artifacts only as CI inspection output when useful.

## Localization

Supported locales:

- `de`
- `en`

Routing should stay explicit and shareable:

- `/de`
- `/en`
- `/de/resume.json`
- `/en/resume.json`

Locale behavior:

- Infer the initial locale from the `Accept-Language` request header.
- Provide an explicit language switcher.
- Prefer URL-based locale persistence.
- Keep deterministic fallback behavior, with German as the default.
- Treat platform-level redirects as an enhancement, not the only way locale routing works.

Translate presentation copy and content summaries where needed:

- Navigation labels
- Hero and section copy
- CTA labels
- Project and talk summaries
- Page titles and descriptions

Dates, links, and technical keywords can remain language-neutral when that is clearer.

## Contact And Privacy

Contact options should be clear without creating unnecessary spam exposure.

Preferred approach:

- Keep email usable for humans and no-JS users.
- Avoid repeating the raw email address across the site.
- Consider a dedicated alias or server-side form only if spam becomes a real problem.
- Do not rely on JavaScript-only email reveal patterns.

Optional channels can include Signal or Mastodon when they are actively maintained.

Privacy defaults:

- Do not load third-party video iframes until explicit user action.
- Provide direct external links as fallbacks.
- Use contextual click-to-load behavior for embeds.
- Avoid generic consent walls.
- Explain relevant data processing in the privacy policy.

## Media Content

Keep canonical public talk/media links in resume data. Website-specific media metadata can live in a local TypeScript data file when needed.

Useful media fields:

- Stable `id` or `slug`
- Provider
- Event
- Date
- Description
- Thumbnail
- Duration
- Featured flag
- Embed mode

Guidelines:

- Join resume entries with website metadata by stable ID or slug.
- Keep provider-specific behavior in code.
- Keep metadata provider-agnostic where possible.
- Prefer prominent direct links when an embed adds little value.
- For PDF output, prefer readable domain-owned short aliases over long video URLs.

## Open Source Content

Open source should be curated as portfolio content, not dumped from an API.

Guidelines:

- Render open source content statically at build time.
- Separate raw GitHub facts from curated portfolio context.
- Include both owned/maintained repositories and notable third-party contributions.
- Do not fetch GitHub data client-side at runtime.

Useful fields:

- Repository name
- URL
- Description
- Primary language
- Contribution type
- Impact summary
- Featured flag
- Screenshots or supporting assets when useful

## Core Components

Expected UI building blocks:

- Layout, header, footer, and section wrappers.
- Language switcher.
- Hero.
- Resume PDF CTA.
- Tech experience visualization.
- Experience list.
- Project cards and optional project detail routes.
- Skills list.
- Open source section.
- Media link/embed cards.
- Contact module.
- Legal footer navigation.

Progressive enhancement requirements:

- Core content must render without JavaScript.
- Navigation, links, contact options, and content hierarchy must remain usable without JavaScript.
- Interactive technology animations must degrade to static readable content.
- Click-to-load media cards must always provide direct external links.
- The downloadable PDF must not depend on client-side rendering.
- Locale selection and locale-specific routing must work without JavaScript.

## Routing And Redirects

Keep route behavior predictable:

- `/de`
- `/en`
- `/` redirects or falls back to a localized route.
- `/de/resume.json`
- `/en/resume.json`
- `/resume.json` redirects or falls back to a localized resume JSON route.
- `/impressum` and localized legal routes.
- `/datenschutz` and localized privacy routes.
- Short aliases for print-friendly links on the primary domain.

Short links should be human-readable and owned by the domain. Keep definitions in `src/lib/data/short-links.ts` and `netlify.toml` aligned.

## Quality Bar

Accessibility:

- Semantic HTML.
- Keyboard navigation.
- Clear heading hierarchy and landmarks.
- Accessible names for links, buttons, media controls, and external destinations.
- Sufficient contrast.
- No essential information conveyed only through color, motion, hover, or animation.

SEO and metadata:

- Localized titles and descriptions.
- Canonical URLs.
- `hreflang` tags.
- Open Graph tags.
- Twitter card tags.
- Social preview image.

Performance:

- Static generation.
- Minimal JavaScript.
- Lazy-load non-critical images.
- No third-party video requests before explicit activation.

Testing:

- Unit test data mapping, duration calculations, content joins, and provider/embed decisions.
- Unit test Typst data generation.
- Test locale preference parsing and localized resume parity.
- Test short-link parity between TypeScript data and `netlify.toml`.
- Use accessibility tests for rendered pages where practical.
- Verify generated PDFs in CI for both locales.

## Commands

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm dev
```

Compile Paraglide messages:

```bash
pnpm paraglide:compile
```

Run the normal verification set:

```bash
pnpm check
pnpm test
pnpm lint
```

Build everything, including PDFs:

```bash
pnpm build
```

Build generated resume JSON:

```bash
pnpm resume:build
```

Build PDFs:

```bash
pnpm pdf:build
```

Check generated files:

```bash
pnpm generated:check
```

For documentation-only changes, `git diff --check` is usually enough.

## Git Worktree And Subtree Branch Model

Create or reuse a feature worktree from the folder that contains the bare repo `.git` directory:

```bash
git fetch origin
git worktree list
```

If `<feature>` is already listed, reuse it. Otherwise create it:

```bash
git worktree add <feature>
```

Work in the feature worktree:

```bash
cd <feature>
pnpm install
pnpm check
pnpm test
```

Keep pull requests focused on one coherent change:

- Do not let unrelated edits sneak into a pull request.
- If you notice useful follow-up work that is not required for the current change, leave it out of the current branch.
- Create a separate feature branch and pull request for unrelated changes.
- Prefer this split even for small cleanups because it keeps `git bisect` useful and makes `git blame` easier to reason about.

Keep the branch up to date with `main`:

```bash
git fetch origin
git rebase origin/main
```

When asked to squash commits since `origin/main`, first rebase the branch onto the current `origin/main`, then squash only the commits that still remain on top:

```bash
git fetch origin
git rebase origin/main
git log --oneline origin/main..HEAD
```

Do not use `git reset --soft origin/main` before rebasing onto the current remote base. If `origin/main` advanced and contains equivalent or related commits, a reset can stage unrelated base changes that a normal rebase would have dropped or reconciled. If this happens, use `git reflog` to find the pre-reset commit, reset back to it, then rebase normally.

Before considering the work ready for `git push`, run `pnpm ready`. This script is also used by CI and should stay in sync with the quick, inexpensive checks from the CI pipeline. It should keep successful output concise and print the current check name plus the failing command's output when a check fails.

Publish the branch:

```bash
git push -u origin <feature>
```

## Commit And PR Messages

When a coding agent makes repository changes, commit the completed agent-authored changes before finishing unless the user explicitly asks to leave them uncommitted.

Use Conventional Commits for commit subjects:

```text
<type>(optional-scope): <summary>
```

Examples:

```text
docs: replace planning notes with agent guidance
feat(resume): add open source contribution metadata
fix(i18n): preserve explicit locale selection
```

Pull request commits are squashed before merge, so the final commit message matters. Write the squashed commit message for a future `git blame` reader:

- Use the subject to summarize the behavioral or documentation change.
- Use the body to explain why the changed lines should exist, not what changed. The diff already shows what changed.
- Preserve the user's stated intention in the commit body when it was explained in chat with the coding agent. Capture the problem they wanted solved, the UX or maintenance goal, and any rejected alternatives that clarify why this approach exists.
- Include the motivation, context, constraints, and tradeoffs that are not visible from a single blamed line.
- Mention relevant verification commands and any skipped checks.
- Keep the PR description in sync with the intended squash commit message.
- After changing the commit message during review, update the PR description to match.

## Before Finishing

- Run the narrowest useful verification for the files changed.
- Check `git status --short` and confirm the diff contains only the intended edits.
- Mention any command that could not be run, especially if the change touches generated content, tests, or deployment behavior.
