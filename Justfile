# just runs recipes with this file's directory as the working directory,
# so these paths are relative to linkedin/ regardless of where `just` is invoked from.
export_dir := "export"
resume := "../roschaefer.de/main/resume.i18n.json"
out_dir := "output"

default:
    @just --list

help:
    @just --list


# Build the release binary.
build:
    cargo build --release

# Write output/resume.json and output/linkedin.json from the export in export/ and resume.json.
generate: build
    ./target/release/linkedin-sync --dir={{export_dir}} --resume={{resume}} --out-dir={{out_dir}}

# Generate, then show the diff between the two output files.
diff: generate
    git diff --no-index {{out_dir}}/resume.json {{out_dir}}/linkedin.json || true
