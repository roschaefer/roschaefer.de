#!/usr/bin/env bash
set -euo pipefail

# Only Netlify's own build servers set NETLIFY=true (the Netlify CLI sets
# NETLIFY_LOCAL=true instead). Their build image lacks Typst, while local
# builds are expected to have it already.
if [[ "${NETLIFY-}" == true ]]; then
	curl -fsSL https://mise.run | sh
	mise="$HOME/.local/bin/mise"
	"$mise" trust
	"$mise" install
	PATH="$("$mise" bin-paths | paste -sd:):$PATH"
	export PATH
fi

pnpm build
