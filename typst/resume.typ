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

#let experience-entry(entry) = [
  #item-title(entry.name, suffix: entry.entity, link-url: entry.url)
  #v(2pt)
  #item-meta(entry.role + "   " + entry.period)
  #if entry.description != "" [
    #v(4pt)
    #item-copy(entry.description)
  ]
  #if entry.keywords.len() > 0 [
    #v(5pt)
    #grid(
      columns: (1fr, 1fr),
      gutter: 4pt,
      ..entry.keywords.map(chip),
    )
  ]
]

#let talk-entry(entry) = [
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
      (
        label: data.labels.location,
        value: data.basics.location,
        link: none,
      ),
    ), entry => contact-entry(entry.label, entry.value, link-url: entry.link))
  ],
)

#v(10pt)

#grid(
  columns: (2.1fr, 1fr),
  gutter: 16pt,
  [
    #section-heading(data.labels.selectedProjects)
    #for entry in data.experience [
      #experience-entry(entry)
      #v(10pt)
    ]

    #if data.talks.len() > 0 [
      #section-heading(data.labels.selectedTalks)
      #for entry in data.talks [
        #talk-entry(entry)
        #v(7pt)
      ]
    ]
  ],
  [
    #if data.skills.len() > 0 [
      #section-heading(data.labels.skills)
      #grid(
        columns: (1fr, 1fr),
        gutter: 4pt,
        ..data.skills.map(chip),
      )
      #v(10pt)
    ]

    #if data.languages.len() > 0 [
      #section-heading(data.labels.languages)
      #sidebar-list(data.languages, language-entry)
    ]

    #if data.education.len() > 0 [
      #section-heading(data.labels.education)
      #sidebar-list(data.education, education-entry)
    ]

    #if data.profiles.len() > 0 [
      #section-heading(data.labels.profiles)
      #sidebar-list(data.profiles, profile-entry)
    ]

    #if data.awards.len() > 0 [
      #section-heading(data.labels.awards)
      #sidebar-list(data.awards, award-entry)
    ]
  ],
)
