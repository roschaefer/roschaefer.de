#!/usr/bin/env bash
set -euo pipefail

test_root="$(mktemp -d)"
trap 'rm -rf "$test_root"' EXIT

cp -R src/content/writing "$test_root/writing"
while IFS= read -r -d '' article; do
	mv "$article" "${article%.svx}.md"
done < <(find "$test_root/writing" -type f -name '*.svx' -print0)

scrut test "$test_root/writing"
