#!/usr/bin/env bash
set -euo pipefail

test_root="$(mktemp -d)"
trap 'rm -rf "$test_root"' EXIT

cp -R src/content/log "$test_root/log"
while IFS= read -r -d '' article; do
	mv "$article" "${article%.svx}.md"
done < <(find "$test_root/log" -type f -name '*.svx' -print0)

scrut test "$test_root/log"
