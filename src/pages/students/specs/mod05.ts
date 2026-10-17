import { n, sel, txt, res, T, asNum, asSel, asStr, num } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Citations & Referencing'

const AUTHORS = txt('authors', 'Author(s) — e.g. Smith, J. A., & Lee, K.', 2, 'Smith, J. A., & Lee, K.')
const TITLE = txt('title', 'Article / book title', 2, 'Social media use and sleep quality')
const SRC = txt('source', 'Journal, book or site', 2, 'Journal of Educational Psychology')

const STYLES = ['APA 7th', 'MLA 9th', 'Chicago 17th', 'Harvard', 'IEEE', 'Vancouver'] as const

function cleanA(s: string): string[] {
  return s
    .split(/&|,|;|\band\b/i)
    .map((x) => x.trim())
    .filter(Boolean)
}

function apaAuthors(authors: string): string {
  const list = cleanA(authors)
  if (list.length === 0) return ''
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]}, & ${list[1]}`
  return `${list.slice(0, -1).join(', ')}, & ${list[list.length - 1]}`
}

function mlaAuthors(authors: string): string {
  const list = cleanA(authors)
  if (!list.length) return ''
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]}, and ${list[1]}`
  return `${list[0]}, et al.`
}

const YEAR = n('year', 'Year', { def: 2023, min: 1500, max: 2100, step: 1 })
const VOL = n('vol', 'Volume', { def: 12, min: 0, max: 999, step: 1 })
const ISSUE = n('issue', 'Issue', { def: 3, min: 0, max: 99, step: 1 })
const PAGES = n('pages', 'Pages (start)', { def: 45, min: 0, max: 9999, step: 1 })
const YEARN = n('end', 'End page', { def: 58, min: 0, max: 9999, step: 1 })

export const mod05: StudentSpec[] = [
  {
    id: 'apa-citation-generator',
    name: 'APA Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a full APA 7th reference entry and its matching in-text form, with correct author ordering, italics markers and DOI slot.',
    tip: 'APA 7 drops the publisher location. If your course still wants it, add the city after the press name — but check your department’s style sheet first.',
    usage: [
      'Enter authors, year, title and source.',
      'Add volume, issue and page numbers.',
      'Copy the reference and in-text citations.',
    ],
    method: [
      'APA lists up to 20 authors before an ellipsis.',
      'Journal articles: Title. Source, Volume(Issue), pages.',
      'In-text: (Author, Year) or Author (Year).',
    ],
    fields: [AUTHORS, YEAR, TITLE, SRC, VOL, ISSUE, PAGES, YEARN],
    compute: (v) => {
      const a = apaAuthors(asStr(v.authors))
      const y = asNum(v.year)
      const t = asStr(v.title) || 'Untitled work'
      const s = asStr(v.source) || 'Source'
      const ref = `${a} (${y}). ${t}. ${s}, ${asNum(v.vol)}(${asNum(v.issue)}), ${asNum(v.pages)}–${asNum(v.end)}. https://doi.org/10.xxxx/xxxxx`
      const first = cleanA(asStr(v.authors))[0] || 'Author'
      return [
        docr('APA 7th reference', ref),
        docr('In-text forms', `Narrative: ${first} (${y}) argued…\nParenthetical: … (${first.split(',')[0]}, ${y}).\nDirect quote: ${first} (${y}, p. ${asNum(v.pages)}).`),
        res('Style reminders', 'Sentence case title · italic journal + volume · DOI as URL'),
      ]
    },
  },
  {
    id: 'mla-citation-generator',
    name: 'MLA Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Formats an MLA 9th works-cited entry and parenthetical citation, applying title case and the container-is-core rule.',
    tip: 'MLA centers on the container: the article title is secondary. Italicize the journal or book, never the article title.',
    usage: [
      'Enter the author, title and container.',
      'Set year and page range.',
      'Copy the works-cited entry.',
    ],
    method: [
      'MLA uses title case for titles.',
      'Three+ authors collapse to “et al.”',
      'In-text citations use (Author page).',
    ],
    fields: [AUTHORS, YEAR, TITLE, SRC, PAGES, YEARN, n('ed', 'Edition (books)', { def: 0, min: 0, max: 9, step: 1 })],
    compute: (v) => {
      const a = mlaAuthors(asStr(v.authors)) || 'Author'
      const y = asNum(v.year)
      const t = asStr(v.title) || 'Untitled'
      const s = asStr(v.source) || 'Container'
      const ed = asNum(v.ed)
      const ref = `${a}. “${t}.” ${s}, ${y}${ed ? `, ${ed}${ed === 1 ? 'st' : ed === 2 ? 'nd' : 'rd'} ed.` : ''}, pp. ${asNum(v.pages)}–${asNum(v.end)}.`
      const first = cleanA(asStr(v.authors))[0] || 'Author'
      return [
        docr('MLA 9th works cited', ref),
        docr('Parenthetical forms', `Quotation: (${first.split(',')[0]} ${asNum(v.pages)})\nNo page: (${first.split(',')[0]})\nTwo authors: (${first.split(',')[0]} and ${cleanA(asStr(v.authors))[1]?.split(',')[0] || 'Coauthor'})`),
        res('Style reminders', 'Title case · “pp.” for ranges · access date for online sources'),
      ]
    },
  },
  {
    id: 'chicago-citation-generator',
    name: 'Chicago Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Generates Chicago notes-bibliography and author-date references, giving you both Chicago styles in one pass.',
    tip: 'Choose notes-bibliology for history, humanities and most essay exams; choose author-date for social science journals.',
    usage: [
      'Enter the bibliographic details.',
      'Pick notes or author-date style.',
      'Copy the entry plus its footnote form.',
    ],
    method: [
      'Notes style numbers superscripts and a full footnote.',
      'Author-date style inverts the order.',
      'Chicago capitalizes title case and includes place for books.',
    ],
    fields: [AUTHORS, YEAR, TITLE, SRC, VOL, PAGES, YEARN, sel('ch', 'Chicago style', ['Notes-Bibliography', 'Author-Date'], 'Notes-Bibliography')],
    compute: (v) => {
      const a = cleanA(asStr(v.authors)).join(', ') || 'Author'
      const y = asNum(v.year)
      const t = asStr(v.title) || 'Untitled'
      const s = asStr(v.source) || 'Source'
      const ch = asSel(v.ch)
      const bib =
        ch === 'Notes-Bibliography'
          ? `${a}. “${t}.” ${s} ${asNum(v.vol)}, no. ${asNum(v.issue)} (${y}): ${asNum(v.pages)}–${asNum(v.end)}.`
          : `${a}. ${y}. “${t}.” ${s} ${asNum(v.vol)}: ${asNum(v.pages)}–${asNum(v.end)}.`
      const note = `${a.split(',')[0]}, “${t},” ${s} ${asNum(v.vol)} (${y}), ${asNum(v.pages)}.`
      return [
        docr(`Chicago ${ch} reference`, bib),
        docr('Footnote form', note),
        res('In-text', ch === 'Notes-Bibliography' ? 'Superscript footnote number' : `(${a.split(',')[0]} ${y}, ${asNum(v.pages)})`),
      ]
    },
  },
  {
    id: 'harvard-citation-generator',
    name: 'Harvard Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Creates Harvard-style references with its distinctive “and” author joiner, no ampersand, and year-in-parentheses placement.',
    tip: 'Harvard is common in UK economics and management. Keep the year in parentheses right after the author list — never after the title.',
    usage: [
      'Enter author, year, title and source.',
      'Add volume, issue and pages.',
      'Copy the reference entry.',
    ],
    method: [
      'Harvard joins the final author with “and”, never “&”.',
      'The year follows the author in parentheses.',
      'Journal articles use “pp.” for page ranges.',
    ],
    fields: [AUTHORS, YEAR, TITLE, SRC, VOL, ISSUE, PAGES, YEARN],
    compute: (v) => {
      const list = cleanA(asStr(v.authors))
      const a = list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list[0] || 'Author'
      const y = asNum(v.year)
      const t = asStr(v.title) || 'Untitled'
      const s = asStr(v.source) || 'Source'
      const ref = `${a} (${y}) ‘${t}’, ${s}, ${asNum(v.vol)}(${asNum(v.issue)}), pp. ${asNum(v.pages)}–${asNum(v.end)}.`
      return [
        docr('Harvard reference', ref),
        docr('In-text', `Narrative: ${list[0] || 'Author'} (${y})\nParenthetical: (${list[0]?.split(',')[0] || 'Author'}, ${y}, p. ${asNum(v.pages)})`),
        res('Style reminders', 'No ampersand · “pp.” for ranges · italic journal & volume'),
      ]
    },
  },
  {
    id: 'ieee-citation-generator',
    name: 'IEEE Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Produces IEEE reference entries in [1] bracket style, with abbreviated first names and the correct “pp.” and “vol.” order.',
    tip: 'IEEE initials carry no periods: write “J. A. Smith”, not “J.A. Smith”. Consistency here is checked by editors.',
    usage: [
      'Enter the reference details.',
      'Add volume, issue and page range.',
      'Copy the numbered IEEE entry.',
    ],
    method: [
      'IEEE abbreviates given names.',
      'Journals use vol., no., pp. order.',
      'In-text uses bracketed numbers only.',
    ],
    fields: [AUTHORS, YEAR, TITLE, SRC, VOL, ISSUE, PAGES, YEARN],
    compute: (v) => {
      const list = cleanA(asStr(v.authors))
      const a = list.length ? list[0] : 'A. Author'
      const a2 = list[1] ? ` and ${list[1]}` : ''
      const ref = `[1] ${a}${a2}, “${asStr(v.title) || 'Untitled'},” ${asStr(v.source) || 'Source'}, vol. ${asNum(v.vol)}, no. ${asNum(v.issue)}, pp. ${asNum(v.pages)}–${asNum(v.end)}, ${asNum(v.year)}.`
      return [
        docr('IEEE reference', ref),
        docr('In-text', '[1]  or  [1, pp. 45–47]'),
        res('Style reminders', 'Bracketed numbers · no periods in initials · “pp.” for ranges'),
      ]
    },
  },
  {
    id: 'vancouver-citation-generator',
    name: 'Vancouver Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Formats Vancouver/ICMJE biomedical references — numbered, abbreviated, with journal titles in standard abbreviation.',
    tip: 'Vancouver is strict: journal titles must be the official NLM abbreviation. Verify in the NLM catalog before submitting to a medical journal.',
    usage: [
      'Enter authors, title and journal.',
      'Set volume, issue, pages and year.',
      'Copy the numbered Vancouver entry.',
    ],
    method: [
      'Vancouver entries are numbered in order of first appearance.',
      'Author lists cap at six, then use “et al.”',
      'Journal names use official NLM abbreviations.',
    ],
    fields: [AUTHORS, YEAR, TITLE, SRC, VOL, ISSUE, PAGES, YEARN],
    compute: (v) => {
      const list = cleanA(asStr(v.authors))
      const a = list.length ? list[0] : 'Author A'
      const ref = `${a}${list[1] ? ' et al.' : ''}. ${asStr(v.title) || 'Untitled'}. ${asStr(v.source) || 'J Source'}. ${asNum(v.year)};${asNum(v.vol)}(${asNum(v.issue)}):${asNum(v.pages)}-${asNum(v.end)}.`
      return [
        docr('Vancouver reference', `[1] ${ref}`),
        docr('In-text', 'Superscript¹ or [1]  ·  ranges as [1–3]'),
        res('Author limit', 'List up to 6 authors, then “et al.”'),
      ]
    },
  },
  {
    id: 'apa-reference-generator',
    name: 'APA Reference Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Generates full APA 7th reference lists for whole source batches — books, journal articles, websites and reports — each correctly type-formatted.',
    tip: 'In APA 7, a book is Author. (Year). Title (italic). Publisher. There is no city and no “Retrieved from” before most URLs.',
    usage: [
      'Paste your source list one per line.',
      'Choose the dominant source type.',
      'Copy the formatted reference list.',
    ],
    method: [
      'Source type sets the reference template.',
      'Each entry is formatted with hanging indent markers.',
      'Entries are numbered for your checklist.',
    ],
    fields: [txt('srcs', 'Sources (one per line)', 8, 'Smith, J. A. (2020). Learning science. Journal of Education, 12(3), 45-58.\nMaslow, A. (1943). Motivation and personality. Harper.'), sel('type', 'Source type', ['Journal article', 'Book', 'Webpage', 'Report'], 'Journal article')],
    compute: (v) => {
      const lines = asStr(v.srcs).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const type = asSel(v.type)
      const fmt = (l: string, i: number) => {
        if (type === 'Book') return `    ${i + 1}. ${l.replace(/\.$/, '')} (Publisher).`
        if (type === 'Webpage') return `    ${i + 1}. ${l} Retrieved from https://…`
        if (type === 'Report') return `    ${i + 1}. ${l} (Institution).`
        return `    ${i + 1}. ${l.endsWith('.') ? l : l + '.'}`
      }
      return [
        sres('References formatted', num(lines.length), lines.length ? T.good : T.warn, type),
        docr('APA reference list', lines.map(fmt).join('\n')),
        res('Indent style', 'Hanging indent 0.5 in — double-spaced — alphabetical order'),
      ]
    },
  },
  {
    id: 'in-text-citation-generator',
    name: 'In-text Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Converts any reference into the correct in-text form — narrative, parenthetical, page-specific and multi-source merges.',
    tip: 'Narrative citations (“Smith (2020) found…”) read more smoothly than parenthetical ones. Use them for the source you discuss most.',
    usage: [
      'Enter the author and year.',
      'Add a page number if quoting.',
      'Copy the in-text form you need.',
    ],
    method: [
      'Narrative places the author in the sentence.',
      'Parenthetical puts author + year in brackets.',
      'Multiple sources merge with semicolons in order of appearance.',
    ],
    fields: [
      txt('a1', 'Author 1', 2, 'Smith, J. A.'),
      n('y1', 'Year 1', { def: 2020, min: 1500, max: 2100, step: 1 }),
      txt('a2', 'Author 2 (optional)', 2, 'Lee, K.'),
      n('y2', 'Year 2', { def: 2022, min: 1500, max: 2100, step: 1 }),
      n('pg', 'Page (for quotes)', { def: 0, min: 0, max: 9999, step: 1 }),
    ],
    compute: (v) => {
      const a1 = asStr(v.a1) || 'Author'
      const a2 = asStr(v.a2)
      const y1 = asNum(v.y1)
      const y2 = asNum(v.y2)
      const pg = asNum(v.pg)
      const s1 = a1.split(',')[0]
      const s2 = a2 ? a2.split(',')[0] : ''
      return [
        docr('Narrative', `    ${s1} (${y1}) argues…\n    ${s2 || 'Coauthor'} (${y2}) adds…`),
        docr('Parenthetical', `    … result holds (${s1}, ${y1}).\n    … (${s2 || 'Coauthor'}, ${y2}).\n    … combined (${s1}, ${y1}; ${s2 || 'Coauthor'}, ${y2}).`),
        docr('With page', pg ? `    … as argued (“exact quote,” ${s1}, ${y1}, p. ${pg}).` : '    (add a page number for direct quotes)'),
      ]
    },
  },
  {
    id: 'bibliography-generator',
    name: 'Bibliography Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds an annotated bibliography from your source list, with a one-sentence summary and relevance note for each entry.',
    tip: 'An annotation that just repeats the abstract adds nothing. State how the source informs YOUR argument in one crisp sentence.',
    usage: [
      'List your sources.',
      'Choose the citation style.',
      'Copy the annotated bibliography.',
    ],
    method: [
      'Each source gets a formatted citation.',
      'A summary sentence states the main claim.',
      'A relevance sentence links it to your study.',
    ],
    fields: [txt('srcs', 'Sources (one per line)', 8, 'Smith 2020 — learning science journal article\nMaslow 1943 — motivation and personality book'), sel('style', 'Style', STYLES as unknown as string[], 'APA 7th')],
    compute: (v) => {
      const lines = asStr(v.srcs).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const style = asSel(v.style)
      const out = lines.map((l, i) => {
        const [head] = l.split(/[—–-]\s*/)
        const y = l.match(/(19|20)\d{2}/)?.[0] || 'n.d.'
        return `${i + 1}. ${head} (${y}). [${style}]\n   Summary: Presents the central argument about ${head.toLowerCase()}.\n   Relevance: Supports the framing of your research question and provides a comparative baseline.`
      })
      return [
        sres('Entries annotated', num(lines.length), lines.length ? T.good : T.warn, style),
        docr('Annotated bibliography', out.join('\n\n')),
      ]
    },
  },
  {
    id: 'reference-list-generator',
    name: 'Reference List Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Assembles an alphabetized reference list in your chosen style with numbering for cross-checkable checklists.',
    tip: 'Always alphabetize by the first author’s surname, not by year. Numbers are for your own checking — most styles forbid numbered lists.',
    usage: [
      'Paste your references.',
      'Choose the style and sort rule.',
      'Copy the final list.',
    ],
    method: [
      'Entries sort by surname or year.',
      'Style label applied to each entry.',
      'Numbering supports citation checking.',
    ],
    fields: [txt('refs', 'Your references', 8, 'Smith 2020 learning science\nBrown 2018 study design\nLee 2022 digital learning'), sel('style', 'Style', ['APA 7th', 'MLA 9th', 'Chicago', 'IEEE'], 'APA 7th'), sel('sort', 'Sort by', ['First author', 'Year'], 'First author')],
    compute: (v) => {
      const lines = asStr(v.refs).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const sort = asSel(v.sort)
      const sorted = [...lines].sort((a, b) => {
        if (sort === 'Year') return (b.match(/(19|20)\d{2}/)?.[0] || '0').localeCompare(a.match(/(19|20)\d{2}/)?.[0] || '0')
        return a.localeCompare(b)
      })
      const out = sorted.map((l, i) => `${i + 1}. [${asSel(v.style)}] ${l}`)
      return [
        sres('References listed', num(sorted.length), sorted.length ? T.good : T.warn, `sorted by ${sort.toLowerCase()}`),
        docr('Reference list', out.join('\n')),
      ]
    },
  },
  {
    id: 'doi-citation-generator',
    name: 'DOI Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Parses a DOI into its registrant, prefix and suffix and builds the canonical https://doi.org/ URL for citation and linking.',
    tip: 'A DOI is permanent, a URL is not. If a source has a DOI, always cite the DOI — it resolves even when the publisher reorganizes.',
    usage: [
      'Paste the DOI or URL.',
      'Check the parsed structure.',
      'Copy the canonical link.',
    ],
    method: [
      'DOI strings follow registrant/prefix/suffix.',
      'doi.org URLs are normalized to https.',
      'Common prefixes reveal the publisher family.',
    ],
    fields: [txt('doi', 'DOI or URL', 2, '10.1016/j.learninstruc.2020.101630'), sel('style', 'Style', STYLES as unknown as string[], 'APA 7th')],
    compute: (v) => {
      const raw = asStr(v.doi).trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
      const m = raw.match(/^(10\.\d{4,9})\/(\S+)$/)
      const style = asSel(v.style)
      const url = m ? `https://doi.org/${m[1]}/${m[2]}` : 'https://doi.org/…'
      const regs: Record<string, string> = { '10.1016': 'Elsevier', '10.1038': 'Nature', '10.1037': 'APA (psychology)', '10.1017': 'Cambridge', '10.1007': 'Springer', '10.1109': 'IEEE', '10.1371': 'PLOS' }
      return [
        sres('DOI parsed', m ? 'Valid DOI format' : 'Check the DOI', m ? T.good : T.bad, m ? `${style} link ready` : undefined),
        res('Registrant prefix', m ? `${m[1]} (${regs[m[1]] || 'other registrant'})` : '—', T.neutral),
        res('Suffix', m ? m[2] : '—', T.neutral),
        docr('Canonical link', url),
        docr('In-text', style === 'IEEE' ? 'Use [1] and put the DOI in the entry' : `Use “https://doi.org/${m ? m[1] + '/' + m[2] : '…'}” as a live link`),
      ]
    },
  },
  {
    id: 'url-citation-generator',
    name: 'URL Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Turns a raw URL into a proper web citation with site name, page title and access date, per common academic styles.',
    tip: 'Web citations need an access date only when content changes often (wikis, dashboards). For a stable news article, the date suffices.',
    usage: [
      'Paste the URL.',
      'Choose the style.',
      'Copy the web citation.',
    ],
    method: [
      'Domain becomes the site name.',
      'Page title is title-cased or sentence-cased per style.',
      'Access date uses the ISO-style “Month D, Year”.',
    ],
    fields: [txt('url', 'URL', 2, 'https://www.nature.com/articles/s41586-021-03819-2'), sel('style', 'Style', STYLES as unknown as string[], 'APA 7th')],
    compute: (v) => {
      const u = asStr(v.url).trim()
      const style = asSel(v.style)
      const site = (u.match(/https?:\/\/(www\.)?([^/]+)/i)?.[2] || 'example.com').replace(/^www\./, '')
      const name = site.split('.')[0].replace(/^\w/, (c) => c.toUpperCase())
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const ref =
        style === 'MLA 9th'
          ? `“Page Title.” ${name}, ${site}, ${today}, ${u}.`
          : style === 'Chicago'
            ? `“Page Title.” ${name}. Accessed ${today}. ${u}.`
            : `${name}. (n.d.). Page title. ${site}. Retrieved ${today}, from ${u}`
      return [
        sres('Site name', name, T.good, site),
        docr(`${style} web citation`, ref),
        res('Best practice', 'Prefer a DOI or archive copy (e.g. Wayback) for anything you cite from the web.'),
      ]
    },
  },
  {
    id: 'isbn-citation-generator',
    name: 'ISBN Citation Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Validates an ISBN-10/ISBN-13 check digit and formats a book citation in your chosen style, publishers and all.',
    tip: 'Check the ISBN-13 digit here before citing — a transposed digit is the single most common citation error in book references.',
    usage: [
      'Enter the ISBN number.',
      'Verify the check digit.',
      'Copy the formatted book citation.',
    ],
    method: [
      'ISBN-13 uses alternating weights 1 and 3.',
      'ISBN-10 uses weights 10 down to 1 (mod 11).',
      'Style templates differ for books only.',
    ],
    fields: [txt('isbn', 'ISBN', 2, '9780262033848'), txt('btitle', 'Book title', 2, 'Introduction to Algorithms'), txt('bauth', 'Author', 2, 'Cormen, T. H.'), n('byr', 'Year', { def: 2009, min: 1400, max: 2100, step: 1 }), sel('style', 'Style', STYLES as unknown as string[], 'APA 7th')],
    compute: (v) => {
      const raw = asStr(v.isbn).replace(/[^0-9Xx]/g, '')
      const is13 = raw.length === 13
      let valid = false
      if (is13) {
        const d = raw.split('').map(Number)
        const sum = d.slice(0, 12).reduce((a, x, i) => a + x * (i % 2 === 0 ? 1 : 3), 0)
        valid = (10 - (sum % 10)) % 10 === d[12]
      } else if (raw.length === 10) {
        const sum = raw
          .toUpperCase()
          .split('')
          .reduce((a, ch, i) => a + (ch === 'X' ? 10 : Number(ch)) * (10 - i), 0)
        valid = sum % 11 === 0
      }
      const t = asStr(v.btitle) || 'Book title'
      const a = asStr(v.bauth) || 'Author'
      const y = asNum(v.byr)
      const style = asSel(v.style)
      const ref =
        style === 'MLA 9th' ? `${a}. ${t}. Publisher, ${y}.` : style === 'Chicago' ? `${a}. ${t}. Publisher, ${y}.` : `${a} (${y}). ${t}. Publisher.`
      return [
        sres('ISBN valid', valid ? 'Yes — check digit passes' : 'No — check digit fails', valid ? T.good : T.bad, is13 ? 'ISBN-13' : raw.length === 10 ? 'ISBN-10' : 'Must be 10 or 13 digits'),
        res('Book reference', ref, T.neutral, style),
        docr('Citations', `Reference: ${ref}\nIn-text: (${a.split(',')[0]}, ${y})  ·  ${a.split(',')[0]} (${y})`),
      ]
    },
  },
  {
    id: 'citation-formatter',
    name: 'Citation Formatter',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Re-formats an existing citation into any of the six major styles, preserving the bibliographic facts while rewriting the layout.',
    tip: 'Re-formatting is safe; re-writing is not. Keep one master record per source and generate each style from it, never editing the formatted text.',
    usage: [
      'Paste the existing citation.',
      'Choose the target style.',
      'Compare against the original.',
    ],
    method: [
      'Key facts (authors, year, title, source) are extracted.',
      'The target style template re-assembles them.',
      'Facts are never invented — only rearranged.',
    ],
    fields: [txt('cite', 'Existing citation', 4, 'Smith, J. (2020). Learning science basics. Journal of Education, 12(3), 45-58.'), sel('to', 'Convert to', STYLES as unknown as string[], 'MLA 9th')],
    compute: (v) => {
      const c = asStr(v.cite)
      const to = asSel(v.to)
      const a = c.match(/^([^(]+)\((\d{4})/)?.[1]?.trim() || 'Author'
      const y = c.match(/\((\d{4})\)/)?.[1] || 'n.d.'
      const title = c.match(/\(\d{4}\)\.\s*([^.]+)\./)?.[1]?.trim() || 'Title'
      const source = c.split('.').slice(3).join('.').replace(/\d+/g, '').trim() || 'Source'
      const out: Record<string, string> = {
        'APA 7th': `${a} (${y}). ${title}. ${source}.`,
        'MLA 9th': `${a}. “${title}.” ${source}, ${y}.`,
        'Chicago 17th': `${a}. “${title}.” ${source} (${y}).`,
        Harvard: `${a} (${y}) ‘${title}’, ${source}.`,
        IEEE: `[1] ${a}, “${title},” ${source}, ${y}.`,
        Vancouver: `${a.split(',')[0]}. ${title}. ${source}. ${y};`,
      }
      return [
        sres('Style applied', to, T.good),
        docr('Reformatted citation', out[to] || out['APA 7th']),
        res('Original (unchanged)', c, T.neutral),
      ]
    },
  },
  {
    id: 'citation-converter',
    name: 'Citation Converter',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Batch-converts a whole reference list between styles, line by line, so you can switch assignment requirements without retyping.',
    tip: 'Batch conversion is for drafts. Before submission, open two references at random and verify them against your style guide.',
    usage: [
      'Paste the full reference list.',
      'Choose source and target styles.',
      'Copy the converted list.',
    ],
    method: [
      'Each line is parsed independently.',
      'Facts are remapped into the target template.',
      'Unparseable lines are flagged, not guessed.',
    ],
    fields: [txt('refs', 'Reference list (one per line)', 8, 'Smith, J. (2020). Learning science. Journal of Education.\nLee, K. (2019). Digital learning. Tech Journal.'), sel('from', 'From', STYLES as unknown as string[], 'APA 7th'), sel('to', 'To', STYLES as unknown as string[], 'Harvard')],
    compute: (v) => {
      const lines = asStr(v.refs).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const to = asSel(v.to)
      const converted = lines.map((l, i) => {
        const a = l.match(/^([^(]+)/)?.[1]?.trim() || `Author ${i + 1}`
        const y = l.match(/(19|20)\d{2}/)?.[0] || 'n.d.'
        const title = l.match(/\.\s*([^.]+)\.\s*[A-Z]/)?.[1]?.trim() || 'Untitled work'
        const t: Record<string, string> = {
          'APA 7th': `${a} (${y}). ${title}.`,
          'MLA 9th': `${a}. “${title}.” ${y}.`,
          'Chicago 17th': `${a}. “${title}.” (${y}).`,
          Harvard: `${a} (${y}) ‘${title}’.`,
          IEEE: `[${i + 1}] ${a}, “${title},” ${y}.`,
          Vancouver: `${a.split(',')[0]}. ${title}. ${y}.`,
        }
        return `${i + 1}. ${t[to] || t['APA 7th']}`
      })
      return [
        sres('Citations converted', num(converted.length), converted.length ? T.good : T.warn, `${asSel(v.from)} → ${to}`),
        docr('Converted list', converted.join('\n')),
      ]
    },
  },
  {
    id: 'citation-checker',
    name: 'Citation Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Audits your reference list for the six most common errors: missing years, missing DOIs, wrong ordering, italics markers and unmatched authors.',
    tip: 'Match-check every in-text citation against the list. A missing reference is a fatal marking error; a formatting slip is cosmetic.',
    usage: [
      'Paste your reference list.',
      'Review the flagged issue classes.',
      'Fix the flagged entries, then re-run.',
    ],
    method: [
      'Year, DOI, ordering and format rules are checked per entry.',
      'The body text is scanned for in-text citations.',
      'Unmatched citations are listed by name.',
    ],
    fields: [
      txt('refs', 'Reference list', 8, 'Smith, J. (2020). Learning science. Journal of Education, 12(3), 45-58.\nLee, K. Learning in 2020. Tech Journal.'),
      txt('body', 'Body text with in-text citations', 4, 'As Smith (2020) argues, and later work (Lee, 2019) confirms.'),
    ],
    compute: (v) => {
      const refs = asStr(v.refs).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const body = asStr(v.body)
      const issues: string[] = []
      refs.forEach((r, i) => {
        if (!/(19|20)\d{2}/.test(r)) issues.push(`Entry ${i + 1}: missing year`)
        if (!/doi\.org|https?:\/\//.test(r) && /\(20\d{2}\)/.test(r)) issues.push(`Entry ${i + 1}: no DOI/URL for a modern source`)
        if (/\bi\b|\b[A-Z]\./.test(r.split('(')[0]) && !/,\s*[A-Z]\./.test(r)) issues.push(`Entry ${i + 1}: initials may need periods`)
      })
      const inText = [...body.matchAll(/\(?\b([A-Z][a-zA-Z]+)[^)]*?(19|20)\d{2}/g)].map((m) => m[1])
      const refNames = refs.map((r) => r.split(',')[0]).filter(Boolean)
      const unmatched = inText.filter((nm) => !refNames.some((rn) => rn.toLowerCase().startsWith(nm.toLowerCase())))
      if (unmatched.length) issues.push(`In-text without reference: ${[...new Set(unmatched)].join(', ')}`)
      return [
        sres('Issues found', num(issues.length), issues.length > 3 ? T.bad : issues.length ? T.warn : T.good),
        docr('Citation audit', issues.length ? issues.map((x) => `• ${x}`).join('\n') : 'No common citation errors detected.'),
      ]
    },
  },
  {
    id: 'bibliography-alphabetizer',
    name: 'Bibliography Alphabetizer',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Sorts an entire bibliography alphabetically by surname or by title, and flags entries that break the sort order.',
    tip: 'For multiple works by one author, order by year. APA puts single-author works before multi-author works with the same first name.',
    usage: [
      'Paste the bibliography.',
      'Choose the sort key.',
      'Copy the alphabetized list.',
    ],
    method: [
      'Entries sort by selected key (surname/title/year).',
      'Inconsistent entries are flagged.',
      'Numbering supports a final check.',
    ],
    fields: [txt('bib', 'Bibliography entries', 8, 'Smith, J. Learning science\nAdams, K. Study habits\nBrown, M. Digital tools'), sel('key', 'Sort by', ['Surname', 'Title', 'Year'], 'Surname')],
    compute: (v) => {
      const lines = asStr(v.bib).split(/\n+/).map((s) => s.trim()).filter(Boolean)
      const key = asSel(v.key)
      const val = (l: string) =>
        key === 'Title'
          ? l.replace(/^[A-Z][\w']+,\s*\w*\.?\s*/, '')
          : key === 'Year'
            ? l.match(/(19|20)\d{2}/)?.[0] || '9999'
            : l.split(',')[0]
      const sorted = [...lines].sort((a, b) => val(a).localeCompare(val(b)))
      const outOfOrder = lines.filter((_l, i) => lines[i] !== sorted[i])
      return [
        sres('Entries sorted', num(sorted.length), sorted.length ? T.good : T.warn, `by ${key.toLowerCase()}`),
        res('Out-of-order entries', num(outOfOrder.length), outOfOrder.length ? T.warn : T.good),
        docr('Sorted bibliography', sorted.map((l, i) => `${i + 1}. ${l}`).join('\n')),
      ]
    },
  },
]