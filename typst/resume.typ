#import "template/theme.typ": brand, chip, item-copy, item-meta, item-title, section-heading

#let lang = sys.inputs.at("lang", default: "de")
#let data = json("content/" + lang + ".typ.json")

#set page(
  paper: "a4",
  margin: (top: 14mm, right: 15mm, bottom: 15mm, left: 15mm),
)

#set text(font: "Titillium", fallback: true, size: 9pt, fill: rgb("#12181f"))
#set par(justify: false, leading: 0.62em)
#show link: set text(fill: brand)

#let sidebar-list(items, renderer) = [
  #for item in items [
    #renderer(item)
    #v(7pt)
  ]
]

#let experience-entry(entry) = block(breakable: false)[
  #item-title(entry.name, suffix: entry.entity, link-url: entry.url)
  #v(2pt)
  #item-meta(entry.role + "   " + entry.period)
  #if entry.description != "" [
    #v(4pt)
    #item-copy(entry.description)
  ]
  #if entry.keywords.len() > 0 [
    #v(5pt)
    #for (index, keyword) in entry.keywords.enumerate() [
      #chip(keyword)
      #if index < entry.keywords.len() - 1 [
        #h(4pt)
      ]
    ]
  ]
]

#let talk-entry(entry) = block(breakable: false)[
  #item-title(entry.name, suffix: entry.entity, link-url: entry.url)
  #v(2pt)
  #item-meta(entry.period)
]

#let education-entry(entry) = [
  #item-title(entry.title)
  #v(2pt)
  #item-meta(entry.institution)
  #if entry.period != "" [
    #linebreak()
    #item-meta(entry.period)
  ]
  #if entry.score != "" [
    #linebreak()
    #item-meta(entry.score)
  ]
]

#let award-entry(entry) = [
  #item-title(entry.title, suffix: entry.awarder)
  #if entry.period != "" [
    #v(2pt)
    #item-meta(entry.period)
  ]
  #if entry.summary != "" [
    #v(3pt)
    #item-copy(entry.summary)
  ]
]

#let profile-entry(entry) = [
  #item-title(entry.network, link-url: entry.url)
  #v(1pt)
  #item-meta(entry.printLabel)
]

#let language-entry(entry) = [
  #item-title(entry.name)
  #v(1pt)
  #item-meta(entry.fluency)
]

#let technology-project-count(count) = {
  if data.locale == "de" {
    if count == 1 {
      "1 Projekt"
    } else {
      str(count) + " Projekte"
    }
  } else {
    if count == 1 {
      "1 project"
    } else {
      str(count) + " projects"
    }
  }
}

#let technology-entry(entry) = [
  #item-title(entry.name)
  #v(1pt)
  #item-meta(entry.duration)
  #v(1pt)
  #item-meta(technology-project-count(entry.projectCount))
  #v(1pt)
  #item-meta(entry.lastUsedLabel)
]

#let technology-grid-entry(entry) = [
  #technology-entry(entry)
]

#let contact-entry(label, value, link-url: none) = [
  #text(size: 7.6pt, weight: 700, tracking: 0.1em, fill: brand)[#upper(label)]
  #v(1.5pt)
  #if link-url != none {
    link(link-url)[#item-copy(value)]
  } else {
    item-copy(value)
  }
]

#text(font: "Jost*", size: 24pt, weight: 700, tracking: 0.03em)[#data.basics.name]
#v(2pt)
#text(size: 10.2pt, weight: 700, tracking: 0.16em, fill: brand)[#upper(data.basics.label)]
#v(7pt)

#grid(
  columns: (2.3fr, 1fr),
  gutter: 14pt,
  [
    #item-copy(data.basics.summary)
  ],
  [
    #sidebar-list((
      (
        label: data.labels.website,
        value: data.basics.websiteLabel,
        link: data.basics.websiteUrl,
      ),
      (
        label: data.labels.email,
        value: data.basics.email,
        link: "mailto:" + data.basics.email,
      ),
    ), entry => contact-entry(entry.label, entry.value, link-url: entry.link))
  ],
)

#v(10pt)

#grid(
  columns: (2.1fr, 1fr),
  gutter: 16pt,
  [
    #if data.technologies.len() > 0 [
      #section-heading(data.labels.skills)
      #grid(
        columns: (1fr, 1fr, 1fr),
        gutter: 8pt,
        row-gutter: 7pt,
        ..data.technologies.map(technology-grid-entry),
      )
      #v(10pt)
    ] else if data.skills.len() > 0 [
      #section-heading(data.labels.skills)
      #grid(
        columns: (1fr, 1fr, 1fr),
        gutter: 4pt,
        ..data.skills.map(chip),
      )
      #v(10pt)
    ]

    #if data.experience.len() > 0 [
      #block(breakable: false)[
        #section-heading(data.labels.selectedProjects)
        #experience-entry(data.experience.first())
      ]
      #v(10pt)
    ]
    #for entry in data.experience.slice(1) [
      #experience-entry(entry)
      #v(10pt)
    ]

    #if data.talks.len() > 0 [
      #block(breakable: false)[
        #section-heading(data.labels.selectedTalks)
        #talk-entry(data.talks.first())
      ]
      #v(7pt)
      #for entry in data.talks.slice(1) [
        #talk-entry(entry)
        #v(7pt)
      ]
    ]
  ],
  [
    #if data.languages.len() > 0 [
      #block(breakable: false)[
        #section-heading(data.labels.languages)
        #language-entry(data.languages.first())
      ]
      #v(7pt)
      #for entry in data.languages.slice(1) [
        #language-entry(entry)
        #v(7pt)
      ]
    ]

    #if data.education.len() > 0 [
      #block(breakable: false)[
        #section-heading(data.labels.education)
        #education-entry(data.education.first())
      ]
      #v(7pt)
      #for entry in data.education.slice(1) [
        #education-entry(entry)
        #v(7pt)
      ]
    ]

    #if data.profiles.len() > 0 [
      #block(breakable: false)[
        #section-heading(data.labels.profiles)
        #profile-entry(data.profiles.first())
      ]
      #v(7pt)
      #for entry in data.profiles.slice(1) [
        #profile-entry(entry)
        #v(7pt)
      ]
    ]

    #if data.awards.len() > 0 [
      #block(breakable: false)[
        #section-heading(data.labels.awards)
        #award-entry(data.awards.first())
      ]
      #v(7pt)
      #for entry in data.awards.slice(1) [
        #award-entry(entry)
        #v(7pt)
      ]
    ]
  ],
)
