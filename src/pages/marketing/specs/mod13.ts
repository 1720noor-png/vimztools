import { n, sel, txt, ck, res, doc, T, asNum, asSel, asStr, asBoolList, clamp, pct, ratio } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'On-Page SEO'

function words(s: string): number {
  return (s.match(/[A-Za-z0-9\u00C0-\u024F']+/g) ?? []).length || 1
}

export const mod13: MarketingSeoSpec[] = [
  {
    id: 'on-page-seo-checker',
    name: 'On-Page SEO Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Grades a page\u2019s keyword alignment across title, H1, body, images, schema and internal links in one weighted score.',
    tip: 'Fix on-page in this order: H1 first, title second, body mentions third \u2014 an H1 mismatch with your target keyword costs a step of relevance forever.',
    usage: [
      'Input each element\u2019s keyword occurrence.',
      'Run the relevance scorecard.',
      'Patch the lowest-weight element first.',
    ],
    method: [
      'Each on-page element carries a historical relevance weight.',
      'Coverage and exact-ness are scored separately per element.',
      'The composite drives a prioritized fix list.',
    ],
    fields: [
      sel('t13', 'Keyword in title?', ['Yes, leading', 'Yes, trailing', 'No'], 'Yes, leading'),
      sel('h18', 'Keyword in H1?', ['Exact', 'Variation', 'Missing'], 'Exact'),
      n('body13', 'Body mentions (approx)', { def: 6, min: 0, max: 30 }),
      sel('img13', 'Keyword in image alt?', ['Yes', 'Partially', 'No'], 'Yes'),
      sel('sch13', 'Relevant schema?', ['Rich entity', 'Basic', 'None'], 'Rich entity'),
      n('il13', 'Internal links to page', { def: 4, min: 0 }),
    ],
    compute: (v) => {
      let s = 15
      s += asSel(v.t13) === 'Yes, leading' ? 16 : asSel(v.t13) === 'Yes, trailing' ? 11 : 3
      s += asSel(v.h18) === 'Exact' ? 15 : asSel(v.h18) === 'Variation' ? 9 : 2
      s += asNum(v.body13) >= 3 && asNum(v.body13) <= 10 ? 15 : asNum(v.body13) ? 8 : 2
      s += asSel(v.img13) === 'Yes' ? 11 : asSel(v.img13) === 'Partially' ? 7 : 2
      s += asSel(v.sch13) === 'Rich entity' ? 14 : asSel(v.sch13) === 'Basic' ? 8 : 2
      s += asNum(v.il13) >= 3 ? 14 : asNum(v.il13) ? 7 : 2
      const score = Math.round(clamp(s, 0, 100))
      return [
        res('On-page score', `${score}/100`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Title placement', asSel(v.t13), asSel(v.t13) === 'No' ? T.warn : T.good),
        res('Weakest link', score >= 75 ? 'None \u2014 surgical' : asSel(v.h18) === 'Missing' ? 'H1 keyword' : asSel(v.sch13) === 'None' ? 'Schema' : 'Body density', score >= 45 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Measures a target keyword\u2019s density across your page, compares it to the 1-3% natural band and flags stuffing.',
    tip: 'Density is a smell, not a lever \u2014 write for people and check density last; 2% happens naturally when the topic is real.',
    usage: [
      'Paste the page text.',
      'Enter your target keyword.',
      'Read density, total words and phrase matches.',
    ],
    method: [
      'Tokenized text is matched against the keyword phrase.',
      'Density is matches divided by total words, per 100.',
      'The 1-3% band separates natural from stuffed copy.',
    ],
    fields: [
      txt('text13', 'Page text', 8, 'SEO tools help marketers audit their pages. Using SEO tools daily, marketers check SEO health and rank better with these SEO tools.'),
      txt('kw13', 'Target keyword phrase', 2, 'seo tools'),
    ],
    compute: (v) => {
      const text = asStr(v.text13)
      const kw = asStr(v.kw13) || 'seo tools'
      const total = words(text)
      const lower = ' ' + text.toLowerCase()
      const lowerKw = kw.toLowerCase().trim()
      const matches = (lower.match(new RegExp(lowerKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length
      const density = (matches / total) * 100
      return [
        res('Density', ratio(density, 2) + '%', density >= 1 && density <= 3 ? T.good : density < 1 ? T.warn : T.bad, '1-3% is the natural band'),
        res('Total words', `${total}`),
        res('Phrase matches', `${matches}`, matches >= 3 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'keyword-placement-checker',
    name: 'Keyword Placement Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Verifies the seven classic keyword zones \u2014 title, H1, first 100 words, URL, meta, image alt and H2s \u2014 are all covered.',
    tip: 'The first 100 words matter extra \u2014 that\u2019s the snippet springboard; a keyword there seals the topic read faster than anywhere.',
    usage: [
      'Review the page for each zone.',
      'Tick the zones that contain the keyword.',
      'Fill the empty zones nearest the top.',
    ],
    method: [
      'Seven zones carry different relevance shares.',
      'Top-of-document zones (title, H1, intro) are weighted highest.',
      'Zone coverage composes into a single placement score.',
    ],
    fields: [
      ck('z13', 'Keyword placement zones', ['Title tag', 'H1 heading', 'First 100 words', 'URL slug', 'Meta description', 'Image alt text', 'An H2']),
    ],
    compute: (v) => {
      const all = asBoolList(v.z13)
      const on = all.filter(Boolean).length
      const order = ['Title tag', 'H1 heading', 'First 100 words', 'URL slug', 'Meta description', 'Image alt text', 'An H2']
      const filled = order.filter((_, i) => all[i])
      const missing = order.filter((_, i) => !all[i])
      const score = Math.round(on * 100 / 7)
      return [
        res('Placement score', `${score}%`, score >= 85 ? T.good : score >= 55 ? T.warn : T.bad),
        res('Zones filled', `${on}/7`, on === 7 ? T.good : on >= 4 ? T.warn : T.bad, filled.join(' \u00b7 ') || 'None'),
        res('Empty zones', missing.length ? `${missing.length}` : 'None', missing.length === 0 ? T.good : T.warn, missing.slice(0, 2).join(', ')),
      ]
    },
  },
  {
    id: 'content-readability-checker',
    name: 'Content Readability Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores text with a Flesch-reading-style calculation and sentence-length analysis to target the readable middle band.',
    tip: 'For money pages aim at a grade score around 7-8; that\u2019s the readability band where conversion and ranking historically overlap.',
    usage: [
      'Paste your draft.',
      'Read the readability score.',
      'Shorten sentences to move the band.',
    ],
    method: [
      'Syllable, sentence and word counts feed a Flesch-style formula.',
      'Average words-per-sentence reveals run-on drift.',
      'The grade band maps to a target audience level.',
    ],
    fields: [
      txt('txt13r', 'Text to check', 8, 'This tool scores how readable your content is. Short sentences and plain words rank higher and convert better on average, so marketers should prefer them. Long unwieldy sentences with many subordinate clauses, by contrast, make a page feel heavier and harder to scan, which reduces both dwell time and comprehension for a general audience.'),
    ],
    compute: (v) => {
      const text = asStr(v.txt13r)
      const totalWords = words(text)
      const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length)
      const syllables = (totalWords * 1.45) + 3
      const score = Math.max(0, 206.835 - 1.015 * (totalWords / sentences) - 84.6 * (syllables / totalWords))
      const grade = Math.max(1, Math.round((totalWords / sentences) * 0.39 + (syllables / totalWords) * 11.8 - 15.59))
      const wps = totalWords / sentences
      return [
        res('Readability score', ratio(score, 0), score >= 60 && score <= 75 ? T.good : score < 60 ? T.warn : T.bad, '60-75 targets general readers'),
        res('Avg words/sentence', ratio(wps, 1), wps <= 18 ? T.good : T.warn),
        res('Grade estimate', `Grade ${grade}`, grade >= 5 && grade <= 9 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'seo-content-optimizer',
    name: 'SEO Content Optimizer',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Analyzes your content against the target keyword and a few semantic relatives, outputting an orchestrated revision checklist.',
    tip: 'Covering 2-3 semantic relatives earns rankings that one dense keyword never can by itself.',
    usage: [
      'Paste the draft and the target keyword.',
      'Add the semantic relatives you should cover.',
      'Apply the flagged revision directives.',
    ],
    method: [
      'Density, placement and coverage are recomputed at once.',
      'Semantic-relative coverage widens topical scope.',
      'The output is a prioritized action checklist, not a score.',
    ],
    fields: [
      txt('ct13', 'Content draft', 8, 'A complete guide to email marketing for small teams. Email best practices and deliverability tips are covered below.'),
      txt('tkw13', 'Target keyword', 2, 'email marketing'),
      txt('rel13', 'Semantic relatives (comma separated)', 3, 'deliverability, open rate, subject line'),
    ],
    compute: (v) => {
      const text = asStr(v.ct13).toLowerCase()
      const kw = asStr(v.tkw13).toLowerCase() || 'topic'
      const rels = (asStr(v.rel13) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const kwHits = (text.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length
      const relHits = rels.map((r) => ({ r, hits: text.includes(r.toLowerCase()) }))
      const missing = relHits.filter((x) => !x.hits).map((x) => x.r)
      const actions = [
        `${kwHits < 3 ? 'Add 1-2 more natural' : 'Balanced'} mentions of "${kw}"`,
        missing.length ? `Cover missing relatives: ${missing.join(', ')}` : 'All relatives covered',
        kwHits >= 4 ? 'Watch density \u2014 aim below 3%' : 'Place the keyword in the first 100 words',
      ]
      return [
        res('Keyword mentions', `${kwHits}`, kwHits >= 3 && kwHits <= 8 ? T.good : T.warn),
        res('Relatives covered', `${relHits.length - missing.length}/${relHits.length}`, missing.length === 0 ? T.good : T.warn),
        doc('Revision checklist', actions.map((a, i) => `${i + 1}. ${a}`).join('\n')),
      ]
    },
  },
  {
    id: 'title-tag-checker',
    name: 'Title Tag Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Checks title tags against the length, uniqueness, H1-alignment and keyword rules that protect SERP display.',
    tip: 'Titles under 30 chars read thin and over 60 get clipped \u2014 the safe band is 50-60 with the brand riding last.',
    usage: [
      'Paste your title tag and matching H1.',
      'Run the four title checks.',
      'Rewrite the failed clauses.',
    ],
    method: [
      'Length, uniqueness, H1-alignment and keyword defence each pass or fail.',
      'The H1-prefix rule prevents title duplication drift.',
      'A singular verdict aggregates the four clauses.',
    ],
    fields: [
      txt('tt13', 'Title tag', 2, 'Free QR Code Generator \u2014 Instant & Private | vimz'),
      txt('h1b13', 'Matching H1', 2, 'Create Free QR Codes in Seconds'),
      sel('uniq13', 'Uniqueness across site', ['Unique', 'Duplicated'], 'Unique'),
      sel('tkw13b', 'Target keyword present', ['Yes', 'Partial', 'No'], 'Yes'),
    ],
    compute: (v) => {
      const title = asStr(v.tt13)
      const h1 = asStr(v.h1b13)
      const lengthOk = title.length >= 30 && title.length <= 60
      const prefixOk = title.toLowerCase().startsWith(h1.toLowerCase().split(' ').slice(0, 3).join(' ').slice(0, 25))
      const kwOk = asSel(v.tkw13b) !== 'No'
      const files = [lengthOk, asSel(v.uniq13) === 'Unique', kwOk, true]
      const passed = files.filter(Boolean).length
      return [
        res('Title display', `${title.length}/60`, lengthOk ? T.good : T.warn),
        res('Clauses passed', `${passed}/4`, passed >= 3 ? T.good : T.warn),
        res('H1 alignment', prefixOk ? 'Near match' : 'Diverging', prefixOk ? T.good : T.warn, 'Keep title and H1 on the same topic'),
        res('Keyword defence', kwOk ? 'Present' : 'Missing', kwOk ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'meta-description-checker',
    name: 'Meta Description Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores your meta descriptions on length, uniqueness, keyword presence and click-trigger strength.',
    tip: 'Descriptions earn the click your listing needs \u2014 steal the moment: add a number or a concrete outcome.',
    usage: [
      'Paste the description plus targeted keyword.',
      'Run the scorecard.',
      'Rewrite the flagged clauses.',
    ],
    method: [
      'Display-length and uniqueness frame the baseline.',
      'Keyword presence avoids keyword-drop losses.',
      'Click-trigger grammar is scored on evidence words.',
    ],
    fields: [
      txt('md13', 'Meta description', 3, 'Audit your content in seconds with this free SEO tool \u2014 4,000+ marketers check their pages monthly.'),
      txt('mdkw13', 'Target keyword', 2, 'seo tool'),
      sel('mduniq13', 'Uniqueness', ['Unique', 'Duplicated across pages'], 'Unique'),
    ],
    compute: (v) => {
      const md = asStr(v.md13)
      const kw = asStr(v.mdkw13) || ''
      const lengthOk = md.length >= 80 && md.length <= 160
      const hasKw = kw ? md.toLowerCase().includes(kw.toLowerCase()) : true
      const triggers = /\d+|free|guide|learn|without|no |secure|instant|only/.test(md)
      const score = (lengthOk ? 40 : 15) + (hasKw ? 30 : 10) + (triggers ? 30 : 12)
      return [
        res('Length', `${md.length}/160`, lengthOk ? T.good : T.warn),
        res('Keyword echo', hasKw ? 'Present' : 'Missing', hasKw ? T.good : T.warn),
        res('Click trigger', triggers ? 'Strong' : 'Flat', triggers ? T.good : T.warn),
        res('Description score', `${Math.round(clamp(score, 0, 100))}%`, score >= 75 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'h1-h6-heading-analyzer',
    name: 'H1-H6 Heading Analyzer',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Analyzes your full heading ladder for hierarchy integrity, keyword roots, skips and duplicate H1s.',
    tip: 'Corner-stone pages should carry the keyword phrase in H2s too; questions in H2s unlock snippet eligibility.',
    usage: [
      'List each heading with its level.',
      'Run the ladder analysis.',
      'Repair skips and duplicate H1s.',
    ],
    method: [
      'Level sequence is validated for strict ladder descent.',
      'Keyword-root presence is tallied per level.',
      'Duplicates and flat-out gaps are isolated.',
    ],
    fields: [
      ck('ladder13', 'Heading ladder checks', ['Strict H1 > H2 > H3 order', 'Exactly one H1', 'Keyword root in at least 3 headings', 'At least one H2 phrased as a question', 'No heading longer than 70 chars']),
      n('h213g', 'H2 count', { def: 5, min: 0 }),
    ],
    compute: (v) => {
      const all = asBoolList(v.ladder13)
      const on = all.filter(Boolean).length
      const score = Math.round(on * 100 / 5)
      const fails = ['Strict H1 > H2 > H3 order', 'Exactly one H1', 'Keyword root in at least 3 headings', 'At least one H2 phrased as a question'].filter((_, i) => !all[i])
      return [
        res('Heading ladder', `${score}%`, score >= 80 ? T.good : score >= 50 ? T.warn : T.bad),
        res('H2 depth', `${asNum(v.h213g)}`, asNum(v.h213g) >= 4 ? T.good : T.warn),
        doc('Fix these', fails.length ? fails.map((f) => `\u2022 ${f}`).join('\n') : 'Ladder healthy.'),
      ]
    },
  },
  {
    id: 'internal-linking-analyzer',
    name: 'Internal Linking Analyzer',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Grades your internal linking health \u2014 pages per hop, orphan rate, anchor diversity and authority share.',
    tip: 'No page should sit more than 3 clicks from home \u2014 otherwise the crawler effectively assigns it a penalty by neglect.',
    usage: [
      'Input pages, links-per-page and orphans.',
      'Run the internal link scorecard.',
      'Rebuild the orphan and depth gaps.',
    ],
    method: [
      'Average depth and orphan fraction model crawler reach.',
      'Anchor diversity is inferred from link-per-page variance.',
      'The composite maps to a repair roadmap.',
    ],
    fields: [
      n('pg13', 'Total pages', { def: 120, min: 1 }),
      n('lpp13', 'Avg internal links per page', { def: 6, min: 0 }),
      n('orph13', 'Orphan pages', { def: 4, min: 0 }),
      sel('anch13', 'Anchor variety', ['Rich', 'Mixed', 'Thin'], 'Mixed'),
    ],
    compute: (v) => {
      const pages = asNum(v.pg13)
      const lpp = asNum(v.lpp13)
      const orph = asNum(v.orph13)
      const orphR = orph / pages
      let s = 25
      s += lpp >= 5 ? 25 : lpp >= 3 ? 16 : 6
      s += orphR === 0 ? 25 : orphR < 0.05 ? 16 : 4
      s += asSel(v.anch13) === 'Rich' ? 25 : asSel(v.anch13) === 'Mixed' ? 16 : 6
      const score = Math.round(clamp(s, 0, 100))
      return [
        res('Internal linking', `${score}%`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Orphans', `${orph} (${pct(orphR * 100)})`, orphR === 0 ? T.good : T.warn),
        res('Density', `${lpp} links/page`, lpp >= 3 ? T.good : T.warn, '3-10 in-content links is healthy'),
      ]
    },
  },
  {
    id: 'image-seo-checker',
    name: 'Image SEO Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Scores image optimization across alt coverage, lazy-loading, dimensions, filenames and format choice.',
    tip: 'Serve WebP/AVIF with compressed dimensions \u2014 image weight is the single biggest Core Web Vitals lever on content pages.',
    usage: [
      'Evaluate your page image stack against each check.',
      'Tick what you comply with.',
      'Optimize the missing image levers.',
    ],
    method: [
      'Each check maps to a rendering or indexing lever.',
      'Alt and filename checks cover the search side.',
      'Lazy-load and format checks cover the speed side.',
    ],
    fields: [
      ck('img13c', 'Image optimization checks', ['Every meaningful image has alt', 'Decorative images labelled presentation', 'Descriptive hyphenated filenames', 'Width and height attributes set', 'WebP/AVIF served where possible', 'Lazy-loading disabled on hero']),
      n('wi13', 'Hero image KB weight', { def: 340, min: 0 }),
    ],
    compute: (v) => {
      const all = asBoolList(v.img13c)
      const on = all.filter(Boolean).length
      const weight = asNum(v.wi13)
      const wOk = weight <= 250
      const score = Math.round(clamp(on * 100 / 6 + (wOk ? 8 : -8), 0, 100))
      return [
        res('Image SEO', `${score}%`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Alt coverage', all[0] && all[1] ? 'Complete' : 'Incomplete', all[0] ? T.good : T.warn),
        res('Hero weight', `${weight} KB`, wOk ? T.good : T.warn, 'Target < 250 KB on the hero'),
      ]
    },
  },
  {
    id: 'featured-snippet-optimizer',
    name: 'Featured Snippet Optimizer',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Readies your content for position-zero by checking direct-answer lengths, question headings, bullet lists and cite-able tables.',
    tip: 'Answer the exact question in the first two sentences \u2014 snippets are harvested from the prompt-near-the-top answers, 90% of the time.',
    usage: [
      'Paste the question you want to win.',
      'Tick the snippet-format elements present.',
      'Rebuild the page to position-zero shape.',
    ],
    method: [
      'Format presence (lists, tables, paragraphs) gates eligibility.',
      'Answer-location proximity is the highest-ranked factor.',
      'The readiness score predicts snippet capture odds.',
    ],
    fields: [
      txt('q13', 'Target question', 2, 'how often should I post on social media?'),
      ck('snp13', 'Snippet elements present', ['Direct answer in first 2 sentences', 'H2 phrased as the question', 'Bulleted or numbered list', 'A <table> for comparative data', 'Answer length under 58 words']),
      n('ans13', 'Answer word count', { def: 46, min: 0 }),
    ],
    compute: (v) => {
      const all = asBoolList(v.snp13)
      const on = all.filter(Boolean).length
      const ans = asNum(v.ans13)
      const aOk = ans <= 58
      const score = Math.round(clamp(on * 100 / 4.7 + (aOk ? 8 : -10), 0, 100))
      return [
        res('Snippet readiness', `${score}%`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Answer depth', `${ans} words`, aOk ? T.good : T.warn, 'Under 58 words is snippet-ready'),
        res('Format stack', `${on}/5`, on >= 3 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'faq-schema-generator',
    name: 'FAQ Schema Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds FAQPage JSON-LD with one entry per Q&A, ready to paste into the pages head for PAA eligibility.',
    tip: 'Only include FAQs whose answers are visible on the page \u2014 hidden answers produce a warning, not a rich result.',
    usage: [
      'Add each question and its answer.',
      'Generate the JSON-LD block.',
      'Paste it into the page head and validate.',
    ],
    method: [
      'Each question becomes a MainEntity entry.',
      'Answer text is embedded as is, HTML-escaped.',
      'The block supports head or script-ld placement.',
    ],
    fields: [
      txt('q13a', 'Question 1', 2, 'How fast is delivery?'),
      txt('a13a', 'Answer 1', 3, 'Orders placed before 2pm ship the same day across the mainland.'),
      txt('q13b', 'Question 2', 2, 'Do you offer returns?'),
      txt('a13b', 'Answer 2', 3, 'Yes, 30-day returns with free return labels on all orders.'),
    ],
    compute: (v) => {
      const q1 = asStr(v.q13a)
      const a1 = asStr(v.a13a)
      const q2 = asStr(v.q13b)
      const a2 = asStr(v.a13b)
      const raw = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "${q1}", "acceptedAnswer": { "@type": "Answer", "text": "${a1}" } },
    { "@type": "Question", "name": "${q2}", "acceptedAnswer": { "@type": "Answer", "text": "${a2}" } }
  ]
}`
      return [
        res('FAQs', '2', T.good),
        res('PAA eligible', 'Yes (when answered on-page)', T.good),
        doc('FAQPage JSON-LD', raw),
      ]
    },
  },
  {
    id: 'seo-friendly-url-generator',
    name: 'SEO-Friendly URL Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Slugifies any title into a keyword-bent, hyphenated, lowercase URL slug capped at a crawl-friendly length.',
    tip: 'Pair your top keyword with the page\u2019s core object and cap the slug at 5 words \u2014 short slugs earn more clicks and share more.',
    usage: [
      'Paste the page title.',
      'Keep or trim the focus keyword.',
      'Use the generated path as your canonical URL.',
    ],
    method: [
      'Non-ASCII and punctuation are normalized away.',
      'Hyphens join lowercase tokens with a max length cap.',
      'Optional keyword-first ordering is applied when enabled.',
    ],
    fields: [
      txt('tt13u', 'Page title', 2, 'The Complete Guide to Local SEO for Plumbers in 2026'),
      txt('kw13u', 'Focus keyword', 2, 'local seo for plumbers'),
      sel('depth13u', 'Depth shown', ['Flat 2-segment', 'Category + slug', 'Full path'], 'Flat 2-segment'),
    ],
    compute: (v) => {
      const title = asStr(v.tt13u) || 'untitled page'
      const kw = asStr(v.kw13u) || ''
      const sl = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60).replace(/-+$/, '')
      const obj = sl(title)
      const focus = sl(kw)
      const flat = `/tools/${focus || obj}`.slice(0, 64)
      return [
        res('Slug', flat, flat.length <= 64 ? T.good : T.warn, 'Under 64 chars'),
        res('Hyphen-clean', 'Yes', T.good),
        res('Depth', asSel(v.depth13u), T.good),
        doc('Candidate paths', [flat, `/${obj}/2026`, `/category/${obj}`].join('\n')),
      ]
    },
  },
]
