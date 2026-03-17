#let brand = rgb("#0b84c6")
#let ink = rgb("#12181f")
#let muted = rgb("#5f6973")
#let line-color = rgb("#d7dfe5")
#let chip-fill = rgb("#eef4f7")

#let section-heading(title) = [
  #text(size: 8.2pt, weight: 700, tracking: 0.18em, fill: brand)[#upper(title)]
  #v(4pt)
  #line(length: 100%, stroke: (paint: line-color, thickness: 0.7pt))
  #v(7pt)
]

#let item-title(title, suffix: none, link-url: none) = {
  let content = if link-url != none {
    link(link-url)[#text(weight: 700, fill: ink)[#title]]
  } else {
    text(weight: 700, fill: ink)[#title]
  }

  if suffix != none and suffix != "" {
    [#content#text(fill: muted)[, #suffix]]
  } else {
    [#content]
  }
}

#let item-meta(value) = text(size: 8.1pt, fill: muted)[#value]
#let item-copy(value) = text(size: 8.9pt, fill: ink)[#value]

#let chip(value) = box(
  fill: chip-fill,
  radius: 4pt,
  inset: (x: 5pt, y: 2.4pt),
)[#text(size: 7.3pt, fill: ink)[#value]]
