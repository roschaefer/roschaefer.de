#!/usr/bin/env bash
# Netlify exposes SOPS_AGE_KEY to the entire build. Take it out of the
# environment first, so mise and the tools it downloads never see it, and
# hand it back only to the site build that decrypts resume.i18n.json.
set -euo pipefail

sops_age_key="${SOPS_AGE_KEY:?SOPS_AGE_KEY must be set in the Netlify environment}"
unset SOPS_AGE_KEY

curl -fsSL https://mise.run | sh
mise="$HOME/.local/bin/mise"
"$mise" trust
"$mise" install

# Put the mise tools on PATH directly instead of using `mise exec`, which
# would run the mise binary with the key in its environment.
PATH="$("$mise" bin-paths | paste -sd:):$PATH"
export PATH

SOPS_AGE_KEY="$sops_age_key" pnpm build
