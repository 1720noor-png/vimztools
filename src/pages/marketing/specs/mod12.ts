import { n, sel, txt, ck, res, doc, T, asNum, asSel, asStr, asBoolList, clamp, pct } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Website SEO Audit'

export const mod12: MarketingSeoSpec[] = [
  {
    id: 'seo-score-checker',
    name: 'SEO Score Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Synthesizes the four headline SEO compartments \u2014 crawl, content, links and speed \u2014 into a single on-page health score.',
    tip: 'Score in the 70s on content but 40s on links? Your fix is off-page \u2014 no on-page tweak will move that needle.',
    usage: [
      'Input your four compartment scores.',
      'Run the weighted health roll-up.',
      'Target the weakest compartment first.',
    ],
    method: [
      'Four compartments are weighted by historical rank impact.',
      'A performance-grade rubric converts each into a letter class.',
      'The composite score rolls up to one decision number.',
    ],
    fields: [
      n('crawl12', 'Crawlability score', { def: 82, min: 0, max: 100 }),
      n('content12', 'Content score', { def: 68, min: 0, max: 100 }),
      n('links12', 'Authority score', { def: 44, min: 0, max: 100 }),
      n('speed12', 'Speed score', { def: 76, min: 0, max: 100 }),
    ],
    compute: (v) => {
      const crawl = asNum(v.crawl12)
      const content = asNum(v.content12)
      const links = asNum(v.links12)
      const speed = asNum(v.speed12)
      const total = Math.round(crawl * 0.25 + content * 0.3 + links * 0.3 + speed * 0.15)
      const parts = [
        { k: 'Crawl', v: crawl },
        { k: 'Content', v: content },
        { k: 'Links', v: links },
        { k: 'Speed', v: speed },
      ]
      const weakest = parts.reduce((a, b) => (a.v < b.v ? a : b))
      return [
        res('SEO health', `${total}/100`, total >= 70 ? T.good : total >= 45 ? T.warn : T.bad),
        res('Content grade', content >= 70 ? 'A' : content >= 50 ? 'B' : 'C', content >= 50 ? T.good : T.bad),
        res('Authority grade', links >= 60 ? 'A' : links >= 35 ? 'B' : 'C', links >= 35 ? T.good : T.warn),
        res('Weakest department', weakest.k, weakest.v >= 50 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'meta-tag-analyzer',
    name: 'Meta Tag Analyzer',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Audits title, description, OG tags and meta robots on any URL and flags the tags that fall outside best-practice length.',
    tip: 'One empty OG:image quietly kills most social-share CTR from your key pages \u2014 fill it before polishing descriptions.',
    usage: [
      'Paste the source of your head section.',
      'The analyzer extracts and scores each tag.',
      'Fix the flagged lengths and missing duplicates.',
    ],
    method: [
      'Title and description are measured against SERP display budgets.',
      'Canonical and robots-check ensure no self-sabotage is present.',
      'The verdict lists exactly which tags survive or fail.',
    ],
    fields: [
      txt('title12', 'Title tag', 2, 'Free QR Code Generator | vimz Tools'),
      txt('desc12', 'Meta description', 3, 'Create a free QR code for your URL in seconds.'),
      ck('tags12', 'Present tags', ['Canonical', 'meta robots', 'OG title', 'OG image', 'OG description', 'Twitter card']),
    ],
    compute: (v) => {
      const title = asStr(v.title12)
      const desc = asStr(v.desc12)
      const present = asBoolList(v.tags12)
      const tOk = title.length >= 30 && title.length <= 60
      const dOk = desc.length >= 80 && desc.length <= 160
      const ogAll = present[2] && present[3] && present[4]
      const issues = []
      if (!tOk) issues.push('title length')
      if (!dOk) issues.push('description length')
      if (!ogAll) issues.push('OG tags incomplete')
      if (!present[0]) issues.push('canonical')
      return [
        res('Title', `${title.length}/60`, tOk ? T.good : T.warn),
        res('Description', `${desc.length}/160`, dOk ? T.good : T.warn),
        res('Social graph', ogAll ? 'Complete' : 'Incomplete', ogAll ? T.good : T.warn),
        res('Verdict', issues.length ? 'Fix: ' + issues.join(', ') : 'All clean', issues.length ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'meta-title-generator',
    name: 'Meta Title Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Writes 50-60 character title tags that front-load the keyword and append a brand or differentiator.',
    tip: 'SERP titles are cut at ~60 chars \u2014 keep the keyword inside the first 40 and the brand safe at the end.',
    usage: [
      'Name the page topic and primary keyword.',
      'Add your differentiator.',
      'Pick the variant within display length.',
    ],
    method: [
      'Keyword-first ordering maximizes glance relevance.',
      'Separator and brand stack use the safe suffix zone.',
      'Each variant is clamped to the 60-char display window.',
    ],
    fields: [
      txt('kw12', 'Primary keyword', 2, 'free QR code maker'),
      txt('diff12', 'Differentiator', 2, 'no signup \u00b7 private'),
      txt('brand12', 'Brand', 2, 'vimz Tools'),
    ],
    compute: (v) => {
      const kw = asStr(v.kw12) || 'your topic'
      const diff = asStr(v.diff12)
      const brand = asStr(v.brand12) || 'Brand'
      const options = [
        `${kw} \u2014 ${diff} | ${brand}`,
        `${kw} Online \u2014 ${diff} | ${brand}`,
        `${kw} | ${brand} (${diff})`,
      ]
      const safe = options.map((t) => (t.length <= 60 ? t : t.slice(0, 57) + '...'))
      return [
        res('Keyword front-load', 'Yes', T.good),
        res('Best length', `${safe[0].length}/60`, safe[0].length <= 60 ? T.good : T.warn),
        doc('Title options', safe.join('\n')),
      ]
    },
  },
  {
    id: 'meta-description-generator',
    name: 'Meta Description Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes keyword-bearing 150-character meta descriptions that promise an outcome and a reason to click.',
    tip: 'Describe the page\u2019s actual answer \u2014 not a sales slogan \u2014 since Google now rewrites vague descriptions in favor of pure snippets.',
    usage: [
      'Summarize what the page solves.',
      'Add your differentiator detail.',
      'Paste the output as your meta description.',
    ],
    method: [
      'The promise line names the outcome the page delivers.',
      'A trust detail (scale, speed, proof) earns the click.',
      'Length is clamped to the search-result window.',
    ],
    fields: [
      txt('solve12', 'What the page solves', 2, 'audit your site\u2019s keyword cannibalization in minutes'),
      txt('det12', 'Trust detail', 2, 'free, runs 100% in your browser'),
    ],
    compute: (v) => {
      const solve = asStr(v.solve12) || 'solve a problem in minutes'
      const det = asStr(v.det12) || 'free and fast'
      let meta = `Use this tool to ${solve}. ${det} \u2014 no signup, no limits, works instantly.`
      if (meta.length > 160) meta = meta.slice(0, 157) + '...'
      return [
        res('Length', `${meta.length}/160`, meta.length <= 160 ? T.good : T.warn),
        res('Outcome', 'Named', T.good),
        doc('Meta description', meta),
      ]
    },
  },
  {
    id: 'heading-structure-checker',
    name: 'Heading Structure Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Verifies a page\u2019s H1-H6 hierarchy against the flat, skipped and duplicated patterns that weaken on-page signals.',
    tip: 'One H1 only, and a strictly sequential H2 > H3 ladder \u2014 a skipped level reads thin to both from-language and users scanning.',
    usage: [
      'List your headings in document order.',
      'Tick the structure promises it keeps.',
      'Fix any skipped level before publishing.',
    ],
    method: [
      'The checker compares your hierarchy to a strict ladder.',
      'Duplicates in the H1 and H2 layer are flagged as dilution.',
      'Heading keyword coverage is rewarded per level.',
    ],
    fields: [
      n('h1c12', 'H1 count', { def: 1, min: 0, max: 6 }),
      n('h2c12', 'H2 count', { def: 6, min: 0 }),
      n('h3c12', 'H3 count', { def: 12, min: 0 }),
      n('h4c12', 'H4 count', { def: 3, min: 0 }),
      sel('seq12', 'Ladder order', ['Sequential no skips', 'One skip (H2\u2192H4)', 'Multiple skips'], 'Sequential no skips'),
      sel('kw12h', 'Keyword in headings', ['In H1 + H2', 'In H1 only', 'Missing'], 'In H1 + H2'),
    ],
    compute: (v) => {
      const h1 = asNum(v.h1c12)
      const h2 = asNum(v.h2c12)
      const h3 = asNum(v.h3c12)
      const h4 = asNum(v.h4c12)
      const seq = asSel(v.seq12)
      const kw = asSel(v.kw12h)
      let s = 30
      s += h1 === 1 ? 20 : h1 === 0 ? 0 : 8
      s += seq === 'Sequential no skips' ? 20 : seq === 'One skip (H2\u2192H4)' ? 10 : 4
      s += kw === 'In H1 + H2' ? 20 : kw === 'In H1 only' ? 12 : 2
      s += h2 >= 4 && h3 >= h2 ? 10 : h2 >= 2 ? 5 : 0
      const score = Math.round(clamp(s, 0, 100))
      return [
        res('Heading structure', `${score}%`, score >= 80 ? T.good : score >= 50 ? T.warn : T.bad),
        res('H1 rule', h1 === 1 ? 'Single H1' : h1 === 0 ? 'Missing H1!' : `${h1} H1s \u2014 too many`, h1 === 1 ? T.good : T.warn),
        res('Density', `${h2 + h3 + h4} subheadings`, h2 + h3 + h4 >= 8 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'image-alt-text-checker',
    name: 'Image Alt Text Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Computes an image SEO score from how many imgs carry meaningful alt, correct filenames and descriptive context.',
    tip: 'Every meaningful image needs natural alt text; decorative ones can be role="presentation" to pass accessibility audits.',
    usage: [
      'Count total images and those with alt.',
      'Note filename quality.',
      'Apply the score to close the gap.',
    ],
    method: [
      'Alt coverage is the dominant weight.',
      'Filenames and descriptive context resolve image relevance.',
      'The score output maps directly to an accessibility win.',
    ],
    fields: [
      n('imgs12', 'Total images', { def: 40, min: 1 }),
      n('alt12', 'Images with alt', { def: 26, min: 0 }),
      n('good12', 'Descriptive filenames', { def: 30, min: 0 }),
    ],
    compute: (v) => {
      const imgs = asNum(v.imgs12)
      const alt = asNum(v.alt12)
      const good = asNum(v.good12)
      const altR = alt / imgs
      const fileR = good / imgs
      const score = Math.round(clamp(altR * 65 + fileR * 35, 0, 100))
      return [
        res('Image SEO', `${score}%`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Alt coverage', pct(altR * 100), altR >= 0.9 ? T.good : altR >= 0.7 ? T.warn : T.bad),
        res('Filename quality', pct(fileR * 100), fileR >= 0.7 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'broken-link-checker',
    name: 'Broken Link Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Models the impact of broken links across your site \u2014 how many exist, how much authority they leak, and the fix workload.',
    tip: 'Fix internal 404s before external ones; each internal break chokes crawlers on the pages that feed your rankings.',
    usage: [
      'Enter your crawl totals.',
      'Run the leak model.',
      'Prioritize the internal 404s first.',
    ],
    method: [
      'External and internal breaks are counted separately.',
      'Authority bleed scales with the pages linking to breaks.',
      'The repair effort is estimated from break volume.',
    ],
    fields: [
      n('pages12', 'Pages crawled', { def: 300, min: 1 }),
      n('ext12', 'External 404s', { def: 22, min: 0 }),
      n('int12', 'Internal 404s', { def: 6, min: 0 }),
      n('bl12', 'Links pointing to breaks', { def: 38, min: 0 }),
    ],
    compute: (v) => {
      const pages = asNum(v.pages12)
      const ext = asNum(v.ext12)
      const int = asNum(v.int12)
      const bl = asNum(v.bl12)
      const rate = (ext + int) / pages
      const leak = Math.round(clamp(bl * 0.35, 0, 100))
      const hrs = Math.round(int * 8 + ext * 3) / 60
      return [
        res('Break rate', pct(rate * 100), rate < 0.06 ? T.good : rate < 0.12 ? T.warn : T.bad),
        res('Authority leak', `${leak}%`, leak < 30 ? T.good : T.warn),
        res('Fix effort', `${hrs} hours`, hrs < 3 ? T.good : T.warn),
        res('Priority', int > 0 ? 'Internal 404s first' : 'External cleanup', int > 0 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'canonical-url-checker',
    name: 'Canonical URL Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Verifies canonical hygiene \u2014 self-referencing canonicals, no conflicting signals, no facets \u2014 so duplicate content never dilutes you.',
    tip: 'A canonical that points to a redirected URL is a silent killer \u2014 validate every canonical target resolves 200.',
    usage: [
      'Answer the canonical hygiene checks.',
      'Note any flagged conflicts.',
      'Fix signal conflicts before crawling again.',
    ],
    method: [
      'Each check maps to a duplicate-content failure mode.',
      'Self-referencing and 200-resolution are non-negotiable.',
      'The score integrates across all checks similarly weighted.',
    ],
    fields: [
      ck('can12', 'Canonical hygiene checks', [
        'Self-referencing canonical on every page',
        'No canonical to 3xx URLs',
        'Single canonical per page',
        'Facet & param pages canonicalized to clean URL',
        'Hreflang pairs canonical to same-host page',
        'No conflicting meta robots noindex',
      ]),
      n('pagesc12', 'Pages audited', { def: 120, min: 1 }),
    ],
    compute: (v) => {
      const all = asBoolList(v.can12)
      const on = all.filter(Boolean).length
      const score = Math.round(clamp(on * 100 / 6, 0, 100))
      const flags = ['Canonical \u2192 3xx', 'Multi-canonical conflict', 'Facet leak'].filter((_, i) => (!all[1] && i === 0) || (!all[2] && i === 1) || (!all[3] && i === 2))
      return [
        res('Canonical hygiene', `${score}%`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Pages checked', `${asNum(v.pagesc12)}`),
        doc('Conflicts to fix', flags.length ? flags.map((f) => `\u2022 ${f}`).join('\n') : 'Canonical signals clean.'),
      ]
    },
  },
  {
    id: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a lean robots.txt with sitemap reference and allow/disallow rules that keep crawlers out of wasteful folders.',
    tip: 'Never disallow crawl of your own CSS/JS \u2014 blocking those silently kills your page rendering score in Google\u2019s eyes.',
    usage: [
      'List the paths you want to block.',
      'Add your sitemap URL.',
      'Put the file at /robots.txt and re-crawl.',
    ],
    method: [
      'User-agent wildcard plus explicit rules is the safe baseline.',
      'Blocked paths are appended with leading slashes.',
      'A sitemap line indexes every crawlable URL.',
    ],
    fields: [
      txt('blocks12', 'Paths to block (line separated)', 4, '/admin/\n/cart/\n/\u0021cache/'),
      txt('sitemap12', 'Sitemap URL', 2, 'https://example.com/sitemap.xml'),
      ck('allow12', 'Allow lists', ['Allow /public/', 'Allow /blog-images/']),
    ],
    compute: (v) => {
      const blocks = (asStr(v.blocks12) || '/admin/').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 12)
      const raw = ['User-agent: *', `Allow: /${asBoolList(v.allow12)[0] ? 'public/' : ''}`, `Disallow: /${asBoolList(v.allow12)[1] ? 'blog-images/' : ''}`, ...blocks.map((b) => (b.startsWith('/') ? `Disallow: ${b}` : `Disallow: /${b}`)), '', `Sitemap: ${asStr(v.sitemap12) || 'https://example.com/sitemap.xml'}`].join('\n').replace(/\n+/g, '\n')
      return [
        res('Rules', `${blocks.length + 1}`, T.good),
        res('Sitemap', 'Included', T.good),
        doc('robots.txt', raw),
      ]
    },
  },
  {
    id: 'xml-sitemap-generator',
    name: 'XML Sitemap Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Structures an XML sitemap template from your URL list with priorities and change frequencies for the crawler.',
    tip: 'Keep canonical URLs only, cap 50k entries, and drop URLs you noindex \u2014 a polluted sitemap trains Google to ignore it.',
    usage: [
      'List your top URLs.',
      'Set typical change frequency.',
      'Export and upload to /sitemap.xml, then submit in Search Console.',
    ],
    method: [
      'Every URL is wrapped in canonical location tags.',
      'Priority reflects depth and importance heuristics.',
      'Change frequency and lastmod follow your site\u2019s cadence.',
    ],
    fields: [
      txt('urls12', 'URLs (one per line)', 5, 'https://example.com/\nhttps://example.com/pricing'),
      sel('freq12', 'Change frequency', ['daily', 'weekly', 'monthly'], 'weekly'),
      sel('pri12', 'Default priority', ['1.0', '0.8', '0.5'], '0.8'),
    ],
    compute: (v) => {
      const urls = (asStr(v.urls12) || 'https://example.com/').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 50)
      const freq = asSel(v.freq12)
      const pri = asSel(v.pri12)
      const raw = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`), '</urlset>'].join('\n')
      return [
        res('URLs', `${urls.length}`, urls.length <= 50000 ? T.good : T.warn),
        res('Frequency', freq, T.good),
        res('Size', `${Math.round(raw.length / 1024)} KB`, T.good),
        doc('sitemap.xml', raw),
      ]
    },
  },
  {
    id: 'sitemap-url-checker',
    name: 'Sitemap URL Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Scores your sitemap against the posting rules that keep it canonical-clean and crawl-friendly.',
    tip: 'Stale lastmod is the silent sitemap killer \u2014 an unchanged URL in the top of the sitemap trains the crawler to revisit rarely.',
    usage: [
      'Review each rule against your actual sitemap.',
      'Tick the ones you comply with.',
      'Repair any falsified rows and resubmit.',
    ],
    method: [
      'Canonical-only enforcement prevents duplicate pollution.',
      'Recency and size rules keep crawl efficiency high.',
      'The compliance score reflects readiness for indexing.',
    ],
    fields: [
      ck('sm12', 'Sitemap compliance checks', [
        'URLs are final 200-capable canonicals',
        'No noindexed URLs included',
        'lastmod dates stay accurate & current',
        'File under 50,000 URLs',
        'Size under 50MB uncompressed',
        'References hreflang alternates',
      ],),
    ],
    compute: (v) => {
      const all = asBoolList(v.sm12)
      const on = all.filter(Boolean).length
      const score = Math.round(on * 100 / 6)
      const misses = ['Canonical-only URLs', 'Recency of lastmod', 'Under size limits'].filter((_, i) => [0, 2, 3].includes(i) ? !all[i] : false)
      return [
        res('Sitemap health', `${score}%`, score >= 80 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Rules met', `${on}/6`),
        doc('Repair list', misses.length ? misses.map((m) => `\u2022 ${m}`).join('\n') : 'Compliant \u2014 resubmit and watch coverage.'),
      ]
    },
  },
  {
    id: 'hreflang-generator',
    name: 'Hreflang Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds the reciprocal hreflang annotation set for a URL across all the language and region versions you serve.',
    tip: 'Every language URL must point to every other language URL including itself \u2014 breaking the loop silently underserves non-English visitors.',
    usage: [
      'Set your base URL and language.',
      'List the other language versions.',
      'Drop the output into head tags or the response header.',
    ],
    method: [
      'All variants plus the self-reference are paired.',
      'x-default signals the language-neutral fallback.',
      'Reciprocal pairs are emitted per document.',
    ],
    fields: [
      txt('base12', 'Base URL (en)', 2, 'https://example.com/path'),
      txt('langs12', 'Other versions: en-US, es, fr (comma separated)', 2, 'https://example.com/es/path, https://example.com/fr/path'),
    ],
    compute: (v) => {
      const base = asStr(v.base12) || 'https://example.com/path'
      const others = (asStr(v.langs12) || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12)
      const all = [base, ...others]
      const lines: string[] = []
      for (const u of all) {
        for (const alt of all) lines.push(`<link rel="alternate" hreflang="${u === base ? 'en' : 'other'}" href="${u}${u === alt ? '#self' : ''}" />`)
      }
      return [
        res('Language versions', `${all.length}`, T.good),
        res('Pairs emitted', `${all.length * all.length}`, all.length * all.length <= 20 ? T.good : T.warn, 'Every page links to every page'),
        doc('hreflang block', lines.slice(0, 40).join('\n')),
      ]
    },
  },
  {
    id: 'website-schema-generator',
    name: 'Schema Markup Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Generates a multi-entity JSON-LD block \u2014 Organization, WebSite, Article or Product \u2014 ready for your pages head.',
    tip: 'Give Google fresh structured data that matches visible page content \u2014 mismatched schema disappears from rich results.',
    usage: [
      'Choose the primary entity type.',
      'Fill the entity fields.',
      'Validate in the Rich Results Test post-deploy.',
    ],
    method: [
      'Entity type changes the JSON-LD skeleton.',
      'All fields map to schema.org properties.',
      'Crossrefs (sameAs, publisher) are appended where applicable.',
    ],
    fields: [
      sel('st12', 'Entity type', ['Organization', 'WebSite', 'Article', 'Product', 'Event'], 'WebSite'),
      txt('nm12', 'Name', 2, 'vimz Tools'),
      txt('url12', 'URL', 2, 'https://vimz-tools.com'),
      txt('desc12s', 'Description', 2, 'Free browser-based utilities'),
      txt('logo12', 'Logo URL', 2, 'https://vimz-tools.com/logo.png'),
    ],
    compute: (v) => {
      const t = asSel(v.st12)
      const raw = `{
  "@context": "https://schema.org",
  "@type": "${t}",
  "name": "${asStr(v.nm12)}",
  "url": "${asStr(v.url12)}",
  "description": "${asStr(v.desc12s)}",
  ${t === 'WebSite' ? `"potentialAction": { "@type": "SearchAction", "target": "${asStr(v.url12)}/search?q={search_term_string}" }` : `"logo": "${asStr(v.logo12)}"`}
}`
      return [
        res('Entity', t, T.good),
        res('Snippet-ready', t !== 'Organization' ? 'Build your block on this' : 'Basic', T.good),
        doc(`${t} JSON-LD`, raw),
      ]
    },
  },
  {
    id: 'open-graph-generator',
    name: 'Open Graph Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Emits the full Open Graph tag block for a page so every social share renders a title, image and description that drive clicks.',
    tip: 'A 1200\u00d7630 OG image with a text overlay lifts social CTR about 25% \u2014 the image literally is the title on most platforms.',
    usage: [
      'Add your page title and description.',
      'Point at a share-ready image URL.',
      'Insert before </head>.',
    ],
    method: [
      'og:type resolves to the page\u2019s share shape.',
      'og:image at 1.91:1 matches platform crop windows.',
      'The fallback of twitter:card mirrors the OG fields.',
    ],
    fields: [
      txt('ogt12', 'Page title', 2, 'Free QR Code Generator'),
      txt('ogd12', 'Description', 2, 'Create private QR codes instantly in your browser.'),
      txt('ogimg12', 'Image URL', 2, 'https://vimz-tools.com/og-default.png'),
      sel('ogt12y', 'og:type', ['website', 'article', 'product'], 'website'),
    ],
    compute: (v) => {
      const t = asStr(v.ogt12) || 'Page title'
      const d = asStr(v.ogd12) || ''
      const img = asStr(v.ogimg12) || ''
      const raw = [
        `<meta property="og:type" content="${asSel(v.ogt12y)}" />`,
        `<meta property="og:title" content="${t}" />`,
        `<meta property="og:description" content="${d}" />`,
        `<meta property="og:image" content="${img}" />`,
        `<meta property="og:url" content="https://example.com/page" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
      ].join('\n')
      return [
        res('Share ready', img && t ? 'Yes' : 'Missing image', img && t ? T.good : T.warn),
        res('Image ratio', '1200\u00d7630 target', T.good),
        doc('Open Graph block', raw),
      ]
    },
  },
  {
    id: 'twitter-card-generator',
    name: 'Twitter Card Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds the twitter:card meta set (summary_large_image with title, description, site and image) for X/Twitter previews.',
    tip: 'twitter:card must be summary_large_image to show the big preview; the small summary card wastes your visual asset.',
    usage: [
      'Set your site handle and page title.',
      'Add the share image URL.',
      'Insert into the head with the OG block.',
    ],
    method: [
      'The card type selects large vs small preview.',
      'Site and creator handles scope attribution.',
      'Image and title mirror the OG values for consistency.',
    ],
    fields: [
      txt('twt12', 'Page title', 2, 'Free QR Code Generator'),
      txt('twd12', 'Description', 2, 'Private, browser-only QR codes'),
      txt('twimg12', 'Image URL', 2, 'https://vimz-tools.com/og-default.png'),
      txt('site12', 'Site @handle', 2, '@vimztools'),
    ],
    compute: (v) => {
      const raw = [
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${asStr(v.twt12)}" />`,
        `<meta name="twitter:description" content="${asStr(v.twd12)}" />`,
        `<meta name="twitter:image" content="${asStr(v.twimg12)}" />`,
        `<meta name="twitter:site" content="${asStr(v.site12)}" />`,
      ].join('\n')
      return [
        res('Card type', 'summary_large_image', T.good),
        res('Image', asStr(v.twimg12) ? 'Set' : 'Missing', asStr(v.twimg12) ? T.good : T.warn),
        doc('Twitter card block', raw),
      ]
    },
  },
  {
    id: 'url-structure-analyzer',
    name: 'URL Structure Analyzer',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores a URL\u2019s structure \u2014 slugs, depth, parameters, protocol and casing \u2014 against crawl-and-share best practice.',
    tip: 'Keep depth to 2-3 segments, use hyphen-separated lowercase slugs, and strip parameters where possible \u2014 they dillute crawl budget.',
    usage: [
      'Paste the URL you want to audit.',
      'Run the structure scorecard.',
      'Apply the flagged shape fixes.',
    ],
    method: [
      'Segment depth is scored for flattening.',
      'Slug patterns reward hyphens over underscores and casing.',
      'Parameters and dynamic tokens are flagged as crawl friction.',
    ],
    fields: [
      txt('url12s', 'Full URL', 2, 'https://example.com/Seo/Audit.Check?ref=utm_source=abc'),
      n('depth12', 'Path depth (segments)', { def: 2, min: 1, max: 8 }),
      sel('slug12', 'Slug style', ['lowercase-hyphens', 'camelCase', 'underscores', 'no-slug'], 'lowercase-hyphens'),
      ck('uv12', 'URL traits', ['www vs non-www consistent', 'HTTPS enabled', 'No UTM on canonical']),
    ],
    compute: (v) => {
      const depth = asNum(v.depth12)
      const slug = asSel(v.slug12)
      const flags = asBoolList(v.uv12)
      let s = 25
      s += depth <= 2 ? 20 : depth <= 4 ? 12 : 5
      s += slug === 'lowercase-hyphens' ? 15 : slug === 'no-slug' ? 4 : 8
      s += flags[0] ? 13 : 5
      s += flags[1] ? 14 : 5
      s += flags[2] ? 14 : 5
      const score = Math.round(clamp(s, 0, 100))
      return [
        res('URL structure', `${score}%`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Depth', `${depth} segments`, depth <= 3 ? T.good : T.warn),
        res('Slug clean', slug === 'lowercase-hyphens' ? 'Best practice' : slug, slug === 'lowercase-hyphens' ? T.good : T.warn),
      ]
    },
  },
]
