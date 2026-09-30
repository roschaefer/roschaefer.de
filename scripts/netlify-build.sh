#!/usr/bin/env bash
# Netlify exposes SOPS_AGE_KEY to the entire build. Take it out of the
# environment first, so mise and the tools it downloads never see it, and
# hand it back only to the site build that decrypts resume.i18n.json.
# Local builds usually have no SOPS_AGE_KEY; sops then uses its key file.
set -euo pipefail

sops_age_key="${SOPS_AGE_KEY-}"
unset SOPS_AGE_KEY

# Only Netlify's own build servers set NETLIFY=true (the Netlify CLI sets
# NETLIFY_LOCAL=true instead). Their build image lacks these tools, while
# local builds are expected to have them already.
if [[ "${NETLIFY-}" == true ]]; then
	curl -fsSL https://mise.run | sh
	mise="$HOME/.local/bin/mise"
	"$mise" trust
	"$mise" install

	# Put the mise tools on PATH directly instead of using `mise exec`, which
	# would run the mise binary with the key in its environment.
	PATH="$("$mise" bin-paths | paste -sd:):$PATH"
	export PATH
fi

if [[ -n "$sops_age_key" ]]; then
	SOPS_AGE_KEY="$sops_age_key" pnpm build
else
	pnpm build
fi
