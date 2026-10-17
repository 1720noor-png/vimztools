import { ck, clamp, doc as docRes, dt, money, mxd, n, num, numD, pct, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec, Tone } from '../archetypes/spec'

const tone = (pass: boolean): Tone => (pass ? T.good : T.warn)

export const specs: OfficeToolSpec[] = [
  // ---------------- Public Relations ----------------
  {
    id: 'press-release-distribution-cost-estimator',
    archetype: 'est',
    blurb: 'Prices the press-release engine: writing, distribution, wire, syndication and placement yield.',
    fields: [n('a', 'Newsroom / writing cost', { def: 1200 }), n('b', 'Distribution product', { def: 1500 }), n('c', 'Wire service', { def: 800 }), n('d', 'Syndication / extras', { def: 400 }), n('e', 'Expected placements', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = Math.max(1, v.e as number)
      const total = a + b + c + d
      const cpp = total / e
      return [
        res('Total distribution cost', money(total), total <= 5000 ? T.good : total <= 8000 ? T.warn : T.bad, 'Anchor + wire typically runs $2k\u20134k per release.'),
        res('Placements expected', `${num(e, 0)} picks`, e >= 30 ? T.good : T.warn),
        res('Cost per placement', money(cpp), cpp <= 150 ? T.good : cpp <= 300 ? T.warn : T.bad),
        res('Write-vs-distribute', pct((a / total) * 100, 1), (a / total) * 100 <= 35 ? T.good : T.warn, 'If writing dominates, invest in a good bylined story.'),
      ]
    },
  },
  {
    id: 'media-impressions-to-pr-value-ave-calculator',
    archetype: 'est',
    blurb: 'Converts media impressions into an advertising-equivalent value to size earned coverage.',
    fields: [n('a', 'Impressions', { def: 650000 }), n('b', 'CPM / 1,000 impressions ($)', { def: 25 }), n('c', 'Engagement rate %', { def: 1.8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const ave = (a / 1000) * b
      const engaged = a * (c / 100)
      const cpe = engaged > 0 ? ave / engaged : 0
      return [
        res('AVE value', money(ave), ave > 0 ? T.good : T.neutral, 'AVE is directional; treat it as floor, not invoice.'),
        res('Engaged audience', `${num(Math.round(engaged), 0)}`, T.neutral),
        res('Cost per engaged user', money(cpe), cpe <= 1 ? T.good : cpe <= 3 ? T.warn : T.bad),
        res('Impressions', `${num(a, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'crisis-pr-sentiment-impact-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores crisis response across speed, message, empathy and monitoring to judge reputational impact.',
    fields: [mxd('m', 'Crisis dimensions', ['Dimension', 'Weight %', 'Score /10'], ['Response speed', 'Message consistency', 'Empathy & tone', 'Spokesperson credibility', 'Sentiment monitoring', 'Recovery narrative'], [[20, 6], [20, 8], [15, 7], [15, 8], [15, 7], [15, 6]]), sel('c', 'Crisis grade', ['Manageable', 'Escalating', 'Severe / existential'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Response speed', 'Message consistency', 'Empathy & tone', 'Spokesperson credibility', 'Sentiment monitoring', 'Recovery narrative']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const weak = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Crisis score', `${numD(score, 1)}/100`, score >= 75 ? T.good : score >= 50 ? T.warn : T.bad, `${v.c as string} \u2014 brief the war-room with this now.`),
        res('Weakest dimension', labels[weak], M[weak]?.[1] && M[weak]?.[1] < 6 ? T.bad : T.warn),
        res('Stake to protect', score < 50 ? 'Elevate to C-suite' : 'PR command handles', score >= 50 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'media-relations-journalist-database-indexer',
    archetype: 'log',
    blurb: 'Indexes a journalist database by beat to spot response gaps before you pitch.',
    fields: [mxd('m', 'Beats', ['Beat', 'Journalists logged', 'Pitches sent'], ['Technology', 'Finance', 'Health', 'Policy', 'Consumer'], [[38, 12], [29, 9], [21, 6], [14, 3], [26, 10]]), n('t', 'Target journalists', { def: 50 })],
    compute: (v) => {
      const M = v.m as number[][]
      const logged = M.reduce((s, r) => s + (r[0] || 0), 0)
      const pitched = M.reduce((s, r) => s + (r[1] || 0), 0)
      const t = Math.max(1, v.t as number)
      const rate = pitched / Math.max(1, logged) * 100
      const gap = Math.max(0, t - logged)
      return [
        res('Journalists logged', `${num(logged, 0)}`, logged >= t ? T.good : T.warn, `Coverage ${pct(clamp(logged / t * 100, 0, 100), 0)} of target.`),
        res('Pitch activation', pct(rate, 1), rate >= 35 ? T.good : rate >= 20 ? T.warn : T.bad, 'Under 20% of your list has ever been pitched.'),
        res('Beat gap', gap > 0 ? `+${num(gap, 0)} more needed` : 'Target met', gap === 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'corporate-brand-value-valuation-estimator',
    archetype: 'est',
    blurb: 'Estimates the monetary value of the brand from revenue, margins and brand contribution.',
    fields: [n('a', 'Annual revenue ($)', { def: 120000000 }), n('b', 'EBIT margin %', { def: 15 }), n('c', 'Brand contribution % of margin', { def: 30 }), n('d', 'Valuation multiple', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const ebit = a * (b / 100)
      const brandEarnings = ebit * (c / 100)
      const value = brandEarnings * d
      return [
        res('Brand value', money(value), value > 0 ? T.good : T.neutral, 'Annual brand earnings \u00d7 sector multiple.'),
        res('Brand earnings', money(brandEarnings)),
        res('Brand lift vs margins', pct((b * (c / 100)) / 10, 1), T.neutral),
        res('Multiple check', `${num(d, 0)}x`, d <= 15 ? T.good : d <= 20 ? T.warn : T.bad, 'Above 15x you are pricing momentum, not brand.'),
      ]
    },
  },
  {
    id: 'press-event-conference-roi-calculator',
    archetype: 'est',
    blurb: 'Measures a press event\u2019s ROI against media value, attendance and the leads it creates.',
    fields: [n('a', 'Event cost ($)', { def: 45000 }), n('b', 'Attendees', { def: 120 }), n('c', 'Media value generated ($)', { def: 80000 }), n('d', 'Qualified leads', { def: 18 }), n('e', 'Pipeline value ($)', { def: 250000 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const returns = c + e
      const roi = (returns - a) / a * 100
      const cpp = a / Math.max(1, b)
      return [
        res('ROI', pct(roi, 1), roi > 0 ? T.good : T.bad, 'Media value + pipeline \u00f7 event cost \u2212 1.'),
        res('Cost per attendee', money(cpp), cpp <= 500 ? T.good : cpp <= 800 ? T.warn : T.bad),
        res('Leads', `${num(d, 0)} qualified`, d >= 15 ? T.good : T.warn),
        res('Media cover value', money(c), c > a * 0.5 ? T.good : T.warn, 'Strong events pay for themselves in coverage alone.'),
      ]
    },
  },
  {
    id: 'corporate-sponsorship-roi-calculator',
    archetype: 'est',
    blurb: 'Sizes sponsorship ROI from the fee, activation and attributable revenue it drags in.',
    fields: [n('a', 'Sponsorship fee ($)', { def: 100000 }), n('b', 'Activation / build ($)', { def: 35000 }), n('c', 'Attributable revenue ($)', { def: 180000 }), n('d', 'Brand-lift impressions (M)', { def: 4 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const total = a + b
      const roi = ((c - total) / total) * 100
      const cpm = (total / (d * 1000000)) * 1000
      const back = c > 0 ? total / c : 0
      return [
        res('ROI', pct(roi, 1), roi > 0 ? T.good : T.bad, 'Fee + activation \u00f7 attributable revenue.'),
        res('Attributable revenue', money(c), c > total ? T.good : T.warn),
        res('Effective CPM', `${numD(cpm, 2)}`, cpm <= 50 ? T.good : cpm <= 100 ? T.warn : T.bad),
        res('Cash-back time', `${numD(back, 2)} yrs of revenue`, back <= 1 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'press-release-embargo-notification-generator',
    archetype: 'fmt',
    blurb: 'Prints an embargo notice with the release time, NDA and contact line for your media list.',
    fields: [txt('s', 'Story subject', 1, 'Acme opens EU headquarters'), txt('q', 'Spokesperson quote', 2, 'This brings us closer to customer time zones.'), txt('k', 'Key detail / stat', 1, '2,000 local users in first year'), dt('e', 'Embargo time (date)'), sel('t', 'Embargo type', ['News release', 'Executive announcement', 'Product drop'])],
    compute: (v) => {
      const s = v.s as string, q = v.q as string, k = v.k as string, e = v.e as string, t = v.t as string
      const emb = e ? new Date(e + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD'
      const filled = [s, q, k].filter((x) => x.trim() !== '').length
      const doc = `EMBARGOED UNTIL ${emb.toUpperCase()}\n\nTYPE: ${t}\nSUBJECT LINE: ${s || '(no title)'}\n\nFOR IMMEDIATE RELEASE: embargo lifts at the time above.\n\nHEADLINE:\n${s || '(title)'}\n\nWHAT IT IS\n${k || '(key detail)'}\n\nSPOKESPERSON QUOTE\n${q || '(quote)'}\n\nMEDIA CONTACTS\n- Primary: ______\n- Spokesperson availability: ______\n- B-roll / images: ______\n\nEMBARGO RULES\n1. No coverage before $date.\n2. Reporters may quote with attribution.\n3. Embargo list: see distribution manifest.`
      return [res('Completeness', `${filled}/3`, filled === 3 ? T.good : filled >= 2 ? T.warn : T.bad),
        res('Embargo', emb, T.neutral),
        docRes('Embargo notice', doc)]
    },
  },
  {
    id: 'pr-media-mentions-sentiment-analyzer',
    archetype: 'index',
    blurb: 'Rolls positive, neutral and negative mentions into a sentiment index to judge coverage health.',
    fields: [n('p', 'Positive mentions', { def: 84 }), n('n', 'Neutral mentions', { def: 42 }), n('g', 'Negative mentions', { def: 9 })],
    compute: (v) => {
      const p = v.p as number, n = v.n as number, g = v.g as number
      const total = p + n + g
      const pos = total ? (p / total) * 100 : 0
      const neg = total ? (g / total) * 100 : 0
      const idx = clamp((pos - neg) + 50, 0, 100)
      return [
        res('Sentiment index', pct(idx, 1), idx >= 70 ? T.good : idx >= 50 ? T.warn : T.bad, '50 = balanced; 70+ leans strongly positive.'),
        res('Positive share', pct(pos, 1), pos >= 60 ? T.good : T.warn),
        res('Negative share', pct(neg, 1), neg <= 10 ? T.good : T.warn, 'Track negative spikes against your own releases.'),
        res('Mentions', `${num(total, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'spokesperson-media-training-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores a spokesperson on message control, bridging, body language and live handling.',
    fields: [mxd('m', 'Skills', ['Skill', 'Weight %', 'Score /10'], ['Message control', 'Bridging technique', 'Body language', 'Live Q&A handling', 'On/off-record discipline', 'Crisis composure'], [[20, 8], [20, 7], [15, 8], [20, 6], [15, 8], [10, 6]]), sel('x', 'Experience', ['First-time', 'Seasoned exec', 'Keynote veteran'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Message control', 'Bridging technique', 'Body language', 'Live Q&A handling', 'On/off-record discipline', 'Crisis composure']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const weak = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Training score', `${numD(score, 1)}/100`, score >= 80 ? T.good : score >= 60 ? T.warn : T.bad, `${v.x as string} \u2014 book a mock session before the big one.`),
        res('Sharpest gap', labels[weak], M[weak]?.[1] && M[weak]?.[1] < 6 ? T.bad : T.warn),
        res('Rehearse', score < 70 ? '2 mock rounds recommended' : 'Ready for press', score >= 70 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'pr-crisis-response-time-benchmarker',
    archetype: 'est',
    blurb: 'Benchmarks time-to-first-statement against the 60-minute rule and flags escalation drift.',
    fields: [n('a', 'Time to first statement (min)', { def: 55 }), n('b', 'Statements issued (first 24h)', { def: 3 }), n('c', 'External inquiries', { def: 42 }), n('d', 'Policy target (min)', { def: 60 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const onTime = a <= d
      const cadence = c > 0 ? b / (c / c * 24) * c * 24 : b
      const perint = b ? (c / b) : c
      return [
        res('Time to statement', `${num(a, 0)} min`, onTime ? T.good : T.bad, 'First confirmed statement inside the golden hour.'),
        res('Policy target', `${num(d, 0)} min`, a <= d ? T.good : T.warn),
        res('Statements / inquiry', `1 : ${numD(perint, 1)}`, perint <= 20 ? T.good : perint <= 40 ? T.warn : T.bad, 'Drowning inbound means your narratives are thin.'),
        res('24h cadence', `${num(cadence, 0)} stmts/day`, cadence >= 3 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'corporate-award-application-tracker',
    archetype: 'tracker',
    blurb: 'Tracks a corporate award application by deadline, win-probability and review status.',
    fields: [dt('d', 'Application deadline'), n('p', 'Win probability %', { def: 45 }), sel('s', 'Status', ['Drafting', 'Submitted', 'Finalist', 'Shortlisted', 'Won'])],
    compute: (v) => {
      const d = v.d as string, p = v.p as number, s = v.s as string
      const dateStr = d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      const run = p >= 70 ? 'Chase entry carefully' : p >= 50 ? 'In the hunt' : 'Low odds - one entry max'
      return [
        res('Status', s, s === 'Won' ? T.good : s === 'Shortlisted' || s === 'Finalist' ? T.warn : T.neutral),
        res('Win probability', pct(clamp(p, 0, 100), 1), p >= 60 ? T.good : p >= 35 ? T.warn : T.bad),
        res('Strategy', run, p >= 50 ? T.good : T.neutral, 'Spread entries across awards, not eggs in one basket.'),
        res('Deadline', dateStr, T.neutral),
      ]
    },
  },
  {
    id: 'international-trade-show-booth-roi-calculator',
    archetype: 'est',
    blurb: 'Measures a trade-show booth\u2019s cost per lead and return from the deals it generates.',
    fields: [n('a', 'Total show cost ($)', { def: 85000 }), n('b', 'Visitors to booth', { def: 320 }), n('c', 'Qualified leads', { def: 64 }), n('d', 'Deals closed (est)', { def: 6 }), n('e', 'Avg deal value ($)', { def: 40000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = Math.max(1, v.c as number), d = v.d as number, e = v.e as number
      const revenue = d * e
      const cpl = a / c
      const roi = ((revenue - a) / a) * 100
      const conv = (d / c) * 100
      return [
        res('ROI', pct(roi, 1), roi > 0 ? T.good : T.bad, 'Deal value \u2212 booth cost \u00f7 booth cost.'),
        res('Cost per qualified lead', money(cpl), cpl <= 1500 ? T.good : cpl <= 2500 ? T.warn : T.bad),
        res('Lead-to-close', pct(conv, 1), conv >= 10 ? T.good : T.warn),
        res('Visitors', `${num(b, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'press-coverage-share-of-voice-sov-calculator',
    archetype: 'est',
    blurb: 'Computes your share of media coverage versus three competitors in a topic window.',
    fields: [n('a', 'Your mentions', { def: 120 }), n('b', 'Competitor A', { def: 150 }), n('c', 'Competitor B', { def: 90 }), n('d', 'Competitor C', { def: 60 }), n('e', 'Market / total pool', { def: 520 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const competitors = b + c + d
      const sov = (a / Math.max(1, e)) * 100
      const rel = competitors ? a / competitors : 1
      return [
        res('Your SOV', pct(sov, 1), sov >= 30 ? T.good : sov >= 20 ? T.warn : T.bad, 'Target #1 or #2 in topic coverage.'),
        res('vs top competitor', `${pct(rel * 100, 1)} of their volume`, rel >= 0.8 ? T.good : rel >= 0.5 ? T.warn : T.bad),
        res('Competitors total', `${num(competitors, 0)}`, T.neutral),
        res('Total pool', `${num(e, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'corporate-reputation-repair-cost-estimator',
    archetype: 'est',
    blurb: 'Prices the full reputational repair bill: media, legal, retention and rebrand response.',
    fields: [n('a', 'Crisis severity score', { def: 70 }), n('b', 'Media campaign cost ($)', { def: 120000 }), n('c', 'Legal / advisory ($)', { def: 90000 }), n('d', 'Retention & recruitment hit ($)', { def: 70000 }), n('e', 'Recovery horizon (months)', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const direct = b + c + d
      const sever = (a / 100) * direct
      const total = direct * (1 + a / 100) * (e / 12)
      const mo = total / Math.max(1, e)
      return [
        res('Repair bill', money(total), total > 0 ? T.good : T.neutral, 'Direct costs scale with crisis severity and horizon.'),
        res('Monthly burn', money(mo), T.neutral),
        res('Severity loading', pct(sever / Math.max(1, total) * 100, 1), T.neutral),
        res('Watch', a >= 70 ? 'Engage external PR' : 'In-house management', a >= 70 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'media-interview-prep-sheet-builder',
    archetype: 'fmt',
    blurb: 'Prints a one-page interview prep sheet with messages, bridges and traps for the spokesperson.',
    fields: [txt('t', 'Topic / outlet', 1, 'Market expansion interview - TechDaily'), txt('m', 'Key messages (one per line)', 4, 'We are local-first\nFocus on 2 markets this year'), txt('b', 'Bridges to use', 2, 'What matters for customers is\u2026'), txt('x', 'Trap questions to expect', 2, 'What about the last layoffs?'), sel('f', 'Format', ['TV / video', 'Print', 'Podcast', 'Radio'])],
    compute: (v) => {
      const t = v.t as string, m = v.m as string, b = v.b as string, x = v.x as string, f = v.f as string
      const msgs = m.split('\n').map((s) => s.trim()).filter(Boolean)
      const traps = x.split('\n').map((s) => s.trim()).filter(Boolean)
      const filled = [t, m, b, x].filter((s) => s.trim() !== '').length
      const doc = `INTERVIEW PREP \u00b7 ${f}\n\nMEDIUM / OUTLET\n${t || '(topic)'}\n\nKEY MESSAGES (repeat out loud)\n${msgs.length ? msgs.map((m2, i) => `${i + 1}. ${m2}`).join('\n') : '(add messages)'}  \n\nBRIDGES\n${b || '(add 2 bridges)'}\n\nANTICIPATE\n${traps.length ? traps.map((tr) => `- ${tr}`).join('\n') : '(add trap questions)'}\n\nRULES: 3 messages max. Bridge every question. Off-record: never in a foreign press room.\n\nContact: PR desk ______`
      return [res('Sheet complete', `${filled}/4`, filled === 4 ? T.good : filled >= 3 ? T.warn : T.bad),
        res('Messages', `${msgs.length}`, msgs.length <= 3 ? T.good : T.warn, '3-5 max or the spokes lose the throughline.'),
        docRes('Prep sheet', doc)]
    },
  },
  {
    id: 'global-brand-trademark-registration-planner',
    archetype: 'matrix',
    blurb: 'Plans multinational trademark filings by country with costs, classes and validity years.',
    fields: [mxd('m', 'Markets', ['Market', 'Filing cost ($)', 'Classes', 'Validity (yrs)'], ['US (USPTO)', 'EU (EUTM)', 'UK', 'China', 'Japan', 'Brasil'], [[1250, 2, 10], [1850, 2, 10], [800, 2, 10], [3000, 2, 10], [2400, 2, 10], [2100, 2, 10]]), n('b', 'Lawyer / agent fees ($/country)', { def: 1500 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['US (USPTO)', 'EU (EUTM)', 'UK', 'China', 'Japan', 'Brasil']
      const b = v.b as number
      const total = M.reduce((s, r) => s + (r[0] || 0) + b, 0)
      const classTotal = M.reduce((s, r) => s + (r[1] || 0), 0)
      const maxI = M.reduce((bi, r, i) => ((r[0] || 0) > (M[bi][0] || 0) ? i : bi), 0)
      const costPerClass = total / Math.max(1, classTotal)
      return [
        res('First-filing budget', money(total), costPerClass <= 4000 ? T.good : T.warn),
        res('Cost per class', money(costPerClass), T.neutral),
        res('Priciest market', labels[maxI], M[maxI][0] >= 2500 ? T.warn : T.good, 'China + EUTM combo covers most export routes.'),
        res('Total classes', `${num(classTotal, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'investor-relations-earnings-call-agenda-builder',
    archetype: 'fmt',
    blurb: 'Prints an earnings-call agenda with highlights, Q&A themes and the beat posture for IR.',
    fields: [txt('m', 'Metric highlights', 3, 'ARR up 22% YoY'), txt('g', 'Forward guidance', 2, 'Guiding 18-22% next quarter'), sel('b', 'Beat posture', ['Beat & raise', 'In line', 'Miss / reset']), txt('q', 'Anticipated Q&A (one per line)', 3, 'Guidance conservatism\nFX impact on margin')],
    compute: (v) => {
      const m = v.m as string, g = v.g as string, b = v.b as string, q = v.q as string
      const themes = q.split('\n').map((s) => s.trim()).filter(Boolean)
      const doc = `EARNINGS CALL AGENDA\n\nTONE: ${b}\n\n1. OPEN (3 min) - CFO: reconciles to the release; no new material.\n\n2. HIGHLIGHTS (8 min)\n${m || '(add highlights)'}\n\n3. FY OUTLOOK / GUIDANCE (3 min)\n${g || '(add guidance)'}\n\n4. Q&A (30 min)\n${themes.length ? themes.map((t) => `- ${t}`).join('\n') : '(add expected themes)'}  \n\n5. WRAP & IR CONTACTS\n- Create conference replay within 1 business day.\n- File 8-K exhibit; update IR site same day.\n\n#beatposture: ${b}`
      return [res('Posture', b, b === 'Beat & raise' ? T.good : b === 'In line' ? T.neutral : T.bad),
        res('Q&A themes', `${themes.length}`, themes.length >= 4 ? T.good : T.warn, 'Prepare a one-liner for each real analyst theme.'),
        docRes('Earnings agenda', doc)]
    },
  },
  {
    id: 'shareholder-cap-table-ownership-percentage',
    archetype: 'est',
    blurb: 'Computes a holder\u2019s ownership on current and fully-diluted share counts.',
    fields: [n('a', 'Shares you hold', { def: 120000 }), n('b', 'Shares outstanding', { def: 2000000 }), n('c', 'Options / warrants outstanding', { def: 200000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const simple = (a / b) * 100
      const diluted = (a / (b + c)) * 100
      const dil = simple > 0 ? ((simple - diluted) / simple) * 100 : 0
      return [
        res('Basic ownership', pct(simple, 2), simple >= 5 ? T.good : simple >= 1 ? T.warn : T.neutral),
        res('Fully diluted', pct(diluted, 2), dil <= 15 ? T.good : dil <= 30 ? T.warn : T.bad),
        res('Dilution drag', pct(dil, 1), T.neutral, 'Options dilate you more as the pool grows.'),
        res('Diluted pool', `${num(b + c, 0)} shares`, T.neutral),
      ]
    },
  },
  {
    id: 'investor-pitch-deck-financial-summary-formatter',
    archetype: 'fmt',
    blurb: 'Prints the financial summary slide of a pitch deck with the SaaS math an investor checks.',
    fields: [txt('r', 'Revenue story', 2, '$1.2M ARR, +45% QoQ'), txt('m', 'Unit economics', 2, 'CAC $800, LTV $6,400, payback 19 mo'), n('c', 'Cash position ($)', { def: 1500000 }), n('b', 'Monthly burn ($)', { def: 180000 }), sel('s', 'Stage', ['Seed', 'Series A', 'Series B'])],
    compute: (v) => {
      const r = v.r as string, m = v.m as string, c = v.c as number, b = v.b as number, s = v.s as string
      const runway = b > 0 ? c / b : 0
      const doc = `FINANCIAL SUMMARY \u00b7 ${s}\n\nREVENUE\n${r || '(revenue story)'}\n\nUNIT ECONOMICS\n${m || '(unit economics)'}\n\nBALANCE\n- Cash: $${num(c, 0)}\n- Monthly burn: $${num(b, 0)}\n- Runway: ${numD(runway, 1)} months\n\nKEY QUESTIONS INVESTORS ASK\n1. Rule of 40? Gross margin? Churn?\n2. How many quarters of runway?\n3. What is the financing use-case?`
      const ok = c >= b * 12
      return [res('Runway', `${numD(runway, 1)} months`, ok ? T.good : runway >= 6 ? T.warn : T.bad, 'Under 12 months gets flagged by every VC.'),
        res('Slider', s, T.neutral),
        docRes('Financial summary', doc)]
    },
  },
  {
    id: 'analyst-consensus-estimate-variance-calculator',
    archetype: 'est',
    blurb: 'Measures how far actual EPS land from street consensus and how wide the estimate spread is.',
    fields: [n('a', 'Consensus EPS', { def: 1.2 }), n('b', 'Actual EPS', { def: 1.35 }), n('c', 'High estimate', { def: 1.4 }), n('d', 'Low estimate', { def: 1.05 }), n('e', 'Analysts covering', { def: 14 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const surprise = ((b - a) / Math.max(1, a)) * 100
      const spread = ((c - d) / Math.max(1, a)) * 100
      return [
        res('Surprise', pct(surprise, 1, true), b >= a ? T.good : T.bad, 'Beat = positive surprise.'),
        res('Estimate spread', pct(spread, 1), spread <= 15 ? T.good : spread <= 30 ? T.warn : T.bad, 'Wide spreads signal deep uncertainty.'),
        res('Consensus vs actual', `${numD(b, 2)} vs ${numD(a, 2)}`, T.neutral),
        res('Coverage', `${num(e, 0)} analysts`, e >= 10 ? T.good : T.warn, 'Below 5 analysts your stock is under-covered.'),
      ]
    },
  },
  {
    id: 'public-company-annual-report-10-k-checklist',
    archetype: 'checklist',
    blurb: 'Runs the 10-K against the standard item sections so filing season doesn\u2019t surprise you.',
    fields: [ck('c', 'Items verified', ['Business description (Item 1)', 'Risk factors (Item 1A)', 'Unresolved staff comments', 'Properties (Item 2)', 'Legal proceedings', 'MD&A (Item 7)', 'Financial statements + notes', 'Controls & procedures', 'Audit committee report', 'Exhibits + certifications'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['Business description (Item 1)', 'Risk factors (Item 1A)', 'Unresolved staff comments', 'Properties (Item 2)', 'Legal proceedings', 'MD&A (Item 7)', 'Financial statements + notes', 'Controls & procedures', 'Audit committee report', 'Exhibits + certifications'].filter((_, i) => !items[i])
      const status = done === 10 ? 'Filing-ready' : done >= 8 ? 'Nearly there' : done >= 5 ? 'In work' : 'Early draft'
      return [
        res('10-K readiness', pct(done * 10, 1), done === 10 ? T.good : done >= 8 ? T.warn : T.bad),
        res('Status', status, done === 10 ? T.good : done >= 5 ? T.warn : T.bad),
        res('Gaps', missing.length ? missing.slice(0, 3).join('; ') : 'None', missing.length ? T.warn : T.good, 'MD&A is the highest-litigation-density section.'),
      ]
    },
  },
  {
    id: 'investor-shareholder-inquiries-tracker',
    archetype: 'tracker',
    blurb: 'Tracks a shareholder inquiry by type, aging and response posture for the IR desk.',
    fields: [dt('d', 'Received date'), n('o', 'Days open', { def: 3 }), sel('t', 'Type', ['Transfer / ownership', 'Proxy / voting', 'ESG request', 'Press inquiry', 'Regulatory'])],
    compute: (v) => {
      const d = v.d as string, o = v.o as number, t = v.t as string
      const dateStr = d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      const r = o <= 2 ? 'Respond promptly' : o <= 5 ? 'Within SLA' : 'Escalate to IR lead'
      return [
        res('Type', t, T.neutral),
        res('Aging', `${num(o, 0)} days`, o <= 2 ? T.good : o <= 5 ? T.warn : T.bad),
        res('Action', r, o <= 5 ? T.good : T.warn, 'Shareholder inquiries are also SEC disclosure triggers.'),
        res('Received', dateStr, T.neutral),
      ]
    },
  },
  {
    id: 'investor-data-room-document-indexer',
    archetype: 'log',
    blurb: 'Indexes the data room by document category and recency so diligence finds it all.',
    fields: [mxd('m', 'Categories', ['Category', 'Docs included', 'Current (<=90d)'], ['Financial statements', 'Legal & cap table', 'Commercial contracts', 'HR & compensation', 'ESG & compliance'], [[24, 18], [32, 20], [18, 12], [15, 9], [12, 10]]), n('t', 'Target current ratio %', { def: 80 })],
    compute: (v) => {
      const M = v.m as number[][]
      const incl = M.reduce((s, r) => s + (r[0] || 0), 0)
      const cur = M.reduce((s, r) => s + (r[1] || 0), 0)
      const ratio = incl ? (cur / incl) * 100 : 0
      const t = v.t as number
      const stale = M.filter((r) => (r[0] || 0) > 0 && ((r[1] || 0) / (r[0] || 0)) * 100 < 60).length
      return [
        res('Documents indexed', `${num(incl, 0)}`, incl > 0 ? T.good : T.warn),
        res('Current ratio', pct(ratio, 1), ratio >= t ? T.good : ratio >= 60 ? T.warn : T.bad, `Target ${num(t, 0)}%.`),
        res('Stale categories', `${num(stale, 0)}`, stale === 0 ? T.good : stale <= 1 ? T.warn : T.bad, 'Rotate stale folders monthly or diligence re-downloads everything.'),
      ]
    },
  },
  {
    id: 'share-repurchase-buyback-impact-estimator',
    archetype: 'est',
    blurb: 'Models EPS lift and cash outlay from a share repurchase program.',
    fields: [n('a', 'Shares outstanding', { def: 100000000 }), n('b', 'Repurchase (shares)', { def: 5000000 }), n('c', 'Buyback price ($)', { def: 40 }), n('d', 'Net income ($)', { def: 120000000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const cost = b * c
      const epsBefore = d / a
      const epsAfter = d / (a - b)
      const lift = ((epsAfter - epsBefore) / Math.max(1, epsBefore)) * 100
      const yr = Math.min(12, Math.max(1, Math.round(cost / (d * 0.3))))
      return [
        res('Buyback cost', money(cost), cost / Math.max(1, d) <= 0.5 ? T.good : T.warn, 'Cap buyback at a prudent share of free cash flow.'),
        res('EPS before', `${numD(epsBefore, 2)}`),
        res('EPS after', `${numD(epsAfter, 2)}`, epsAfter > epsBefore ? T.good : T.neutral),
        res('EPS lift', pct(lift, 1), lift > 0 ? T.good : T.warn, `~${num(yr, 0)} months of FCF-equivalent to fund.`),
      ]
    },
  },
  {
    id: 'institutional-investor-ownership-matrix',
    archetype: 'matrix',
    blurb: 'Maps top institutional holders, their share counts and quarterly changes to read momentum.',
    fields: [mxd('m', 'Top holders', ['Holder', 'Shares (M)', 'Change vs Q (M)'], ['Vanguard', 'BlackRock', 'State Street', 'Fidelity', 'Capital Group', 'Insider + 5%'], [[8.2, 0.4], [7.6, 0.2], [3.9, -0.1], [3.2, 0.3], [2.8, 0.1], [9.0, 0.0]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Vanguard', 'BlackRock', 'State Street', 'Fidelity', 'Capital Group', 'Insider + 5%']
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const netFlow = M.reduce((s, r) => s + (r[1] || 0), 0)
      const biggest = M.reduce((bi, r, i) => ((r[0] || 0) > (M[bi][0] || 0) ? i : bi), 0)
      const inst = total - (M[5]?.[0] || 0)
      return [
        res('Top-6 ownership', `${numD(total, 1)}M shares`),
        res('Net quarterly change', `${numD(netFlow, 1)}M`, netFlow >= 0 ? T.good : T.bad, 'Positive = accumulation; negative = rotation reading.'),
        res('Largest holder', labels[biggest], T.neutral),
        res('Institutional float', `${numD(inst, 1)}M`, T.neutral),
      ]
    },
  },
  {
    id: 'dividend-payout-ratio-and-yield-calculator',
    archetype: 'est',
    blurb: 'Derives payout ratio and yield from EPS, dividends per share and the share price.',
    fields: [n('a', 'EPS (trailing)', { def: 2.4 }), n('b', 'DPS (annual)', { def: 0.6 }), n('c', 'Share price ($)', { def: 30 }), n('d', 'Shares outstanding (M)', { def: 250 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const ratio = (b / a) * 100
      const yieldc = (b / c) * 100
      const total = b * d * 1000000
      return [
        res('Payout ratio', pct(ratio, 1), ratio <= 60 ? T.good : ratio <= 80 ? T.warn : T.bad, 'Over 80% leaves no reinvestment room.'),
        res('Dividend yield', pct(yieldc, 2), yieldc >= 2 && yieldc <= 6 ? T.good : T.warn),
        res('Total cash out', money(total), T.neutral),
        res('Coverage', `${numD(a / b, 1)}x earnings`, a / b >= 1.5 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'investor-relations-email-newsletter-formatter',
    archetype: 'fmt',
    blurb: 'Prints a shareholder newsletter draft with market update, events and the IR contact line.',
    fields: [txt('t', 'Month / headline', 1, 'Q3 update - 3 months to target'), txt('m', 'Market update', 3, 'Revenue up 9% QoQ, capex on plan.'), txt('e', 'Upcoming IR events', 2, 'Q3 call Oct 24 | Investor Day Nov 12'), sel('a', 'Audience', ['Retail shareholders', 'Institutions', 'Both'])],
    compute: (v) => {
      const t = v.t as string, m = v.m as string, e = v.e as string, a = v.a as string
      const doc = `INVESTOR NEWSLETTER \u00b7 ${t || '(issue)'}\n\nAUDIENCE: ${a}\n\nHEADLINE\n${t || '(headline)'}\n\nMARKET UPDATE\n${m || '(update)'}\n\nSAVE THE DATE\n${e || '(events)'}\n\nIR CONTACT\n- Email: ir@______\n- Website: investor.______\n- Forward-looking statement: advisory notice attached.\n\n_Send to list of ${a} addresses + archive to IR site._`
      return [res('Audience', a, T.neutral),
        res('Ready', t && m && e ? 'Send-ready' : 'Fill blanks', t && m && e ? T.good : T.warn),
        docRes('Newsletter draft', doc)]
    },
  },
  {
    id: 'shareholder-annual-general-meeting-agm-quorum-checker',
    archetype: 'est',
    blurb: 'Checks whether represented votes clear the AGM quorum threshold and what it takes.',
    fields: [n('a', 'Shares outstanding', { def: 100000000 }), n('b', 'Shares represented', { def: 73000000 }), n('c', 'Quorum threshold %', { def: 60 }), n('d', 'Votes needed for quorum', { def: 0 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const need = d > 0 ? d : a * (c / 100)
      const short = need - b
      const met = b >= need
      const turn = (b / a) * 100
      return [
        res('Quorum met', met ? 'Yes - meeting valid' : 'Shortfall', met ? T.good : T.bad),
        res('Represented', `${num(b, 0)} shares`, turn >= c ? T.good : T.warn),
        res('Turnout', pct(turn, 1), turn >= c ? T.good : T.warn),
        res('Need for quorum', `${num(need, 0)} shares`, T.neutral, short > 0 ? `${num(short, 0)} short of the mark.` : ''),
      ]
    },
  },
  {
    id: 'earnings-per-share-eps-basic-and-diluted-calculator',
    archetype: 'est',
    blurb: 'Computes basic and diluted EPS with preferred dividends stripped out.',
    fields: [n('a', 'Net income ($)', { def: 50000000 }), n('b', 'Preferred dividends ($)', { def: 2000000 }), n('c', 'Weighted avg shares (basic)', { def: 20000000 }), n('d', 'Dilutive securities (shares)', { def: 2500000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const toCommon = a - b
      const basic = toCommon / c
      const diluted = toCommon / (c + d)
      const dil = ((basic - diluted) / Math.max(1, basic)) * 100
      return [
        res('Basic EPS', `${numD(basic, 2)}`, basic > 0 ? T.good : T.bad),
        res('Diluted EPS', `${numD(diluted, 2)}`, dil <= 15 ? T.good : dil <= 25 ? T.warn : T.bad, 'Spread of contingent shares matters here.'),
        res('Dilution', pct(dil, 1), T.neutral),
        res('Earnings to common', money(toCommon), T.neutral),
      ]
    },
  },
  {
    id: 'esg-investor-sustainability-checklist',
    archetype: 'checklist',
    blurb: 'Scores ESG disclosure readiness for institutional investors against the standard pillars.',
    fields: [ck('c', 'Disclosed / ready', ['GHG emissions (Scope 1-3)', 'Climate transition plan', 'Water & waste metrics', 'Workforce safety (TRIR)', 'Pay equity & DEI data', 'Board diversity & tenure', 'Executive clawback policy', 'Supplier code & audits', 'Human rights due diligence', 'Third-party ESG assurance'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['GHG emissions (Scope 1-3)', 'Climate transition plan', 'Water & waste metrics', 'Workforce safety (TRIR)', 'Pay equity & DEI data', 'Board diversity & tenure', 'Executive clawback policy', 'Supplier code & audits', 'Human rights due diligence', 'Third-party ESG assurance'].filter((_, i) => !items[i])
      const label = done === 10 ? 'Disclosure leader' : done >= 7 ? 'Investor-grade' : done >= 4 ? 'Early-stage' : 'Gap year'
      return [
        res('ESG readiness', pct(done * 10, 1), done >= 8 ? T.good : done >= 5 ? T.warn : T.bad),
        res('Profile', label, done >= 8 ? T.good : T.warn),
        res('Gaps', missing.length ? missing.slice(0, 3).join('; ') : 'None', missing.length ? T.warn : T.good, 'Emissions and board data are the first asks.'),
      ]
    },
  },
  // ---------------- International Business ----------------
  {
    id: 'international-chamber-of-commerce-dispute-cost',
    archetype: 'est',
    blurb: 'Prices an ICC arbitration: fees, legal, hearings and the time-to-award window.',
    fields: [n('a', 'Claim amount ($)', { def: 800000 }), n('b', 'Admin & arbitrator fees %', { def: 12 }), n('c', 'Legal / expert cost ($)', { def: 120000 }), n('d', 'Hearing days (est)', { def: 10 }), n('e', 'Duration (months)', { def: 14 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const fees = a * (b / 100)
      const legal = c + d * 1500
      const total = fees + legal
      const share = (total / a) * 100
      const avgPerMo = total / Math.max(1, e)
      return [
        res('Total dispute cost', money(total), share <= 20 ? T.good : share <= 35 ? T.warn : T.bad, 'Fees + legal \u00f7 claim.'),
        res('Fees vs claim', pct(share, 1), T.good),
        res('Monthly burn', money(avgPerMo), T.neutral),
        res('Time value', `${num(e, 0)} months`, e <= 12 ? T.good : e <= 18 ? T.warn : T.bad, 'Locked capital is the quiet cost of arbitration.'),
      ]
    },
  },
  {
    id: 'corporate-foundation-grant-allocator',
    archetype: 'bdown',
    blurb: 'Splits the foundation budget across programs and rates each by applications received.',
    fields: [mxd('m', 'Programs', ['Program', 'Grant ($)', 'Applications'], ['Education', 'Community', 'Sustainability', 'Health', 'Disaster relief'], [[400000, 180], [300000, 120], [200000, 90], [250000, 140], [150000, 60]]), n('b', 'Foundation budget ($)', { def: 1400000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Education', 'Community', 'Sustainability', 'Health', 'Disaster relief']
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const apps = M.reduce((s, r) => s + (r[1] || 0), 0)
      const b = v.b as number
      const over = Math.max(0, total - b)
      const perApp = apps ? total / apps : 0
      const hot = M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Allocated', money(total), total <= b ? T.good : T.warn),
        res('Budget coverage', pct((total / b) * 100, 1), total <= b * 0.95 ? T.good : over > 0 ? T.warn : T.good, over > 0 ? `Exceeds budget by ${money(over)}.` : ''),
        res('Avg grant size', money(perApp)),
        res('Hottest program', labels[hot], T.neutral),
      ]
    },
  },
  {
    id: 'cross-border-fx-currency-conversion-loss-estimator',
    archetype: 'est',
    blurb: 'Prices the spread and timing loss on cross-border currency conversion to hedge or eat it.',
    fields: [n('a', 'Amount (USD)', { def: 500000 }), n('b', 'Spot rate to you', { def: 0.92 }), n('c', 'Booking rate', { def: 0.9 }), n('d', 'Volatility (monthly %)', { def: 2 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const spread = ((b - c) / Math.max(1, c)) * 100
      const loss = a * Math.abs(spread) / 100
      const varz = a * (d / 100)
      return [
        res('Conversion spread', pct(spread, 2), Math.abs(spread) <= 0.5 ? T.good : Math.abs(spread) <= 2 ? T.warn : T.bad, 'Banks quote 0.1-1% depending on size.'),
        res('Conversion cost', money(loss), T.neutral),
        res('Volatility risk/30d', `${money(varz)} ways`, T.neutral, 'This swings ±; hedge if your margin is thinner.'),
        res('Hedge gap', Math.abs(spread) > 1.5 || d >= 3 ? 'Consider forward cover' : 'Spot is fine', Math.abs(spread) > 1.5 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'global-timezone-meeting-scheduler',
    archetype: 'est',
    blurb: 'Finds the overlap window between two offices\u2019 working hours across time zones.',
    fields: [n('a', 'Your UTC offset (hrs)', { def: -5 }), n('b', 'Partner office offset', { def: 8 }), n('c', 'Your work start (local 24h)', { def: 9 }), n('d', 'Your work end (local)', { def: 18 }), n('e', 'Partner work end (local)', { def: 18 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const yourStartUtc = c - a
      const yourEndUtc = d - a
      const partStartUtc = 9 - b
      const partEndUtc = e - b
      const lo = Math.max(yourStartUtc, partStartUtc)
      const hi = Math.min(yourEndUtc, partEndUtc)
      const win = Math.max(0, hi - lo)
      const yourLocal = Math.max(c, lo + a)
      const meet = win > 0 ? `${clamp(lo + a, 0, 23)}:00 - ${clamp(hi + a, 0, 23)}:00 your time` : 'No overlap today'
      return [
        res('Overlap window', meet, win >= 3 ? T.good : win >= 1 ? T.warn : T.bad),
        res('Overlap hours', `${numD(win, 1)} hrs`, win >= 3 ? T.good : T.warn, 'Under 3 hours, alternate meetings between sides.'),
        res('UTC anchor', `09:00 - ${numD(hi, 1)} UTC`, T.neutral),
        res('Your local start', `${numD(yourLocal, 0)}:00`, T.neutral),
      ]
    },
  },
  {
    id: 'international-travel-visa-requirements-matrix',
    archetype: 'matrix',
    blurb: 'Plans business travel by country with visa processing days, cost and on-arrival access.',
    fields: [mxd('m', 'Destinations', ['Market', 'Processing (days)', 'eVisa cost ($)', 'On-arrival (1=yes)'], ['Singapore', 'Germany', 'Japan', 'Brazil', 'UAE', 'USA (ESTA)'], [[5, 35, 1], [20, 95, 0], [12, 60, 0], [25, 160, 0], [3, 20, 1], [2, 21, 1]]), n('t', 'Trip lead time before travel (days)', { def: 0 })],
    compute: (v) => {
      const M = v.m as number[][]
      const daysMax = M.reduce((s, r) => s + (r[0] || 0), 0) / M.length
      const cost = M.reduce((s, r) => s + (r[1] || 0), 0)
      const noArrival = M.filter((r) => (r[2] || 0) === 0).length
      const urgent = M.filter((r) => (r[0] || 0) > 3 && (r[2] || 0) === 0).length
      const t = v.t as number
      return [
        res('No-visa-on-arrival', `${num(noArrival, 0)}/6`, noArrival <= 2 ? T.good : noArrival <= 4 ? T.warn : T.bad),
        res('Avg processing', `${numD(daysMax, 1)} days`, daysMax <= 10 ? T.good : daysMax <= 20 ? T.warn : T.bad),
        res('Visa budget', money(cost)),
        res('Book-soon markets', `${num(urgent, 0)}`, urgent === 0 ? T.good : T.warn, t > 0 && t <= daysMax ? 'Start consular work now for those' : 'Lead time covers halts.'),
      ]
    },
  },
  {
    id: 'cross-cultural-business-etiquette-checker',
    archetype: 'scorecard',
    blurb: 'Scores cultural-fit risk on communication, hierarchy, pace and gift/norm expectations.',
    fields: [mxd('m', 'Dimensions', ['Dimension', 'Weight %', 'Score /10'], ['Communication style', 'Hierarchy & titles', 'Time perception', 'Negotiation pace', 'Gift & formality norms'], [[20, 7], [20, 6], [20, 7], [20, 6], [20, 7]]), sel('r', 'Market', ['Japan', 'Germany', 'Brazil', 'UAE', 'India', 'China'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Communication style', 'Hierarchy & titles', 'Time perception', 'Negotiation pace', 'Gift & formality norms']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const weak = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Etiquette fit', `${numD(score, 1)}/100`, score >= 70 ? T.good : score >= 50 ? T.warn : T.bad, `${v.r as string}: brief the team before first meetings.`),
        res('Sharpest risk', labels[weak], M[weak]?.[1] && M[weak]?.[1] < 6 ? T.warn : T.good),
        res('Action', score < 65 ? 'Book cultural briefing' : 'Local norms internalized', score >= 65 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'global-expat-tax-equalization-calculator',
    archetype: 'est',
    blurb: 'Sizes the tax-equalization top-up an expat package pays versus hypothetical home tax.',
    fields: [n('a', 'Actual host-country tax ($)', { def: 145000 }), n('b', 'Hypothetical home tax ($)', { def: 100000 }), n('c', 'Housing allowance ($)', { def: 45000 }), n('d', 'Schooling allowance ($)', { def: 25000 }), n('e', 'Repatriation bonus ($)', { def: 15000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const taxTopup = Math.max(0, a - b)
      const total = taxTopup + c + d + e
      const base = b + c + d
      return [
        res('Tax top-up', money(taxTopup), T.neutral, 'Host tax minus hypothetical home tax.'),
        res('Package cost/y', money(total), T.good),
        res('As % of home tax', pct((total / Math.max(1, base)) * 100, 1), T.neutral),
        res('Watch', taxTopup > base * 0.5 ? 'Review assignment length' : 'On plan', taxTopup <= base * 0.5 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'global-entity-formation-cost-matrix',
    archetype: 'matrix',
    blurb: 'Compares first-year cost and time to incorporate across candidate markets.',
    fields: [mxd('m', 'Markets', ['Market', 'Registration cost ($)', 'Compliance ($/yr)', 'Days to incorporate'], ['Germany (GmbH)', 'Singapore (Pte)', 'UAE (LLC)', 'India (Pvt)', 'USA (C-corp)', 'Netherlands (BV)'], [[3200, 9000, 30], [500, 4000, 5], [12000, 6000, 15], [2500, 3500, 20], [3000, 8000, 14], [1800, 6000, 21]]), n('h', 'Annual budget', { def: 25000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Germany (GmbH)', 'Singapore (Pte)', 'UAE (LLC)', 'India (Pvt)', 'USA (C-corp)', 'Netherlands (BV)']
      const total = M.map((r) => (r[0] || 0) + (r[1] || 0))
      const h = v.h as number
      const minI = total.reduce((bi, x, i) => (x < total[bi] ? i : bi), 0)
      const avgDays = M.reduce((s, r) => s + (r[2] || 0), 0) / M.length
      const sum = total.reduce((s, x) => s + x, 0)
      return [
        res('First-year total', money(sum), sum <= h ? T.good : T.warn),
        res('Cheapest market — ' + labels[minI], money(total[minI]), tone(total[minI] <= h)),
        res('Avg time to form', `${numD(avgDays, 1)} days`, avgDays <= 20 ? T.good : T.warn),
        res('Recurring burden', money(M.reduce((s, r) => s + (r[1] || 0), 0)), T.neutral),
      ]
    },
  },
  {
    id: 'international-freight-shipping-insurance-estimator',
    archetype: 'est',
    blurb: 'Prices freight insurance, transit cost and landed margin on an international shipment.',
    fields: [n('a', 'Cargo value ($)', { def: 120000 }), n('b', 'Freight cost ($)', { def: 24000 }), n('c', 'Insurance rate %', { def: 0.5 }), n('d', 'Transit (days)', { def: 21 }), n('e', 'Duty & taxes %', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const ins = a * (c / 100)
      const duty = (a + b) * (e / 100)
      const landed = a + b + ins + duty
      const perDay = landed / Math.max(1, d)
      return [
        res('Insurance', money(ins), c <= 1 ? T.good : T.warn, 'Under 0.5% if you tender properly.'),
        res('Landed cost', money(landed), T.good),
        res('Duty & taxes', money(duty), T.neutral),
        res('Carrying cost/day', money(perDay), T.neutral),
      ]
    },
  },
  {
    id: 'international-tariff-and-trade-war-risk-estimator',
    archetype: 'est',
    blurb: 'Sizes the duty exposure if tariffs spike and how much margin you need to absorb it.',
    fields: [n('a', 'Annual import value ($)', { def: 2000000 }), n('b', 'Current tariff %', { def: 7 }), n('c', 'Proposed tariff %', { def: 20 }), n('d', 'Dutiable share of value %', { def: 80 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const base = a * (d / 100) * (b / 100)
      const newt = a * (d / 100) * (c / 100)
      const add = newt - base
      const addShare = (add / a) * 100
      return [
        res('Current duty', money(base)),
        res('Projected duty', money(newt), add <= 0 ? T.good : T.warn),
        res('Incremental tariff load', money(add), add <= 0 ? T.good : T.bad),
        res('As % of import value', pct(addShare, 1), addShare <= 3 ? T.good : addShare <= 8 ? T.warn : T.bad),
        res('Mitigation', add > 0 ? 'Shift sourcing or seek exclusions' : 'No material shift', add <= 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'global-currency-exchange-risk-exposure-index',
    archetype: 'index',
    blurb: 'Scores net FX exposure against volatility and hedge coverage to index the risk left open.',
    fields: [n('a', 'Receivables (foreign) $', { def: 3000000 }), n('b', 'Payables (foreign) $', { def: 1800000 }), n('c', 'Volatility (annual %)', { def: 8 }), n('d', 'Hedged %', { def: 60 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const net = Math.abs(a - b)
      const open = net * (1 - d / 100)
      const varVal = open * (c / 100)
      const idx = clamp(Math.min(100, (varVal / Math.max(1, a)) * 120), 0, 100)
      return [
        res('FX exposure index', pct(idx, 1), idx <= 30 ? T.good : idx <= 55 ? T.warn : T.bad, 'Value-at-risk style gauge of unhedged swing.'),
        res('Open exposure', money(open), d >= 70 ? T.good : T.warn),
        res('Annual swing risk', money(varVal), T.neutral),
        res('Hedge coverage', pct(clamp(d, 0, 100), 1), d >= 70 ? T.good : d >= 40 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'international-subsidiary-management-fee-formatter',
    archetype: 'fmt',
    blurb: 'Prints a management-fee memo for intercompany service charges between HQ and a subsidiary.',
    fields: [txt('s', 'Subsidiary', 1, 'Acme GmbH (Germany)'), txt('sv', 'Services provided', 3, 'Group IT, treasury, procurement'), n('f', 'Annual fee ($)', { def: 180000 }), txt('t', 'Billing terms', 1, 'Quarterly in advance'), sel('c', 'Currency', ['Same as fee (USD)', 'Settle in EUR', 'Settle in pro-rata mix'])],
    compute: (v) => {
      const s = v.s as string, sv = v.sv as string, f = v.f as number, t = v.t as string, c = v.c as string
      const quarter = f / 4
      const memo = `INTERCOMPANY MANAGEMENT FEE MEMO\n\nFROM: Acme Group HQ\nTO: ${s || '(subsidiary)'}\nSERVICE AGREEMENT: 2026-01 (annual)\n\nSERVICES\n${sv || '(list services)'}\n\nFEE\nAnnual: $${num(f, 0)}\nQuarterly invoice: $${num(quarter, 0)}\nTerms: ${t || '(terms)'}\nSettlement: ${c}\n\nTRANSFER PRICING NOTE\n- Arm\u2019s length test: benchmark cost + 5% markup retained.\n- Documentation: service description, cost basis, allocation key.\n- Invoice tags: MF-26- series with supporting file in data room.`
      return [res('Quarterly invoice', money(quarter), T.good),
        res('Settlement', c, T.neutral, 'Match intercompany currency to invoice to cut FX noise.'),
        docRes('Management fee memo', memo)]
    },
  },
  {
    id: 'global-mobility-tax-treaty-checker',
    archetype: 'checklist',
    blurb: 'Checks the tax-treaty gates a mobile assignee must clear to avoid double taxation.',
    fields: [ck('c', 'Checked', ['183-day rule satisfied', 'No permanent establishment (PE)', 'Treaty rate on dividends / royalties', 'Social-security totalization', 'Transfer pricing documentation', 'Payroll reporting in host country', 'Stay-day count log maintained', 'Host payroll / local entity linkage'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['183-day rule satisfied', 'No permanent establishment (PE)', 'Treaty rate on dividends / royalties', 'Social-security totalization', 'Transfer pricing documentation', 'Payroll reporting in host country', 'Stay-day count log maintained', 'Host payroll / local entity linkage'].filter((_, i) => !items[i])
      const risk = done >= 7 ? 'Treaty-covered' : done >= 5 ? 'Partial - counsel review' : 'High double-tax risk'
      return [
        res('Treaty health', pct(done * 12.5, 1), done >= 7 ? T.good : done >= 5 ? T.warn : T.bad),
        res('Assessment', risk, risk === 'Treaty-covered' ? T.good : risk === 'Partial - counsel review' ? T.warn : T.bad, 'Track days in the calendar; counts decide treaty tests.'),
        res('Gaps', missing.length ? missing.slice(0, 3).join('; ') : 'None', missing.length ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'global-payroll-provider-cost-comparator',
    archetype: 'bdown',
    blurb: 'Compares global payroll providers by annual fee and country coverage to pick the best value.',
    fields: [mxd('m', 'Providers', ['Provider', 'Annual fee ($)', 'Countries covered'], ['Provider A', 'Provider B', 'Provider C', 'Provider D'], [[220000, 48], [150000, 32], [190000, 45], [260000, 70]]), n('e', 'Headcount on payroll', { def: 600 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Provider A', 'Provider B', 'Provider C', 'Provider D']
      const per = M.map((r) => (r[0] || 0) / Math.max(1, (r[1] || 0)))
      const perHead = M.map((r) => (r[0] || 0) / Math.max(1, v.e as number))
      const minI = per.reduce((bi, x, i) => (x < per[bi] ? i : bi), 0)
      const costPerCountry = per[minI]
      const best = perHead[minI]
      return [
        res('Per country / $', `${numD(costPerCountry, 0)}`, M[minI][1] >= 40 ? T.good : T.warn, `Best value: ${labels[minI]} at $${num(costPerCountry, 0)}/country.`),
        res('Cheapest / head', `${numD(best, 0)}`, best <= 500 ? T.good : best <= 800 ? T.warn : T.bad),
        res('Countries coverage', `${num(M[minI][1], 0)}`, M[minI][1] >= 35 ? T.good : T.warn),
        res('Providers compared', `${num(M.length, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'sanctions-list-entity-checker',
    archetype: 'checklist',
    blurb: 'Runs the entity-screening gates against sanctions lists before you onboard a counterparty.',
    fields: [ck('c', 'Verified', ['Exact name match (all lists)', 'Same DOB / entity no.', 'Parent & subsidiary check', 'PEP / derogatory media', 'Alphabetical variants scanned', 'Screening frequency > quarterly', 'PII stored & retained per law', 'False-positive handling logged'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['Exact name match (all lists)', 'Same DOB / entity no.', 'Parent & subsidiary check', 'PEP / derogatory media', 'Alphabetical variants scanned', 'Screening frequency > quarterly', 'PII stored & retained per law', 'False-positive handling logged'].filter((_, i) => !items[i])
      const clear = done === 8 ? 'Clear to onboard' : done >= 6 ? 'Conditional - escalate' : 'Freeze engagement'
      return [
        res('Screening coverage', pct(done * 12.5, 1), done === 8 ? T.good : done >= 6 ? T.warn : T.bad),
        res('Verdict', clear, clear === 'Clear to onboard' ? T.good : clear === 'Conditional - escalate' ? T.warn : T.bad, 'Any unresolved hit = stop money movement.'),
        res('Gaps', missing.length ? missing.join('; ') : 'None', missing.length ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'foreign-direct-investment-fdi-incentive-checker',
    archetype: 'est',
    blurb: 'Estimates the incentive a direct investment can claim based on project scale and jobs.',
    fields: [n('a', 'Project investment ($)', { def: 6000000 }), n('b', 'Jobs created', { def: 80 }), n('c', 'Avg wage ($/yr)', { def: 45000 }), n('d', 'Incentive % of capex', { def: 12 }), n('e', 'Target zone bonus %', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const grant = a * ((d + e) / 100)
      const wageBill = b * c
      const effSubsidy = (grant / Math.max(1, wageBill + a)) * 100
      const payback = a / Math.max(1, (wageBill + grant) * (d / 100 > 0 ? 1 : 1))
      return [
        res('Estimated incentive', money(grant), grant > 0 ? T.good : T.warn, 'Capex + jobs \u00d7 incentive + zone bonus.'),
        res('Effective subsidy', pct(effSubsidy, 1), effSubsidy >= 5 ? T.good : T.warn),
        res('Jobs created', `${num(b, 0)}`, b >= 50 ? T.good : T.warn, 'Wage bill: ' + money(wageBill)),
        res('Ask leverage', pct((d + e), 1), (d + e) <= 25 ? T.good : T.warn),
        res('Payback proxy', `${numD(payback, 1)} yrs`, T.neutral),
      ]
    },
  },
  {
    id: 'global-expansion-labor-cost-index',
    archetype: 'matrix',
    blurb: 'Builds a comparable labor-cost index from salaries and employer burden across markets.',
    fields: [mxd('m', 'Markets', ['Market', 'Base salary ($)', 'Employer burden %'], ['USA', 'Germany', 'India', 'Brazil', 'Vietnam', 'Poland'], [[95000, 16], [72000, 25], [28000, 20], [40000, 38], [22000, 16], [45000, 27]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['USA', 'Germany', 'India', 'Brazil', 'Vietnam', 'Poland']
      const cost = M.map((r) => (r[0] || 0) * (1 + (r[1] || 0) / 100))
      const total = cost.reduce((s, x) => s + x, 0)
      const us = cost[0] || 1
      const idx = cost.map((x) => (x / us) * 100)
      const minIdx = idx.reduce((bi, x, i) => (x < idx[bi] ? i : bi), 0)
      return [
        res('Avg loaded cost', money(total / M.length)),
        res('Cheapest loaded', money(cost[minIdx]), tone(cost[minIdx] <= us), labels[minIdx]),
        res('Index vs USA', `${numD(idx[minIdx], 0)}%`, T.neutral, 'Cheapest market is ' + Math.round(idx[minIdx]) + '% of US cost.'),
        res('US benchmark', money(us), T.neutral),
        res('Dispersion', pct((1 - (Math.min(...cost) / Math.max(...cost))) * 100, 1), T.neutral),
      ]
    },
  },
  {
    id: 'international-wire-transfer-swift-fee-calculator',
    archetype: 'est',
    blurb: 'Counts the total cost of an international wire: fixed fees, correspondent legs and FX spread.',
    fields: [n('a', 'Amount to send ($)', { def: 200000 }), n('b', 'Transfer fee ($)', { def: 25 }), n('c', 'Correspondent fee ($)', { def: 15 }), n('d', 'FX spread %', { def: 0.4 }), n('e', 'Intermediary count', { def: 2 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const fixed = b + e * c
      const spread = a * (d / 100)
      const total = fixed + spread
      const arrival = a - total
      const eff = (total / a) * 100
      return [
        res('Total wire cost', money(total), eff <= 0.5 ? T.good : eff <= 1.5 ? T.warn : T.bad, `${num(e, 0)} legs \u00b7 fixed ${money(fixed)}.`),
        res('Effective % of amount', pct(eff, 2), T.neutral),
        res('Recipient receives', money(arrival), T.good),
        res('Avoid', e >= 3 ? 'Use a direct FX corridor' : 'Correspondent chain fine', e >= 3 ? T.warn : T.good, 'Each intermediary leg usually adds $10-20.'),
      ]
    },
  },
  {
    id: 'international-patent-pct-filing-cost-estimator',
    archetype: 'est',
    blurb: 'Estimates PCT filing plus national-phase entry costs across a target market list.',
    fields: [n('a', 'PCT international stage ($)', { def: 4500 }), n('b', 'National phases entered', { def: 4 }), n('c', 'Per-phase cost ($)', { def: 12000 }), n('d', 'Examiner / counsel ($)', { def: 25000 }), n('e', 'Annuity yrs to maintain', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const phases = b * c
      const annuities = b * 800 * e
      const toGrant = a + phases + d
      const lifetime = toGrant + annuities
      const perMarket = lifetime / Math.max(1, b)
      return [
        res('To grant', money(toGrant), T.good),
        res('Lifetime (with annuities)', money(lifetime), T.neutral),
        res('Per-market cost', money(perMarket), perMarket <= 30000 ? T.good : perMarket <= 45000 ? T.warn : T.bad, 'Annuities quietly double the bill.'),
        res('Phases', `${num(b, 0)}`, b <= 5 ? T.good : b <= 8 ? T.warn : T.bad, 'Each phase adds filing + local agent costs.'),
      ]
    },
  },
]