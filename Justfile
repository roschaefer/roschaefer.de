# just runs recipes with this file's directory as the working directory,
# so these paths are relative to the repo root regardless of where `just` is invoked from.
linkedin_dir := "linkedin"
export_dir := linkedin_dir / "export"
resume := "roschaefer.de/resume.i18n.json"
out_dir := linkedin_dir / "output"

default:
    @just --list

help:
    @just --list


# Build the linkedin-sync release binary.
linkedin-build:
    cargo build --release --manifest-path {{linkedin_dir}}/Cargo.toml

# Write linkedin/output/resume.json and linkedin/output/linkedin.json from the export in linkedin/export/ and resume.i18n.json.
linkedin-generate: linkedin-build
    ./{{linkedin_dir}}/target/release/linkedin-sync --dir={{export_dir}} --resume={{resume}} --out-dir={{out_dir}}

# Generate, then show the diff between the two output files.
linkedin-diff: linkedin-generate
    git diff --no-index {{out_dir}}/resume.json {{out_dir}}/linkedin.json || true
