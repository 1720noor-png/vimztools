import { n, sel, txt, res, doc, T, asNum, asSel, asStr, pct, num, ratio } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Competitor Research'

export const mod23: MarketingSeoSpec[] = [
  {
    id: 'competitor-seo-analyzer',
    name: 'Competitor SEO Analyzer',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores a competitor\u2019s technical SEO posture \u2014 title strategy, index visibility, speed, schema and freshness \u2014 to spot the crack to enter.',
    tip: 'Competitors fall on gaps that are dull to fix and cheap to find: meta coverage, header structure, schema, and last-updated dates.',
    usage: [
      'Assess each column honestly.',
      'Run the weighted score.',
      'Attack the column where they score lowest.',
    ],
    method: [
      'Six technical dimensions are weighted by impact.',
      'The score summarizes relative posture.',
      'A gap-line names the single weakest dimension.',
    ],
    fields: [
      sel('title23', 'Title/meta coverage', ['Full & optimized', 'Partial', 'Missing'], 'Partial'),
      sel('arch23', 'Index & structure', ['Clean silo', 'Flat mess', 'Buried pages'], 'Clean silo'),
      sel('speed23', 'Page speed', ['Fast (LCP < 2.5s)', 'Average', 'Slow'], 'Fast (LCP < 2.5s)'),
      sel('schema23', 'Structured data', ['Rich', 'Minimal', 'None'], 'Minimal'),
      sel('fresh23', 'Freshness', ['Updated < 90d', 'Stale some', 'Aged content'], 'Updated < 90d'),
    ],
    compute: (v) => {
      const w: Record<string, number> = { 'Full & optimized': 18, 'Partial': 9, 'Missing': 3, 'Clean silo': 18, 'Flat mess': 9, 'Buried pages': 3, 'Fast (LCP < 2.5s)': 18, 'Average': 9, 'Slow': 3, 'Rich': 12, 'Minimal': 6, 'None': 2, 'Updated < 90d': 14, 'Stale some': 7, 'Aged content': 2 }
      const score = w[asSel(v.title23)] + w[asSel(v.arch23)] + w[asSel(v.speed23)] + w[asSel(v.schema23)] + w[asSel(v.fresh23)]
      const worst = Math.min(w[asSel(v.title23)], w[asSel(v.arch23)], w[asSel(v.speed23)], w[asSel(v.schema23)], w[asSel(v.fresh23)])
      const dim = String([
        ['title/meta', w[asSel(v.title23)]],
        ['index structure', w[asSel(v.arch23)]],
        ['page speed', w[asSel(v.speed23)]],
        ['structured data', w[asSel(v.schema23)]],
        ['freshness', w[asSel(v.fresh23)]],
      ].reduce((a, b) => (b[1] < a[1] ? b : a))[0])
      return [
        res('SEO posture', Math.round(score) + '/90', score >= 65 ? T.warn : score >= 40 ? T.good : T.bad, 'Higher = harder to beat'),
        res('Weakest column', dim, T.warn),
        res('Attack line', worst >= 10 ? 'Harden offense elsewhere' : 'Exploit ' + dim, T.good),
        doc('Verbatim', `Columns: title ${w[asSel(v.title23)]}, structure ${w[asSel(v.arch23)]}, speed ${w[asSel(v.speed23)]}, schema ${w[asSel(v.schema23)]}, freshness ${w[asSel(v.fresh23)]}. Weakest: ${dim}.`),
      ]
    },
  },
  {
    id: 'competitor-keyword-comparison',
    name: 'Competitor Keyword Comparison',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Compares your keyword set against a competitor\u2019s across range, strength and overlaps \u2014 the battlefield map of who owns which term.',
    tip: 'Own the terms they insensibly wrote for, not their head terms. Head terms are patrolled; long-form intent is unguarded.',
    usage: [
      'Estimate your and their keyword counts.',
      'Rough-split shared vs unique.',
      'Target their unowned tails, not their trademark.',
    ],
    method: [
      'Your and their sets are split into shared and unique.',
      'Overlap ratio frames the real competition diameter.',
      'The unguarded-tail arithmetic picks the entry terms.',
    ],
    fields: [
      n('theirs23', 'Their ranking keywords', { def: 920, min: 1 }),
      n('yours23', 'Your ranking keywords', { def: 380, min: 1 }),
      n('shared23', 'Keywords both rank for', { def: 95, min: 0 }),
      n('strength23', 'Their avg position', { def: 14, min: 1 }),
    ],
    compute: (v) => {
      const theirs = asNum(v.theirs23)
      const shared = asNum(v.shared23)
      const strength = asNum(v.strength23)
      const overlap = shared / Math.max(1, theirs) * 100
      const unguarded = Math.max(0, theirs - shared)
      const targetable = unguarded * 0.6
      return [
        res('Overlap', pct(overlap, 1), overlap <= 30 ? T.good : T.warn, 'Low overlap = open field'),
        res('Their unguarded tails', num(unguarded) + ' terms', unguarded > shared * 2 ? T.good : T.warn),
        res('Entry target', num(Math.round(targetable)) + ' realistic', T.good),
        res('Their avg position', '#' + strength, strength >= 12 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'competitor-content-gap',
    name: 'Competitor Content Gap',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Finds the topics a competitor ranks for that you do not \u2014 the exact map of content real estate they hold and you are absent from.',
    tip: 'The gap is not topics they cover rarely; it is the cluster they cover shallowly. Deep-dive the shallow cluster to win the cluster.',
    usage: [
      'Estimate their full topic coverage.',
      'Estimate topics you both touch.',
      'Clone only the shallow gaps, deepen them.',
    ],
    method: [
      'Their coverage minus your coverage is the gap set.',
      'Shallow-covered clusters are scored as quick wins.',
      'A cluster plan sequences the deep dives.',
    ],
    fields: [
      n('cov23', 'Their topics ranked', { def: 210, min: 1 }),
      n('yoursC23', 'Your topics ranked', { def: 64, min: 0 }),
      n('shallow23', 'Their shallow pages (< 800w)', { def: 80, min: 0 }),
      n('pool23', 'Your content budget (posts/qtr)', { def: 10, min: 1 }),
    ],
    compute: (v) => {
      const cov = asNum(v.cov23)
      const yours = asNum(v.yoursC23)
      const shallow = asNum(v.shallow23)
      const pool = asNum(v.pool23)
      const gap = Math.max(0, cov - yours)
      const quick = Math.min(shallow, pool)
      const fillPct = gap > 0 ? pool / gap * 100 : 100
      return [
        res('Gap topics', num(gap), gap > 0 ? T.good : T.warn),
        res('Shallow quick-wins', num(shallow), shallow >= pool ? T.good : T.warn),
        res('You can fill', `${quick} with ${pool} posts`, T.good),
        res('Gap coverage', pct(fillPct, 0) + ' at current budget', fillPct >= 25 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'competitor-backlink-comparison',
    name: 'Competitor Backlink Comparison',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Compares link equity \u2014 referring domains, authority score, ratio \u2014 between you and a rival, and converts the deficit into a harvest list.',
    tip: 'Chase their link gaps, not their count. A rival with 5,000 links from 20 hotel blogs is easier to catch than one with 800 from 40 authoritative editors.',
    usage: [
      'Enter domain and authority numbers.',
      'Run the equity comparison.',
      'Move the deficit lever you can control first.',
    ],
    method: [
      'Referring-domain and authority scores enter the model.',
      'A ratio converts count into equity for fair compare.',
      'The deficit translates into a harvest-velocity target.',
    ],
    fields: [
      n('myRd23', 'Your referring domains', { def: 420, min: 0 }),
      n('theirRd23', 'Theirs', { def: 860, min: 0 }),
      n('myDr23', 'Your authority', { def: 42, min: 0, max: 100 }),
      n('theirDr23', 'Their authority', { def: 55, min: 0, max: 100 }),
      n('mo23', 'Months you will spend', { def: 6, min: 1 }),
    ],
    compute: (v) => {
      const myRd = asNum(v.myRd23)
      const theirRd = asNum(v.theirRd23)
      const myDr = asNum(v.myDr23)
      const theirDr = asNum(v.theirDr23)
      const gap = Math.max(0, theirRd - myRd)
      const myEq = myRd * myDr
      const theirEq = theirRd * theirDr
      const eqGap = Math.max(0, theirEq - myEq)
      const perMonth = gap / asNum(v.mo23)
      const catchable = theirDr >= 60 && myDr < 45
      return [
        res('Domain gap', '+' + num(gap), gap > 0 ? T.warn : T.good),
        res('Equity gap', ratio(eqGap, 0) + ' pts', eqGap > 0 ? T.warn : T.good),
        res('Pace to close', num(Math.round(perMonth)) + '/mo', perMonth <= 60 ? T.good : T.warn),
        res('Quality tariff', catchable ? 'Digital-pr board needed' : 'Winnable niche', catchable ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'competitor-traffic-estimator',
    name: 'Competitor Traffic Estimator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Estimates a competitor\u2019s organic traffic from ranking keywords and average positions \u2014 and the reach of your catch-up plan.',
    tip: 'Traffic estimates are direction, not truth. Model 3 scenarios and watch the caps: you need the band, not the decimal.',
    usage: [
      'Count their keywords and avg position.',
      'Estimate the click-through at that position.',
      'Read the scenario band.',
    ],
    method: [
      'Position-scaled CTR model weights each keyword.',
      'Head, mid and long-tail mixes shape the share.',
      'Scenario banding shows low and high bounds.',
    ],
    fields: [
      n('kw23t', 'Ranking keywords', { def: 1400, min: 1 }),
      n('pos23t', 'Avg position', { def: 16, min: 1 }),
      n('vol23', 'Avg keyword volume', { def: 320, min: 1 }),
      n('share23t', 'Avg search share', { def: 12, min: 1, max: 100 }),
    ],
    compute: (v) => {
      const kw = asNum(v.kw23t)
      const pos = asNum(v.pos23t)
      const vol = asNum(v.vol23)
      const share = asNum(v.share23t) / 100
      const ctr = Math.max(0.01, 0.35 / Math.pow(pos, 0.6))
      const low = kw * vol * ctr * share * 0.7
      const high = kw * vol * ctr * share * 1.3
      const mid = (low + high) / 2
      return [
        res('Position CTR', pct(ctr * 100, 1) + ' \u2248 #' + pos, pos <= 12 ? T.good : T.warn),
        res('Est. visits/mo', num(Math.round(mid)) + ' (band)'),
        res('Range', num(Math.round(low)) + ' \u2013 ' + num(Math.round(high)), T.good),
        res('Catch logic', pos <= 10 ? 'Near-term threat' : 'Chaseable', pos <= 10 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'competitor-ad-copy-analyzer',
    name: 'Competitor Ad Copy Analyzer',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Deconstructs a competitor\u2019s ad angle \u2014 their headline hook, claimed benefit and CTA \u2014 to see which gap your copy should counter.',
    tip: 'Do not out-claim them; break their promise. If they say "5x results", the gap is proof \u2014 answer with verifiable, specific numbers.',
    usage: [
      'Capture their main ad line.',
      'Name the benefit they claim.',
      'Position your counter-angle against it.',
    ],
    method: [
      'Their headline is scored for hook strength.',
      'The claimed benefit is compared to proof depth.',
      'Your counter-copy is generated on the open axis.',
    ],
    fields: [
      txt('their23a', 'Their ad line', 2, 'get 5x more results with AI'),
      txt('theirB23', 'Claimed benefit', 2, '5x results'),
      sel('promise23', 'Promise depth', ['Vague (no numbers)', 'Specific claim', 'Backed by proof'], 'Vague (no numbers)'),
      txt('yourEdge23', 'Your real edge', 2, 'a live dashboard that shows results hourly'),
    ],
    compute: (v) => {
      const their = asStr(v.their23a) || 'their ad'
      const claim = asStr(v.theirB23) || 'their claim'
      const depth = asSel(v.promise23)
      const edge = asStr(v.yourEdge23) || 'your edge'
      const counter = depth === 'Vague (no numbers)'
        ? `They say: ${their}. You get: ${edge}. Proof on the page, now.`
        : depth === 'Specific claim'
        ? `${claim} is a goalpost. ${cap23(edge)} is how you actually measure it.`
        : `We are the proof behind "${their}": ${edge}.`
      return [
        res('Their hook', their.split(' ').length <= 8 ? 'Short' : 'Wordy', T.good),
        res('Promise depth', depth, depth === 'Vague (no numbers)' ? T.good : depth === 'Specific claim' ? T.warn : T.good),
        res('Your counter', edge.split(' ').length <= 9 ? 'Concrete' : 'Trim to one', edge.split(' ').length <= 9 ? T.good : T.warn),
        res('Counter angle', depth === 'Vague (no numbers)' ? 'Out-specify them' : 'Out-measure them', T.good),
        doc('Deconstruction', `Ad: "${their}"\nClaim: ${claim} (${depth})\nPlay: ${counter}`),
      ]
    },
  },
  {
    id: 'competitor-social-media-analyzer',
    name: 'Competitor Social Media Analyzer',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores a competitor\u2019s social posture \u2014 cadence, engagement, format and reply-rate \u2014 and reads which behavior actually wins.',
    tip: 'The format with the highest engagement is the market\u2019s vote. Copy the format, not their voice \u2014 formats are transferable, voices are not.',
    usage: [
      'Score their cadence and engagement.',
      'Rate their format discipline.',
      'Copy formats, differentiate voice.',
    ],
    method: [
      'Cadence, engagement, format and responsiveness are scored.',
      'Engagement-per-follower weights the real signal.',
      'A format-vote recommendation drives your tactic.',
    ],
    fields: [
      sel('cad23', 'Cadence', ['Daily', '3-4x/wk', 'Erratic'], '3-4x/wk'),
      sel('eng23', 'Engagement', ['High per follower', 'Average', 'Ghost town'], 'High per follower'),
      sel('frm23', 'Format', ['Consistent niche format', 'Mixed', 'Calls-videos mix'], 'Consistent niche format'),
      sel('reply23', 'Reply rate', ['Fast & human', 'Occasional', 'Never'], 'Fast & human'),
    ],
    compute: (v) => {
      const w: Record<string, number> = { 'Daily': 5, '3-4x/wk': 5, 'Erratic': 2, 'High per follower': 9, 'Average': 5, 'Ghost town': 1, 'Consistent niche format': 8, 'Mixed': 5, 'Calls-videos mix': 6, 'Fast & human': 6, 'Occasional': 3, 'Never': 1 }
      const score = w[asSel(v.cad23)] + w[asSel(v.eng23)] + w[asSel(v.frm23)] + w[asSel(v.reply23)]
      const lesson = asSel(v.frm23) === 'Consistent niche format' ? 'Their format is the moat \u2014 replicate it with your voice' : 'Copy their cadence until you find the format moat'
      return [
        res('Social posture', score + '/28', score >= 20 ? T.warn : score >= 14 ? T.good : T.bad, 'Higher = harder to beat'),
        res('Format lesson', lesson, T.good),
        res('Reply speed', asSel(v.reply23), asSel(v.reply23) !== 'Never' ? T.good : T.warn),
        res('Verdict', score >= 20 ? 'Disciplined \u2014 differentiate harder' : 'Loose \u2014 overtakeable', score >= 20 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'competitor-domain-comparison',
    name: 'Competitor Domain Comparison',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Compares two domains across authority, pages, index health and link texture to frame who is structurally bigger \u2014 and how to surpass them.',
    tip: 'Domain authority is slow; index health is fast. More healthy pages beats more raw authority for the ROI per week you actually have.',
    usage: [
      'Enter both domains\u2019 authority and pages.',
      'Add index health.',
      'Sequence: fix your index before chasing their authority.',
    ],
    method: [
      'Authority, healthy pages and index ratio combine.',
      'The relative mass gives a structural verdict.',
      'A sequence plan prefers fast-health levers first.',
    ],
    fields: [
      n('myA23', 'Your authority', { def: 38, min: 0, max: 100 }),
      n('theirA23', 'Their authority', { def: 52, min: 0, max: 100 }),
      n('myPg23', 'Your indexed pages', { def: 240, min: 1 }),
      n('theirPg23', 'Their indexed pages', { def: 620, min: 1 }),
      n('myIx23', 'Your index health (%)', { def: 88, min: 0, max: 100 }),
    ],
    compute: (v) => {
      const myA = asNum(v.myA23)
      const theirA = asNum(v.theirA23)
      const myPg = asNum(v.myPg23)
      const theirPg = asNum(v.theirPg23)
      const myIx = asNum(v.myIx23) / 100
      const myPts = myA * 2 + myPg * myIx
      const theirPts = theirA * 2 + theirPg
      const gap = theirPts - myPts
      const iso = gap <= 0
      const seq = myIx < 0.7 ? 'De-index junk pages first' : iso ? 'Defend & compound' : 'Add 3x topics, then earn links'
      return [
        res('Structural pts', ratio(myPts, 0) + ' vs ' + ratio(theirPts, 0), iso ? T.good : T.warn),
        res('Authority delta', (myA - theirA).toFixed(0) + ' pts', myA >= theirA ? T.good : T.warn),
        res('Index health', pct(myIx * 100, 0), myIx >= 0.7 ? T.good : T.warn),
        res('Sequence', seq, T.good),
      ]
    },
  },
  {
    id: 'serp-competitor-finder',
    name: 'SERP Competitor Finder',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'For a keyword, scores who actually owns the page-1 slots you are competing for \u2014 and who you can realistically take.',
    tip: 'Differentiate page-1 owners by intent match. Since "best X" ranks, solution pages rank; the listicle owners are your real rivals.',
    usage: [
      'Enter the keyword.',
      'Score page-1 mix.',
      'Target the lowest-authority intent-matching slot.',
    ],
    method: [
      'Page-1 slots are classified by intent and authority.',
      'A takeable-slot score ranks the lowest-hanging entry point.',
      'The plan targets one slot, not the whole page.',
    ],
    fields: [
      txt('kw23s', 'Target keyword', 2, 'best time tracking for agencies'),
      n('serp23', 'Page-1 domains (estimate)', { def: 8, min: 1 }),
      sel('intentS23', 'Top-3 intent', ['Info lead', 'Commercial mix', 'Transactional pages'], 'Commercial mix'),
      n('lowAuth23', 'Low-authority page-1 slots', { def: 3, min: 0 }),
    ],
    compute: (v) => {
      const kw = asStr(v.kw23s) || 'your keyword'
      const serp = asNum(v.serp23)
      const intent = asSel(v.intentS23)
      const low = asNum(v.lowAuth23)
      const win = Math.min(low, 1)
      const play = intent === 'Commercial mix' ? 'Match the listicle format but add comparison tables' : intent === 'Transactional pages' ? 'Catch the bottom-funnel: side-by-side pricing + guarantee' : 'Answers first: direct, cited answers above the summary'
      return [
        res('Page-1 owners', serp + ' domains', T.good),
        res('Takeable slots', low + ' low-authority', low >= 1 ? T.good : T.warn),
        res('Intent play', play.split(' ').length <= 12 ? 'Focused' : 'Tighten', T.good),
        res('One target', win === 1 ? 'Track slot #' + Math.min(10, serp + 1) : 'Bid on adjacent long-tail first', T.good),
        doc('SERP map', `${kw}: ${serp} page-1 domains, ${low} with authority < your site.\nPlay: ${play}`),
      ]
    },
  },
  {
    id: 'competitor-content-ideas-generator',
    name: 'Competitor Content Ideas Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Mines a competitor\u2019s content for one-step-better ideas \u2014 deeper, newer, more proof \u2014 and turns them into your content plan.',
    tip: 'The "one-step-better" rule: what they made, you make with the missing element (numbers, templates, FAQ answers) that the top result lacks.',
    usage: [
      'List what they published recently.',
      'Name the missing element per piece.',
      'Convert to your differentiated titles.',
    ],
    method: [
      'Each competitor piece is scored for a missing element.',
      'The one-step-better formula generates your title.',
      'Ideas are de-duplicated and prioritized by section.',
    ],
    fields: [
      txt('pieces23', 'Their recent pieces', 2, 'annual retainer pricing, hourly rate 2026, scope creep clauses'),
      txt('missing23', 'The missing element', 2, 'real numbers, downloadable template'),
      sel('deph23', 'Depth edge', ['More data', 'Template/sheet', 'Video walkthrough'], 'Template/sheet'),
    ],
    compute: (v) => {
      const pieces = (asStr(v.pieces23) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const missing = asStr(v.missing23) || 'real numbers'
      const depth = asSel(v.deph23)
      const ideas = pieces.slice(0, 4).map((p) => `${cap23(p)} \u2014 with ${missing} and a ${depth.toLowerCase()}.`)
      return [
        res('Candidate ideas', `${ideas.length}`, ideas.length >= 2 ? T.good : T.warn),
        res('Differentiator', depth, T.good),
        res('One-step-better', 'Depth beats wholesale', T.good),
        doc('Idea plan', ideas.join('\n')),
      ]
    },
  },
]

function cap23(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}