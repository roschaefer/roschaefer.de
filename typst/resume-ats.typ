#import "template/theme.typ": brand, item-copy, item-meta, item-title, section-heading

#let lang = sys.inputs.at("lang", default: "de")
#let data = json("content/" + lang + ".typ.json")

#set page(
  paper: "a4",
  margin: (top: 14mm, right: 15mm, bottom: 15mm, left: 15mm),
)

#set text(font: "Titillium", fallback: true, size: 9pt, fill: rgb("#12181f"))
#set par(justify: false, leading: 0.62em)
#show link: set text(fill: brand)

#let experience-entry(entry) = block(breakable: false)[
  #item-title(entry.name, suffix: entry.entity, link-url: entry.url)
  #v(2pt)
  #item-meta(entry.role + "   " + entry.period)
  #if entry.description != "" [
    #v(4pt)
    #item-copy(entry.description)
  ]
  #if entry.keywords.len() > 0 [
    #v(3pt)
    #item-meta(entry.keywords.join(" • "))
  ]
]

#let simple-entry(title, meta: "", copy: "", link-url: none) = block(breakable: false)[
  #item-title(title, link-url: link-url)
  #if meta != "" [
    #v(1.5pt)
    #item-meta(meta)
  ]
  #if copy != "" [
    #v(2pt)
    #item-copy(copy)
  ]
]

#let technology-project-count(count) = {
  if data.locale == "de" {
    if count == 1 { "1 Projekt" } else { str(count) + " Projekte" }
  } else {
    if count == 1 { "1 project" } else { str(count) + " projects" }
  }
}

#text(font: "Jost*", size: 24pt, weight: 700, tracking: 0.03em)[#data.basics.name]
#v(2pt)
#text(size: 10.2pt, weight: 700, tracking: 0.16em, fill: brand)[#upper(data.basics.label)]
#v(7pt)
#item-copy(data.basics.summary)
#v(8pt)
#item-meta(data.labels.website + ": " + data.basics.websiteLabel)
#v(1pt)
#item-meta(data.labels.email + ": " + data.basics.email)

#v(10pt)

#if data.experience.len() > 0 [
  #block(breakable: false)[
    #section-heading(data.labels.selectedProjects)
    #experience-entry(data.experience.first())
  ]
  #v(8pt)
  #for entry in data.experience.slice(1) [
    #experience-entry(entry)
    #v(8pt)
  ]
]

#if data.technologies.len() > 0 [
  #v(4pt)
  #block(breakable: false)[
    #section-heading(data.labels.skills)
    #simple-entry(
      data.technologies.first().name,
      meta: data.technologies.first().duration + "   " + technology-project-count(data.technologies.first().projectCount),
      copy: data.technologies.first().lastUsedLabel,
    )
  ]
  #v(6pt)
  #for entry in data.technologies.slice(1) [
    #simple-entry(
      entry.name,
      meta: entry.duration + "   " + technology-project-count(entry.projectCount),
      copy: entry.lastUsedLabel,
    )
    #v(6pt)
  ]
]

#if data.talks.len() > 0 [
  #v(4pt)
  #block(breakable: false)[
    #section-heading(data.labels.selectedTalks)
    #simple-entry(data.talks.first().name, meta: data.talks.first().entity + "   " + data.talks.first().period, link-url: data.talks.first().url)
  ]
  #v(6pt)
  #for entry in data.talks.slice(1) [
    #simple-entry(entry.name, meta: entry.entity + "   " + entry.period, link-url: entry.url)
    #v(6pt)
  ]
]

#if data.languages.len() > 0 [
  #v(4pt)
  #block(breakable: false)[
    #section-heading(data.labels.languages)
    #simple-entry(data.languages.first().name, meta: data.languages.first().fluency)
  ]
  #v(6pt)
  #for entry in data.languages.slice(1) [
    #simple-entry(entry.name, meta: entry.fluency)
    #v(6pt)
  ]
]

#if data.education.len() > 0 [
  #v(4pt)
  #block(breakable: false)[
    #section-heading(data.labels.education)
    #simple-entry(
      data.education.first().title,
      meta: data.education.first().institution + "   " + data.education.first().period,
      copy: data.education.first().score,
    )
  ]
  #v(6pt)
  #for entry in data.education.slice(1) [
    #simple-entry(entry.title, meta: entry.institution + "   " + entry.period, copy: entry.score)
    #v(6pt)
  ]
]

#if data.profiles.len() > 0 [
  #v(4pt)
  #block(breakable: false)[
    #section-heading(data.labels.profiles)
    #simple-entry(data.profiles.first().network, meta: data.profiles.first().printLabel, link-url: data.profiles.first().url)
  ]
  #v(6pt)
  #for entry in data.profiles.slice(1) [
    #simple-entry(entry.network, meta: entry.printLabel, link-url: entry.url)
    #v(6pt)
  ]
]

#if data.awards.len() > 0 [
  #v(4pt)
  #block(breakable: false)[
    #section-heading(data.labels.awards)
    #simple-entry(
      data.awards.first().title,
      meta: data.awards.first().awarder + "   " + data.awards.first().period,
      copy: data.awards.first().summary,
    )
  ]
  #v(6pt)
  #for entry in data.awards.slice(1) [
    #simple-entry(entry.title, meta: entry.awarder + "   " + entry.period, copy: entry.summary)
    #v(6pt)
  ]
]
