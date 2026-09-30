# Typst PDF Assets

This directory contains the `Typst` source used to build the PDF CV.

## Fonts

The preferred setup is to vendor the PDF fonts into:

```text
typst/fonts/
```

Recommended files:

```text
typst/fonts/Jost-Regular.ttf
typst/fonts/Jost-Bold.ttf
typst/fonts/TitilliumWeb-Regular.ttf
typst/fonts/TitilliumWeb-Bold.ttf
```

The build script checks for `typst/fonts/`:

- the PDF build requires vendored `.ttf` or `.otf` files under `typst/fonts/`
- `Typst` is invoked with `--font-path typst/fonts`
- the build fails immediately if the expected families are not visible to `Typst`

This keeps PDF generation independent of machine-specific system fonts.

## Debugging

Inspect what `Typst` can see:

```bash
typst fonts
typst fonts --font-path typst/fonts
```

Inspect the fonts embedded in the generated PDF:

```bash
pdffonts static/de/robert-schaefer-resume.de.pdf
pdffonts static/en/robert-schaefer-resume.en.pdf
```
