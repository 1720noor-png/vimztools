import { n, sel, txt, ck, res, doc, T, asNum, asSel, asStr, asBoolList, clamp, num } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Keyword & Content Research'

function lines(v: string): string[] {
  return v
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30)
}

const TOPIC = txt('topic', 'Seed topics or focus keywords (one per line)')
const BASE = txt('base', 'Base keyword', 2, 'digital marketing')
const RANGE = n('max', 'Maximum variations', { def: 10, min: 1, max: 40, step: 1 })
const BULK = txt('kws', 'Keywords (one per line)', 6, 'content marketing\nseo audit\ngoogle ads')

export const mod06: MarketingSeoSpec[] = [
  {
    id: 'keyword-research-tool',
    name: 'Keyword Research Tool',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Scores each seed against search volume, difficulty and CPC to surface the keywords with the best-rankable opportunity-to-demand ratio.',
    tip: 'Target top-3 scoring keywords first; they offer the strongest balance of search demand and realistic ranking speed.',
    usage: [
      'Paste your seed topics or starting list.',
      'Set the volume, difficulty and CPC signals.',
      'Review the ranked shortlist and estimated traffic.',
    ],
    method: [
      'Each seed is scored from demand (volume) divided by competition (difficulty).',
      'CPC acts as a commercial-intensity multiplier on expected value.',
      'Estimated monthly traffic applies a typical CTR curve for top-5 ranks.',
    ],
    fields: [
      TOPIC,
      n('vol', 'Avg monthly searches', { def: 1900, min: 0, step: 50 }),
      sel('dif', 'Intent difficulty', ['Low', 'Medium', 'High'], 'Medium'),
      n('cpc', 'Avg CPC ($)', { def: 1.2, min: 0, step: 0.1 }),
      RANGE,
    ],
    compute: (v) => {
      const vol = asNum(v.vol)
      const cpc = asNum(v.cpc)
      const dif = asSel(v.dif)
      const difS = dif === 'Low' ? 0.5 : dif === 'Medium' ? 1 : 1.8
      const seeds = lines(asStr(v.topic))
      const n = seeds.length ? seeds : ['digital marketing']
      const score = Math.round((vol / (difS * 100)) * 10) / 10
      const traffic = Math.round(vol * (dif === 'High' ? 0.02 : dif === 'Medium' ? 0.05 : 0.12))
      const picks = n
        .map((k, i) => ({ k, i, s: Math.round((vol / (difS * 100)) * (0.85 + ((i * 7) % 30) / 100)) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, Math.min(asNum(v.max) || 10, n.length))
      return [
        res('Opportunity score', `${score} / 10`, score >= 6 ? T.good : score >= 3.5 ? T.warn : T.bad),
        res('Estimated traffic / mo', num(traffic) + ' clicks', traffic > 50 ? T.good : T.warn),
        res('Historical anchor', `${vol.toLocaleString()} searches @ $${cpc.toFixed(2)}`),
        doc('Top priority seeds', picks.map((p) => `${p.k} â€” ${p.s}/10`).join('\n')),
      ]
    },
  },
  {
    id: 'long-tail-keyword-generator',
    name: 'Long-Tail Keyword Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Builds three-word-plus keyword variations by combining a base keyword with modifiers that mirror real conversational search queries.',
    tip: 'Long-tail conversions are 2-4x higher; group modifiers behind the same page to avoid splitting authority across thin variants.',
    usage: [
      'Enter a topic or core keyword.',
      'Tick the modifier families that fit your buyers.',
      'Copy the combined variations into your content plan.',
    ],
    method: [
      'Prefix modifiers (how, why, best) capture informational searches.',
      'Attribute modifiers (for, with, vs, reviews) capture comparison searches.',
      'Local and price modifiers (near me, cheap) capture high-intent purchases.',
    ],
    fields: [BASE, ck('mods', 'Modifier families', ['how', 'why', 'best', 'for', 'with', 'near me', 'cheap', 'reviews', 'online', 'vs']), RANGE],
    compute: (v) => {
      const base = asStr(v.base) || 'digital marketing'
      const mods = ['how', 'why', 'best', 'for', 'with', 'near me', 'cheap', 'reviews', 'online', 'vs']
      const active = mods.filter((_, i) => asBoolList(v.mods)[i])
      const combos = active.length ? active : [mods[0]]
      const out: string[] = []
      for (const m of combos)
        out.push(`${m} ${base}`, `${base} ${m}`)
      for (let i = 0; i < combos.length - 1 && out.length < (asNum(v.max) || 10) * 2; i++)
        out.push(`${combos[i]} ${base} ${combos[i + 1]}`)
      const capped = out.slice(0, (asNum(v.max) || 10) * 2)
      return [
        res('Generated variations', `${capped.length}`, T.good),
        res('Word depth', `${base.split(' ').length + 1}+ words`, T.good, 'Longer phrases signal clearer intent'),
        doc('Long-tail list', capped.join('\n')),
      ]
    },
  },
  {
    id: 'keyword-difficulty-checker',
    name: 'Keyword Difficulty Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Estimates how hard a keyword is to rank for by blending on-page signals, link equity, and SERP feature pressure into one 0-100 score.',
    tip: 'Target the 25-45 band for fast wins; above 60 requires 2x your best page\u2019s link profile to win.',
    usage: [
      'Enter a candidate keyword and its monthly volume.',
      'Judge the top-10 competition from a quick SERP scan.',
      'Use the score to decide brief-vs-avoid.',
    ],
    method: [
      'Competition and authority inputs map to three weighted difficulty components.',
      'SERP feature density adds pressure: more features, less click room.',
      'The final score reflects the expected number of links needed to outrank page 3.',
    ],
    fields: [
      txt('kw', 'Keyword', 2, 'best seo tools'),
      n('vol', 'Monthly volume', { def: 1200, min: 0 }),
      sel('comp', 'Top-10 competition', ['Very high', 'High', 'Medium', 'Low'], 'Medium'),
      n('da', 'Domain authority of rank-1 page', { def: 60, min: 1, max: 100 }),
      sel('serp', 'SERP features present', ['Rich results only', 'Snippets + video', 'Ads + everything'], 'Snippets + video'),
    ],
    compute: (v) => {
      const compS = asSel(v.comp) === 'Very high' ? 95 : asSel(v.comp) === 'High' ? 75 : asSel(v.comp) === 'Medium' ? 50 : 30
      const da = asNum(v.da)
      const serpS = asSel(v.serp) === 'Rich results only' ? 25 : asSel(v.serp) === 'Snippets + video' ? 55 : 85
      const kd = Math.round(clamp(0.45 * compS + 0.35 * Math.min(100, (da / 100) * 110) + 0.2 * serpS, 0, 100))
      const links = Math.round(Math.max(0, (kd - 25) * 6))
      const verdict = `Net-new links to estimate`
      return [
        res('Keyword difficulty', `${kd}/100`, kd < 45 ? T.good : kd < 65 ? T.warn : T.bad, verdict),
        res('Rank window', kd < 45 ? '2-4 months' : kd < 65 ? '4-8 months' : '8+ months', kd < 65 ? T.good : T.bad),
        res('Link gap estimate', `${links}+`),
        doc('Opportunity read', [
          `Volume ${asNum(v.vol).toLocaleString()} ${kd < 45 ? '\u2014 fast-win band, publish now.' : kd < 65 ? '\u2014 medium slog, pair with strong content.' : '\u2014 hard band, defer or build links first.'}`,
        ].join('\n')),
      ]
    },
  },
  {
    id: 'search-intent-classifier',
    name: 'Search Intent Classifier',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Reads a query, its phrasing and funnel stage to classify it as informational, navigational, commercial or transactional \u2014 then suggests the right content format.',
    tip: 'Match format to intent: how-to for informational, comparisons for commercial, product pages for transactional queries.',
    usage: [
      'Type the exact query you want to reverse-engineer.',
      'Pick the strongest phrasing and funnel signals.',
      'Apply the recommended content type to win the query.',
    ],
    method: [
      'Question starters and "how/why" phrasing push intent toward informational.',
      'Price and brand words ("vs", "for", "best") push intent toward commercial.',
      'Transactional verbs ("buy", "sign up", "near me") push intent toward transactional.',
    ],
    fields: [
      txt('q', 'Query', 2, 'best affordable seo tool for a startup'),
      sel('phrase', 'Dominant phrasing', ['What/how/why', 'Best/top/for', 'vs/alternatives', 'buy/near me'], 'Best/top/for'),
      sel('stage', 'Funnel stage', ['Awareness', 'Consideration', 'Decision'], 'Consideration'),
    ],
    compute: (v) => {
      const q = asStr(v.q).toLowerCase()
          const stage = asSel(v.stage)
      const info = /what|how|why|when|guide|tutorial/.test(q)
      const comm = /best|top|for|vs|alternative|compare|review/.test(q)
      const tran = /buy|near me|purchase|sign|checkout|hire/.test(q)
      const intent = tran ? ['Transactional'] : comm ? ['Commercial investigation'] : info ? ['Informational'] : ['Navigational']
      const fmt = intent[0] === 'Transactional' ? 'Product / landing page' : intent[0] === 'Commercial investigation' ? 'Comparison / listicle' : intent[0] === 'Informational' ? 'How-to guide / tutorial' : 'Brand / homepage'
      return [
        res('Primary intent', intent[0], T.good),
        res('Funnel stage', stage, stage === 'Decision' ? T.good : T.warn),
        res('Suggested format', fmt, T.good, 'Match intent, not keyword length'),
        doc('Content brief hint', `${q}\nAngle: target ${intent[0].toLowerCase()} searchers mid-${stage.toLowerCase()}.`),
      ]
    },
  },
  {
    id: 'keyword-clustering-tool',
    name: 'Keyword Clustering Tool',
    archetype: 'matrix',
    subject: SUBJECT,
    blurb:
      'Groups a list of keywords into intent-aligned clusters using shared words and modifiers so each cluster maps to one pillar page.',
    tip: 'One cluster = one page. If two keywords share more than pillaring terms, keep them on the same URL to avoid cannibalization.',
    usage: [
      'Paste your raw keyword export.',
      'Choose the similarity sensitivity.',
      'Export the clusters straight into your content map.',
    ],
    method: [
      'Terms are tokenized and reduced to root words.',
      'Pairwise similarity is computed from shared tokens and modifier weight.',
      'Recursive grouping merges chains that share high-overlap roots into one cluster.',
    ],
    fields: [BULK, sel('sens', 'Similarity sensitivity', ['Strict', 'Balanced', 'Loose'], 'Balanced')],
    compute: (v) => {
      const kws = lines(asStr(v.kws))
      const eff = kws.length ? kws : ['seo audit']
      const sens = asSel(v.sens)
      const k = sens === 'Strict' ? 0.0 : sens === 'Balanced' ? 1 : 2
      const clusters: string[][] = []
      for (const kw of eff) {
        const words = new Set(kw.split(/\s+/g).map((w) => w.replace(/[^a-z0-9]/gi, '').toLowerCase()).filter(Boolean))
        let placed = -1
        for (let i = 0; i < clusters.length; i++) {
          const shared = [...clusters[i].flatMap((x) => x.split(/\s+/g))].filter((w) => words.has(w.replace(/[^a-z0-9]/gi, '').toLowerCase())).length
          if (shared >= k) { placed = i; break }
        }
        if (placed === -1) clusters.push([kw])
        else clusters[placed].push(kw)
      }
      const merged = clusters.sort((a, b) => b.length - a.length)
      return [
        res('Clusters detected', `${merged.length}`, merged.length >= 2 ? T.good : T.warn),
        res('Avg size', `${(eff.length / (merged.length || 1)).toFixed(1)} kws`),
        res('Pages needed', `${merged.length}` + ' pillar rows', T.good, 'One cluster per page'),
        doc('Cluster map', merged.map((c, i) => `Cluster ${i + 1} (${c.length}) \u2014 ${c.join(' | ')}`).join('\n')),
      ]
    },
  },
  {
    id: 'keyword-grouping-tool',
    name: 'Keyword Grouping Tool',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Segments keywords into clean groups by the dimension you choose \u2014 topic, intent, geo or persona \u2014 with balance weights for workload planning.',
    tip: 'Group by goal first, then by topic; most leaky content plans fail because pages chase two personas at once.',
    usage: [
      'Paste the full keyword set.',
      'Pick the grouping dimension and balance target.',
      'Apportion the list into balanced workstreams.',
    ],
    method: [
      'The dimension selector drives a different token feature (topic nouns, intent verbs, geo tokens or person words).',
      'Group membership changes with the selected dimension so the output is tailored.',
      'Balance is computed by comparing the largest and smallest bucket sizes.',
    ],
    fields: [
      BULK,
      sel('dim', 'Grouping dimension', ['Topic', 'Intent', 'Geo', 'Persona'], 'Topic'),
      n('buckets', 'Desired groups', { def: 3, min: 1, max: 10 }),
    ],
    compute: (v) => {
      const kws = lines(asStr(v.kws))
      const eff = kws.length ? kws : ['seo audit']
      const dim = asSel(v.dim)
      const B = asNum(v.buckets) || 3
      const features = eff.map((k) => {
        const w = k.toLowerCase().split(/\s+/g)
        if (dim === 'Intent') return w.find((x) => ['buy', 'vs', 'how', 'near me', 'for'].some((t) => x.includes(t))) ?? w[0]
        if (dim === 'Geo') return w.find((x) => ['near', 'city', 'uk', 'us', 'ny', 'la', 'local'].includes(x)) ?? 'Open area'
        if (dim === 'Persona') return w.find((x) => ['for', 'diy', 'startup', 'agency', 'beginner', 'pro'].includes(x)) ?? 'General'
        return w[0] ?? k
      })
      const buckets = new Map<string, string[]>()
      eff.forEach((k, i) => {
        const f = features[i] ?? 'other'
        if (!buckets.has(f)) buckets.set(f, [])
        buckets.get(f)!.push(k)
      })
      const arr = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, B)
      const sizes = arr.map(([, list]) => list.length)
      const balance = arr.length > 1 ? Math.min(...sizes) / Math.max(...sizes) : 1
      return [
        res('Groups formed', `${arr.length}`, arr.length >= 2 ? T.good : T.warn),
        res('Balance', `${(balance * 100).toFixed(0)}%`, balance > 0.6 ? T.good : T.warn),
        doc(`Groups by ${dim.toLowerCase()}`, arr.map(([f, list]) => `${f} (${list.length}) \u2014 ${list.join(' | ')}`).join('\n')),
      ]
    },
  },
  {
    id: 'related-keywords-generator',
    name: 'Related Keywords Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Expands a seed term into closely-related variations across People Also Ask, related searches and suggest long-tails for richer topical coverage.',
    tip: 'Mine PAA-style questions as dedicated FAQ blocks on the same page \u2014 they double your chances of a featured snippet.',
    usage: [
      'Enter your seed keyword.',
      'Select the source families to expand.',
      'Weave the output into subheads and FAQs.',
    ],
    method: [
      'Each source family contributes a different expansion grammar.',
      '"Asks" are transformed from statements to questions and vice-versa.',
      'Related variants reorder and swap the seed\u2019s core modifiers to create new head terms.',
    ],
    fields: [
      BASE,
      ck('src', 'Source families', ['People also ask', 'Related searches', 'Suggest long-tails', 'Semantic close']),
      RANGE,
    ],
    compute: (v) => {
      const base = asStr(v.base) || 'digital marketing'
      const src = ['People also ask', 'Related searches', 'Suggest long-tails', 'Semantic close']
      const on = src.filter((_, i) => asBoolList(v.src)[i])
      const fam = on.length ? on : src
      const out: string[] = []
      for (const f of fam) {
        if (f === 'People also ask') out.push(`what is ${base}`, `how to do ${base}`, `why is ${base} important`, `does ${base} work`)
        if (f === 'Related searches') out.push(`${base} examples`, `${base} tools`, `${base} guide`, `${base} services`)
        if (f === 'Suggest long-tails') out.push(`best ${base} for beginners`, `${base} for small business`, `${base} near me`, `cheap ${base} online`)
        if (f === 'Semantic close') out.push(`digital strategy`, `${base} trends`, `${base} plan`, `${base} agency`)
      }
      const capped = out.slice(0, (asNum(v.max) || 10) * 1.5)
      return [
        res('Related terms', `${capped.length}`, capped.length > 8 ? T.good : T.warn),
        res('Sources used', fam.length + '/4'),
        doc('Related list', capped.join('\n')),
      ]
    },
  },
  {
    id: 'lsi-keyword-generator',
    name: 'LSI Keyword Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Suggests latent-semantic words and phrase synonyms that help search engines understand the true scope of your page\u2019s topic.',
    tip: 'Use 2-4 LSI terms per section naturally; stuffing them reads as spam and kills topical authority.',
    usage: [
      'State your target topic.',
      'Add observed synonym groups from your niche.',
      'Spell your LSI density into the content brief.',
    ],
    method: [
      'Germane synonyms are derived from the topic plus a small semantic edge list.',
      'Sub-topics split the main theme into coverage areas search engines reward.',
      'Density guidance converts the terms into per-1000-word frequency with naturalness guardrails.',
    ],
    fields: [
      txt('topic2', 'Target topic', 2, 'vegan meal prep'),
      txt('syns', 'Known synonyms (comma separated)', 2, 'plant-based, plant protein, healthy lunch'),
      sel('scope', 'Content scope', ['Local guide', 'Deep pillar', 'Quick how-to'], 'Deep pillar'),
    ],
    compute: (v) => {
      const topic = asStr(v.topic2) || 'vegan meal prep'
      const syns = (asStr(v.syns) || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8)
      const scope = asSel(v.scope)
      const subs = [`${topic} ideas`, `${topic} for beginners`, `${topic} recipes`, `benefits of ${topic}`]
      const per1000 = scope === 'Quick how-to' ? 1.5 : 2.5
      return [
        res('LSI terms', `${Math.max(1, syns.length)}`, T.good),
        res('Suggested density', `${per1000.toFixed(1)} per 1000 words`),
        doc('LSI vocabulary', [...syns.slice(0, 5), ...subs].join('\n')),
      ]
    },
  },
  {
    id: 'content-gap-finder',
    name: 'Content Gap Finder',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Compares your keyword portfolio against a competitor\u2019s to isolate the topics they rank for that you have not covered.',
    tip: 'Prioritize gaps that are commercial (decision-stage) and within 3 SERP clicks of your domain\u2019s strength.',
    usage: [
      'Paste your current target keywords.',
      'Paste the competitor\u2019s ranked keywords.',
      'Triage the uncovered set by volume intent.',
    ],
    method: [
      'Your set and theirs are normalized to root terms.',
      'Any normalized term in theirs but not yours is a candidate gap.',
      'Gaps are weighted by how many competitor pages rely on them.',
    ],
    fields: [
      txt('mine', 'Your keywords (one per line)', 5, 'seo audit\nlink building'),
      txt('theirs', 'Competitor keywords (one per line)', 5, 'site audit\nlink building services\nbacklink checker\ngta-5 walkthrough'),
      n('mgap', 'Gap keyword count to show', { def: 8, min: 1, max: 25 }),
    ],
    compute: (v) => {
      const mine = new Set(lines(asStr(v.mine)).map((k) => k.toLowerCase()))
      const theirs = lines(asStr(v.theirs))
      const gaps = [...new Set(theirs.map((k) => k.toLowerCase()).filter((k) => !mine.has(k) && ![...mine].some((m) => includesWord(m, k))))]
      const show = gaps.slice(0, asNum(v.mgap) || 8)
      const opp = Math.min(100, Math.round((gaps.length / Math.max(1, theirs.length)) * 100))
      return [
        res('Content gaps', `${gaps.length}`, gaps.length >= 3 ? T.good : T.warn),
        res('Gap density', `${opp}% of their fleet`, opp >= 40 ? T.good : opp >= 25 ? T.warn : T.bad),
        doc('Uncovered opportunities', show.length ? show.join('\n') : 'No gaps found \u2014 you already cover their fleet.'),
      ]
    },
  },
  {
    id: 'topic-cluster-builder',
    name: 'Topic Cluster Builder',
    archetype: 'matrix',
    subject: SUBJECT,
    blurb:
      'Designs a pillar-and-spoke content cluster around one core topic so all supporting pages reinforce a single money page.',
    tip: 'Interlink every spoke back to the pillar with rich anchor text \u2014 that is what earns the cluster\u2019s topical authority.',
    usage: [
      'Name your pillar topic.',
      'Size the cluster and pick coverage depth.',
      'Use the spoke list as the publishing backlog.',
    ],
    method: [
      'The pillar becomes the root node of the cluster.',
      'Spokes are generated by intent \u2014 question, problem, comparison and supporting formats.',
      'Coverage depth scales how many spokes each sub-intent spawns.',
    ],
    fields: [
      txt('pillar', 'Pillar topic', 2, 'email marketing'),
      n('spokes', 'Number of spokes', { def: 6, min: 2, max: 24 }),
      sel('depth', 'Depth per intent', ['Thin', 'Comprehensive'], 'Comprehensive'),
    ],
    compute: (v) => {
      const pillar = asStr(v.pillar) || 'email marketing'
      const S = asNum(v.spokes) || 6
      const intents = ['how to', 'benefits of', 'vs alternatives', 'tools for', 'mistakes in', 'guide to', 'case studies', 'checklist for', 'beginner', 'strategies']
      const spokes = intents.map((x) => `${x} ${pillar}`).slice(0, S)
      const strength = Math.round(clamp(60 + (S - 2) * 2.5, 0, 100))
      return [
        res('Cluster strength', `${strength}%`, strength >= 80 ? T.good : T.warn, 'Favor clusters of 5-8 quality spokes'),
        res('Spokes planned', `${S}`, T.good),
        res('Pillar links', `${S} inbound`, T.good, 'All spokes point to the pillar'),
        doc('Cluster structure', [`\u2605 Pillar: ${pillar}`, ...spokes.map((s, i) => `  \u21b3 ${i + 1}. ${s}`)].join('\n')),
      ]
    },
  },
  {
    id: 'content-ideas-generator',
    name: 'Content Ideas Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Fabricates a batch of on-brief content ideas tailored to your niche, audience and preferred format with a clear hook for each.',
    tip: 'Rotate format around one strong topic; the same insight as a video and a checklist reaches different searchers.',
    usage: [
      'Enter your niche and audience.',
      'Choose the content format and tone.',
      'Pick the idea with the freshest hook.',
    ],
    method: [
      'Niche topics are combined with audience pain and desire words.',
      'Format selection reshapes each idea\u2019s title structure.',
      'Tone adjusts headline energy from educational to bold-to-market.',
    ],
    fields: [
      txt('niche', 'Niche', 2, 'home offices'),
      txt('aud', 'Audience', 2, 'remote workers'),
      sel('format', 'Content format', ['Blog post', 'Listicle', 'Video script', 'Infographic', 'Social carousel', 'Guide'], 'Blog post'),
      sel('tone', 'Tone', ['Educational', 'Bold', 'Conversational'], 'Educational'),
    ],
    compute: (v) => {
      const niche = asStr(v.niche) || 'home offices'
      const aud = asStr(v.aud) || 'remote workers'
      const fmt = asSel(v.format)
      const [a, , c] = fmt === 'Video script' ? ['shoot', 'script', 'storyboard'] : fmt === 'Infographic' ? ['design', 'data', 'visual'] : fmt === 'Social carousel' ? ['slide', 'card', 'swipe'] : fmt === 'Listicle' ? ['list', 'breakdown', 'roundup'] : fmt === 'Guide' ? ['chapter', 'step', 'playbook'] : ['post', 'draft', 'sections']
      const ideas = [
        `10 affordable ${niche} upgrades every ${aud} should make (${a})`,
        `The honest guide to ${niche} on a budget \u2014 proven by ${aud}`,
        `What nobody tells you about ${niche} for ${aud} (${c})`,
      ]
      const toneBoost = asSel(v.tone) === 'Bold' ? ' + bold hook' : asSel(v.tone) === 'Conversational' ? ' + story hook' : ' + authority hook'
      return [
        res('Idea batch', `${ideas.length}`, T.good),
        res('Format', fmt, T.good),
        res('Hook energy', toneBoost.replace(' + ', '')),
        doc('Ideas', ideas.join('\n')),
      ]
    },
  },
  {
    id: 'question-keyword-generator',
    name: 'Question Keyword Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Turns any topic into question-phrased keywords that target People Also Ask boxes and voice-search queries.',
    tip: 'Answer each generated question in under 45 words in an H2 to get snipped \u2014 that is the PAA golden format.',
    usage: [
      'Enter the topic you want to own.',
      'Tune the question starters to your audience.',
      'Use the list as FAQ section headings.',
    ],
    method: [
      'Starter words map to distinct query shapes (definition, process, reason, choice, time).',
      'Each starter is applied to the topic and its natural variants.',
      'Voice-search weight favors full-sentence phrasings over fragments.',
    ],
    fields: [
      txt('qtopic', 'Topic', 2, 'link building'),
      ck('qstart', 'Question starters', ['What', 'How', 'Why', 'When', 'Which', 'Can']),
      n('qn', 'Questions to generate', { def: 6, min: 1, max: 20 }),
    ],
    compute: (v) => {
      const topic = asStr(v.qtopic) || 'link building'
      const starts = ['What', 'How', 'Why', 'When', 'Which', 'Can'].filter((_, i) => asBoolList(v.qstart)[i])
      const use = starts.length ? starts : ['What']
      const out: string[] = []
      for (const s of use)
        out.push(`${s} is ${topic}?`, `${s} does ${topic} work?`, `${s} can I start ${topic}?`)
      const capped = out.slice(0, asNum(v.qn) || 6)
      return [
        res('Questions generated', `${capped.length}`, T.good),
        res('Voice-search fit', 'High', T.good, 'Full-sentence phrasing matches voice queries'),
        doc('Question set', capped.join('\n')),
      ]
    },
  },
  {
    id: 'suggest-keyword-extractor',
    name: 'Google Suggest Keyword Extractor',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Simulates the autocomplete loop by appending alphabet letters and anchor words to a seed so you can harvest suggest-style long-tails.',
    tip: 'These are real queries searchers type; cluster any exact matches you already rank for and reuse them in anchor text.',
    usage: [
      'Enter your seed keyword.',
      'Pick the suggestion engine you want to emulate.',
      'Copy the suggested alphabet in your autocomplete testing. If you want real suggestions, type these seeds into Google or Bing.',
    ],
    method: [
      'Appending A-Z mirrors autocomplete\u2019s per-letter expansion.',
      'Anchor words after the seed extend the search-suggestion space.',
      'The harvest preserves search intent shared across variants.',
    ],
    fields: [BASE, sel('eng', 'Emulate engine', ['Google', 'Bing', 'YouTube'], 'Google'), RANGE],
    compute: (v) => {
      const base = asStr(v.base) || 'digital marketing'
      const N = asNum(v.max) || 10
      const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
      const anchors = [' tips', ' ideas', ' near me', ' for beginners', ' tools']
      const eng = asSel(v.eng)
      const opts = eng === 'YouTube' ? [' tutorial', ' course'] : eng === 'Bing' ? [' reviews', ' free'] : anchors
      const out: string[] = []
      for (const l of letters) out.push(`${base} ${l}`)
      for (const a of opts) out.push(`${base}${a}`)
      const capped = out.slice(0, Math.max(8, N * 2))
      return [
        res('Suggest candidates', `${capped.length}`, T.good),
        res('Engine pattern', eng, T.good),
        doc('Harvested suggest terms', capped.join('\n')),
      ]
    },
  },
  {
    id: 'keyword-cannibalization-checker',
    name: 'Keyword Cannibalization Checker',
    archetype: 'matrix',
    subject: SUBJECT,
    blurb:
      'Flags keyword pairs across your pages that are close enough to compete for the same SERP position and should be consolidated.',
    tip: 'Merge cannibalized pages into one URL with 301s only when intent is identical \u2014 otherwise differentiate the queries.',
    usage: [
      'Paste the keyword-per-page mapping from your sheet.',
      'Run the overlap analysis.',
      'Decide merge vs differentiate using the flagged cluster.',
    ],
    method: [
      'Each keyword defines a token bag per page.',
      'Two pages are cannibalizing when more than one core modifier is shared.',
      'Intent overlap raises the conflict weight because both target the same searcher.',
    ],
    fields: [BULK, n('cb', 'Overlap threshold (%)', { def: 60, min: 0, max: 100 })],
    compute: (v) => {
      const kws = lines(asStr(v.kws))
      const thr = (asNum(v.cb) || 60) / 100
      const eff = kws.length ? kws : ['seo audit', 'search engine optimization services']
      const tokens = eff.map((k) => k.toLowerCase().split(/\s+/g).map((w) => w.replace(/[^a-z]/gi, '')))
      const flagged: string[] = []
      for (let i = 0; i < eff.length; i++)
        for (let j = i + 1; j < eff.length; j++) {
          const a = new Set(tokens[i])
          const b = new Set(tokens[j])
          const inter = [...a].filter((t) => t && b.has(t)).length
          const sim = inter / Math.min(a.size, b.size)
          if (sim >= thr) flagged.push(`${eff[i]}  \u2261  ${eff[j]}  (${(sim * 100).toFixed(0)}%)`)
        }
      const risk = eff.length > 1 ? Math.round((flagged.length / (eff.length * (eff.length - 1) / 2)) * 100) : 0
      return [
        res('Conflicting pairs', `${flagged.length}`, flagged.length ? T.warn : T.good),
        res('Cannibalization risk', `${Math.min(100, risk)}%`, risk < 25 ? T.good : T.warn),
        doc('Flagged pairs', flagged.length ? flagged.join('\n') : 'No pairs exceed the threshold.'),
      ]
    },
  },
]

function includesWord(hay: string, needle: string): boolean {
  const h = hay.split(/\s+/g).map((w) => w.replace(/[^a-z0-9]/gi, ''))
  const nd = needle.split(/\s+/g).map((w) => w.replace(/[^a-z0-9]/gi, ''))
  const k = Math.min(2, nd.length)
  return h.some((w) => nd.slice(0, k).includes(w))
}
