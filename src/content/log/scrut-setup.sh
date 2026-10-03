# shellcheck shell=bash

export GIT_CONFIG_GLOBAL=/dev/null
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME="Log Example"
export GIT_AUTHOR_EMAIL="log@example.com"
export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME"
export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"
export GIT_AUTHOR_DATE="2026-01-01T00:00:00Z"
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"

export EXAMPLE_ROOT="$PWD"
example_root="$EXAMPLE_ROOT"
export LIBRARY_FORK="$example_root/library-fork.git"

git init -q --bare --initial-branch=main "$example_root/library-upstream.git"
git clone -q "$example_root/library-upstream.git" "$example_root/library-seed" 2>/dev/null
printf '%s\n' "export const answer = 42;" >"$example_root/library-seed/index.js"
git -C "$example_root/library-seed" add index.js
git -C "$example_root/library-seed" commit -qm "library: initial release"
git -C "$example_root/library-seed" push -q origin main
git clone -q --bare "$example_root/library-upstream.git" "$LIBRARY_FORK"

for example in submodule subtree; do
	git init -q --initial-branch=main "$example_root/$example-monorepo"
	printf '%s\n' "# Application" >"$example_root/$example-monorepo/README.md"
	git -C "$example_root/$example-monorepo" add README.md
	git -C "$example_root/$example-monorepo" commit -qm "application: initial commit"
done

cd "$example_root/submodule-monorepo" || return
