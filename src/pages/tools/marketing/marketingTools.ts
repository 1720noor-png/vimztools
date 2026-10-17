export interface MktField {
  key: string
  label: string
  kind: 'number' | 'text' | 'textarea' | 'select'
  options?: Array<{ value: string; label: string }>
  suffix?: string
  placeholder?: string
  min?: string
}

export interface MktResult {
  label: string
  value: string
  tone?: 'ok' | 'warn'
  hint?: string
}

export interface MktTab {
  id: string
  label: string
  fields: MktField[]
  compute: (v: Record<string, string>) => MktResult[]
}

export interface MktTool {
  id: string
  name: string
  description: string
  subcategoryId: string
  tabs: MktTab[]
  output?: string
}

const money = (n: number, digits = 2): string =>
  Number.isFinite(n) ? (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: digits }) : '—'

const pct = (n: number, digits = 1): string =>
  Number.isFinite(n) ? n.toFixed(digits) + '%' : '—'

const r2 = (n: number): string =>
  Number.isFinite(n) ? n.toFixed(2) + 'x' : '—'

function num(v: Record<string, string>, k: string): number {
  const x = parseFloat(v[k] ?? '')
  return Number.isFinite(x) ? x : NaN
}

function req(...a: number[]): boolean {
  return a.every((x) => Number.isFinite(x) && x >= 0)
}

export const MKT_TOOLS: MktTool[] = [
  // ============ 1. SEO ============
  {
    id: 'schema-markup-generator',
    name: 'Schema Markup Generator',
    description: 'Generate JSON-LD structured data for Articles, Products and FAQs.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'article',
        label: 'Article',
        fields: [
          { key: 'headline', label: 'Headline', kind: 'text', placeholder: 'Your article title' },
          { key: 'url', label: 'Article URL', kind: 'text', placeholder: 'https://example.com/post' },
          { key: 'author', label: 'Author name', kind: 'text', placeholder: 'Jane Doe' },
          { key: 'publisher', label: 'Publisher name', kind: 'text', placeholder: 'Your Brand' },
          { key: 'date', label: 'Published date', kind: 'text', placeholder: '2026-01-15' },
        ],
        compute: (v) => [
          {
            label: 'JSON-LD',
            value: JSON.stringify(
              {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: v.headline || '',
                url: v.url || '',
                author: { '@type': 'Person', name: v.author || '' },
                publisher: { '@type': 'Organization', name: v.publisher || '' },
                datePublished: v.date || '',
              },
              null,
              2,
            ),
            tone: 'ok',
            hint: 'Paste into your <head> with <script type="application/ld+json">.',
          },
        ],
      },
      {
        id: 'product',
        label: 'Product',
        fields: [
          { key: 'name', label: 'Product name', kind: 'text', placeholder: 'Wireless Headphones' },
          { key: 'price', label: 'Price', kind: 'number', suffix: '$', min: '0' },
          { key: 'currency', label: 'Currency code', kind: 'text', placeholder: 'USD' },
          { key: 'sku', label: 'SKU', kind: 'text', placeholder: 'WH-100' },
          { key: 'brand', label: 'Brand', kind: 'text', placeholder: 'Acme' },
        ],
        compute: (v) => {
          const price = num(v, 'price')
          return [
            {
              label: 'JSON-LD',
              value: JSON.stringify(
                {
                  '@context': 'https://schema.org',
                  '@type': 'Product',
                  name: v.name || '',
                  sku: v.sku || '',
                  brand: { '@type': 'Brand', name: v.brand || '' },
                  offers: {
                    '@type': 'Offer',
                    price: Number.isFinite(price) ? price : 0,
                    priceCurrency: v.currency || 'USD',
                    availability: 'https://schema.org/InStock',
                  },
                },
                null,
                2,
              ),
              tone: 'ok',
              hint: 'Rich results require this to match on-page content.',
            },
          ]
        },
      },
      {
        id: 'faq',
        label: 'FAQ',
        fields: [
          {
            key: 'q1', label: 'Question 1', kind: 'text', placeholder: 'First question',
          },
          { key: 'a1', label: 'Answer 1', kind: 'text', placeholder: 'Answer text' },
          { key: 'q2', label: 'Question 2', kind: 'text', placeholder: 'Second question' },
          { key: 'a2', label: 'Answer 2', kind: 'text', placeholder: 'Answer text' },
          { key: 'q3', label: 'Question 3', kind: 'text', placeholder: 'Third question' },
          { key: 'a3', label: 'Answer 3', kind: 'text', placeholder: 'Answer text' },
        ],
        compute: (v) => {
          const items = [
            [v.q1, v.a1],
            [v.q2, v.a2],
            [v.q3, v.a3],
          ]
            .filter(([q, a]) => q && a)
            .map(([q, a]) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            }))
          return [
            {
              label: 'JSON-LD',
              value: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items }, null, 2),
              tone: items.length ? 'ok' : 'warn',
              hint: items.length ? `${items.length} FAQ pair(s) generated.` : 'Fill at least one question + answer.',
            },
          ]
        },
      },
    ],
  },
  {
    id: 'internal-link-equity-calculator',
    name: 'Internal Link Strategy & Equity Calculator',
    description: 'Estimate how internal link flow distributes PageRank-like equity across your site.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'calc',
        label: 'Equity spread',
        fields: [
          { key: 'pages', label: 'Indexed pages', kind: 'number', suffix: 'pages', min: '1' },
          { key: 'links', label: 'Internal links on a page', kind: 'number', min: '0' },
          { key: 'equity', label: 'Page equity (0-100)', kind: 'number', suffix: 'pts', min: '0' },
          { key: 'depth', label: 'Click depth', kind: 'number', suffix: 'clicks', min: '1' },
        ],
        compute: (v) => {
          const pages = num(v, 'pages')
          const lk = num(v, 'links')
          const eq = num(v, 'equity')
          const depth = num(v, 'depth')
          if (!req(pages, lk, eq, depth) || pages === 0) return []
          const dampen = Math.pow(0.85, depth)
          const perLink = (eq / pages) * dampen
          const total = perLink * lk
          return [
            { label: 'Equity per link', value: r2(perLink), tone: 'ok', hint: 'Before redistribution to target pages.' },
            { label: 'Equity to 1 target page', value: r2(perLink), hint: 'A page with 1 inbound internal link.' },
            { label: 'Equity to page with ' + lk + ' links', value: r2(total), tone: perLink > 0.05 ? 'warn' : 'ok', hint: 'Too many links to one page dilutes authority.' },
            { label: 'Depth penalty (0.85^n)', value: pct((1 - dampen) * 100), hint: 'Equity lost per extra click depth.' },
            { label: 'Est. links to point at pillars', value: Math.round(Math.max(1, pages * 0.1)).toString(), hint: 'Pillar pages deserve many more internal links than average.' },
          ]
        },
      },
    ],
  },
  {
    id: 'redirect-path-checker',
    name: 'Redirect Path & HTTP Header Checker',
    description: 'Audit redirect chains, 301/302 status and potential 404-prone paths.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'audit',
        label: 'Redirect audit',
        fields: [
          { key: 'hops', label: 'Redirect hops', kind: 'number', suffix: 'hops', min: '0' },
          {
            key: 'status', label: 'Current status', kind: 'select',
            options: [
              { value: '200', label: '200 OK' },
              { value: '301', label: '301 Moved Permanently' },
              { value: '302', label: '302 Found (temporary)' },
              { value: '404', label: '404 Not Found' },
              { value: '410', label: '410 Gone' },
            ],
          },
          { key: 'external', label: 'External links to URL', kind: 'number', min: '0' },
          {
            key: 'target', label: 'Target is live', kind: 'select',
            options: [
              { value: 'yes', label: 'Yes - resolves to 200' },
              { value: 'no', label: 'No - target missing' },
              { value: 'unknown', label: 'Unknown' },
            ],
          },
        ],
        compute: (v) => {
          const hops = num(v, 'hops')
          const ext = num(v, 'external')
          const status = v.status || '200'
          const target = v.target || 'yes'
          if (!req(hops, ext)) return []
          const leaks = ext * Math.pow(0.9, hops)
          let verdict = status === '200' ? 'Healthy - no redirect needed.' : status === '410' ? 'Explicitly gone - remove links.' : `${status} should be a permanent 301 to the final URL.`
          if (status === '404' && ext > 0) verdict = '404 with external links - set up a 301 to the closest live page.'
          if (status === '301' && hops >= 2) verdict = 'Redirect chain length ' + hops + ' - collapse to a single 301.'
          if (status === '302' && ext > 0) verdict = 'Temporary 302 on a linked URL - use 301 to preserve equity.'
          if (status === '301' && target === 'no') verdict = '301 points to a dead target - fix the destination.'
          return [
            { label: 'Crawl eligibility', value: status === '404' || status === '410' ? 'No' : 'Yes', tone: status === '404' || status === '410' ? 'warn' : 'ok' },
            { label: 'Estimated equity leak', value: pct(leaks > 0 ? (1 - Math.pow(0.9, hops)) * 100 : 0), hint: 'Each hop loses roughly 10% of passing equity.' },
            { label: 'Recommendation', value: verdict, tone: status === '404' || status === '410' ? 'warn' : 'ok', hint: 'Audit every redirect chain quarterly.' },
          ]
        },
      },
    ],
  },
  {
    id: 'anchor-text-planner',
    name: 'Anchor Text Distribution Planner',
    description: 'Plan a natural anchor text profile to avoid over-optimization.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'plan',
        label: 'Distribution plan',
        fields: [
          { key: 'links', label: 'Total backlinks', kind: 'number', suffix: 'links', min: '1' },
          { key: 'brand', label: 'Branded %', kind: 'number', suffix: '%', min: '0', placeholder: '40' },
          { key: 'exact', label: 'Exact-match %', kind: 'number', suffix: '%', min: '0', placeholder: '10' },
          { key: 'partial', label: 'Partial-match %', kind: 'number', suffix: '%', min: '0', placeholder: '20' },
          { key: 'generic', label: 'Generic %', kind: 'number', suffix: '%', min: '0', placeholder: '20' },
          { key: 'url', label: 'URL/naked %', kind: 'number', suffix: '%', min: '0', placeholder: '10' },
        ],
        compute: (v) => {
          const total = num(v, 'links')
          const vals = { Branded: num(v, 'brand'), 'Exact-match': num(v, 'exact'), 'Partial-match': num(v, 'partial'), Generic: num(v, 'generic'), 'URL/naked': num(v, 'url') }
          if (!req(total, ...Object.values(vals))) return []
          const sum = Object.values(vals).reduce((a, b) => a + b, 0)
          const out: MktResult[] = []
          for (const [k, val] of Object.entries(vals)) {
            out.push({ label: k, value: `${Math.round((total * val) / 100)} links`, tone: 'ok' })
          }
          out.push({
            label: 'Totals check',
            value: sum === 100 ? '100% - balanced' : `${sum.toFixed(0)}% - rebalance`,
            tone: sum === 100 ? 'ok' : 'warn',
            hint: 'Exact-match above 15-20% looks unnatural to Google.',
          })
          return out
        },
      },
    ],
  },
  {
    id: 'canonical-hreflang-generator',
    name: 'Canonical Tag & Hreflang Tag Generator',
    description: 'Generate canonical URLs and hreflang alternates for multilingual pages.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'tags',
        label: 'Generate tags',
        fields: [
          { key: 'url', label: 'Canonical URL', kind: 'text', placeholder: 'https://example.com/page' },
          { key: 'x', label: 'x-default URL', kind: 'text', placeholder: 'https://example.com/' },
          { key: 'en', label: 'en URL', kind: 'text', placeholder: 'https://example.com/en/' },
          { key: 'es', label: 'es URL', kind: 'text', placeholder: 'https://example.com/es/' },
          { key: 'fr', label: 'fr URL', kind: 'text', placeholder: 'https://example.com/fr/' },
        ],
        compute: (v) => {
          const langs = [
            ['x-default', v.x],
            ['en', v.en],
            ['es', v.es],
            ['fr', v.fr],
          ].filter(([, u]) => u)
          const hreflang = langs.map(([l, u]) => `<link rel="alternate" hreflang="${l}" href="${u}" />`).join('\n')
          const canonical = v.url ? `<link rel="canonical" href="${v.url}" />` : ''
          return [
            { label: 'Tags', value: [canonical, hreflang].filter(Boolean).join('\n'), tone: v.url && langs.length ? 'ok' : 'warn', hint: 'Every language URL should also self-canonicalize.' },
          ]
        },
      },
    ],
  },
  {
    id: 'robots-sitemap-builder',
    name: 'Robots.txt & XML Sitemap Builder',
    description: 'Generate a robots.txt and an XML sitemap for your site.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'robots',
        label: 'robots.txt',
        fields: [
          { key: 'domain', label: 'Domain', kind: 'text', placeholder: 'example.com' },
          { key: 'disallow', label: 'Disallowed paths (one per line)', kind: 'textarea', placeholder: '/admin/\n/api/\n/checkout/cart' },
          { key: 'sitemap', label: 'Sitemap URL', kind: 'text', placeholder: 'https://example.com/sitemap.xml' },
        ],
        compute: (v) => {
          const dis = (v.disallow || '').split('\n').map((l) => l.trim()).filter(Boolean)
          const lines = ['User-agent: *']
          for (const d of dis) lines.push('Disallow: ' + d)
          if (!dis.length) lines[0] = 'User-agent: *\nAllow: /'
          if (v.sitemap) lines.push('Sitemap: ' + v.sitemap)
          return [{ label: 'robots.txt', value: lines.join('\n'), tone: 'ok', hint: 'Crawl: /robots.txt to verify.' }]
        },
      },
      {
        id: 'sitemap',
        label: 'XML sitemap',
        fields: [
          { key: 'domain', label: 'Domain', kind: 'text', placeholder: 'example.com' },
          { key: 'urls', label: 'Page paths (one per line)', kind: 'textarea', placeholder: '/\n/about\n/blog\n/products' },
        ],
        compute: (v) => {
          const paths = (v.urls || '').split('\n').map((l) => l.trim()).filter(Boolean)
          const domain = (v.domain || 'example.com').replace(/\/+$/, '')
          const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...paths.map((p) => `  <url><loc>https://${domain}${p.startsWith('/') ? p : '/' + p}</loc></url>`),
            '</urlset>',
          ].join('\n')
          return [{ label: 'sitemap.xml', value: xml, tone: paths.length ? 'ok' : 'warn', hint: `${paths.length} URL(s). Max 50,000 URLs per sitemap.` }]
        },
      },
    ],
  },
  {
    id: 'core-web-vitals-estimator',
    name: 'Page Speed / Core Web Vitals Estimator',
    description: 'Estimate Core Web Vitals health from typical field values.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'vitals',
        label: 'Score vitals',
        fields: [
          { key: 'lcp', label: 'LCP', kind: 'number', suffix: 's', min: '0', placeholder: '2.4' },
          { key: 'inp', label: 'INP', kind: 'number', suffix: 'ms', min: '0', placeholder: '180' },
          { key: 'cls', label: 'CLS', kind: 'number', suffix: 'score', min: '0', placeholder: '0.05' },
          { key: 'fcp', label: 'FCP', kind: 'number', suffix: 's', min: '0', placeholder: '1.8' },
        ],
        compute: (v) => {
          const lcp = num(v, 'lcp')
          const inp = num(v, 'inp')
          const cls = num(v, 'cls')
          const fcp = num(v, 'fcp')
          if (!req(lcp, inp, cls, fcp)) return []
          const grade = (val: number, ok: number, warn: number, label: string, unit: string) => {
            if (val <= ok) return { label, value: `${val}${unit}`, tone: 'ok' as const, hint: 'Good' }
            if (val <= warn) return { label, value: `${val}${unit}`, tone: 'warn' as const, hint: 'Needs improvement' }
            return { label, value: `${val}${unit}`, tone: 'warn' as const, hint: 'Poor' }
          }
          const good = [lcp <= 2.5, inp <= 200, cls <= 0.1, fcp <= 1.8].filter(Boolean).length
          return [
            grade(lcp, 2.5, 4, 'Largest Contentful Paint', 's'),
            grade(inp, 200, 500, 'Interaction to Next Paint', 'ms'),
            { label: 'Cumulative Layout Shift', value: cls.toFixed(2), tone: cls <= 0.1 ? 'ok' : 'warn', hint: cls <= 0.1 ? 'Good' : 'Needs improvement' },
            grade(fcp, 1.8, 3, 'First Contentful Paint', 's'),
            { label: 'Result', value: `${good}/4 within Good thresholds`, tone: good >= 3 ? 'ok' : 'warn', hint: 'Aim to pass all four for the page experience signal.' },
          ]
        },
      },
    ],
  },
  {
    id: 'serp-pixel-width-checker',
    name: 'SERP Meta Title & Description Pixel Width Checker',
    description: 'Estimate rendered pixel width of meta titles and descriptions.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'check',
        label: 'Check widths',
        fields: [
          { key: 'title', label: 'Meta title', kind: 'textarea', placeholder: 'Your meta title here' },
          { key: 'desc', label: 'Meta description', kind: 'textarea', placeholder: 'Short description that sells the click.' },
        ],
        compute: (v) => {
          const px = (s: string) => Array.from(s || '').reduce((sum, ch) => {
            const w = ch >= 'A' && ch <= 'Z' ? 10 : ch >= 'a' && ch <= 'z' ? 8 : ch === ' ' ? 4 : ch === 'W' || ch === 'M' ? 12 : 7
            return sum + w
          }, 0)
          const tp = px(v.title)
          const dp = px(v.desc)
          return [
            { label: 'Title width', value: tp + 'px', tone: tp <= 600 ? 'ok' : 'warn', hint: 'Keep titles under ~600px (about 55-60 chars).' },
            { label: 'Description width', value: dp + 'px', tone: dp <= 920 ? 'ok' : 'warn', hint: 'Keep descriptions under ~920px (about 150-160 chars).' },
            { label: 'Title chars', value: (v.title || '').length + ' chars', hint: 'Mobile truncates earlier than desktop.' },
            { label: 'Description chars', value: (v.desc || '').length + ' chars' },
          ]
        },
      },
    ],
  },
  {
    id: 'heading-structure-analyzer',
    name: 'H1-H6 Heading Structure Analyzer',
    description: 'Paste headings to spot hierarchy jumps and missing levels.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'analyze',
        label: 'Analyze outline',
        fields: [
          { key: 'headings', label: 'Headings (one per line, e.g. H2: Title)', kind: 'textarea', placeholder: 'H1: Main title\nH2: Section\nH3: Sub-section' },
        ],
        compute: (v) => {
          const lines = (v.headings || '').split('\n').map((l) => l.trim()).filter(Boolean)
          const levels = lines.map((l) => {
            const m = l.match(/^H([1-6])\s*[:.\-)]?\s*(.*)$/i)
            return m ? { level: Number(m[1]), text: m[2] || l } : { level: 0, text: l }
          })
          const h1 = levels.filter((x) => x.level === 1).length
          const issue = levels.some((x) => x.level === 0)
          const jumps: string[] = []
          let prev = 0
          for (const x of levels) {
            if (x.level === 0) continue
            if (prev && x.level - prev > 1) jumps.push(`H${prev} → H${x.level}`)
            prev = x.level
          }
          const problems = []
          if (h1 > 1) problems.push('More than one H1 on the page.')
          if (jumps.length) problems.push('Hierarchy jumps: ' + jumps.slice(0, 4).join(', '))
          if (issue) problems.push('Some lines are not labelled H1-H6.')
          if (prev > 0 && !levels.some((x) => x.level === 1)) problems.push('No H1 found.')
          if (!problems.length) problems.push('Heading structure looks clean.')
          return [
            { label: 'H1 count', value: h1.toString(), tone: h1 === 1 ? 'ok' : 'warn' },
            { label: 'Total headings', value: levels.filter((x) => x.level > 0).length.toString() },
            { label: 'Findings', value: problems.join(' '), tone: levels.some((x) => x.level === 0) || jumps.length || h1 !== 1 ? 'warn' : 'ok' },
          ]
        },
      },
    ],
  },
  {
    id: 'knowledge-graph-entity-finder',
    name: 'Google Knowledge Graph Entity Finder',
    description: 'Outline entity properties to improve your Knowledge Graph presence.',
    subcategoryId: 'seo',
    tabs: [
      {
        id: 'entity',
        label: 'Entity profile',
        fields: [
          { key: 'name', label: 'Entity name (brand/person)', kind: 'text', placeholder: 'Acme Inc.' },
          { key: 'type', label: 'Entity type', kind: 'select', options: [
            { value: 'Organization', label: 'Organization' },
            { value: 'Person', label: 'Person' },
            { value: 'LocalBusiness', label: 'Local business' },
            { value: 'Product', label: 'Product' },
          ] },
          { key: 'website', label: 'Website', kind: 'text', placeholder: 'https://example.com' },
          { key: 'sameAs', label: 'Social profiles (one per line)', kind: 'textarea', placeholder: 'https://linkedin.com/company/x\nhttps://twitter.com/x' },
        ],
        compute: (v) => {
          const profiles = (v.sameAs || '').split('\n').map((l) => l.trim()).filter(Boolean)
          const json = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': v.type || 'Organization',
            name: v.name || '',
            url: v.website || '',
            sameAs: profiles,
          }, null, 2)
          return [
            { label: 'Entity JSON-LD', value: json, tone: 'ok', hint: 'Use consistent name and URLs everywhere on and off site.' },
            { label: 'Verification signals', value: `${profiles.length} social link(s)`, hint: 'Google cross-references Wikipedia, Wikidata and socials.' },
            { label: 'Next step', value: profiles.length < 3 ? 'Add LinkedIn, Twitter/X and a directory listing.' : 'Create a Wikipedia/Wikidata entry if eligible.', hint: 'Reviews, mentions and brand consistency strengthen the entity.' },
          ]
        },
      },
    ],
  },

  // ============ 2. Content Marketing ============
  {
    id: 'aida-copywriting-generator',
    name: 'AIDA Copywriting Framework Generator',
    description: 'Build an Attention-Interest-Desire-Action funnel for any offer.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'generate',
        label: 'Generate AIDA',
        fields: [
          { key: 'offer', label: 'What are you selling?', kind: 'text', placeholder: 'A budgeting app for freelancers' },
          { key: 'audience', label: 'Target audience', kind: 'text', placeholder: 'Freelancers who never know what they earned' },
          { key: 'hook', label: 'Opening hook', kind: 'textarea', placeholder: 'Question, bold claim or pain point...' },
          { key: 'benefit', label: 'Key benefit', kind: 'text', placeholder: 'See real take-home pay in one tap' },
        ],
        compute: (v) => {
          const offer = v.offer || 'your product'
          const aud = v.audience || 'your customers'
          const hook = v.hook || `Ever felt lost when $10 tax, $8 fees and 4 subscriptions quietly drain ${aud}?`
          const benefit = v.benefit || 'get clear, accurate numbers instantly'
          return [
            { label: 'Attention', value: hook, tone: 'ok', hint: 'Lead with the pain or a bold claim.' },
            { label: 'Interest', value: `${offer} exists because ${aud} deserve better than guesswork. We built it around the one job that matters most to you.`, hint: 'Connect your product to their situation.' },
            { label: 'Desire', value: `Imagine ${benefit}. No spreadsheets, no surprises - just ${offer} doing the heavy lifting so you can focus on the work you love.`, hint: 'Pivot to the emotional payoff.' },
            { label: 'Action', value: `Try ${offer} free today - no card required. Start now and see your numbers in the next 60 seconds.`, hint: 'One clear CTA with low friction.' },
          ]
        },
      },
    ],
  },
  {
    id: 'pas-framework-writer',
    name: 'PAS (Problem-Agitate-Solution) Framework Writer',
    description: 'Write problem-agitate-solution copy for landing pages and emails.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'write',
        label: 'Write PAS',
        fields: [
          { key: 'audience', label: 'Audience', kind: 'text', placeholder: 'New moms' },
          { key: 'problem', label: 'Core problem', kind: 'text', placeholder: 'No time to cook healthy meals' },
          { key: 'agitate', label: 'Agitation angle', kind: 'textarea', placeholder: 'So you order takeout again, feel guilty, and spiral...' },
          { key: 'solution', label: 'Your solution', kind: 'text', placeholder: '15-minute meal kits' },
        ],
        compute: (v) => [
          { label: 'Problem', value: v.audience ? `You are ${v.audience.toLowerCase()}. You have a problem: ${v.problem}.` : `Every ${v.audience || 'customer'} hits a wall: ${v.problem}.`, tone: 'ok' },
          { label: 'Agitation', value: v.agitate || `And it is not just annoying - ${v.problem} quietly costs you time, money and peace of mind, day after day.`, hint: 'Make the pain vivid; keep it honest.' },
          { label: 'Solution', value: v.solution ? `${v.solution} fixes exactly that - letting you ${v.problem ? 'skip the friction entirely' : 'get back to what matters'}.` : 'Lead with the fix.', tone: 'ok', hint: 'Introduce the solution as the inevitable answer.' },
        ],
      },
    ],
  },
  {
    id: 'email-subject-line-tester',
    name: 'Email Subject Line Tester & Spam Trigger Checker',
    description: 'Score subject lines for length, curiosity and spam-filter triggers.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'tester',
        label: 'Test subject line',
        fields: [
          { key: 'subject', label: 'Subject line', kind: 'text', placeholder: 'Your subject line here' },
          { key: 'preview', label: 'Preview text', kind: 'text', placeholder: 'Optional preview text' },
        ],
        compute: (v) => {
          const subj = (v.subject || '').trim()
          const spam = ['free', 'winner', 'guarantee', 'urgent', 'act now', 'no cost', 'click here', '100%', 'buy now', 'cheap', 'limited time', 'cash', 'earn money']
          const hits = spam.filter((w) => subj.toLowerCase().includes(w))
          const len = subj.length
          const lenScore = len >= 20 && len <= 50 ? 'Good length for open rates.' : len < 20 ? 'Short - consider adding a specific hook.' : 'Long - mobile clients will truncate around 40-50 chars.'
          const curiosity = /[?]/.test(subj) ? 'Question mark can lift opens.' : 'No question mark - try one.'
          const score = Math.max(0, 10 - Math.floor(len / 10) - hits.length * 2)
          return [
            { label: 'Length', value: len + ' chars', tone: len <= 50 ? 'ok' : 'warn', hint: lenScore },
            { label: 'Spam triggers', value: hits.length ? hits.join(', ') : 'None detected', tone: hits.length ? 'warn' : 'ok', hint: 'Avoid ALL-CAPS, "guarantee", "free" in quantity, and overusing exclamation marks.' },
            { label: 'Curiosity', value: curiosity, hint: 'Combine a hook with a clear benefit.' },
            { label: 'Subject score', value: `${Math.max(1, score)}/10`, tone: score >= 7 ? 'ok' : 'warn', hint: 'Final preview: ' + (v.preview || '') },
          ]
        },
      },
    ],
  },
  {
    id: 'content-decay-analyzer',
    name: 'Content Decay & Refresh Frequency Analyzer',
    description: 'Estimate when a page is decaying and how often to refresh it.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'decay',
        label: 'Analyze decay',
        fields: [
          { key: 'months', label: 'Age (months)', kind: 'number', suffix: 'mo', min: '0' },
          { key: 'peak', label: 'Peak monthly traffic', kind: 'number', suffix: 'visits', min: '0' },
          { key: 'current', label: 'Current monthly traffic', kind: 'number', suffix: 'visits', min: '0' },
          { key: 'updates', label: 'Times updated', kind: 'number', suffix: 'times', min: '0' },
        ],
        compute: (v) => {
          const months = num(v, 'months')
          const peak = num(v, 'peak')
          const cur = num(v, 'current')
          const upd = num(v, 'updates')
          if (!req(months, peak, cur, upd)) return []
          const decay = peak > 0 ? (1 - cur / peak) * 100 : 0
          let advice: string
          let tone: 'ok' | 'warn' = 'ok'
          if (decay > 40) { advice = 'High decay - refresh stats, examples and update the publish date.'; tone = 'warn' }
          else if (decay > 20) { advice = 'Moderate decay - refresh within 90 days.'; tone = 'warn' }
          else advice = 'Healthy page - keep the refresh cycle going.'
          const freq = decay > 40 ? 3 : decay > 20 ? 6 : 12
          return [
            { label: 'Traffic decay', value: pct(decay), tone, hint: 'Compare like-for-like months.' },
            { label: 'Updates density', value: `${upd}/${months} updates per month`, hint: upd > 0 ? `${(months / upd).toFixed(1)} months between refreshes on average.` : 'No updates recorded yet.' },
            { label: 'Next refresh', value: freq + ' months', hint: advice },
          ]
        },
      },
    ],
  },
  {
    id: 'topic-cluster-planner',
    name: 'Content Topic Cluster & Pillar Page Planner',
    description: 'Sketch a pillar page and its supporting cluster topics.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'cluster',
        label: 'Plan cluster',
        fields: [
          { key: 'topic', label: 'Pillar topic', kind: 'text', placeholder: 'Email marketing' },
          { key: 'parts', label: 'Cluster keywords (one per line)', kind: 'textarea', placeholder: 'Email marketing for beginners\nBest email marketing tools\nEmail open rate tips\nTransactional email vs newsletter' },
        ],
        compute: (v) => {
          const parts = (v.parts || '').split('\n').map((l) => l.trim()).filter(Boolean)
          const pillar = v.topic || 'Your pillar topic'
          return [
            { label: 'Pillar page', value: `${pillar}: the complete guide`, tone: 'ok', hint: 'Long-form, broadly authoritative, hub of the cluster.' },
            { label: 'Cluster pages', value: parts.length ? parts.slice(0, 6).join(' | ') : 'Add 4-8 supporting keywords', tone: parts.length ? 'ok' : 'warn', hint: 'Each cluster page links back to the pillar.' },
            { label: 'Internal links', value: parts.length ? `${parts.length * 2} suggested links` : '—', hint: 'Link every cluster page to the pillar and 1-2 peers.' },
          ]
        },
      },
    ],
  },
  {
    id: 'persona-alignment-checker',
    name: 'Target Persona Content Alignment Checker',
    description: 'Score whether your draft matches the target persona.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'check',
        label: 'Check alignment',
        fields: [
          { key: 'persona', label: 'Persona', kind: 'text', placeholder: 'Agency owner, 35-50' },
          { key: 'stage', label: 'Funnel stage', kind: 'select', options: [
            { value: 'awareness', label: 'Awareness' },
            { value: 'consideration', label: 'Consideration' },
            { value: 'decision', label: 'Decision' },
          ] },
          { key: 'pain', label: 'Persona pain point', kind: 'text', placeholder: 'Losing clients to cheaper agencies' },
          { key: 'draft', label: 'Draft content focus', kind: 'textarea', placeholder: 'Describe what your content covers...' },
        ],
        compute: (v) => {
          const painWords = (v.pain || '').toLowerCase().split(/\W+/).filter((w) => w.length > 3)
          const draft = (v.draft || '').toLowerCase()
          const overlap = painWords.filter((w) => draft.includes(w)).length
          const score = painWords.length ? Math.round((overlap / painWords.length) * 100) : 0
          let verdict = score >= 60 ? 'Strongly aligned.' : score >= 30 ? 'Partially aligned - sharpen the pain language.' : 'Weakly aligned - rewrite around the persona pain.'
          if (v.stage === 'awareness' && score > 60) verdict = 'Great for awareness; save pricing talk for decision-stage content.'
          if (v.stage === 'decision' && score < 60) verdict = 'Decision-stage content must resolve objections directly.'
          return [
            { label: 'Pain-keyword overlap', value: `${overlap}/${painWords.length} terms`, tone: score >= 60 ? 'ok' : 'warn' },
            { label: 'Alignment score', value: score + '%', tone: score >= 60 ? 'ok' : 'warn' },
            { label: 'Verdict', value: verdict, hint: `Persona: ${v.persona || '—'} · Stage: ${v.stage || '—'}` },
          ]
        },
      },
    ],
  },
  {
    id: 'tone-of-voice-adjuster',
    name: 'Tone of Voice Adjuster (Professional, Casual, Urgent)',
    description: 'Rewrap a draft into professional, casual or urgent tone variants.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'adjust',
        label: 'Adjust tone',
        fields: [
          { key: 'text', label: 'Draft text', kind: 'textarea', placeholder: 'We wanted to let you know the new pricing starts next month...' },
          {
            key: 'tone', label: 'Target tone', kind: 'select',
            options: [
              { value: 'professional', label: 'Professional' },
              { value: 'casual', label: 'Casual' },
              { value: 'urgent', label: 'Urgent' },
            ],
          },
        ],
        compute: (v) => {
          const t = (v.text || '').trim()
          if (!t) return []
          let out = ''
          if (v.tone === 'professional') {
            out = t.charAt(0).toLowerCase() + t.slice(1)
            out = out.replace(/\b(get)\b/g, 'receive').replace(/\b(let\syou\sknow)\b/g, 'inform you').replace(/\b(a lot)\b/g, 'significantly')
            out = `We would like to ${out.slice(0, 1).toLowerCase() + out.slice(1)}`.replace(/We would like to we\b/, '')
            out = out.length ? out : 'Please note the upcoming change to our pricing, effective next month.'
          } else if (v.tone === 'casual') {
            out = t.replace(/\b(would like to|inform you)\b/g, 'want you to know').replace(/\breceive\b/g, 'get')
            out = 'Hey! Quick heads-up: ' + out.charAt(0).toLowerCase() + out.slice(1)
          } else {
            out = 'Action needed now: ' + t.replace(/\.$/, '. Don\u2019t wait - slots are limited.')
          }
          return [
            { label: 'Rewritten', value: out, tone: 'ok', hint: 'Review for factual accuracy before sending.' },
            { label: 'Original', value: t, hint: 'Keep the core message intact.' },
          ]
        },
      },
    ],
  },
  {
    id: 'sentence-density-analyzer',
    name: 'Sentence Length & Density Analyzer for Ads',
    description: 'Analyze readability for fast-scrolling ad copy.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'analyze',
        label: 'Analyze copy',
        fields: [
          { key: 'text', label: 'Ad copy', kind: 'textarea', placeholder: 'Paste your ad text here...' },
        ],
        compute: (v) => {
          const t = (v.text || '')
          const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean)
          const words = t.split(/\s+/).filter(Boolean)
          const longSentences = sentences.filter((s) => s.split(/\s+/).length > 15).length
          const avg = sentences.length ? words.length / sentences.length : 0
          const grade = avg <= 12 ? 'Excellent for ads.' : avg <= 18 ? 'Good - trim a few long sentences.' : 'Too dense - split long sentences for mobile.'
          return [
            { label: 'Sentences', value: sentences.length.toString() },
            { label: 'Avg sentence length', value: avg.toFixed(1) + ' words', tone: avg <= 18 ? 'ok' : 'warn' },
            { label: 'Long sentences (>15 words)', value: Math.round((longSentences / Math.max(1, sentences.length)) * 100) + '%', tone: longSentences > sentences.length / 2 ? 'warn' : 'ok' },
            { label: 'Readability', value: grade, tone: avg <= 18 ? 'ok' : 'warn', hint: 'Scrolling thumbs prefer short, punchy lines.' },
          ]
        },
      },
    ],
  },
  {
    id: 'cta-generator',
    name: 'Call-To-Action (CTA) Generator & Tester',
    description: 'Generate CTA variants for different stages and test guidance.',
    subcategoryId: 'content',
    tabs: [
      {
        id: 'generate',
        label: 'Generate CTAs',
        fields: [
          { key: 'offer', label: 'Offer', kind: 'text', placeholder: 'Free 14-day trial' },
          { key: 'audience', label: 'Audience', kind: 'text', placeholder: 'Small business owners' },
          {
            key: 'stage', label: 'Stage', kind: 'select',
            options: [
              { value: 'top', label: 'Top of funnel (subscribe)' },
              { value: 'mid', label: 'Middle (download/demo)' },
              { value: 'bottom', label: 'Bottom (buy/start)' },
            ],
          },
        ],
        compute: (v) => {
          const offer = v.offer || 'this offer'
          const aud = v.audience || 'you'
          const ctas =
            v.stage === 'top'
              ? [`Get the ${offer} newsletter`, `Subscribe - the best of ${aud} each week`, `Join ${aud.toLowerCase()} making smarter calls`]
              : v.stage === 'mid'
                ? [`See how ${offer} works`, `Get your free ${offer} demo`, `Download the guide - free for ${aud.toLowerCase()}`]
                : [`Start ${offer} today`, `Claim your ${offer} now`, `Get started - ${offer}`]
          return [
            { label: 'Variant 1', value: ctas[0], tone: 'ok' },
            { label: 'Variant 2', value: ctas[1] },
            { label: 'Variant 3', value: ctas[2] },
            { label: 'Test tip', value: 'A/B test verbs: Start vs Try vs Claim vs Get. Use one CTA per page.', hint: `Audience: ${aud} · Stage: ${v.stage}` },
          ]
        },
      },
    ],
  },

  // ============ 3. SMM ============
  {
    id: 'optimal-posting-time-estimator',
    name: 'Optimal Posting Time Estimator by Timezone',
    description: 'Estimate the best windows to post per platform and audience timezone.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'time',
        label: 'Best times',
        fields: [
          {
            key: 'platform', label: 'Platform', kind: 'select',
            options: [
              { value: 'instagram', label: 'Instagram' },
              { value: 'facebook', label: 'Facebook' },
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'tiktok', label: 'TikTok' },
            ],
          },
          { key: 'offset', label: 'Audience UTC offset', kind: 'number', suffix: 'h', min: '-12', placeholder: '-5' },
          { key: 'audience', label: 'Audience size', kind: 'number', suffix: 'followers', min: '1', placeholder: '5000' },
        ],
        compute: (v) => {
          const off = num(v, 'offset')
          const aud = num(v, 'audience')
          if (!req(off, aud)) return []
          const local = (h: number) => ((h + off + 24) % 24 + 24) % 24
          const fmt = (h: number) => `${String(Math.floor(local(h)) % 12 || 12).padStart(2, '0')}:00 ${local(h) < 12 ? 'AM' : 'PM'}`
          const base = { instagram: [9, 18], facebook: [9, 15], linkedin: [8, 17], tiktok: [7, 19] }[v.platform || 'instagram'] || [9, 18]
          const slots = [base[0], base[0] + 3, base[1]]
          return [
            { label: 'Prime window 1', value: fmt(slots[0]), tone: 'ok', hint: 'Morning commute / first coffee scroll.' },
            { label: 'Prime window 2', value: fmt(slots[1]), hint: 'Midday break.' },
            { label: 'Prime window 3', value: fmt(slots[2]), hint: 'Evening wind-down.' },
            { label: 'Best daily', value: v.platform + ' at ' + fmt(slots[0]), hint: `For ~${aud.toLocaleString()} followers, test 2-3 times weekly.` },
          ]
        },
      },
    ],
  },
  {
    id: 'profile-grid-previewer',
    name: 'Social Media Profile Grid & Feed Visual Previewer',
    description: 'Plan an Instagram-style profile grid layout from a color palette.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'preview',
        label: 'Grid preview',
        fields: [
          { key: 'theme', label: 'Grid theme', kind: 'select', options: [
            { value: 'checker', label: 'Checkerboard' },
            { value: 'rows', label: 'Row blocks' },
            { value: 'rainbow', label: 'Rainbow flow' },
          ] },
          { key: 'rows', label: 'Rows to preview', kind: 'number', suffix: 'rows', min: '1', placeholder: '3' },
          { key: 'a', label: 'Accent color A', kind: 'text', placeholder: '#6d28d9' },
          { key: 'b', label: 'Accent color B', kind: 'text', placeholder: '#f59e0b' },
        ],
        compute: (v) => {
          const rows = Math.max(1, Math.round(num(v, 'rows')) || 3)
          const a = v.a || '#6d28d9'
          const b = v.b || '#f59e0b'
          const theme = v.theme || 'checker'
          const plan = Array.from({ length: rows * 3 }, (_, i) => {
            if (theme === 'checker') return (Math.floor(i / 3) + (i % 3)) % 2 === 0 ? a : b
            if (theme === 'rows') return Math.floor(i / 3) % 2 === 0 ? a : b
            const t = (i % 6) / 6
            return `hsl(${Math.round(240 * t)} 70% 55%)`
          }).join(' ')
          return [
            { label: 'Grid tiles (hex)', value: plan, tone: 'ok', hint: `${rows}×3 grid. Alternate colors vertically for rhythm.` },
            { label: 'Tip', value: theme === 'checker' ? 'Checkerboard reads as organized - keep post 1 & 2-3 alternating.' : theme === 'rows' ? 'Row blocks group series of 3 - great for guides.' : 'Rainbow flow suits lifestyle/cosmetics feeds.', hint: 'Preview on mobile before publishing.' },
          ]
        },
      },
    ],
  },
  {
    id: 'emoji-sentiment-analyzer',
    name: 'Emoji Density & Sentiment Analyzer for Captions',
    description: 'Check emoji density and approximate caption sentiment.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'analyze',
        label: 'Analyze caption',
        fields: [
          { key: 'caption', label: 'Caption', kind: 'textarea', placeholder: 'Paste your caption with emojis 🚀' },
        ],
        compute: (v) => {
          const t = (v.caption || '')
          const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\u{FE0F}?/gu
          const emojis = t.match(emojiRe) || []
          const chars = Array.from(t).length
          const density = chars ? (emojis.length / chars) * 100 : 0
          const positives = new Set(['😀', '😁', '😂', '🤣', '😊', '😍', '😎', '🥳', '🔥', '🚀', '❤️', '💖', '✨', '👏', '🤝'])
          const negatives = new Set(['😞', '😢', '😡', '🤬', '💔', '☹️'])
          const pos = emojis.filter((e) => positives.has(e)).length
          const neg = emojis.filter((e) => negatives.has(e)).length
          const sentiment = pos > neg ? 'Positive' : neg > pos ? 'Negative' : 'Neutral'
          return [
            { label: 'Emoji count', value: emojis.length.toString() },
            { label: 'Emoji density', value: density.toFixed(1) + '%', tone: density <= 3 ? 'ok' : 'warn', hint: 'Under ~3% keeps captions readable on mobile.' },
            { label: 'Sentiment', value: sentiment, tone: pos >= neg ? 'ok' : 'warn' },
            { label: 'Readability', value: emojis.length > 6 ? 'Emoji-heavy - trim to 2-3.' : 'Emoji use looks balanced.', tone: emojis.length > 6 ? 'warn' : 'ok' },
          ]
        },
      },
    ],
  },
  {
    id: 'social-character-counter',
    name: 'Social Media Character & Limits Counter',
    description: 'Check drafts against X, LinkedIn and Instagram character limits.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'count',
        label: 'Check limits',
        fields: [
          { key: 'text', label: 'Draft', kind: 'textarea', placeholder: 'Paste your post here...' },
        ],
        compute: (v) => {
          const t = (v.text || '')
          const n = t.length
          const limits: MktResult[] = [
            ['X (Twitter)', 280],
            ['LinkedIn post', 3000],
            ['Instagram caption', 2200],
            ['Instagram bio', 150],
          ].map(([name, max]) => {
            const ml = max as number
            const used = Math.round((n / ml) * 100)
            return { label: name as string, value: `${n}/${ml}`, tone: n <= ml ? ('ok' as const) : ('warn' as const), hint: `${used}% used` }
          })
          return limits
        },
      },
    ],
  },
  {
    id: 'shorts-hook-generator',
    name: 'TikTok & Shorts Video Script Hook Generator',
    description: 'Generate opening hooks for short-form video scripts.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'hooks',
        label: 'Generate hooks',
        fields: [
          { key: 'topic', label: 'Video topic', kind: 'text', placeholder: '3 ways to reuse old content' },
          { key: 'audience', label: 'Audience', kind: 'text', placeholder: 'Solo founders' },
          {
            key: 'length', label: 'Video length', kind: 'select',
            options: [
              { value: '15', label: '~15 seconds' },
              { value: '30', label: '~30 seconds' },
              { value: '60', label: '~60 seconds' },
            ],
          },
        ],
        compute: (v) => {
          const topic = v.topic || 'your topic'
          const aud = v.audience || 'you'
          return [
            { label: 'Hook A (question)', value: `What if ${aud.toLowerCase()} could ${topic} in under a minute?`, tone: 'ok', hint: 'Open on a question in the first 1.5s.' },
            { label: 'Hook B (contrarian)', value: `Everyone gets ${topic} wrong. Here is the fix most ${aud.toLowerCase()} miss.`, hint: 'Pause after the bold claim.' },
            { label: 'Hook C (value)', value: `${topic}: 3 things I wish I knew sooner.`, hint: 'Numbered lists preview value.' },
            { label: 'Structure', value: `Hook (${v.length}s) → Proof/demo → CTA. Hook first, title second - both matter for retention.`, hint: 'Keep pacing tight; 65-70% watch time is the target.' },
          ]
        },
      },
    ],
  },
  {
    id: 'giveaway-winner-picker',
    name: 'Contest & Giveaway Winner Picker Tool',
    description: 'Randomly pick giveaway winners from a participant list.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'pick',
        label: 'Pick winners',
        fields: [
          { key: 'entries', label: 'Participants (one per line)', kind: 'textarea', placeholder: 'user1\nuser2\nuser3' },
          { key: 'winners', label: 'Number of winners', kind: 'number', suffix: 'winners', min: '1', placeholder: '1' },
          { key: 'seed', label: 'Seed (optional for re-runs)', kind: 'text', placeholder: 'contest-2026' },
        ],
        compute: (v) => {
          const list = (v.entries || '').split('\n').map((l) => l.trim()).filter(Boolean)
          const w = Math.max(1, Math.round(num(v, 'winners')) || 1)
          const seed = (v.seed || (v.entries || '').length).toString()
          let h = 0
          for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
          const arr = [...list]
          const picked: string[] = []
          while (picked.length < Math.min(w, arr.length)) {
            h = (h * 1103515245 + 12345) >>> 0
            const idx = h % arr.length
            picked.push(arr.splice(idx, 1)[0])
          }
          return [
            { label: 'Winners', value: picked.length ? picked.join(', ') : 'No entries', tone: picked.length ? 'ok' : 'warn', hint: `${w} winner(s) from ${list.length} entries.` },
            { label: 'Randomness', value: 'Deterministic per seed - re-run with the same seed for the same result.', hint: 'Rerun with a fresh seed to re-draw.' },
          ]
        },
      },
    ],
  },
  {
    id: 'content-calendar-planner',
    name: 'Content Calendar Schedule Planner',
    description: 'Plan a weekly content calendar across channels.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'calendar',
        label: 'Plan week',
        fields: [
          {
            key: 'channel', label: 'Primary channel', kind: 'select',
            options: [
              { value: 'instagram', label: 'Instagram' },
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'facebook', label: 'Facebook' },
              { value: 'tiktok', label: 'TikTok' },
            ],
          },
          { key: 'posts', label: 'Posts per week', kind: 'number', suffix: 'posts', min: '1', placeholder: '5' },
          { key: 'ideas', label: 'Content ideas (one per line)', kind: 'textarea', placeholder: 'Behind the scenes\nClient case study\nQuick tip reel' },
        ],
        compute: (v) => {
          const posts = Math.max(1, Math.round(num(v, 'posts')) || 5)
          const ideas = (v.ideas || '').split('\n').map((l) => l.trim()).filter(Boolean)
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          const plan = Array.from({ length: Math.min(posts, 7) }, (_, i) => `${days[i % 7]} ${((i + ((v.channel === 'instagram' ? 1 : 0))) % ideas.length) >= 0 ? ideas[i % Math.max(1, ideas.length)] ?? 'TBD' : 'TBD'}`).join(' | ')
          return [
            { label: 'Weekly plan', value: plan, tone: 'ok', hint: `${posts} posts · ${v.channel}` },
            { label: 'Mix tip', value: '40% value, 30% engagement, 20% product, 10% community.', hint: 'Batch-create on Sunday; schedule all posts.' },
          ]
        },
      },
    ],
  },
  {
    id: 'bio-link-builder',
    name: 'Bio Link-in-Bio Landing Page Builder',
    description: 'Generate a simple link-in-bio HTML page for your socials.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'build',
        label: 'Build bio page',
        fields: [
          { key: 'name', label: 'Your name/brand', kind: 'text', placeholder: 'Acme Studio' },
          { key: 'handle', label: 'Handle', kind: 'text', placeholder: '@acme' },
          { key: 'links', label: 'Links (one per line: Label - URL)', kind: 'textarea', placeholder: 'Portfolio - https://acme.site\nNewsletter - https://acme.site/news\nBook a call' },
        ],
        compute: (v) => {
          const rows = (v.links || '').split('\n').map((l) => l.trim()).filter(Boolean)
          const items = rows.map((r) => {
            const [label, ...rest] = r.split(/\s+-\s+/)
            return rest.length ? { label, url: rest.join('-') } : { label, url: null }
          })
          const html = `<html lang="en">\n<head><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${v.name || 'Bio'}</title></head>\n<body style="font-family:system-ui;max-width:480px;margin:auto;padding:32px 16px;text-align:center">\n  <h1>${v.name || ''} ${v.handle || ''}</h1>\n${items.map((it) => `  <a href="${it.url ?? '#'}" style="display:block;margin:8px 0;padding:12px;border:1px solid #ddd;border-radius:12px;text-decoration:none;color:#111">${it.label}</a>`).join('\n')}\n</body>\n</html>`
          return [
            { label: 'Link-in-bio HTML', value: html, tone: items.length ? 'ok' : 'warn', hint: 'Paste into any static-site host or link-in-bio tool.' },
            { label: 'Tiles generated', value: items.length + ' tile(s)', hint: 'Keep 3-7 links for a clean grid.' },
          ]
        },
      },
    ],
  },
  {
    id: 'carousel-content-generator',
    name: 'Carousel Slide Deck Layout Content Generator',
    description: 'Outline a slide-by-slide carousel post.',
    subcategoryId: 'smm',
    tabs: [
      {
        id: 'outline',
        label: 'Outline deck',
        fields: [
          { key: 'topic', label: 'Topic', kind: 'text', placeholder: 'How we grew email list 5x' },
          { key: 'slides', label: 'Number of slides', kind: 'number', suffix: 'slides', min: '3', placeholder: '8' },
          { key: 'audience', label: 'Audience', kind: 'text', placeholder: 'Marketing managers' },
        ],
        compute: (v) => {
          const n = Math.min(15, Math.max(3, Math.round(num(v, 'slides')) || 8))
          const topic = v.topic || 'your topic'
          const slides: string[] = []
          for (let i = 1; i <= n; i++) {
            const label = i === 1 ? `Hook: ${topic}` : i === n ? `CTA: Save/share and follow for more` : `Slide ${i}: One key point with a supporting stat, mini-example or tip (${topic})`
            slides.push(`${i}. ${label}`)
          }
          return [
            { label: 'Slide deck', value: slides.join('\n'), tone: 'ok', hint: 'Aim for 1 idea per slide, max 12 words each.' },
            { label: 'Format', value: 'Consistent template titles (Slide 1-2, 3-4, ...) + save-worthy value = more shares.', hint: 'End with a follow CTA, not a hard pitch.' },
          ]
        },
      },
    ],
  },

  // ============ 4. Paid Ads ============
  {
    id: 'cac-calculator',
    name: 'Customer Acquisition Cost (CAC) Calculator',
    description: 'Compute CAC from total acquisition spend and new customers.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'calc',
        label: 'Calculate CAC',
        fields: [
          { key: 'marketing', label: 'Marketing spend', kind: 'number', suffix: '$', min: '0' },
          { key: 'sales', label: 'Sales spend', kind: 'number', suffix: '$', min: '0' },
          { key: 'customers', label: 'New customers', kind: 'number', min: '1' },
        ],
        compute: (v) => {
          const m = num(v, 'marketing')
          const s = num(v, 'sales')
          const c = num(v, 'customers')
          if (!req(m, s, c) || c === 0) return []
          const cac = (m + s) / c
          return [
            { label: 'Total acquisition spend', value: money(m + s), tone: 'ok' },
            { label: 'CAC', value: money(cac), tone: 'ok', hint: `Per new customer over the period.` },
            { label: 'CAC by channel', value: 'Compare per-channel to find your cheapest', hint: 'Run this per channel, not blended.' },
          ]
        },
      },
    ],
  },
  {
    id: 'ltv-calculator',
    name: 'Customer Lifetime Value (LTV) Calculator',
    description: 'Estimate lifetime value from order value, frequency, margin and retention.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'calc',
        label: 'Calculate LTV',
        fields: [
          { key: 'aov', label: 'Average order value', kind: 'number', suffix: '$', min: '0' },
          { key: 'freq', label: 'Orders per year', kind: 'number', suffix: '/yr', min: '0' },
          { key: 'margin', label: 'Gross margin', kind: 'number', suffix: '%', min: '0' },
          { key: 'years', label: 'Avg customer lifespan', kind: 'number', suffix: 'years', min: '0' },
        ],
        compute: (v) => {
          const aov = num(v, 'aov')
          const f = num(v, 'freq')
          const m = num(v, 'margin')
          const y = num(v, 'years')
          if (!req(aov, f, m, y)) return []
          const profit = (aov * f * (m / 100)) * y
          return [
            { label: 'Revenue LTV', value: money(aov * f * y), tone: 'ok' },
            { label: 'Profit LTV', value: money(profit), tone: 'ok', hint: `At ${m}% gross margin over ${y} years.` },
          ]
        },
      },
    ],
  },
  {
    id: 'ltv-cac-ratio',
    name: 'LTV to CAC Ratio Scalability Evaluator',
    description: 'Evaluate LTV:CAC ratio and growth health.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'eval',
        label: 'Evaluate ratio',
        fields: [
          { key: 'ltv', label: 'Lifetime value', kind: 'number', suffix: '$', min: '0' },
          { key: 'cac', label: 'CAC', kind: 'number', suffix: '$', min: '1' },
        ],
        compute: (v) => {
          const ltv = num(v, 'ltv')
          const cac = num(v, 'cac')
          if (!req(ltv, cac) || cac === 0) return []
          const ratio = ltv / cac
          let verdict = 'Healthy and scaleable.'
          let tone: 'ok' | 'warn' = 'ok'
          if (ratio < 1) { verdict = 'Losing money on every customer - fix retention or lower CAC.'; tone = 'warn' }
          else if (ratio < 3) { verdict = 'Workable, but below the 3x benchmark - optimize.'; tone = 'warn' }
          else if (ratio > 10) { verdict = 'Very high - consider investing more to accelerate growth.' }
          return [
            { label: 'LTV:CAC', value: ratio.toFixed(2) + 'x', tone, hint: 'Benchmark: ≥3x healthy, ≥5x great.' },
            { label: 'Verdict', value: verdict, tone },
            { label: 'Scaling guidance', value: ratio >= 3 ? 'You can afford to spend more on acquisition.' : ratio < 1 ? 'Do not scale spend until economics improve.' : 'Scale gradually while improving retention.', hint: 'Revisit monthly.' },
          ]
        },
      },
    ],
  },
  {
    id: 'break-even-roas',
    name: 'Break-Even ROAS Calculator',
    description: 'Find the ROAS needed to break even on ad spend.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'calc',
        label: 'Calculate',
        fields: [
          { key: 'aov', label: 'Average order value', kind: 'number', suffix: '$', min: '0' },
          { key: 'margin', label: 'Gross profit margin', kind: 'number', suffix: '%', min: '0' },
          { key: 'extras', label: 'Other costs (% of sale)', kind: 'number', suffix: '%', min: '0', placeholder: '5' },
        ],
        compute: (v) => {
          const aov = num(v, 'aov')
          const m = num(v, 'margin')
          const e = num(v, 'extras') || 0
          if (!req(aov, m)) return []
          const profit = aov * ((m - e) / 100)
          const be = profit > 0 ? aov / profit : Infinity
          return [
            { label: 'Revenue per sale', value: money(aov) },
            { label: 'Profit per sale', value: money(profit), tone: 'ok' },
            { label: 'Break-even ROAS', value: Number.isFinite(be) ? be.toFixed(2) + 'x' : 'Undefined (no margin)', tone: profit > 0 ? 'warn' : 'warn', hint: `You need \$${Number.isFinite(be) ? be.toFixed(2) : '0'} in revenue per \$${aov > 0 ? '1' : '1'} spent to break even.` },
            { label: 'Target ROAS', value: Number.isFinite(be) ? (be * 1.3).toFixed(2) + 'x' : '—', hint: '30% buffer above break-even is a common target.' },
          ]
        },
      },
    ],
  },
  {
    id: 'ppc-budget-estimator',
    name: 'Pay-Per-Click (PPC) Bidding Budget Estimator',
    description: 'Estimate daily budget, clicks and expected conversions.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'estimate',
        label: 'Estimate budget',
        fields: [
          { key: 'cpc', label: 'Avg CPC', kind: 'number', suffix: '$', min: '0', placeholder: '1.5' },
          { key: 'ctr', label: 'Expected CTR', kind: 'number', suffix: '%', min: '0', placeholder: '2' },
          { key: 'conv', label: 'Conversion rate', kind: 'number', suffix: '%', min: '0', placeholder: '3' },
          { key: 'impressions', label: 'Daily impressions', kind: 'number', min: '0', placeholder: '10000' },
          { key: 'target', label: 'Target daily spend', kind: 'number', suffix: '$', min: '0', placeholder: '100' },
        ],
        compute: (v) => {
          const cpc = num(v, 'cpc')
          const ctr = num(v, 'ctr') / 100
          const conv = num(v, 'conv') / 100
          const impr = num(v, 'impressions')
          const budget = num(v, 'target')
          if (!req(cpc, ctr, conv, impr, budget)) return []
          const clicksCap = impr * ctr
          const spendClicks = budget > 0 ? budget / Math.max(0.01, cpc) : clicksCap
          const clicks = Math.min(clicksCap, spendClicks)
          const conversions = clicks * conv
          return [
            { label: 'Available clicks', value: Math.round(clicks) + ' clicks', tone: 'ok', hint: `CTR ${pct(ctr * 100)} × ${Math.round(impr).toLocaleString()} impressions.` },
            { label: 'Est. daily spend', value: money(Math.round(clicks) * cpc), hint: `At \$${cpc} CPC.` },
            { label: 'Est. conversions', value: conversions.toFixed(1) + '/day', tone: 'ok', hint: `At ${pct(conv * 100)} conversion rate.` },
            { label: 'Dashboard tip', value: 'Split-test headlines to lift CTR - every +0.5% CTR lowers effective CPC load.', hint: 'Recompute weekly as data comes in.' },
          ]
        },
      },
    ],
  },
  {
    id: 'ad-fatigue-calculator',
    name: 'Ad Fatigue & Frequency Capping Calculator',
    description: 'Detect frequency-driven ad fatigue and set caps.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'fatigue',
        label: 'Assess fatigue',
        fields: [
          { key: 'unique', label: 'Unique reach', kind: 'number', min: '1' },
          { key: 'impressions', label: 'Total impressions', kind: 'number', min: '0' },
          { key: 'week', label: 'Days running', kind: 'number', suffix: 'days', min: '1' },
          { key: 'ctr', label: 'Current CTR', kind: 'number', suffix: '%', min: '0', placeholder: '1.2' },
          { key: 'ctr0', label: 'Baseline CTR', kind: 'number', suffix: '%', min: '0', placeholder: '2' },
        ],
        compute: (v) => {
          const uniq = num(v, 'unique')
          const impr = num(v, 'impressions')
          const days = num(v, 'week')
          const ctr = num(v, 'ctr')
          const ctr0 = num(v, 'ctr0')
          if (!req(uniq, impr, days, ctr, ctr0) || uniq === 0) return []
          const freq = impr / uniq
          const ctrDrop = ctr0 > 0 ? (1 - ctr / ctr0) * 100 : 0
          const cap = Math.max(1, Math.round(freq / 2))
          let verdict = 'Healthy frequency.'
          let tone: 'ok' | 'warn' = 'ok'
          if (freq > 4 || ctrDrop > 30) { verdict = 'Fatigue likely - refresh creative or cap frequency.'; tone = 'warn' }
          else if (freq > 3) { verdict = 'Watch closely - frequency is rising.'; tone = 'warn' }
          return [
            { label: 'Avg frequency', value: freq.toFixed(1) + 'x', tone, hint: `Across ${days} day(s).` },
            { label: 'CTR drop vs baseline', value: ctrDrop.toFixed(1) + '%', tone: ctrDrop > 30 ? 'warn' : 'ok', hint: `Currently ${ctr.toFixed(2)}% vs ${ctr0.toFixed(2)}% baseline.` },
            { label: 'Suggested cap', value: cap + 'x', hint: 'Cap per user per week when frequency is 3-5x.' },
            { label: 'Action', value: verdict, tone },
          ]
        },
      },
    ],
  },
  {
    id: 'target-cpl-estimator',
    name: 'Target Cost Per Lead (CPL) Estimator',
    description: 'Back into the CPL you can afford given CAC and lead-to-customer rate.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'estimate',
        label: 'Estimate CPL',
        fields: [
          { key: 'cac', label: 'Target CAC', kind: 'number', suffix: '$', min: '0' },
          { key: 'conv', label: 'Lead → customer rate', kind: 'number', suffix: '%', min: '0' },
        ],
        compute: (v) => {
          const cac = num(v, 'cac')
          const conv = num(v, 'conv') / 100
          if (!req(cac, conv)) return []
          const cpl = conv > 0 ? cac * conv : 0
          return [
            { label: 'Target CPL', value: money(cpl), tone: 'ok', hint: `At ${pct(conv * 100)} lead→customer conversion.` },
            { label: 'Check', value: cpl < 1 ? 'CPL below $1 may be difficult on paid channels - review lead quality.' : 'Use this as your bid/CPL ceiling.', tone: cpl >= 1 ? 'ok' : 'warn' },
          ]
        },
      },
    ],
  },
  {
    id: 'roas-profit-matrix',
    name: 'ROAS vs Profit Margin Matrix Calculator',
    description: 'Understand whether high ROAS actually means profit.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'matrix',
        label: 'Compute matrix',
        fields: [
          { key: 'spend', label: 'Ad spend', kind: 'number', suffix: '$', min: '0' },
          { key: 'revenue', label: 'Attributed revenue', kind: 'number', suffix: '$', min: '0' },
          { key: 'margin', label: 'Gross margin', kind: 'number', suffix: '%', min: '0' },
        ],
        compute: (v) => {
          const spend = num(v, 'spend')
          const rev = num(v, 'revenue')
          const m = num(v, 'margin') / 100
          if (!req(spend, rev, m) || spend === 0) return []
          const roas = rev / spend
          const grossProfit = rev * m
          const net = grossProfit - spend
          const beRoas = m > 0 ? 1 / m : Infinity
          const profitable = net > 0
          return [
            { label: 'ROAS', value: roas.toFixed(2) + 'x', tone: 'ok', hint: 'Revenue ÷ spend.' },
            { label: 'Gross profit', value: money(grossProfit), tone: 'ok' },
            { label: 'Net profit (after ads)', value: money(net), tone: profitable ? 'ok' : 'warn', hint: profitable ? 'Profitable campaign.' : 'Losing money despite ROAS.' },
            { label: 'Key insight', value: `Break-even ROAS ≈ ${Number.isFinite(beRoas) ? beRoas.toFixed(2) : '∞'}x at ${pct(m * 100)} margin. ROAS alone is not profit.`, tone: profitable ? 'ok' : 'warn' },
          ]
        },
      },
    ],
  },
  {
    id: 'ad-copy-previewer',
    name: 'Google & Meta Ad Copy Previewer with Character Limits',
    description: 'Check ad copy against Google and Meta character limits.',
    subcategoryId: 'paid-ads',
    tabs: [
      {
        id: 'google',
        label: 'Google',
        fields: [
          { key: 'head1', label: 'Headline 1 (max 30)', kind: 'text', placeholder: 'Headline one' },
          { key: 'head2', label: 'Headline 2 (max 30)', kind: 'text', placeholder: 'Headline two' },
          { key: 'desc', label: 'Description (max 90)', kind: 'text', placeholder: 'Description text...' },
        ],
        compute: (v) => {
          const rows: MktResult[] = [
            { label: 'Headline 1', value: `${(v.head1 || '').length}/30`, tone: (v.head1 || '').length <= 30 ? 'ok' : 'warn' },
            { label: 'Headline 2', value: `${(v.head2 || '').length}/30`, tone: (v.head2 || '').length <= 30 ? 'ok' : 'warn' },
            { label: 'Description', value: `${(v.desc || '').length}/90`, tone: (v.desc || '').length <= 90 ? 'ok' : 'warn', hint: 'Add 2 descriptions minimum; Google rotates best performers.' },
            { label: 'Preview', value: `[${v.head1 || ''}] | [${v.head2 || ''}]`, hint: (v.desc || '').slice(0, 90) },
          ]
          return rows
        },
      },
      {
        id: 'meta',
        label: 'Meta',
        fields: [
          { key: 'primary', label: 'Primary text (max 125)', kind: 'text', placeholder: 'Primary text' },
          { key: 'headline', label: 'Headline (max 40)', kind: 'text', placeholder: 'Headline' },
          { key: 'desc', label: 'Description (max 30)', kind: 'text', placeholder: 'Description' },
        ],
        compute: (v) => [
          { label: 'Primary text', value: `${(v.primary || '').length}/125`, tone: (v.primary || '').length <= 125 ? 'ok' : 'warn', hint: 'Meta may expand; keep the hook in the first 2 lines.' },
          { label: 'Headline', value: `${(v.headline || '').length}/40`, tone: (v.headline || '').length <= 40 ? 'ok' : 'warn' },
          { label: 'Description', value: `${(v.desc || '').length}/30`, tone: (v.desc || '').length <= 30 ? 'ok' : 'warn' },
          { label: 'Tip', value: 'Use 10% or fewer uppercase words - Meta relabels excessive caps as engagement bait.', hint: 'Keep creative text top-loading and honest.' },
        ],
      },
    ],
  },

  // ============ 5. Analytics ============
  {
    id: 'cohort-retention-calculator',
    name: 'Cohort Retention & Churn Rate Calculator',
    description: 'Compute retention and churn for a cohort over periods.',
    subcategoryId: 'analytics',
    tabs: [
      {
        id: 'calc',
        label: 'Compute retention',
        fields: [
          { key: 'start', label: 'Cohort size (start)', kind: 'number', min: '1' },
          { key: 'remain', label: 'Remaining after period', kind: 'number', min: '0' },
          { key: 'periods', label: 'Periods elapsed', kind: 'number', suffix: 'periods', min: '1' },
        ],
        compute: (v) => {
          const s = num(v, 'start')
          const r = num(v, 'remain')
          const p = num(v, 'periods')
          if (!req(s, r, p) || s === 0) return []
          const retention = (r / s) * 100
          const churn = 100 - retention
          const monthlyChurn = p > 0 ? 100 * (1 - Math.pow(r / s, 1 / p)) : 0
          return [
            { label: 'Retention', value: pct(retention), tone: retention >= 60 ? 'ok' : 'warn', hint: `Cohort after ${p} period(s).` },
            { label: 'Total churn', value: pct(churn), tone: churn <= 40 ? 'ok' : 'warn' },
            { label: 'Avg churn / period', value: pct(monthlyChurn), tone: monthlyChurn <= 5 ? 'ok' : 'warn', hint: 'Healthy SaaS churn is often 2-5%/month.' },
          ]
        },
      },
    ],
  },
  {
    id: 'ab-split-significance',
    name: 'A/B Split Testing Statistical Significance Calculator',
    description: 'Estimate whether an A/B test result is likely significant.',
    subcategoryId: 'analytics',
    tabs: [
      {
        id: 'signif',
        label: 'Significance check',
        fields: [
          { key: 'a', label: 'Variant A conversions', kind: 'number', min: '0' },
          { key: 'an', label: 'Variant A visitors', kind: 'number', min: '1' },
          { key: 'b', label: 'Variant B conversions', kind: 'number', min: '0' },
          { key: 'bn', label: 'Variant B visitors', kind: 'number', min: '1' },
        ],
        compute: (v) => {
          const a = num(v, 'a')
          const an = num(v, 'an')
          const b = num(v, 'b')
          const bn = num(v, 'bn')
          if (!req(a, an, b, bn) || an === 0 || bn === 0) return []
          const pa = a / an
          const pb = b / bn
          const p = (a + b) / (an + bn)
          const se = Math.sqrt(p * (1 - p) * (1 / an + 1 / bn))
          const z = se > 0 ? Math.abs(pa - pb) / se : 0
          const sigPct = 100 * (1 - 0.5 * (1 + erf(z / Math.SQRT2)))
          const significant = sigPct >= 95
          const uplift = pa > 0 && pb > 0 ? ((pb - pa) / pa) * 100 : 0
          return [
            { label: 'Variant A rate', value: pct(pa * 100) },
            { label: 'Variant B rate', value: pct(pb * 100) },
            { label: 'Lift', value: (uplift >= 0 ? '+' : '') + uplift.toFixed(1) + '%', tone: uplift > 0 ? 'ok' : 'warn' },
            { label: 'Confidence', value: sigPct.toFixed(1) + '%', tone: significant ? 'ok' : 'warn', hint: significant ? '≥95% - likely significant. Call the test.' : 'Run longer before declaring a winner.' },
          ]
        },
      },
    ],
  },
  {
    id: 'bounce-vs-exit-analyzer',
    name: 'Bounce Rate vs Exit Rate Analyzer',
    description: 'Separate bounce rate from exit rate for a page.',
    subcategoryId: 'analytics',
    tabs: [
      {
        id: 'analyze',
        label: 'Analyze page',
        fields: [
          { key: 'sessions', label: 'Page sessions', kind: 'number', min: '1' },
          { key: 'bounces', label: 'Single-session visits', kind: 'number', min: '0' },
          { key: 'exits', label: 'Sessions that exited here', kind: 'number', min: '0' },
        ],
        compute: (v) => {
          const s = num(v, 'sessions')
          const b = num(v, 'bounces')
          const e = num(v, 'exits')
          if (!req(s, b, e) || s === 0) return []
          const br = (b / s) * 100
          const er = Math.min(100, (e / s) * 100)
          return [
            { label: 'Bounce rate', value: pct(br), tone: br <= 55 ? 'ok' : 'warn', hint: 'Single-page visits ÷ sessions.' },
            { label: 'Exit rate', value: pct(er), tone: er <= 45 ? 'ok' : 'warn', hint: 'Exits here ÷ sessions.' },
            { label: 'Insight', value: br > 70 ? 'High bounce - page may fail intent or load slowly.' : br > 55 ? 'Bounce above average - review CTA and load time.' : 'Healthy bounce for a content page.', tone: br > 70 ? 'warn' : 'ok' },
          ]
        },
      },
    ],
  },
  {
    id: 'utm-link-creator',
    name: 'UTM Campaign Link Creator & Presets Manager',
    description: 'Build UTM-tagged campaign links for tracking.',
    subcategoryId: 'analytics',
    tabs: [
      {
        id: 'build',
        label: 'Build UTM link',
        fields: [
          { key: 'url', label: 'Base URL', kind: 'text', placeholder: 'https://example.com/landing' },
          { key: 'source', label: 'utm_source', kind: 'text', placeholder: 'newsletter' },
          { key: 'medium', label: 'utm_medium', kind: 'text', placeholder: 'email' },
          { key: 'campaign', label: 'utm_campaign', kind: 'text', placeholder: 'launch-2026' },
          { key: 'content', label: 'utm_content (optional)', kind: 'text', placeholder: 'hero-btn' },
          { key: 'term', label: 'utm_term (optional)', kind: 'text', placeholder: '' },
        ],
        compute: (v) => {
          const base = (v.url || '').trim()
          const params = new URLSearchParams()
          if (v.source) params.set('utm_source', v.source)
          if (v.medium) params.set('utm_medium', v.medium)
          if (v.campaign) params.set('utm_campaign', v.campaign)
          if (v.content) params.set('utm_content', v.content)
          if (v.term) params.set('utm_term', v.term)
          const sep = base.includes('?') ? '&' : '?'
          const full = base ? `${base}${sep}${params.toString()}` : ''
          return [
            { label: 'Full URL', value: full || 'Enter a base URL', tone: base && (v.source && v.medium && v.campaign) ? 'ok' : 'warn', hint: 'Always include source, medium and campaign.' },
            { label: 'Shortlink?', value: 'Use your own shortener if sharing on social.', hint: 'Keep case consistent (lowercase).' },
          ]
        },
      },
    ],
  },
  {
    id: 'conversion-funnel-calculator',
    name: 'Conversion Funnel Drop-off Rate Calculator',
    description: 'Find where visitors drop out across funnel stages.',
    subcategoryId: 'analytics',
    tabs: [
      {
        id: 'dropoff',
        label: 'Compute drop-off',
        fields: [
          { key: 's1', label: 'Stage 1 visitors', kind: 'number', min: '1' },
          { key: 's2', label: 'Stage 2 visitors', kind: 'number', min: '0' },
          { key: 's3', label: 'Stage 3 visitors', kind: 'number', min: '0' },
          { key: 's4', label: 'Stage 4 visitors', kind: 'number', min: '0' },
        ],
        compute: (v) => {
          const [s1, s2, s3, s4] = [num(v, 's1'), num(v, 's2'), num(v, 's3'), num(v, 's4')]
          if (!req(s1, s2, s3, s4) || s1 === 0) return []
          const prev = [s1, s2, s3]
          const cur = [s2, s3, s4]
          const labels = ['Visit → Next', 'Next → Stage 3', 'Stage 3 → Stage 4']
          const drops = prev.map((p, i) => (p > 0 ? (1 - cur[i] / p) * 100 : 100))
          const out: MktResult[] = drops.map((drop, i) => ({
            label: `${labels[i]} drop`,
            value: pct(drop),
            tone: drop > 60 ? 'warn' : 'ok',
            hint: `${Math.round(cur[i]).toLocaleString()} of ${Math.round(prev[i]).toLocaleString()} continue.`,
          }))
          const biggestIdx = drops.indexOf(Math.max(...drops))
          out.push({
            label: 'Biggest leak',
            value: `${labels[biggestIdx]} (${pct(drops[biggestIdx])})`,
            tone: 'warn',
            hint: 'Prioritize the stage with the highest drop-off.',
          })
          return out
        },
      },
    ],
  },
  {
    id: 'organic-paid-roi-comparator',
    name: 'Organic vs Paid Traffic ROI Comparator',
    description: 'Compare channel ROI to decide where to invest.',
    subcategoryId: 'analytics',
    tabs: [
      {
        id: 'compare',
        label: 'Compare channels',
        fields: [
          { key: 'orgRev', label: 'Organic revenue', kind: 'number', suffix: '$', min: '0' },
          { key: 'orgCost', label: 'Organic cost (time/tools)', kind: 'number', suffix: '$', min: '0' },
          { key: 'paidRev', label: 'Paid revenue', kind: 'number', suffix: '$', min: '0' },
          { key: 'paidCost', label: 'Paid spend', kind: 'number', suffix: '$', min: '0' },
        ],
        compute: (v) => {
          const or = num(v, 'orgRev')
          const oc = num(v, 'orgCost')
          const pr = num(v, 'paidRev')
          const pc = num(v, 'paidCost')
          if (!req(or, oc, pr, pc)) return []
          const roi = (rev: number, cost: number) => (cost > 0 ? (rev - cost) / cost : rev > 0 ? Infinity : 0)
          const orgRoi = roi(or, oc)
          const paidRoi = roi(pr, pc)
          const orgDisplay = Number.isFinite(orgRoi) ? (orgRoi * 100).toFixed(0) + '%' : '—'
          const paidDisplay = Number.isFinite(paidRoi) ? (paidRoi * 100).toFixed(0) + '%' : '—'
          const winner = orgRoi > paidRoi ? 'Organic wins on ROI right now.' : paidRoi > orgRoi ? 'Paid scales faster; organic wins long-term.' : 'Channels are even - diversify.'
          return [
            { label: 'Organic ROI', value: orgDisplay, tone: Number.isFinite(orgRoi) && orgRoi > 0 ? 'ok' : 'warn' },
            { label: 'Paid ROI', value: paidDisplay, tone: Number.isFinite(paidRoi) && paidRoi > 0 ? 'ok' : 'warn' },
            { label: 'Budget guidance', value: winner, hint: 'Include the cost of content time in organic ROI.' },
          ]
        },
      },
    ],
  },
  {
    id: 'ga4-event-formatter',
    name: 'Web Event Tracking (GA4 Event Name) Naming Formatter',
    description: 'Format GA4-compliant event names and parameter JSON.',
    subcategoryId: 'analytics',
    tabs: [
      {
        id: 'format',
        label: 'Format event',
        fields: [
          { key: 'name', label: 'Event name', kind: 'text', placeholder: 'First Item Added to Cart' },
          { key: 'params', label: 'Parameters (key=value, one per line)', kind: 'textarea', placeholder: 'currency=USD\nvalue=29.99\nitem_id=sku123' },
        ],
        compute: (v) => {
          const name = (v.name || '').trim()
          const snake = name
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9_]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .replace(/_{2,}/g, '_')
          const params: Record<string, string | number> = {}
          for (const line of (v.params || '').split('\n')) {
            const [k, ...rest] = line.split('=')
            if (!k) continue
            const val = rest.join('=').trim()
            params[k.trim()] = /^-?\d+(\.\d+)?$/.test(val) ? Number(val) : val
          }
          const json = JSON.stringify(params, null, 2)
          return [
            { label: 'GA4 event name', value: snake || (name ? snake : 'Enter an event name'), tone: snake && snake.length <= 40 ? 'ok' : 'warn', hint: '40 chars max, snake_case, letters/digits/underscores only.' },
            { label: 'Parameters JSON', value: json, tone: 'ok', hint: 'Reserved params (value, currency) handled automatically by GA4.' },
          ]
        },
      },
    ],
  },
  {
    id: 'referral-reward-multiplier',
    name: 'Referral Program Reward Multiplier Calculator',
    description: 'Size referral rewards so they scale acquisition profitably.',
    subcategoryId: 'analytics',
    tabs: [
      {
        id: 'calc',
        label: 'Size rewards',
        fields: [
          { key: 'ltv', label: 'Customer LTV', kind: 'number', suffix: '$', min: '0' },
          { key: 'conv', label: 'Invitee → customer rate', kind: 'number', suffix: '%', min: '0' },
          { key: 'invites', label: 'Invites per customer', kind: 'number', suffix: 'invites', min: '0' },
          { key: 'reward', label: 'Reward per referral', kind: 'number', suffix: '$', min: '0' },
        ],
        compute: (v) => {
          const ltv = num(v, 'ltv')
          const conv = num(v, 'conv') / 100
          const inv = num(v, 'invites')
          const rev = num(v, 'reward')
          if (!req(ltv, conv, inv, rev)) return []
          const newCustomers = inv * conv
          const revenueFromRef = newCustomers * ltv
          const cost = inv * rev
          const roi = cost > 0 ? (revenueFromRef - cost) / cost : 0
          const budget = ltv * 0.2
          return [
            { label: 'Referrals → customers', value: newCustomers.toFixed(2) + '/customer', tone: 'ok' },
            { label: 'Program ROI', value: (roi * 100).toFixed(0) + '%', tone: roi > 0 ? 'ok' : 'warn', hint: `Cost \$${cost.toFixed(0)} vs \$${revenueFromRef.toFixed(0)} acquired.` },
            { label: 'Budget per referral', value: 'Up to ' + money(budget) + '/referral', hint: 'Cap rewards near 20% of LTV to stay profitable.' },
            { label: 'Current reward', value: money(rev), tone: rev <= budget ? 'ok' : 'warn', hint: rev > budget ? 'Above the recommended cap - trim reward or raise LTV.' : 'Within range.' },
          ]
        },
      },
    ],
  },
]

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax)
  return sign * y
}

export const MKT_BY_ID: Record<string, MktTool> = Object.fromEntries(MKT_TOOLS.map((t) => [t.id, t]))

export const MKT_TOTAL_TOOLS = MKT_TOOLS.length