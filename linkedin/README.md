# linkedin-sync

Reads this folder's LinkedIn data export and the authoritative
`resume.i18n.json` used by [roschaefer.de](https://roschaefer.de), and
writes each out as a JSON Resume-shaped file:

- `output/resume.json` — resolved to English, sops-decrypted.
- `output/linkedin.json` — built from the LinkedIn CSV export.

Both files use the same field names (`basics`, `education`, `skills`,
`projects`), so you can compare them directly — with `git diff --no-index`,
your editor's diff view, or by committing `output/` and reading `git diff`
across runs — to see what's out of sync between LinkedIn and the site.

`resume.json` is always treated as the source of truth: when the two
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
just linkedin-generate   # build, then write both output files
just linkedin-diff       # generate, then print the diff
```

Or directly with cargo, from inside `linkedin/`:

```sh
cd linkedin
cargo build --release
./target/release/linkedin-sync
git diff --no-index output/resume.json output/linkedin.json
```

`cargo run` also works for a quick check without a release build.

### Flags

| Flag | Default | Meaning |
|---|---|---|
| `--dir=<path>` | `./export` | Where to find `Positions.csv` / `Education.csv` / `Skills.csv` / `Profile.csv` |
| `--resume=<path>` | `<dir>/../../roschaefer.de/resume.i18n.json` | Path to the authoritative resume data |
| `--out-dir=<path>` | `./output` | Where to write `resume.json` and `linkedin.json` |

Example, running from the repo root instead of `linkedin/`:

```sh
./linkedin/target/release/linkedin-sync --dir=linkedin/export --resume=roschaefer.de/resume.i18n.json --out-dir=linkedin/output
```

## Reading the output

Both files share the same shape:

- **`basics`** — name, headline/label, summary, email, location, profile links. LinkedIn's side is a best-effort reconstruction from `Profile.csv` and `Email Addresses.csv`; several fields (a personal `url`, precise `countryCode`) have no clean LinkedIn source and are left out.
- **`education`** — one entry per school. resume.json carries `area`/`score`/full ISO dates; LinkedIn only has a degree name and year-precision dates.
- **`skills`** — resume.json's side is every unique `keywords` value across all projects; LinkedIn's side is `Skills.csv` verbatim. Both sorted alphabetically.
- **`projects`** — resume.json's employment/freelance history as-is (`id`, `entity`, `name`, `roles`, `engagement`, `type`, `keywords`, `description`, ISO dates). LinkedIn's positions are mapped onto the same shape (`entity` = company, `roles` = `[title]`, `startDate`/`endDate` at month precision, `description`); LinkedIn has no independent project/product name, so `name` is left out rather than duplicating the title that's already in `roles`, and there's no `id`, `engagement`, `type`, or per-position `keywords` either.

Both `education` and `projects` arrays are sorted by `startDate` descending on both sides, so the same real-world entry tends to land at (or near) the same array position in each file — that's what keeps a line-based diff readable instead of just a wall of adds/removes.

There's no automatic matching or fuzzy comparison anymore — the tool no longer decides what's "wrong" for you. Read the diff yourself: a block that's pure addition/deletion is usually a LinkedIn-only or resume.json-only entry; a block with both `-` and `+` lines at the same position is usually the same real-world entry with drifted details (a stale end date, a reworded title, a missing description).
