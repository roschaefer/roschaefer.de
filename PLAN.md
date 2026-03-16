# Portfolio Website Plan

This site should serve two purposes:
1. A web portfolio for recruiters, hiring managers, and peers.
2. A print-friendly version that can be exported as a CV document.

## 1. Goals, Audience, Content, Constraints

- Primary goal: clarify (e.g., job search, freelance, credibility).
- Audience: hiring managers, engineering leads, recruiters, peers.
- Positioning: 1–2 sentence summary of who you are + what you excel at.
- Scope: single page vs multi-page; static vs CMS-driven.
- Dual output requirement: web-first but printable as a CV.
- Existing product constraint: keep the current portfolio's look and feel unless a specific UX, accessibility, or print requirement justifies change.
- Engineering constraint: prefer test-driven development for data transformations, rendering logic, and critical UI behavior.
- Localization constraint: support both German and English, with German treated as the primary audience language.
- Constraints: timeline, budget, hosting preference, tech stack comfort.
- Content inventory:
  - About/bio
  - Experience (roles + impact)
  - Projects (2–5 deep dives)
  - Skills/stack
  - Writing/talks (optional)
  - Contact/CTA
  - Resume PDF (optional)

Deliverable: short brief + list of available assets + print requirements.

---

## 2. Information Architecture & Content Structure

Recommended single-page structure:

- Hero
  - Name, role, specialization
  - 1–2 sentence positioning
  - CTA buttons (Contact, Resume, GitHub/LinkedIn)
- Experience
  - Roles with impact bullets (quantified)
  - Tech stack per role
- Featured Projects
  - 2–5 showcase projects
  - For each: problem, solution, stack, results, links
- Skills
  - Languages, frameworks, tooling, infra
  - Add an animated “Tech Experience” block that shows years per technology
    and links each tech to projects where it was used
- About
  - Brief narrative, values
- Contact
  - Email, social links, scheduling (optional)
- Required legal pages
  - `Impressum`
  - `Datenschutzerklärung`

Optional sections:

- Writing/talks
- Open source
- Testimonials
- “Now” section (current focus)
- Talks/media section with privacy-friendly video previews and embeds

Content drafting checklist:

- Each section answers “why you’re valuable” or “what you built”.
- Use metrics and outcomes where possible.
- Keep sentences concise; avoid buzzwords.

Deliverable: page outline + draft content blocks + print layout notes.

---

## 3. Design System & Visual Direction

- Start from the current site's visual language and preserve its typography, color mood, spacing rhythm, and general tone where possible.
- Only introduce visual changes when they improve content clarity, accessibility, responsiveness, or print output.
- Existing visual baseline from `/home/robert/Development/schaefer-development/roschaefer`:
  - dark background with cool blue accent
  - oversized uppercase hero typography
  - `Jost` for display and `Titillium Web` for body copy
  - spacious layout with strong CTA buttons and understated motion
  - textured/parallax background as long as it does not interfere with readability or print
- Typography: keep the current display/body pairing unless there is a strong reason to change it.
- Color palette: preserve the black + cyan/blue identity as the default direction.
- Layout: consistent grid, generous spacing.
- Print style: define a clean 1-page or 2-page CV layout (A4/US Letter).
- Print strategy:
  - optimize first for Firefox print/PDF output
  - keep Chromium print output acceptable, even if not identical
  - prefer a simplified document-style print layout over a visually complex website replica
- Motion: subtle page-load + section reveal animations.
- Brand elements: optional logo/monogram, consistent icon style.
- Design review step: compare the new implementation against the currently running site before making any intentional visual departure.

Deliverable: design tokens (fonts, colors, spacing, motion) + print stylesheet.

---

## 4. Implementation Plan

### Content Source of Truth (JSON Resume)

- Use localized JSON Resume files as the canonical content source:
  - `resume.de.json`
  - `resume.en.json`
- Pipeline:
  - localized JSON Resume data -> site templates (web)
  - localized JSON Resume data -> print-friendly template (CV)
- Benefits:
  - One localized update location for both web and print outputs.
  - Easy to add new views (PDF, plain text, etc.).
- Considerations:
  - Map schema fields to your desired section order and labels.
  - Decide whether to support optional sections (volunteer, awards, publications).
  - Validate against schema to prevent broken builds.
  - Derive technology durations from project date ranges, merging overlapping intervals so "years of experience" is defensible.
  - Derive reverse links from each technology to the projects where it appears.
  - Add stable `id` fields to translatable entries such as projects and talks so locale files can be compared safely.
  - IDs can be generated initially from a slugified title or URL-derived heuristic, but they should become stable content identifiers that do not change accidentally when titles or URLs change.
  - Run static parity checks to ensure `resume.de.json` and `resume.en.json` stay structurally aligned.
  - Validate both locale files against the same TypeScript/schema model.

Deliverable: localized resume file strategy + render pipeline + parity validation plan.

### Localization Strategy

- Support `de` and `en`.
- Infer the initial locale from the `Accept-Language` request header, not the user agent string.
- Provide an explicit language switcher so the choice is always user-controlled.
- Prefer locale-specific routes such as `/de` and `/en` for clarity, sharing, SEO, and prerendering.
- Persist the user's explicit language choice via URL first, and optionally a cookie for redirects.
- Keep locale routing portable at the app level:
  - explicit `/de` and `/en` routes
  - deterministic default fallback to German
  - no dependency on client-side locale redirects
- Use hosting/platform redirects only as an enhancement for first-request locale detection.
- On Netlify, implement `Accept-Language` redirects for `/` and `/resume.json` as an optional edge-level enhancement.
- Apply the same enhancement strategy to the machine-readable resume route.
- Keep non-textual structured data shared where possible, and localize presentation copy separately.
- Translate:
  - navigation labels
  - hero/section copy
  - CTA labels
  - project and talk summaries where needed
  - metadata such as page titles and descriptions
- Current translation decision: summaries and descriptions should be fully translated.
- Keep dates, links, and most technical keywords language-neutral where appropriate.

Deliverable: locale routing plan and translation source structure.

### Contact Strategy

- Provide clear contact options without creating unnecessary spam exposure.
- Prefer a layered approach:
  - primary: email for human users
  - optional: Signal or another lower-spam direct channel
  - optional: Mastodon as a public profile/contact channel
  - optional later: contact form only if there is a clear workflow need
- If email is shown publicly, treat spam reduction as a product requirement.
- Recommended baseline:
  - keep a visible `mailto:` link for usability and no-JS compatibility
  - avoid placing the raw address in many places across the site
  - optionally render the visible label slightly obfuscated in HTML text while keeping the real address in the link target
  - monitor whether spam volume is acceptable before adding more friction
- If spam becomes a problem:
  - use a dedicated alias for the website
  - rotate aliases if needed
  - add a simple server-side contact form with rate limiting/honeypot instead of hiding contact entirely
- Do not rely on JavaScript-only email reveal patterns, because they hurt accessibility and no-JS support more than they help.
- Current contact decisions:
  - email: `hello@roschaefer.de`
  - Signal: use a rotatable public link
  - Mastodon: `https://mastodon.social/@roschaefer`

Deliverable: contact exposure strategy and spam-mitigation decision.

### Media Data Model

- Keep `.url` in `resume.json` as the canonical public link for each talk/media entry.
- Add a separate local TypeScript media metadata file such as `src/lib/data/talks.ts` for website-specific fields such as:
  - `id` or `slug`
  - `provider` (`youtube`, `ccc`, `facebook`)
  - `event`
  - `date`
  - `description`
  - `thumbnail`
  - `duration` (optional)
  - `featured` (optional)
  - `embedMode` (`embed`, `link`)
- Join resume entries with media metadata at build time using a stable `id` or `slug`.
- Keep provider-specific behavior in code, but keep media metadata provider-agnostic in the content file where possible.
- Initial presentation decision: plain prominent video links are acceptable in the first release; privacy-friendly media cards remain a possible later enhancement.
- For print output, prefer domain-owned short aliases over full long video URLs.

Deliverable: talk/media schema, stable key strategy, and `talks.ts` source file definition.

### Open Source Data Model

- Treat open source as a first-class portfolio section, not a secondary link list.
- Render open source content statically at build time.
- Keep a local TypeScript file such as `src/lib/data/openSource.ts` for curated entries and portfolio-specific annotations.
- Optionally generate or enrich that file from GitHub at build time using:
  - GitHub REST API for public repositories
  - GitHub GraphQL API for broader contribution metadata when needed
- Do not fetch GitHub data client-side at runtime.
- Separate raw GitHub facts from curated portfolio context:
  - automated fields: repository name, url, description, stars, primary language, updated date
  - curated fields: why it matters, contribution type, featured status, screenshots, summary
- Support both:
  - owned/maintained repositories
  - notable contributions to third-party projects

Deliverable: `openSource.ts` schema and build-time GitHub sync strategy.

Stack options:

- Framework: SvelteKit with prerendering (preferred)
- Styling: Tailwind CSS
- Tooling: Biome for linting and formatting
- Alternative: plain HTML/CSS/JS if needed

Hosting:

- Netlify, Vercel, GitHub Pages

Content management:

- Hard-coded (fastest)
- Markdown/MDX (clean updates)
- CMS (if frequent updates)

Core components:

- Layout (header, footer, section wrapper)
- Language switcher
- Hero
- Tech Experience visualization on the start page
  - Highlight technologies by years of experience
  - Link each technology to projects where it was used
  - Prefer passive discoverability over explicit filtering
  - Animate a rotating set of technologies and visually highlight the related projects without requiring user input
  - Reuse the previous portfolio's skill-duration idea as the data model, but not necessarily the interaction pattern
  - Make the animation informative first: readable without motion, enhanced by motion
  - Keep the web interaction lightweight and degrade gracefully in print
- Experience list
- Project cards + detail view
- Skills list
- Open source section
  - Featured repositories and selected external contributions
  - Show contribution type, impact summary, and links to GitHub
  - Keep the section curated even if some metadata is imported automatically
- Media embed card
  - Show thumbnail, title, source, and a short privacy notice before loading any third-party player
  - Use click-to-load embeds instead of auto-loading iframes
  - Support YouTube, media.ccc.de, and Facebook with a consistent UI
  - Prefer per-video activation with an optional "remember for this session/device" setting if needed
  - Always provide a direct external link alongside the embed action
- Contact module
- Legal footer navigation
  - Link to `Impressum` and `Datenschutzerklärung` from every page

Progressive enhancement requirements:

- The site must render core content fully without JavaScript.
- Navigation, content hierarchy, links, and contact options must remain usable without JavaScript.
- Interactive enhancements such as tech animations and click-to-load media embeds must degrade to static, readable content.
- Print output must not depend on client-side rendering.
- Print output should simplify the screen layout where necessary to improve cross-browser consistency.
- Prefer native semantic HTML elements such as `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`, and `address` before using generic `div` wrappers.
- Locale selection and locale-specific routing must work without JavaScript.

Routing:

- Locale-first routes:
  - `/de`
  - `/en`
  - `/` defaults to `/de` at the app level
  - `/de/resume.json`
  - `/en/resume.json`
  - `/resume.json` defaults to `/de/resume.json` at the app level
- Separate legal pages:
  - `/impressum`
  - `/datenschutz`
- Add short redirect aliases for print-friendly links on the primary domain
- Optional: /projects/[slug], /writing, /about

Assets:

- Optimize images
- Include resume PDF
- Reuse existing visual assets selectively from `/home/robert/Development/schaefer-development/roschaefer/static` if they still fit the updated content

Deliverable: architecture decisions + component list + content format + print export plan.

---

## 5. Quality, Accessibility, SEO, Performance, Deployment

Accessibility:

- Semantic HTML
- Keyboard navigation
- Contrast checks
- Screen-reader friendly heading structure and landmark usage
- Accessible names for links, buttons, media controls, and external destinations
- Respect `prefers-reduced-motion`
- Ensure all essential information is available without relying on color, motion, or hover

SEO:

- Title/description tags
- Open Graph tags
- Add a share-preview image and localized social metadata for portfolio and legal pages
- Structured data (optional)
- Localize metadata and canonical/hreflang handling for `de` and `en`

Performance:

- Lazy-load images
- Minimize JS
- Static generation
- Do not load third-party video iframes until the user explicitly requests them

Privacy:

- Default to no third-party video requests until explicit user action
- Provide clear provider labels and what loading the embed means
- Prefer local thumbnails and metadata where possible
- Treat media embeds as progressive enhancement, with direct external links as the fallback
- Do not rely on a generic consent wall; use contextual click-to-load cards per video
- Provide a dedicated `Datenschutzerklärung` that covers hosting, logs, contact options, embedded media behavior, and any analytics or third-party requests
- Explain how public contact options are exposed and which data is processed when a user contacts you

Legal/compliance:

- Provide an `Impressum` that is easy to identify, directly accessible, and permanently available
- Keep `Impressum` and `Datenschutzerklärung` reachable from every page, typically via the footer
- If the site includes journalistic-editorial content, evaluate whether an additional responsible editor disclosure is needed
- Current assumption: use home address in the `Impressum` initially, but revisit a dedicated business or `c/o` address solution later if privacy becomes a concern

Media embed strategy:

- YouTube:
  - Use `youtube-nocookie.com` only after click
  - Prefer a local or cached thumbnail if feasible; otherwise evaluate whether remote thumbnails are acceptable
- media.ccc.de:
  - Use the same click-to-load pattern for consistency
  - Consider this the most embed-friendly provider, but keep the same privacy model
- Facebook:
  - Default to link-out if the embed UX or privacy tradeoff is poor
  - Only embed when there is a clear benefit over a direct external link

Consent behavior:

- Primary option: per-video explicit activation only, with no persistent consent state
- Secondary option: optional session-local "remember my choice" if repeated loading becomes annoying in practice
- Avoid global provider-wide consent unless testing shows it materially improves UX

Thumbnail strategy:

- Prefer manually curated thumbnails stored locally in the project
- Fall back to provider thumbnails only when acceptable from a privacy and maintenance perspective
- Ensure every video card still works without a thumbnail

Print link strategy:

- Do not print long raw URLs when they are hard to type or remember.
- Prefer short, human-readable aliases on `roschaefer.de` for selected external targets.
- Keep canonical URLs in the source data and add optional print aliases for:
  - featured projects
  - talk/video links
  - important profile links
- Implement redirects at the routing/deployment layer rather than through a third-party shortening service.
- Prefer readable aliases such as `/dreammall`, `/github`, or `/ccc-open-source` over opaque hashes.

Testing:

- Prefer test-driven development while implementing core features
- Unit test data mapping, duration calculations, content joins, and provider/embed decisions
- Component/integration test accessible rendering, no-JS fallbacks, and print-relevant output where practical
- Lighthouse audit
- Mobile + cross-browser checks
- Print/PDF checks should prioritize Firefox, with Chromium as a secondary compatibility check

Deployment:

- Automated build on push
- Custom domain + SSL
- Netlify deployment with optional edge/function redirects for locale detection
- Analytics (optional)

Deliverable: checklist + deployment plan + print/PDF verification steps.

---

## 6. Human Tasks

- Provide the final legal details for `Impressum` and `Datenschutzerklärung`
  - full name
  - home address or later business/`c/o` address
  - contact details to publish
- Decide which contact channels should be public
  - `hello@roschaefer.de`
  - Signal
  - any additional channels
- Create and maintain localized resume source files
  - `resume.de.json`
  - `resume.en.json`
- Review/generated stable `id` fields for translatable entries such as projects and talks
- Curate which projects are featured on the homepage
- Curate open-source entries for `openSource.ts`
- Curate talk/media metadata for `talks.ts`
  - thumbnails
  - featured status
  - provider behavior (`embed` vs `link`)
- Provide any assets to reuse from the old site
  - background artwork
  - profile image
  - resume PDF
- Review the final legal text before publication

Current details already provided:

- Name: `Robert Schäfer`
- Address: `Unterdorfstrasse 5, 53797 Lohmar`
- Public email: `hello@roschaefer.de`
- Signal link is rotatable and should be treated as replaceable content
- Mastodon profile: `https://mastodon.social/@roschaefer`
- Netlify locale redirects should be enabled as a deployment enhancement
