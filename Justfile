# Recipes use bash process substitution, which plain sh does not have.
set shell := ["bash", "-cu"]

# just runs recipes with this file's directory as the working directory,
# so these paths are relative to the repo root regardless of where `just` is invoked from.
linkedin_dir := "linkedin"
linkedin_sync := "./" + linkedin_dir / "target/release/linkedin-sync"
export_dir := linkedin_dir / "export"
resume := "roschaefer.de/resume.i18n.json"

default:
    @just --list

help:
    @just --list


# Build the linkedin-sync release binary.
linkedin-build:
    cargo build --release --manifest-path {{linkedin_dir}}/Cargo.toml

# Show what is out of sync between resume.i18n.json (the a/ side, decrypted on the fly) and the LinkedIn export (the b/ side).
linkedin-diff: linkedin-build
    git diff --no-index <({{linkedin_sync}} resume --resume={{resume}}) <({{linkedin_sync}} linkedin --dir={{export_dir}}) || true
