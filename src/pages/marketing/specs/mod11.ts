import { n, sel, txt, ck, res, doc, T, asNum, asSel, asStr, asBoolList, clamp, pct, num, ratio } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Conversion & CRO'

function pooled(p1: number, n1: number, p2: number, n2: number): number {
  const pc = (p1 * n1 + p2 * n2) / (n1 + n2)
  const se = Math.sqrt(pc * (1 - pc) * (1 / n1 + 1 / n2))
  return se === 0 ? 0 : (p1 - p2) / se
}

export const mod11: MarketingSeoSpec[] = [
  {
    id: 'conversion-rate-calculator',
    name: 'Conversion Rate Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Converts visitors, leads and orders into the core conversion metric and shows the revenue lift of every added point.',
    tip: 'Each +1% added to conversion typically beats a 10% traffic boost for revenue \u2014 fix rate before scaling spend.',
    usage: [
      'Enter sessions and conversions.',
      'Run the rate + revenue lift maths.',
      'Set a rate target and read the backlog.',
    ],
    method: [
      'CR is orders divided by sessions, expressed per 100.',
      'Lift calculation projects revenue at target rates on your average order value.',
      'The traffic-to-conversion gap flags which lever to pull first.',
    ],
    fields: [
      n('vis11', 'Sessions', { def: 5200, min: 1 }),
      n('conv11', 'Completed conversions', { def: 156, min: 0 }),
      n('aov11', 'Average order value ($)', { def: 64, min: 0 }),
      n('bounce11', 'Bounce rate (%)', { def: 61, min: 0, max: 100 }),
    ],
    compute: (v) => {
      const vis = asNum(v.vis11)
      const conv = asNum(v.conv11)
      const aov = asNum(v.aov11)
      const bounce = asNum(v.bounce11)
      const cr = conv / vis
      const rev = cr * aov
      const target = cr + 0.01
      const lift = (target - cr) * vis * aov
      const engaged = (1 - bounce / 100) * vis
      return [
        res('Conversion rate', pct(cr * 100), cr >= 0.03 ? T.good : cr >= 0.012 ? T.warn : T.bad),
        res('Revenue per session', '$' + rev.toFixed(2)),
        res('+1pp lift revenue', '$' + Math.round(lift).toLocaleString(), T.good, 'What one extra point is worth'),
        res('Engaged visitors', num(engaged), engaged > 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'landing-page-analyzer',
    name: 'Landing Page Analyzer',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores a landing page against the conversion essentials \u2014 clarity, load, one CTA, social proof and mobile fit.',
    tip: 'Clarity beats persuasion: if a visitor can\u2019t state your offer in 5 seconds, the copy is the bottleneck, not the traffic.',
    usage: [
      'Read your page and answer the signal inputs.',
      'Run the conversion scorecard.',
      'Fix the worst-scoring block first.',
    ],
    method: [
      'Five conversion pillars are weighted by their historical lift.',
      'Load-time and above-the-fold inputs model real drop-off.',
      'A single CTA bonus rewards page focus.',
    ],
    fields: [
      sel('clarity11', 'Offer clarity in 5s', ['Crystal clear', 'Fairly clear', 'Vague'], 'Fairly clear'),
      n('load11', 'Load time (s)', { def: 3.2, min: 0.5, max: 15, step: 0.1 }),
      sel('cta11', 'Primary CTA count', ['One', 'Two', 'Three+'], 'One'),
      sel('proof11', 'Social proof above fold', ['Reviews + logos', 'Reviews', 'None'], 'Reviews + logos'),
      n('mobile11', 'Mobile UX score', { def: 70, min: 0, max: 100 }),
    ],
    compute: (v) => {
      let s = 0
      const clarity = asSel(v.clarity11)
      s += clarity === 'Crystal clear' ? 22 : clarity === 'Fairly clear' ? 14 : 6
      const load = asNum(v.load11)
      s += load <= 2.5 ? 16 : load <= 4 ? 11 : 5
      s += asSel(v.cta11) === 'One' ? 18 : asSel(v.cta11) === 'Two' ? 11 : 5
      s += asSel(v.proof11) === 'Reviews + logos' ? 16 : asSel(v.proof11) === 'Reviews' ? 10 : 3
      s += asNum(v.mobile11) / 100 * 18
      const score = Math.round(clamp(s, 0, 100))
      return [
        res('Landing score', `${score}/100`, score >= 75 ? T.good : score >= 45 ? T.warn : T.bad),
        res('Focus', asSel(v.cta11) === 'One' ? 'Single CTA' : 'Scattered', asSel(v.cta11) === 'One' ? T.good : T.warn),
        res('Bottleneck', load > 4 ? 'Load time' : clarity !== 'Crystal clear' ? 'Clarity' : asNum(v.mobile11) < 60 ? 'Mobile' : asSel(v.proof11) === 'None' ? 'Proof' : 'A/B test', s >= 75 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'cro-cta-generator',
    name: 'CTA Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Crafts benefit-outcome CTA buttons across verb styles, tuned by how close your visitor is to buying.',
    tip: 'CTA strength is outcome-first + risk-reduction; \u201cStart my free trial, no card needed\u201d is a full value proposition in a button.',
    usage: [
      'Name the desired conversion.',
      'Set the visitor\u2019s readiness stage.',
      'Test 2-3 variants against the current button.',
    ],
    method: [
      'Stage drives verb intensity from "learn" to "buy".',
      'Outcome-first variants name the post-click reward.',
      'Risk-reduction variants attach assurances to the button.',
    ],
    fields: [
      txt('goal11', 'Conversion goal', 2, 'start a 14-day free trial'),
      sel('stage11', 'Readiness stage', ['Cold aware', 'Warm considering', 'Hot ready'], 'Warm considering'),
    ],
    compute: (v) => {
      const goal = asStr(v.goal11) || 'take the next step'
      const stage = asSel(v.stage11)
      const cold = [`See how ${goal} works`, `Learn about ${goal.replace('start a ', '')}`, `Explore the features`]
      const warm = [`Start my free ${goal.includes('trial') ? 'trial' : 'plan'}`, `Claim ${goal}`, `Set up ${goal.replace('start a ', '')} free`]
      const hot = [`Start ${goal} now`, `Get access \u2014 no card`, `Lock in today's price`]
      const pick = stage === 'Cold aware' ? cold : stage === 'Hot ready' ? hot : warm
      return [
        res('Stage match', stage, T.good),
        res('Variants', `${pick.length}`, T.good, 'A/B against your current button'),
        doc('CTA variants', pick.map((p, i) => `${i + 1}. ${p}`).join('\n')),
      ]
    },
  },
  {
    id: 'cta-strength-checker',
    name: 'CTA Strength Checker',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb:
      'Scores your call-to-action against the six markers of a high-converting button \u2014 verb, outcome, risk, contrast, size and place.',
    tip: 'One change people always miss: the CTA must be visible from the first fold and rendered on mobile tap-size (44px).',
    usage: [
      'Write or paste in your current CTA.',
      'Tick the strength markers you have.',
      'Strengthen only the missing markers.',
    ],
    method: [
      'Each marker is a proven CTA conversion lever.',
      'Weak markers halve predicted click-through.',
      'The score directly maps to a 3-action shortlist.',
    ],
    fields: [
      txt('cta11x', 'Your CTA', 2, 'Submit'),
      ck('mark11', 'Strength markers present', ['Action verb', 'Outcome named', 'Risk reduced', 'High-contrast colour', 'Big enough to tap', 'Above the fold']),
    ],
    compute: (v) => {
      const on = asBoolList(v.mark11).filter(Boolean).length
      const all = asBoolList(v.mark11).length
      const score = Math.round(on * 100 / all)
      const missing = ['Action verb', 'Outcome named', 'Risk reduced', 'High contrast', 'Tap size', 'Above fold'].filter((_, i) => !asBoolList(v.mark11)[i])
      return [
        res('CTA strength', `${score}%`, score >= 70 ? T.good : score >= 40 ? T.warn : T.bad),
        res('Markers', `${on}/${all}`),
        doc('Add these', missing.length ? missing.map((m) => `\u2022 ${m}`).join('\n') : 'Full-strength CTA \u2014 test inflated confidence now.'),
      ]
    },
  },
  {
    id: 'landing-page-headline-generator',
    name: 'Landing Page Headline Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Writes results-first headline candidates from your metric promise, using formula, question and contrast frameworks.',
    tip: 'Lead with the outcome your customer sees, in their words \u2014 pull phrasing straight from a recent feature call.',
    usage: [
      'State the core promise and the proof number.',
      'Generate across three formula families.',
      'Heatmap-test the two strongest.',
    ],
    method: [
      'Each family presses a different persuasion trigger.',
      'Numbers appear verbatim to trigger specificity.',
      'The contrast family frames before/after tension.',
    ],
    fields: [
      txt('prom11', 'Core promise', 2, 'cut reporting time by 8 hours a month'),
      n('num11', 'Proof number (hint)', { def: 31, min: 0 }),
      txt('aud11', 'Audience', 2, 'growth marketers'),
    ],
    compute: (v) => {
      const prom = asStr(v.prom11) || 'your promise'
      const nk = asNum(v.num11)
      const aud = asStr(v.aud11) || 'your audience'
      const heads = [
        `How ${aud} ${prom.replace(/cut /, '').replace(/\w+ \w+ hours/, nk + ' hours')} \u2014 in 3 steps`,
        `Stop losing ${nk} hours a month to ${prom.split(' by ')[1] ?? 'busywork'}`,
        `${prom[0].toUpperCase() + prom.slice(1)}: the playbook used by ${nk}+ teams`,
      ]
      return [
        res('Headlines', `${heads.length}`, T.good),
        res('Formula', 'How + difference + playbook', T.good),
        res('Specificity', `Number used: ${nk}`, T.good),
        doc('Headline candidates', heads.join('\n')),
      ]
    },
  },
  {
    id: 'ab-test-calculator',
    name: 'A/B Test Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Determines whether your A/B experiment has reached statistical significance and guides the winning decision with uplift maths.',
    tip: 'Never call a winner under 95% confidence \u2014 early "significant" results flip direction in up to a third of tests.',
    usage: [
      'Enter conversions for the control and variant.',
      'Read the significance verdict.',
      'Activate only on a "confident winner".',
    ],
    method: [
      'Two-proportion z-test computes the z-statistic.',
      'The p-value threshold maps to a 95% confidence verdict.',
      'Relative uplift is reported alongside absolute lift.',
    ],
    fields: [
      n('cn11', 'Control conversions', { def: 320, min: 0 }),
      n('vn11', 'Variant conversions', { def: 348, min: 0 }),
      n('tn11', 'Visitors in test', { def: 9000, min: 1 }),
    ],
    compute: (v) => {
      const c = asNum(v.cn11)
      const vn = asNum(v.vn11)
      const t = asNum(v.tn11)
      const p1 = c / t
      const p2 = vn / t
      const z = Math.abs(pooled(p1, t, p2, t)) || 0
      const sig95 = z >= 1.96
      const uplift = (p2 - p1) / (p1 || 1) * 100
      return [
        res('Conversion (control)', pct(p1 * 100, 2)),
        res('Conversion (variant)', pct(p2 * 100, 2), sig95 ? T.good : T.warn),
        res('Z-score', ratio(z, 2), sig95 ? T.good : T.warn, '>= 1.96 needs 95% confidence'),
        res('Verdict', sig95 ? 'Confident winner' : 'Keep running', sig95 ? T.good : T.warn, `Relative ${uplift >= 0 ? '' : '- '}${(Math.abs(uplift)).toFixed(1)}%`),
      ]
    },
  },
  {
    id: 'ab-test-sample-size-calculator',
    name: 'A/B Test Sample Size Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb:
      'Tells you how many visitors each variant needs before you can trust a result, based on your baseline and expected lift.',
    tip: 'Budget 2-3x the minimum sample: tests usually need more data when real-world traffic wobbles mid-run.',
    usage: [
      'Enter the baseline conversion and the lift you expect.',
      'Set significance and power.',
      'Schedule the test duration from your traffic level.',
    ],
    method: [
      'Uses the classic two-proportion power formula.',
      'Higher expected lift shrinks the sample needed.',
      'Duration is derived by dividing sample by daily visitors.',
    ],
    fields: [
      n('base11', 'Baseline conversion (%)', { def: 3.5, min: 0.1, max: 50, step: 0.1 }),
      n('lift11', 'Expected relative lift (%)', { def: 15, min: 1, max: 100 }),
      n('daily11', 'Daily visitors', { def: 1500, min: 1 }),
      sel('pow11', 'Power', ['80%', '90%', '95%'], '80%'),
    ],
    compute: (v) => {
      const p1 = asNum(v.base11) / 100
      const lift = asNum(v.lift11) / 100
      const p2 = p1 * (1 + lift)
      const daily = asNum(v.daily11)
      const pow = asSel(v.pow11) === '95%' ? 1.645 : asSel(v.pow11) === '90%' ? 1.28 : 0.84
      const za = 1.96
      const pbar = (p1 + p2) / 2
      const diff = p2 - p1
      const se = Math.sqrt(2 * pbar * (1 - pbar))
      const nPer = Math.ceil(((za * se + pow * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) / diff) ** 2)
      const total = nPer * 2
      const days = Math.max(1, Math.ceil(total / daily))
      return [
        res('Per variant', `${nPer.toLocaleString()} visitors`, T.good),
        res('Total test', `${total.toLocaleString()}`, T.good),
        res('At your traffic', `${days} days`, days <= 28 ? T.good : T.warn, 'Over 30 days risks drift'),
      ]
    },
  },
  {
    id: 'form-conversion-analyzer',
    name: 'Form Conversion Analyzer',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Models the impact of form-length and friction on completion rate, and pairs it with field-by-field dropout reasoning.',
    tip: 'Cut the form to 3 essential fields and auto-fill geo data; every extra field costs ~2-5% completion on average.',
    usage: [
      'Enter views, starts and completions.',
      'Note your current field count.',
      'Project the completion lift of a shorter form.',
    ],
    method: [
      'Start rate and completion rate are derived separately to isolate friction.',
      'Field-count penalty follows a diminishing drop curve.',
      'The model projects completions gained by trim.',
    ],
    fields: [
      n('views11', 'Form views', { def: 3000, min: 1 }),
      n('starts11', 'Started filling', { def: 1900, min: 0 }),
      n('done11', 'Completed', { def: 820, min: 0 }),
      n('fields11', 'Field count', { def: 6, min: 1, max: 15 }),
    ],
    compute: (v) => {
      const views = asNum(v.views11)
      const starts = asNum(v.starts11)
      const done = asNum(v.done11)
      const fields = asNum(v.fields11)
      const startRate = starts / views
      const compRate = done / starts || 0
      const fieldPenalty = Math.max(0.01, 0.72 - (fields - 3) * 0.035)
      const projected = done * (fieldPenalty / (compRate || 0.5))
      const gain = Math.max(0, Math.round(projected - done))
      return [
        res('Completion rate', pct(compRate * 100), compRate >= 0.5 ? T.good : compRate >= 0.3 ? T.warn : T.bad),
        res('Start rate', pct(startRate * 100), startRate >= 0.6 ? T.good : T.warn),
        res('Fields', `${fields}`, fields <= 4 ? T.good : T.warn),
        res('Trim to 3 fields', `+${gain} estimated completions`, gain > 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'checkout-conversion-calculator',
    name: 'Checkout Conversion Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Sizes abandoned-checkout revenue and projects recovery by payment-option and speed changes.',
    tip: 'Removing a single unneeded page from checkout typically recovers double-digit percentages of abandoned carts.',
    usage: [
      'Enter carts opened and paid.',
      'Read the abandoned revenue.',
      'Model the recovery lift scenario.',
    ],
    method: [
      'Abandonment is carts minus paid, priced by AOV.',
      'Recovery scales by a benchmark from 1-click retry.',
      'The two scenarios bracket realistic checkout gains.',
    ],
    fields: [
      n('carts11', 'Carts opened', { def: 2400, min: 1 }),
      n('paid11', 'Carts paid', { def: 720, min: 0 }),
      n('aov11c', 'Average order value ($)', { def: 58, min: 0 }),
    ],
    compute: (v) => {
      const carts = asNum(v.carts11)
      const paid = asNum(v.paid11)
      const aov = asNum(v.aov11c)
      const abandoned = carts - paid
      const conv = paid / carts
      const loss = abandoned * aov
      const recovered1 = loss * 0.08
      const recovered2 = loss * 0.16
      return [
        res('Checkout conversion', pct(conv * 100), conv >= 0.4 ? T.good : conv >= 0.25 ? T.warn : T.bad),
        res('Abandoned revenue', '$' + Math.round(loss).toLocaleString(), T.good, 'The prize on the table'),
        res('Light recovery (+8%)', '+$' + Math.round(recovered1).toLocaleString()),
        res('Strong recovery (+16%)', '+$' + Math.round(recovered2).toLocaleString(), T.good),
      ]
    },
  },
  {
    id: 'lead-conversion-calculator',
    name: 'Lead Conversion Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Converts leads, qualified leads and deals into stage conversion rates and shows which funnel leg is leaking revenue.',
    tip: 'If lead-to-qualified drops below 40%, your lead definition is wrong \u2014 tighten qualification before adding more top-of-funnel spend.',
    usage: [
      'Enter leads, qualified leads and won deals.',
      'Run the stage-rate maths.',
      'Attack the weakest stage first.',
    ],
    method: [
      'Each stage rate is the ratio of moving up one leg.',
      'Overall close rate is the compounded product.',
      'The weakest leg is highlighted for prioritization.',
    ],
    fields: [
      n('leads11', 'Marketing leads', { def: 900, min: 1 }),
      n('qual11', 'Qualified leads', { def: 405, min: 0 }),
      n('won11', 'Won deals', { def: 81, min: 0 }),
    ],
    compute: (v) => {
      const leads = asNum(v.leads11)
      const qual = asNum(v.qual11)
      const won = asNum(v.won11)
      const qRate = qual / leads
      const wRate = won / qual || 0
      const overall = qRate * wRate
      const leak = qRate < wRate ? 'Qualification' : wRate < qRate ? 'Closing' : 'Balanced'
      return [
        res('Lead \u2192 qualified', pct(qRate * 100), qRate >= 0.4 ? T.good : T.warn),
        res('Qualified \u2192 won', pct(wRate * 100), wRate >= 0.2 ? T.good : T.warn),
        res('Overall close rate', pct(overall * 100), overall >= 0.08 ? T.good : T.bad),
        res('Leakiest leg', leak, T.warn, 'Fix this stage first'),
      ]
    },
  },
  {
    id: 'funnel-conversion-calculator',
    name: 'Funnel Conversion Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb:
      'Chains the four main funnel stages \u2014 visitors, leads, qualified, customers \u2014 into one compounded drop-off view.',
    tip: 'Compounded funnels lie in the middle: a 50% dip at any stage is always the same severity as one at the top.',
    usage: [
      'Enter counts for all four stages.',
      'Read the per-stage and total retention.',
      'Graft the biggest drop-off column.',
    ],
    method: [
      'Stage retention is each step\u2019s consecutive ratio.',
      'Overall retention is every ratio multiplied.',
      'Visualized drop highlights where the most revenue vanishes.',
    ],
    fields: [
      n('fvs11', 'Visitors', { def: 10000, min: 1 }),
      n('fld11', 'Leads', { def: 1500, min: 0 }),
      n('fq11', 'Qualified', { def: 720, min: 0 }),
      n('fc11', 'Customers', { def: 252, min: 0 }),
    ],
    compute: (v) => {
      const vs = asNum(v.fvs11)
      const ld = asNum(v.fld11)
      const q = asNum(v.fq11)
      const c = asNum(v.fc11)
      const s1 = ld / vs
      const s2 = q / ld || 0
      const s3 = c / q || 0
      const steps = [Math.round(s1 * 100), Math.round(s2 * 100), Math.round(s3 * 100)]
      const worst = steps.indexOf(Math.min(...steps))
      const label = ['Visitor \u2192 lead', 'Lead \u2192 qualified', 'Qualified \u2192 customer'][worst]
      const bigDrop = steps[worst] < 40
      return [
        res('V \u2192 L', pct(s1 * 100), s1 >= 0.2 ? T.good : T.warn),
        res('L \u2192 Q', pct(s2 * 100), s2 >= 0.5 ? T.good : T.warn),
        res('Q \u2192 C', pct(s3 * 100), s3 >= 0.35 ? T.good : T.warn),
        res('Nastiest leg', label, bigDrop ? T.warn : T.good, bigDrop ? 'Leaking the most revenue' : 'Healthy chain'),
      ]
    },
  },
  {
    id: 'value-proposition-cro',
    name: 'Value Proposition Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a magnetic value proposition for your landing page using the benefit-Plus-pain-Plus-proof formula.',
    tip: 'A value proposition that names the number of the payoff converts radically better than an abstract mission statement.',
    usage: [
      'State the benefit and the pain it kills.',
      'Add the proof number.',
      'Drop the output under your H1.',
    ],
    method: [
      'Benefit phrasing uses customer-visible outcomes.',
      'Pain pairing removes the buy-in friction.',
      'A quantified proof anchors believability.',
    ],
    fields: [
      txt('ben11', 'Benefit', 2, 'cut customer response time in half'),
      txt('pain11', 'Pain it removes', 2, 'no more late-night support triage'),
      n('proof11v', 'Proof anchor (number)', { def: 42, min: 0 }),
      sel('aud11v', 'Audience', ['SaaS teams', 'Agencies', 'E-commerce', 'Freelancers'], 'SaaS teams'),
    ],
    compute: (v) => {
      const ben = asStr(v.ben11) || 'a measurable benefit'
      const pain = asStr(v.pain11) || 'a recurring pain'
      const nk = asNum(v.proof11v)
      const hits = [(ben[0]?.toUpperCase() ?? '') + ben.slice(1) + `, without ${pain}.`, `The fastest way to ${ben} \u2014 ${nk}% of teams confirm within a week.`, `Stop ${pain.replace(/^\w+ /, '')}; start ${ben}.`]
      return [
        res('Formula', 'Benefit + pain + proof', T.good),
        res('Proof anchored', `${nk}%`, T.good),
        doc('Value prop options', hits.join('\n')),
      ]
    },
  },
  {
    id: 'landing-page-copy-generator',
    name: 'Landing Page Copy Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Stitches a full landing page copy deck \u2014 H1, subhead, bullets, social proof and CTA \u2014 from your offer and goal.',
    tip: 'Write one page here, then clone the structure for every test variant \u2014 structure consistency makes A/B results readable.',
    usage: [
      'Describe the offer and target audience.',
      'Add proof and the single conversion goal.',
      'Assemble the piece into your landing template.',
    ],
    method: [
      'H1 leads with outcome; subhead resolves ambiguity.',
      'Bullets convert features to benefits with one line each.',
      'Proof and CTA close with qualified urgency.',
    ],
    fields: [
      txt('offer11c', 'Offer', 2, 'AI meeting notes with action items'),
      txt('tgt11c', 'Target audience', 2, 'remote team leads'),
      txt('pr11c', 'Proof', 2, 'used by 2,000+ distributed teams'),
      txt('goal11c', 'Conversion goal', 2, 'book a 15-min demo'),
    ],
    compute: (v) => {
      const offer = asStr(v.offer11c) || 'your offer'
      const tgt = asStr(v.tgt11c) || 'your ideal customer'
      const proof = asStr(v.pr11c) || 'loved by customers'
      const goal = asStr(v.goal11c) || 'get started'
      const raw = [
        `H1: ${offer} \u2014 built for ${tgt}`,
        `Sub: Setup in 4 minutes. Zero training time.`,
        '',
        'Bullets:',
        `\u2022 Captures decisions so nobody re-runs meetings`,
        `\u2022 Syncs with the tools you already use`,
        `\u2022 ${proof}`,
        '',
        `Proof strip: ${proof} \u00b7 4.8/5 \u00b7 Featured in 3 podcasts`,
        `CTA: [${goal}]  \u2014 free, no card needed.`,
      ].join('\n')
      return [
        res('Structure', 'H1 \u2192 bullets \u2192 proof \u2192 CTA', T.good),
        res('Conversion goal', goal, T.good),
        doc('Landing copy deck', raw),
      ]
    },
  },
]
