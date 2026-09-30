# linkedin-sync

Reads this folder's LinkedIn data export and the authoritative
`resume.i18n.json` used by [roschaefer.de](https://roschaefer.de), and
prints either one to stdout as JSON Resume-shaped JSON:

- `linkedin-sync resume` — `resume.i18n.json`, resolved to English, sops-decrypted.
- `linkedin-sync linkedin` — built from the LinkedIn CSV export.

Both sides use the same field names (`basics`, `education`, `skills`,
`projects`), so you can compare them directly with `git diff --no-index`
to see what's out of sync between LinkedIn and the site.

Nothing is written to disk. The resume side contains decrypted client
names, so it is only ever piped into the diff and never lands in a file
that could get committed.

`resume.i18n.json` is always treated as the source of truth: when the two
disagree, the fix is assumed to happen on LinkedIn.

## Prerequisites

- Rust toolchain (`cargo`, `rustc`) — install via [rustup](https://rustup.rs) if you don't have it.
- A LinkedIn data export (see below).
- [`sops`](https://github.com/getsops/sops) with access to the key `resume.i18n.json` is encrypted with. Confidential client names in that file are sops-encrypted (`sopsEncryptedEntity`/`sopsEncryptedUrl`); the tool detects this and shells out to `sops -d` automatically, so you just need `sops` on `PATH` and your key configured.

## Getting a fresh LinkedIn export

1. On LinkedIn: **Settings & Privacy → Data privacy → Get a copy of your data**.
2. Choose "Download larger data archive" (or just make sure "Profile", "Positions", "Education" and "Skills" are included) and request the export. LinkedIn emails you a download link, usually within a few minutes to ~24h.
3. Unzip the archive into `export/`, replacing its contents (`export/Positions.csv`, `export/Education.csv`, `export/Skills.csv`, etc.).
4. Since the export is tracked in git, `git status` / `git diff` will show you exactly what changed in the export since last time — commit it so you have a history of your LinkedIn data over time.

## Build & run

With [`just`](https://github.com/casey/just) (paths are pre-wired in the `Justfile` at the repo root, works from any directory inside the repo):

```sh
just linkedin-diff   # build, then print the diff
```

In the diff, the `a/` side (`-` lines) is the resume and the `b/` side (`+` lines) is LinkedIn. The header shows `/dev/fd/…` instead of file names because both sides are piped in.

Or directly with cargo, from inside `linkedin/` (needs bash for the `<(…)` process substitution):

```sh
cd linkedin
cargo build --release
git diff --no-index <(./target/release/linkedin-sync resume) <(./target/release/linkedin-sync linkedin)
```

`cargo run -- resume` / `cargo run -- linkedin` also work for a quick look at one side without a release build.

### Commands and flags

| Command | Flag | Default | Meaning |
|---|---|---|---|
| `resume` | `--resume=<path>` | `../roschaefer.de/resume.i18n.json` | Path to the authoritative resume data |
| `linkedin` | `--dir=<path>` | `./export` | Where to find `Positions.csv` / `Education.csv` / `Skills.csv` / `Profile.csv` |

Defaults are relative to the current directory, so they fit when running from inside `linkedin/`. Example, running from the repo root instead:

```sh
git diff --no-index \
  <(./linkedin/target/release/linkedin-sync resume --resume=roschaefer.de/resume.i18n.json) \
  <(./linkedin/target/release/linkedin-sync linkedin --dir=linkedin/export)
```

## Reading the output

Both sides share the same shape:

- **`basics`** — name, headline/label, summary, email, location, profile links. LinkedIn's side is a best-effort reconstruction from `Profile.csv` and `Email Addresses.csv`; several fields (a personal `url`, precise `countryCode`) have no clean LinkedIn source and are left out.
- **`education`** — one entry per school. resume.json carries `area`/`score`/full ISO dates; LinkedIn only has a degree name and year-precision dates.
- **`skills`** — resume.json's side is every unique `keywords` value across all projects; LinkedIn's side is `Skills.csv` verbatim. Both sorted alphabetically.
- **`projects`** — resume.json's employment/freelance history as-is (`id`, `entity`, `name`, `roles`, `engagement`, `type`, `keywords`, `description`, ISO dates). LinkedIn's positions are mapped onto the same shape (`entity` = company, `roles` = `[title]`, `startDate`/`endDate` at month precision, `description`); LinkedIn has no independent project/product name, so `name` is left out rather than duplicating the title that's already in `roles`, and there's no `id`, `engagement`, `type`, or per-position `keywords` either.

Both `education` and `projects` arrays are sorted by `startDate` descending on both sides, so the same real-world entry tends to land at (or near) the same array position on each side — that's what keeps a line-based diff readable instead of just a wall of adds/removes.

There's no automatic matching or fuzzy comparison anymore — the tool no longer decides what's "wrong" for you. Read the diff yourself: a block that's pure addition/deletion is usually a LinkedIn-only or resume.json-only entry; a block with both `-` and `+` lines at the same position is usually the same real-world entry with drifted details (a stale end date, a reworded title, a missing description).
