import { ck, clamp, doc as docRes, dt, days, money, moneyC, mx, mxd, n, num, numD, pct, ratio, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

function factN(x: number): number {
  let f = 1
  for (let i = 2; i <= x; i++) f *= i
  return f
}

function erlangCPC(A: number, m: number): number {
  let s = 0
  for (let k = 0; k < m; k++) s += Math.pow(A, k) / factN(k)
  const b = Math.pow(A, m) / factN(m)
  const p0 = 1 / (s + b * (m / (m - A)))
  return b * (m / (m - A)) * p0
}

export const specs: OfficeToolSpec[] = [
  // ---------------- Satisfaction & Sentiment ----------------
  {
    id: 'customer-satisfaction-csat-score-aggregator',
    archetype: 'est',
    blurb: 'Aggregates 1-5 star survey returns into a weighted CSAT, satisfaction share and response rate.',
    fields: [n('a', 'Surveys sent', { def: 600 }), n('b', 'Scores of 5', { def: 90 }), n('c', 'Scores of 4', { def: 40 }), n('d', 'Scores of 3', { def: 30 }), n('e', 'Scores of 2', { def: 20 }), n('f', 'Scores of 1', { def: 20 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number, f = v.f as number
      const nResp = b + c + d + e + f
      const csat = nResp ? (5 * b + 4 * c + 3 * d + 2 * e + 1 * f) / nResp : 0
      const satisfied = nResp ? ((b + c) / nResp) * 100 : 0
      const detract = nResp ? ((e + f) / nResp) * 100 : 0
      const respRate = a ? (nResp / a) * 100 : 0
      return [
        res('CSAT (avg /5)', numD(csat, 2), csat >= 4.2 ? T.good : csat >= 3.8 ? T.warn : T.bad),
        res('Satisfied (4-5 score)', pct(satisfied, 1), satisfied >= 80 ? T.good : satisfied >= 65 ? T.warn : T.bad),
        res('Detractor (1-2 score)', pct(detract, 1), detract <= 10 ? T.good : T.warn, 'Detractors over 10% need a follow-up lane.'),
        res('Response rate', pct(respRate, 1), respRate >= 35 ? T.good : respRate >= 20 ? T.warn : T.bad, 'A low response rate biases your CSAT up.'),
      ]
    },
  },
  {
    id: 'net-promoter-score-nps-calculator',
    archetype: 'index',
    blurb: 'Computes the classic NPS split between promoters, passives and detractors.',
    fields: [n('a', 'Promoters (9-10)', { def: 40 }), n('b', 'Passives (7-8)', { def: 35 }), n('c', 'Detractors (0-6)', { def: 25 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const n = a + b + c
      const nps = n ? (a - c) / n * 100 : 0
      const promo = n ? (a / n) * 100 : 0
      const det = n ? (c / n) * 100 : 0
      return [
        res('NPS score', `${numD(nps, 1)}`, nps >= 50 ? T.good : nps >= 0 ? T.warn : T.bad, 'Gauge clamps to 0-100; the raw score reads at left if negative.'),
        res('Promoter share', pct(promo, 1), promo >= 50 ? T.good : T.warn),
        res('Detractor share', pct(det, 1), det <= 20 ? T.good : T.warn),
        res('Responses', num(n, 0), T.neutral),
      ]
    },
  },
  {
    id: 'customer-effort-score-ces-calculator',
    archetype: 'est',
    blurb: 'Measures how much effort customers report to get issues resolved.',
    fields: [n('a', 'Sum of effort scores (1-7)', { def: 520 }), n('b', 'Number of ratings', { def: 200 }), n('c', 'Ratings of 5+ (high effort)', { def: 30 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = v.c as number
      const ces = a / b
      const highShare = (c / b) * 100
      return [
        res('CES (avg /7)', numD(ces, 1), ces <= 2 ? T.good : ces <= 3.5 ? T.warn : T.bad, 'Lower is better: 1 = very easy, 7 = very hard.'),
        res('High-effort share', pct(highShare, 1), highShare <= 20 ? T.good : highShare <= 35 ? T.warn : T.bad, 'High-effort experiences predict churn strongly.'),
        res('Ratings of 5+', num(c, 0), T.neutral),
      ]
    },
  },
  {
    id: 'customer-health-score-matrix',
    archetype: 'matrix',
    blurb: 'Rolls usage, tickets, renewal, billing and sentiment into one weighted health score.',
    fields: [mx('m', 'Health dimensions', ['Weight %', 'Score /10'], ['Usage & adoption', 'Ticket volume trend', 'Renewal proximity', 'Billing health', 'Sentiment & advocacy'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Usage & adoption', 'Ticket volume trend', 'Renewal proximity', 'Billing health', 'Sentiment & advocacy']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const health = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      const tier = health >= 8 ? 'Green \u2014 grow' : health >= 6 ? 'Yellow \u2014 watch' : 'Red \u2014 intervene'
      return [
        res('Customer health', `${num(clamp(health, 0, 100), 0)}/100`, health >= 8 ? T.good : health >= 6 ? T.warn : T.bad),
        res('Health tier', tier, health >= 8 ? T.good : health >= 6 ? T.warn : T.bad),
        res('Weakest dimension', labels[minI], T.warn, 'The lowest dimension usually drives the tier.'),
        res('Weight coverage', pct(Math.min(100, w), 0), Math.abs(w - 100) <= 1 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'knowledge-base-article-value-rating',
    archetype: 'matrix',
    blurb: 'Rates article value by views, save rates and deflection hours to retire weak content.',
    fields: [mx('m', 'Articles', ['Views (k)', 'Save rate %', 'Deflection (hrs)'], ['Getting started', 'API docs', 'Troubleshooting', 'Billing FAQ', 'Integrations'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Getting started', 'API docs', 'Troubleshooting', 'Billing FAQ', 'Integrations']
      const views = M.reduce((s, r) => s + (r[0] || 0), 0)
      const save = M.reduce((s, r) => s + (r[1] || 0), 0) / M.length
      const deflect = M.reduce((s, r) => s + (r[2] || 0), 0)
      const top = M.reduce((bi, r, i) => ((r[0] || 0) > (M[bi][0] || 0) ? i : bi), 0)
      const weak = labels.filter((_, i) => (M[i][2] || 0) < 5).length
      return [
        res('Total views', `${num(views, 0)}`, T.neutral, 'Thousands across the catalog.'),
        res('Avg save rate', pct(save, 1), save >= 30 ? T.good : save >= 20 ? T.warn : T.bad, 'Saves imply the article was worth revisiting.'),
        res('Deflection hours', `${numD(deflect, 0)} saved hrs`, T.good, 'Each deflected hour is live support cost avoided.'),
        res('Top article', labels[top], T.good),
        res('Low-value to rewrite', `${weak} article(s)`, weak === 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'customer-service-agent-occupancy-rate',
    archetype: 'est',
    blurb: 'Measures agent occupancy from productive minutes against logged-in time.',
    fields: [n('a', 'Productive minutes/day (talk + wrap)', { def: 330 }), n('b', 'Logged-in minutes/day', { def: 420 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number)
      const occ = (a / b) * 100
      const idle = 100 - occ
      return [
        res('Occupancy', pct(occ, 0), occ >= 75 && occ <= 90 ? T.good : occ > 95 ? T.bad : occ < 70 ? T.warn : T.warn, '75-90% is the healthy band; over 95% signals burnout.'),
        res('Idle share', pct(idle, 0), T.neutral),
        res('Logged-in time', `${num(b, 0)} min`, T.neutral),
        res('Burnout guard', occ > 92 ? 'Coaching + overflow routing needed' : 'Within plan', occ > 92 ? T.bad : T.good),
      ]
    },
  },
  {
    id: 'customer-apology-and-goodwill-voucher-allocator',
    archetype: 'est',
    blurb: 'Sizes goodwill vouchers by complaint volume, churn-avoidance value and severity multiplier.',
    fields: [n('a', 'Complaints resolved', { def: 120 }), n('b', 'Avg churn-avoidance value', { def: 400 }), sel('s', 'Severity', ['Minor issue', 'Major service miss', 'Repeat failure', 'SLA breach']), n('d', 'Budget available', { def: 5000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, s = v.s as string, d = v.d as number
      const share = s === 'Minor issue' ? 0.1 : s === 'Major service miss' ? 0.2 : s === 'Repeat failure' ? 0.35 : 0.4
      const suggest = a * b * share
      const perCase = suggest / a
      return [
        res('Per-case goodwill', moneyC(perCase), T.neutral, `${s} severity.\n`),
        res('Suggested reserve', money(suggest), suggest <= d ? T.good : T.warn, 'Keep reserve under ' + money(d) + ' or raise the budget.'),
        res('Severity multiplier', `${ratio(share * 10, 1)}\u00d7 the baseline`, share >= 0.3 ? T.warn : T.good),
        res('Cases covered', num(a, 0), T.neutral),
      ]
    },
  },
  {
    id: 'customer-advisory-board-cab-feedback-formatter',
    archetype: 'fmt',
    blurb: 'Turns CAB meeting feedback into themes with reactions and an executive digest.',
    fields: [txt('c', 'Meeting / cohort'), txt('s', 'Customer sponsor'), ck('f', 'Feedback themes', ['Product gaps', 'Pricing', 'Roadmap alignment', 'Support pain points', 'Executive access', 'Commercial terms']), sel('d', 'Reaction', ['Engaged', 'Neutral', 'Strained'])],
    compute: (v) => {
      const cohort = ((v.c as string) || '').trim() || 'QBR cohort'
      const sponsor = ((v.s as string) || '').trim() || 'Sponsor'
      const f = v.f as boolean[]
      const themes = ['Product gaps', 'Pricing', 'Roadmap alignment', 'Support pain points', 'Executive access', 'Commercial terms']
      const count = f.filter(Boolean).length
      const reaction = v.d as string
      let doc = `CUSTOMER ADVISORY BOARD DIGEST \u2014 ${cohort.toUpperCase()}\nSponsor: ${sponsor}    Reaction: ${reaction}\n\nThemes heard this cycle:\n`
      doc += themes.map((t, i) => `  [${f[i] ? 'x' : ' '}] ${t}`).join('\n')
      doc += '\n\nEscalation: convert a named theme + named customer into an executive action by the next cycle.'
      return [
        res('Theme coverage', `${count}/6`, count >= 4 ? T.good : count >= 2 ? T.warn : T.bad),
        res('Reaction', reaction, reaction === 'Engaged' ? T.good : reaction === 'Neutral' ? T.warn : T.bad),
        docRes('CAB digest', doc),
      ]
    },
  },
  {
    id: 'customer-sentiment-analysis-scorer',
    archetype: 'scorecard',
    blurb: 'Weighted sentiment score across support, chat, social, reviews and survey text.',
    fields: [mxd('m', 'Text channels', ['Channel', 'Weight %', 'Score /10'], ['Support tickets', 'Chat transcripts', 'Social mentions', 'Reviews', 'Survey comments'], [[25, 7], [25, 6], [15, 6], [20, 7], [15, 8]]), sel('p', 'Period', ['This week', 'This month', 'This quarter'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Support tickets', 'Chat transcripts', 'Social mentions', 'Reviews', 'Survey comments']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Sentiment score', `${num(wScore, 0)}/100`, wScore >= 75 ? T.good : wScore >= 55 ? T.warn : T.bad, 'Weighted across all five channels.'),
        res('Weakest channel', labels[minI], T.warn, 'Dangerous words cluster here first \u2014 sample the raw text.'),
        res('Avg channel score', `${numD(wScore / 10, 1)}/10`, T.neutral),
        res('Period', v.p as string, T.neutral),
      ]
    },
  },
  {
    id: 'customer-loyalty-tier-threshold-calculator',
    archetype: 'est',
    blurb: 'Places a customer in its loyalty tier and shows the spend gap to the next one.',
    fields: [n('a', 'Annual spend', { def: 1500 }), n('b', 'Silver threshold', { def: 500 }), n('c', 'Gold threshold', { def: 1500 }), n('d', 'Platinum threshold', { def: 5000 }), n('e', 'Points multiplier', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const tier = a >= d ? 'Platinum' : a >= c ? 'Gold' : a >= b ? 'Silver' : 'Base'
      const next = tier === 'Platinum' ? 0 : tier === 'Gold' ? d - a : tier === 'Silver' ? c - a : b - a
      const points = a * 10 * e
      return [
        res('Current tier', tier, tier === 'Platinum' ? T.good : tier === 'Gold' ? T.good : tier === 'Silver' ? T.warn : T.neutral),
        res('Spend to next tier', next === 0 ? 'Already top tier' : money(next), next === 0 ? T.good : T.warn, 'Nudge with a targeted upgrade offer.'),
        res('Points accrued', num(points, 0), T.neutral, `Payload at ${ratio(e, 1)}\u00d7 multiplier.`),
        res('Annual spend', money(a), T.neutral),
      ]
    },
  },
  {
    id: 'post-incident-customer-communication-builder',
    archetype: 'fmt',
    blurb: 'Drafts an apology-first customer communication with the elements customers demand.',
    fields: [txt('c', 'Company'), txt('i', 'Incident summary'), sel('s', 'Impact level', ['Partial degradation', 'Full outage', 'Data incident']), ck('t', 'Communication elements', ['Timeline', 'Root cause', 'Resolution', 'Data impact', 'Preventive actions', 'Apology & goodwill'])],
    compute: (v) => {
      const co = ((v.c as string) || '').trim() || 'Company'
      const inc = ((v.i as string) || '').trim() || 'the recent service disruption'
      const t = v.t as boolean[]
      const elems = ['Timeline', 'Root cause', 'Resolution', 'Data impact', 'Preventive actions', 'Apology & goodwill']
      const count = t.filter(Boolean).length
      const s = v.s as string
      let doc = `SUBJECT: Update on ${inc} \u2014 ${co}\n\nImpact: ${s}\n\n` + elems.map((x, i) => `${i + 1}. ${x}${t[i] ? ' \u2713 included' : ' \u2013 missing'}`).join('\n')
      doc += '\n\nSign-off: We take full responsibility and we will hold ourselves accountable in the follow-up.'
      return [
        res('Communication scope', `${count}/6`, count >= 5 ? T.good : count >= 4 ? T.warn : T.bad, 'Missing timeline or root cause erodes trust fast.'),
        res('Impact level', s, s === 'Data incident' ? T.bad : T.warn),
        docRes('Customer communication', doc),
      ]
    },
  },
  {
    id: 'customer-churn-risk-alert-index',
    archetype: 'index',
    blurb: 'Blends usage decline, tickets, renewal runway and sentiment into a churn alert.',
    fields: [n('u', 'Usage decline % vs baseline', { def: 20 }), n('t', 'Open tickets (30d)', { def: 3 }), n('r', 'Renewal runway (months)', { def: 4 }), n('s', 'Sentiment score (0-100)', { def: 55 })],
    compute: (v) => {
      const u = v.u as number, t = v.t as number, r = v.r as number, s = v.s as number
      const risk = clamp(u * 1.2 + t * 3 + (12 - r) * 4 + (100 - s) * 0.4, 0, 100)
      return [
        res('Churn risk index', pct(risk, 1), risk >= 70 ? T.bad : risk >= 40 ? T.warn : T.good, 'Fires an alert above 60 for CSM follow-up.'),
        res('Usage decline', pct(u, 1), u <= 15 ? T.good : u <= 30 ? T.warn : T.bad),
        res('Renewal runway', `${num(r, 0)} months`, r >= 6 ? T.good : r >= 3 ? T.warn : T.bad, 'Under 3 months of runway is urgent.'),
        res('Sentiment', `${num(s, 0)}/100`, s >= 70 ? T.good : s >= 50 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'customer-feedback-loop-action-item-tracker',
    archetype: 'tracker',
    blurb: 'Tracks response due date and backlog clearance for feedback action items.',
    fields: [dt('f', 'Feedback captured'), n('n', 'SLA to respond (days)', { def: 5 }), n('o', 'Open action items', { def: 8 }), n('w', 'Items cleared per week', { def: 3 })],
    compute: (v) => {
      const iso = (v.f as string) || '2026-02-01'
      const n = Math.max(0, Math.round(v.n as number))
      const o = Math.max(0, Math.round(v.o as number))
      const w = Math.max(1, Math.round(v.w as number))
      const base = new Date(iso + 'T00:00:00')
      const due = new Date(base.getTime() + n * 864e5)
      const fmt = (x: Date) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const weeks = o / w
      return [
        res('Feedback date', fmt(base), T.neutral),
        res('Response due', fmt(due), T.warn, 'Close the loop inside the SLA or the customer stops trusting.'),
        res('Open action items', num(o, 0), o <= 5 ? T.good : T.warn),
        res('Backlog clear time', `${numD(weeks, 1)} weeks`, weeks <= 4 ? T.good : weeks <= 8 ? T.warn : T.bad),
        res('Response SLA', days(n), n <= 5 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'customer-re-engagement-campaign-estimator',
    archetype: 'est',
    blurb: 'Sizes reactivation volume, recovered value and ROI of a win-back campaign.',
    fields: [n('a', 'Inactive customers', { def: 2000 }), n('b', 'Expected re-engage rate %', { def: 10 }), n('c', 'Avg value per reactivation', { def: 480 }), n('d', 'Cost per contact', { def: 4 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const react = a * (b / 100)
      const value = react * c
      const cost = a * d
      const roi = value - cost
      return [
        res('Customers reactivated', num(react, 0), react >= 100 ? T.good : T.warn),
        res('Recovered value', money(value), value > cost ? T.good : T.bad),
        res('Campaign cost', money(cost), T.neutral),
        res('Campaign ROI', money(roi), roi >= 0 ? T.good : T.bad, 'Pulse with the reason-for-churn to lift the re-engage rate.'),
      ]
    },
  },
  {
    id: 'customer-survey-response-rate-calculator',
    archetype: 'est',
    blurb: 'Measures survey response rate and completion drop-off by channel.',
    fields: [n('a', 'Surveys sent', { def: 2000 }), n('b', 'Surveys returned', { def: 300 }), n('c', 'Partial completions', { def: 80 }), sel('s', 'Channel', ['Email', 'In-app', 'SMS', 'QR code'])],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number
      const rate = (b / a) * 100
      const completion = b ? (b / (b + c)) * 100 : 0
      return [
        res('Response rate', pct(rate, 1), rate >= 25 ? T.good : rate >= 15 ? T.warn : T.bad, 'Under 15% your sample is self-selected and biased.'),
        res('Completion rate', pct(completion, 1), completion >= 80 ? T.good : completion >= 60 ? T.warn : T.bad, 'Drop-out mid-survey means the survey is too long.'),
        res('Returned', num(b, 0), T.neutral),
        res('Channel', v.s as string, T.neutral, `${v.s} \u2014 in-app and SMS typically double email response.`),
      ]
    },
  },
  {
    id: 'community-forum-activity-rate-matrix',
    archetype: 'matrix',
    blurb: 'Tracks forum activity per segment and the answer-to-post ratio.',
    fields: [mx('m', 'Forum segments', ['Active members', 'Posts / month', 'Answers delivered'], ['New hobbyists', 'Power users', 'Lapsed members', 'Ambassadors'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['New hobbyists', 'Power users', 'Lapsed members', 'Ambassadors']
      const members = M.reduce((s, r) => s + (r[0] || 0), 0)
      const posts = M.reduce((s, r) => s + (r[1] || 0), 0)
      const answers = M.reduce((s, r) => s + (r[2] || 0), 0)
      const top = M.reduce((bi, r, i) => ((r[0] || 0) > (M[bi][0] || 0) ? i : bi), 0)
      const answerRate = posts ? (answers / posts) * 100 : 0
      return [
        res('Active members', num(members, 0), T.neutral),
        res('Posts / month', num(posts, 0), T.neutral),
        res('Answer rate', pct(answerRate, 1), answerRate >= 60 ? T.good : answerRate >= 40 ? T.warn : T.bad, 'High answer rate builds self-service credibility.'),
        res('Most active segment', labels[top], T.good, 'Recruit from this segment for ambassador programs.'),
      ]
    },
  },
  {
    id: 'service-recovery-paradox-rating',
    archetype: 'index',
    blurb: 'Judges whether a great recovery lifts satisfaction above the pre-failure baseline.',
    fields: [n('s', 'Failed response severity (1-10)', { def: 6 }), n('f', 'Recovery quality (1-10)', { def: 8 }), n('c', 'Speed to resolve (hr)', { def: 12 }), n('b', 'Baseline satisfaction (0-100)', { def: 70 })],
    compute: (v) => {
      const s = v.s as number, f = v.f as number, c = v.c as number, b = v.b as number
      const rec = clamp(b + (f - s) * 8 - (c > 48 ? 10 : 0), 0, 100)
      const paradox = rec > b
      return [
        res('Post-recovery satisfaction', pct(rec, 1), rec >= 80 ? T.good : rec >= 60 ? T.warn : T.bad, 'Great recoveries beat never-failed if effort + empathy outrank the failure.'),
        res('Paradox achieved', paradox ? 'Yes \u2014 recovery beat baseline' : 'No \u2014 recovery lost ground', paradox ? T.good : T.bad),
        res('Recovery quality', `${num(f, 0)}/10`, f >= 7 ? T.good : T.warn, 'A 8+ recovery can offset severe failures.'),
        res('Failed severity', `${num(s, 0)}/10`, s <= 4 ? T.good : s <= 7 ? T.warn : T.bad),
      ]
    },
  },
  // ---------------- Contact Center Operations ----------------
  {
    id: 'average-handle-time-aht-calculator',
    archetype: 'est',
    blurb: 'Computes average handle time across talk, hold and after-call work.',
    fields: [n('a', 'Talk time (min)', { def: 320 }), n('b', 'Hold time (min)', { def: 45 }), n('c', 'After-call work (min)', { def: 90 }), n('d', 'Calls handled', { def: 80 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = Math.max(1, v.d as number)
      const aht = (a + b + c) / d
      const wrapShare = (c / (a + b + c)) * 100
      return [
        res('AHT per call', `${numD(aht, 1)} min`, aht <= 6 ? T.good : aht <= 10 ? T.warn : T.bad, 'AHT targets sit ~5-8 min across most contact centers.'),
        res('After-call work share', pct(wrapShare, 1), wrapShare <= 20 ? T.good : T.warn, 'Wrap above 20% suggests CRM data entry is too manual.'),
        res('Calls handled', num(d, 0), T.neutral),
      ]
    },
  },
  {
    id: 'call-center-erlang-c-staffing-calculator',
    archetype: 'est',
    blurb: 'Solves Erlang-C to find agents needed for a service level target at busy hour.',
    fields: [n('a', 'Calls per busy hour', { def: 240 }), n('b', 'Avg handle time (sec)', { def: 240 }), n('c', 'Service level target %', { def: 80 }), n('d', 'Target answer time (sec)', { def: 30 }), n('e', 'Agents staffed', { def: 30 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const load = a * (b / 3600)
      const util = (load / e) * 100
      const pc = load < e ? erlangCPC(load, e) : 1
      const slStaffed = load < e ? (1 - pc * Math.exp(-((e - load) * d) / b)) * 100 : 0
      let req = Math.max(1, Math.ceil(load) + 1)
      for (let m = req; m <= 800; m++) {
        const pcm = erlangCPC(load, m)
        const slm = (1 - pcm * Math.exp(-((m - load) * d) / b)) * 100
        if (slm >= c) { req = m; break }
      }
      return [
        res('Offered load', `${numD(load, 2)} erlangs`, T.neutral, 'Calls per hour x AHT normalized to 1 hour.'),
        res('Utilization', pct(util, 1), util <= 85 ? T.good : util <= 95 ? T.warn : T.bad, 'Above 95% utilization service level collapses.'),
        res('Service level at staffing', pct(slStaffed, 1), slStaffed >= c ? T.good : T.bad, `Answering ${pct(c, 0)} of calls within ${num(d, 0)}s.`),
        res('Agents to hit SLA', num(req, 0), req <= e ? T.good : T.bad),
        res('Staffing gap', num(Math.max(0, req - e), 0), req <= e ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'support-queue-sla-breached-calculator',
    archetype: 'est',
    blurb: 'Measures how many tickets breach the SLA window and the late exposure.',
    fields: [n('a', 'Tickets opened', { def: 150 }), n('b', 'Handled within SLA', { def: 120 }), n('c', 'SLA breach window (hr)', { def: 8 }), n('d', 'Avg open time for breaches (hr)', { def: 12 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = Math.min(a, v.b as number), c = v.c as number, d = v.d as number
      const pctOk = (b / a) * 100
      const breached = a - b
      const lateHrs = breached * Math.max(0, d - c)
      return [
        res('Within SLA', pct(pctOk, 1), pctOk >= 90 ? T.good : pctOk >= 80 ? T.warn : T.bad, 'Hunt for the 90% floor before opening more capacity.'),
        res('Breached tickets', num(breached, 0), breached === 0 ? T.good : T.warn),
        res('Late exposure', `${num(lateHrs, 0)} hr`, lateHrs === 0 ? T.good : T.warn, 'Hours of backlogged breach \u2014 these go to the queue lead.'),
        res('Breach window', `${num(c, 0)} hr`, T.neutral),
      ]
    },
  },
  {
    id: 'call-center-abandonment-rate-calculator',
    archetype: 'index',
    blurb: 'Measures calls abandoned before answer and the speed-of-answer drivers.',
    fields: [n('a', 'Calls offered', { def: 500 }), n('b', 'Calls answered', { def: 430 }), n('c', 'Avg speed to answer (sec)', { def: 45 }), n('d', 'Service level in 20s %', { def: 70 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const aband = ((a - b) / a) * 100
      return [
        res('Abandonment rate', pct(aband, 1), aband <= 5 ? T.good : aband <= 10 ? T.warn : T.bad, 'Sub-5% is healthy; above 10% loses revenue per call.'),
        res('Calls answered', num(b, 0), T.neutral),
        res('Avg speed to answer', `${num(c, 0)} sec`, c <= 30 ? T.good : c <= 60 ? T.warn : T.bad),
        res('Service level (20s)', pct(d, 1), d >= 80 ? T.good : T.warn, 'Standard target: answer 80% within 20 seconds.'),
      ]
    },
  },
  {
    id: 'customer-service-cost-per-contact-calculator',
    archetype: 'est',
    blurb: 'Breaks contact center cost into cost-per-contact and payroll share.',
    fields: [n('a', 'Total contact center cost', { def: 250000 }), n('b', 'Contacts handled', { def: 20000 }), n('c', 'Agent payroll share %', { def: 70 }), n('d', 'Cost per agent hour', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = v.c as number, d = v.d as number
      const cpc = a / b
      const laborCpc = (a * (c / 100)) / b
      return [
        res('Cost per contact', money(cpc), cpc <= 15 ? T.good : cpc <= 30 ? T.warn : T.bad, 'Benchmark: <$15 efficient, $30+ needs channel mix review.'),
        res('Labor cost per contact', money(laborCpc), T.neutral),
        res('Payroll share', pct(c, 1), c <= 75 ? T.good : T.warn, 'Above 75% means little tooling investment.'),
        res('Agent-hour rate', `${money(d)}/hr benchmark`, T.neutral),
      ]
    },
  },
  {
    id: 'omnichannel-ticket-queue-balancer',
    archetype: 'matrix',
    blurb: 'Compares open tickets to per-day capacity per channel and finds overloaded queues.',
    fields: [mx('m', 'Channels', ['Open tickets', 'Cap per agent / day'], ['Email', 'Phone', 'Chat', 'Social', 'In-app'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Email', 'Phone', 'Chat', 'Social', 'In-app']
      const open = M.reduce((s, r) => s + (r[0] || 0), 0)
      const cap = M.reduce((s, r) => s + (r[1] || 0), 0)
      const overloaded = labels.filter((_, i) => (M[i][0] || 0) > (M[i][1] || 0))
      const days = open / Math.max(1, cap)
      return [
        res('Total open', num(open, 0), T.neutral),
        res('Capacity / day', num(cap, 0), cap >= open ? T.good : T.warn),
        res('Clear time', `${numD(days, 1)} days`, open <= cap ? T.good : open <= cap * 3 ? T.warn : T.bad),
        res('Overloaded channels', overloaded.length ? overloaded.join(', ') : 'None', overloaded.length ? T.warn : T.good, 'Rebalance agents toward the overloaded lanes.'),
      ]
    },
  },
  {
    id: 'support-agent-training-needs-index',
    archetype: 'index',
    blurb: 'Scores training urgency from certification, escalations, QA-drag and release pressure.',
    fields: [n('c', 'Certified coverage %', { def: 70 }), n('q', 'Closures behind benchmark %', { def: 15 }), n('x', 'Escalations per agent (30d)', { def: 6 }), n('t', 'New features shipped (30d)', { def: 3 })],
    compute: (v) => {
      const c = v.c as number, q = v.q as number, x = v.x as number, t = v.t as number
      const need = clamp((100 - c) * 0.5 + q + x * 4 + t * 5, 0, 100)
      return [
        res('Training need index', pct(need, 1), need >= 60 ? T.bad : need >= 35 ? T.warn : T.good, 'Above 60 book a certification sprint this quarter.'),
        res('Certified coverage', pct(c, 1), c >= 85 ? T.good : c >= 70 ? T.warn : T.bad),
        res('Escalation load', `${num(x, 0)}/agent`, x <= 5 ? T.good : T.warn),
        res('Release pressure', `${num(t, 0)} features`, t <= 3 ? T.good : T.warn, 'Every live feature needs a training note before ship.'),
      ]
    },
  },
  {
    id: 'call-center-quality-assurance-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores QA criteria on coachable calls with a compliance gate.',
    fields: [mxd('m', 'QA criteria', ['Criterion', 'Weight %', 'Score /10'], ['Greeting & empathy', 'Probing & discovery', 'Resolution accuracy', 'Compliance & security', 'Wrap-up accuracy'], [[20, 8], [20, 7], [30, 7], [20, 9], [10, 7]]), sel('r', 'Review type', ['Audit sample', 'Coaching call', 'Post-incident QA'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Greeting & empathy', 'Probing & discovery', 'Resolution accuracy', 'Compliance & security', 'Wrap-up accuracy']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      const compliance = M[3][1] || 0
      return [
        res('QA score', `${num(wScore, 0)}/100`, wScore >= 85 ? T.good : wScore >= 70 ? T.warn : T.bad, 'Consistent 85+ indicates a well-run floor.'),
        res('Weakest criterion', labels[minI], T.warn, 'Coach on this criterion first.'),
        res('Compliance gate', `${num(compliance, 0)}/10`, compliance >= 9 ? T.good : T.bad, 'Compliance under 9 fails the call regardless of score.'),
        res('Review type', v.r as string, T.neutral),
      ]
    },
  },
  {
    id: 'support-shift-schedule-generator',
    archetype: 'fmt',
    blurb: 'Drafts a coverage schedule from shift blocks and zone pattern.',
    fields: [txt('o', 'Team'), n('a', 'Agents per shift', { def: 4 }), n('b', 'Shifts per day', { def: 3 }), sel('z', 'Zone', ['24/5 with on-call', '24/7', 'Business hours']), ck('s', 'Shift slots', ['UTC overlap', 'Weekend coverage', 'Lunch relief', 'Night-owl band'])],
    compute: (v) => {
      const team = ((v.o as string) || '').trim() || 'Support floor'
      const a = v.a as number, b = v.b as number, z = v.z as string
      const s = v.s as boolean[]
      const slots = ['UTC overlap', 'Weekend coverage', 'Lunch relief', 'Night-owl band']
      const count = s.filter(Boolean).length
      const headcount = a * b
      let doc = `SHIFT PLAN \u2014 ${team.toUpperCase()}\n\nZone: ${z}    Coverage headcount: ${num(headcount, 0)}\n\nShift blocks:\n`
      doc += [['00:00-08:00', 'night'], ['08:00-16:00', 'core'], ['16:00-24:00', 'evening']].map(([t, name], i) => `${i + 1}. ${t} \u2014 ${num(a, 0)} agents (${name})`).join('\n')
      doc += '\n\nSlots:\n' + slots.map((x, i) => `  [${s[i] ? 'x' : ' '}] ${x}`).join('\n')
      doc += '\n\nRotate the night band weekly and guard lunch relief for continuity.'
      return [
        res('Coverage headcount', num(headcount, 0), headcount >= 6 ? T.good : T.warn),
        res('Zone pattern', z, T.neutral, z === '24/5 with on-call' ? 'On-call only outside 24/5.' : z === '24/7' ? 'Round-the-clock floor required.' : 'Business-hours staffing.'),
        res('Slot coverage', `${count}/4 slots`, count >= 3 ? T.good : T.warn),
        docRes('Schedule template', doc),
      ]
    },
  },
  {
    id: 'live-chat-response-speed-benchmarker',
    archetype: 'est',
    blurb: 'Benchmarks first response speed and in-session resolution for live chat.',
    fields: [n('a', 'Chats answered', { def: 300 }), n('b', 'Avg first response (sec)', { def: 28 }), n('c', 'Target first response (sec)', { def: 20 }), n('d', 'Chats resolved in-session', { def: 180 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const meet = b <= c ? 100 : clamp((c / b) * 100, 0, 100)
      const onSess = (d / a) * 100
      return [
        res('Avg first response', `${num(b, 0)} sec`, b <= 20 ? T.good : b <= 30 ? T.warn : T.bad),
        res('Meets target', pct(meet, 1), meet >= 90 ? T.good : meet >= 70 ? T.warn : T.bad, 'Chat expectation is sub-20s for first reply.'),
        res('In-session resolution', pct(onSess, 1), onSess >= 50 ? T.good : onSess >= 30 ? T.warn : T.bad),
        res('Volume', num(a, 0), T.neutral),
      ]
    },
  },
  {
    id: 'helpdesk-software-license-requirement-estimator',
    archetype: 'est',
    blurb: 'Sizes helpdesk seat licenses under named or concurrent licensing models.',
    fields: [n('a', 'Agents', { def: 25 }), n('b', 'Named seats per agent', { def: 1 }), n('c', 'Concurrent seat saving %', { def: 40 }), sel('s', 'Model', ['Named seats', 'Concurrent seats'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, s = v.s as string
      const named = a * b
      const quantity = s === 'Named seats' ? named : Math.max(1, Math.ceil(named * (1 - c / 100)))
      const savings = named - quantity
      return [
        res('License quantity', num(quantity, 0), T.good),
        res('Licenses saved', num(savings, 0), savings > 0 ? T.good : T.neutral),
        res('Model', s, T.neutral, `Concurrent pools save ~${num(c, 0)}% headcount on burst days.`),
        res('Agent base', num(a, 0), T.neutral),
      ]
    },
  },
  {
    id: 'customer-refund-request-approval-matrix',
    archetype: 'matrix',
    blurb: 'Assigns refund authority by amount band and flags authority gaps.',
    fields: [mx('m', 'Refund bands', ['Refund amount', 'Approval level (1-4)'], ['Under $50', '$50-200', '$200-1k', 'Over $1k'])],
    compute: (v) => {
      const M = v.m as number[][]
      const req = [1, 2, 3, 4]
      const gaps = M.reduce((s, r, i) => s + Math.max(0, req[i] - Math.round(r[1] || 0)), 0)
      const avgLevel = M.reduce((s, r) => s + Math.min(4, Math.max(0, Math.round(r[1] || 0))), 0) / M.length
      const maxAmt = Math.max(...M.map((r) => Math.max(0, r[0] || 0)))
      return [
        res('Avg approval level', numD(avgLevel, 1), avgLevel >= 2.5 ? T.good : T.warn),
        res('Authority gaps', num(gaps, 0), gaps === 0 ? T.good : T.bad, 'Level must be: <$50 = 1, $50-200 = 2, $200-1k = 3, >$1k = 4.'),
        res('Max refund tier', money(maxAmt), maxAmt > 200 ? T.warn : T.good, 'Above $1k reputation waivers need exec sign-off.'),
        res('Bands defined', `${M.length}`, T.neutral),
      ]
    },
  },
  {
    id: 'call-center-peak-hour-volume-predictor',
    archetype: 'est',
    blurb: 'Forecasts the peak-hour call spike with seasonal uplift and staffs for it.',
    fields: [n('a', 'Avg calls/day', { def: 1200 }), n('b', 'Peak hour share %', { def: 18 }), n('c', 'Seasonal uplift %', { def: 20 }), n('d', 'Agents on shift today', { def: 10 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const peak = a * (b / 100) * (1 + c / 100)
      const avgHr = a / 18
      const agentsNeeded = Math.ceil(peak / 15)
      return [
        res('Peak hour forecast', num(Math.round(peak), 0), T.neutral, 'Assumes ~15 calls/agent-hour at 80% occupancy.'),
        res('Avg calls / hour', num(avgHr, 0), T.neutral),
        res('Seasonal uplift', pct(c, 1), c <= 25 ? T.good : T.warn),
        res('Agents suggested', num(agentsNeeded, 0), agentsNeeded <= d ? T.good : T.bad),
        res('Today\u2019s staffing', `${num(d, 0)} agents`, agentsNeeded <= d ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'interactive-voice-response-ivr-tree-planner',
    archetype: 'fmt',
    blurb: 'Drafts an IVR menu tree from main options and depth preference.',
    fields: [txt('c', 'Business / line'), ck('m', 'Main menu options', ['Sales', 'Billing', 'Technical support', 'Account status', 'Agent directory']), sel('d', 'Depth', ['Single level', 'Two levels', 'Three levels'])],
    compute: (v) => {
      const biz = ((v.c as string) || '').trim() || 'Main line'
      const m = v.m as boolean[]
      const opts = ['Sales', 'Billing', 'Technical support', 'Account status', 'Agent directory']
      const count = m.filter(Boolean).length
      const depth = v.d as string
      const subs: Record<string, string[]> = {
        'Sales': ['New business', 'Existing accounts', 'Broker line'],
        'Billing': ['View bill', 'Payment', 'Dispute'],
        'Technical support': ['Troubleshoot', 'Book a repair', 'Escalate'],
        'Account status': ['Balance', 'Plan change'],
        'Agent directory': ['By name', 'By extension'],
      }
      let doc = `IVR TREE \u2014 ${biz.toUpperCase()}\n\nMain menu:\n`
      opts.forEach((o, i) => {
        if (!m[i]) return
        doc += `  1. ${o}\n`
        if (depth !== 'Single level') {
          ;(subs[o] || []).forEach((s) => { doc += `     2. ${s}\n` })
          if (depth === 'Three levels') {
            ;(subs[o] || []).forEach((s) => { doc += `        3. ${s} \u2014 details\n` })
          }
        }
      })
      doc += '\nRoute to live agent after two hangs on a submenu.'
      return [
        res('Menu coverage', `${count}/5 options`, count >= 4 ? T.good : count >= 3 ? T.warn : T.bad, 'Keep main menu to 5 items max.'),
        res('Depth', depth, depth === 'Single level' ? T.good : depth === 'Two levels' ? T.warn : T.bad, 'Three levels multiplies abandonment.'),
        docRes('IVR tree', doc),
      ]
    },
  },
  {
    id: 'multi-language-support-staffing-calculator',
    archetype: 'est',
    blurb: 'Balances queue depth and language coverage against multilingual agents.',
    fields: [n('a', 'Contacts in queue', { def: 80 }), n('b', 'Agents on duty', { def: 5 }), sel('l', 'Languages mix', ['English-dominant', 'Bilingual (EN/ES)', 'Trilingual hub']), n('d', 'Multilingual agents', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), d = v.d as number
      const perAgent = a / b
      const langShare = (d / b) * 100
      return [
        res('Contacts per agent', numD(perAgent, 1), perAgent <= 12 ? T.good : perAgent <= 20 ? T.warn : T.bad),
        res('Multilingual share', pct(langShare, 1), langShare >= 40 ? T.good : T.warn, 'Under 40% and the language queue stalls.'),
        res('Language coverage', v.l as string, T.neutral, v.l === 'Bilingual (EN/ES)' ? 'Skip-tier the Spanish queue to the EN/ES agents.' : 'Build routing per language pool.'),
        res('Queue depth', num(a, 0), T.neutral),
      ]
    },
  },
  {
    id: 'customer-service-representative-turnover-estimator',
    archetype: 'est',
    blurb: 'Measures annual agent turnover rate and the hiring cost it creates.',
    fields: [n('a', 'Agents at start of year', { def: 50 }), n('b', 'Agents left during year', { def: 18 }), n('c', 'Agents hired during year', { def: 30 }), n('d', 'Avg onboarding cost', { def: 6000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const avgHc = a + (c - b) / 2
      const rate = (b / avgHc) * 100
      const cost = b * d
      return [
        res('Turnover rate', pct(rate, 1), rate <= 35 ? T.good : rate <= 55 ? T.warn : T.bad, 'Contact centers typically run 30-45% annual churn.'),
        res('Agents exited', num(b, 0), T.neutral),
        res('Annual hiring cost', money(cost), cost > 80000 ? T.warn : T.good),
        res('Avg headcount (CY)', numD(avgHc, 1), T.neutral),
      ]
    },
  },
  {
    id: 'remote-support-tool-bandwidth-estimator',
    archetype: 'est',
    blurb: 'Sizes bandwidth for concurrent remote-support sessions against office upload.',
    fields: [n('a', 'Concurrent sessions', { def: 10 }), n('b', 'Bitrate per session (Mbps)', { def: 1.5 }), n('c', 'Office upload (Mbps)', { def: 25 }), n('d', 'Session length (min)', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const load = a * b
      const util = (load / c) * 100
      const perDay = a * b * (d / 60) * 3600 / 8 / 1000
      return [
        res('Bandwidth load', `${numD(load, 1)} Mbps`, load <= c ? T.good : T.bad),
        res('Utilization', pct(util, 1), util <= 50 ? T.good : T.warn, 'Keep under 50% so business traffic rides free.'),
        res('Daily session data', `${num(perDay, 1)} GB`, T.neutral),
        res('Concurrent sessions', num(a, 0), T.neutral),
      ]
    },
  },
  {
    id: 'first-contact-resolution-fcr-rate-calculator',
    archetype: 'index',
    blurb: 'Measures first-contact resolution and the repeat-contact echo.',
    fields: [n('a', 'Contacts resolved', { def: 90 }), n('b', 'Resolved first contact', { def: 54 }), n('c', 'Repeat contacts (7 days)', { def: 18 }), sel('s', 'Channel', ['Phone', 'Chat', 'Email', 'Omnichannel'])],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number
      const fcr = (b / a) * 100
      const repeat = (c / a) * 100
      return [
        res('FCR rate', pct(fcr, 1), fcr >= 75 ? T.good : fcr >= 60 ? T.warn : T.bad, '75% FCR is the healthy floor for most support orgs.'),
        res('Repeat-contact rate', pct(repeat, 1), repeat <= 15 ? T.good : repeat <= 25 ? T.warn : T.bad),
        res('Channel', v.s as string, T.neutral),
        res('Contacts resolved', num(a, 0), T.neutral),
      ]
    },
  },
  {
    id: 'support-ticket-escalation-rate-calculator',
    archetype: 'est',
    blurb: 'Measures escalation to level 2/3 and deflections as a share of total tickets.',
    fields: [n('a', 'Tickets', { def: 300 }), n('b', 'Escalated to L2', { def: 45 }), n('c', 'Escalated to L3', { def: 12 }), n('d', 'Deflected via KB', { def: 90 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const esc = ((b + c) / a) * 100
      const l3 = (c / a) * 100
      const defl = (d / a) * 100
      return [
        res('Escalation rate', pct(esc, 1), esc <= 15 ? T.good : esc <= 30 ? T.warn : T.bad, 'Heavy escalation means L1 documentation is stale.'),
        res('Level-3 share', pct(l3, 1), l3 <= 5 ? T.good : T.warn, 'L3 should stay under 5% of volume.'),
        res('KB deflection rate', pct(defl, 1), defl >= 25 ? T.good : T.warn),
        res('Tickets', num(a, 0), T.neutral),
      ]
    },
  },
  {
    id: 'customer-retention-cost-crc-calculator',
    archetype: 'est',
    blurb: 'Prices cost-to-retain against the margin each retained customer yields.',
    fields: [n('a', 'Customers retained (period)', { def: 500 }), n('b', 'Retention spend', { def: 60000 }), n('c', 'Gross margin / customer / yr', { def: 900 }), n('d', 'Acquisition cost avoided', { def: 250 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const crc = b / a
      const avoided = a * d
      return [
        res('Cost to retain (CRC)', money(crc), crc <= c * 0.3 ? T.good : crc <= c * 0.6 ? T.warn : T.bad, 'Keep CRC under ~30% of annual margin per customer.'),
        res('Retention spend', money(b), T.neutral),
        res('Margin per retained', money(c), T.neutral),
        res('CAC avoided', money(avoided), avoided > b ? T.good : T.warn, 'Retaining beats reacquiring when this exceeds the retent spend.'),
      ]
    },
  },
  {
    id: 'self-service-deflection-rate-calculator',
    archetype: 'index',
    blurb: 'Measures how many contacts the knowledge base resolves and the live-cost saved.',
    fields: [n('a', 'KB views', { def: 5000 }), n('b', 'KB resolves (one-click escapes)', { def: 1200 }), n('c', 'Total contacts', { def: 3000 }), n('d', 'Cost per live contact', { def: 12 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = Math.max(1, v.c as number), d = v.d as number
      const rate = (b / c) * 100
      const savings = b * d
      const sense = (b / a) * 100
      return [
        res('Deflection rate', pct(rate, 1), rate >= 20 ? T.good : rate >= 10 ? T.warn : T.bad, 'Breadcrumb trackers mislabel escapes; keep the definition strict.'),
        res('Contacts deflected', num(b, 0), T.neutral),
        res('Live cost saved', money(savings), savings > 0 ? T.good : T.warn),
        res('View-to-resolve', pct(sense, 1), sense >= 20 ? T.good : T.warn, 'Views without resolves indicate the article misses the question.'),
      ]
    },
  },
  {
    id: 'support-ticket-categorization-matrix',
    archetype: 'matrix',
    blurb: 'Tracks open backlog and weekly resolution per category to find the pressure point.',
    fields: [mx('m', 'Categories', ['Open tickets', 'Resolved / week'], ['Billing', 'Login & access', 'Feature bugs', 'Training', 'Integration'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Billing', 'Login & access', 'Feature bugs', 'Training', 'Integration']
      const open = M.reduce((s, r) => s + (r[0] || 0), 0)
      const resolve = M.reduce((s, r) => s + (r[1] || 0), 0)
      const byO = M.map((r) => r[0] || 0)
      const hotspot = labels[byO.indexOf(Math.max(...byO))]
      const weeks = open / Math.max(1, resolve)
      return [
        res('Open backlog', num(open, 0), T.neutral),
        res('Weekly resolution', num(resolve, 0), resolve >= Math.max(1, open / 4) ? T.good : T.warn, 'Resolution should outpace ~1/4 of the backlog weekly.'),
        res('Clear time', `${numD(weeks, 1)} weeks`, weeks <= 4 ? T.good : weeks <= 8 ? T.warn : T.bad),
        res('Hotspot', hotspot, open > 0 ? T.warn : T.good, 'Attack this category first with root-cause sessions.'),
      ]
    },
  },
  {
    id: 'customer-onboarding-milestone-tracker',
    archetype: 'timeline',
    blurb: 'Builds an onboarding ramp with milestones measured in days after contract start.',
    fields: [dt('s', 'Contract start'), mx('m', 'Milestones', ['Days after start'], ['Welcome & kickoff', 'Access provisioning', 'First value (TTV)', 'Adoption review', 'Renewal strategy'])],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const ttv = M[2][0] || 0
      const adoption = M[3][0] || 0
      return [
        res('Ramp window', `${num(total, 0)} days`, total <= 90 ? T.good : total <= 120 ? T.warn : T.bad),
        res('First-value (TTV) at day', `${num(ttv, 0)}`, ttv <= 30 ? T.good : ttv <= 60 ? T.warn : T.bad, 'Target value inside 30 days for retention.'),
        res('Adoption review day', `${num(adoption, 0)}`, adoption >= ttv ? T.good : T.bad),
        res('Total milestones', `${M.length}`, T.neutral),
      ]
    },
  },
  {
    id: 'feature-request-priority-scorer',
    archetype: 'matrix',
    blurb: 'Prioritizes feature requests by impact, revenue effect and effort.',
    fields: [mx('m', 'Feature requests', ['User impact /10', 'Revenue impact /10', 'Effort (days)'], ['SSO & SCIM', 'Audit export', 'Bulk editor', 'API v2', 'Team roles'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['SSO & SCIM', 'Audit export', 'Bulk editor', 'API v2', 'Team roles']
      const score = M.map((r) => ((r[0] || 0) * (r[1] || 0) / Math.max(1, r[2] || 0)))
      const top = score.indexOf(Math.max(...score))
      const effort = M.reduce((s, r) => s + (r[2] || 0), 0)
      const avgImp = M.reduce((s, r) => s + (r[0] || 0), 0) / M.length
      return [
        res('Top priority', labels[top], T.good, `Weighted score ${numD(score[top], 1)}.`),
        res('Score of top item', numD(score[top], 1), score[top] >= 15 ? T.good : score[top] >= 8 ? T.warn : T.bad, 'Score = impact x revenue / effort.'),
        res('Total build effort', `${num(effort, 0)} days`, T.neutral),
        res('Avg user impact', `${numD(avgImp, 1)}/10`, avgImp >= 7 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'customer-offboarding-reason-classifier',
    archetype: 'tier',
    blurb: 'Classifies an offboarding by driver and velocity to decide how hard to fight.',
    fields: [sel('p', 'Primary driver', ['Price / budget', 'Product gaps', 'Poor onboarding', 'Competitive win', 'Support experience', 'Unused product']), sel('q', 'Churn velocity', ['Planned end of term', 'Quiet exit, early signals', 'Abrupt cancellation']), n('v', 'Annual account value', { def: 20000 }), n('w', 'Save attempts made', { def: 2 })],
    compute: (v) => {
      const p = v.p as string, q = v.q as string, vp = v.v as number, w = v.w as number
      const score = (p === 'Support experience' || p === 'Poor onboarding' ? 3 : p === 'Product gaps' || p === 'Competitive win' ? 2 : 1) + (q === 'Abrupt cancellation' ? 2 : q === 'Quiet exit, early signals' ? 1 : 0) + (vp >= 50000 ? 2 : vp >= 10000 ? 1 : 0)
      const tier = score >= 5 ? 'Fight hard \u2014 preventable' : score >= 3 ? 'Contest \u2014 retention case' : 'Accept \u2014 low ROI save'
      return [
        res('Classification', tier, score >= 5 ? T.bad : score >= 3 ? T.warn : T.neutral, 'Preventable churn gets a save motion now.'),
        res('Primary driver', p, p === 'Support experience' || p === 'Poor onboarding' ? T.bad : T.warn),
        res('Churn velocity', q, q === 'Abrupt cancellation' ? T.warn : T.neutral),
        res('Account value at risk', money(vp), vp >= 50000 ? T.warn : T.neutral),
        res('Save attempts', `${num(w, 0)} made`, w >= 2 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'sla-credit-refund-calculator',
    archetype: 'est',
    blurb: 'Calculates credit due for SLA breaches using the agreed credit scale.',
    fields: [n('a', 'Monthly fee', { def: 10000 }), n('b', 'Outage minutes', { def: 90 }), n('c', 'SLA guarantee %', { def: 99.5 }), sel('s', 'Credit scale', ['Proportional downtime', 'Doubling scale', 'Capped 25%'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, s = v.s as string
      const allowed = ((100 - c) / 100) * 43800
      const over = Math.max(0, b - allowed)
      const share = s === 'Proportional downtime' ? Math.min(1, over / 43800) : s === 'Doubling scale' ? Math.min(1, (over / Math.max(0.001, allowed)) * 0.1) : Math.min(0.25, (over / Math.max(0.001, allowed)) * 0.05)
      const credit = a * share
      return [
        res('Allowed downtime', `${numD(allowed, 0)} min`, T.neutral, `${c}% uptime monthly allowance.`),
        res('Excess downtime', num(over, 0), over === 0 ? T.good : T.bad),
        res('Credit to customer', money(credit), credit > 0 ? T.warn : T.good, `${s} scale applied.`),
        res('Credit cap', s === 'Capped 25%' ? '25% of monthly fee' : 'Per your schedule', T.neutral),
      ]
    },
  },
  {
    id: 'vip-customer-prioritization-matrix',
    archetype: 'matrix',
    blurb: 'Ranks VIP accounts by churn-weighted ARR to decide where premium attention goes.',
    fields: [mx('m', 'VIP accounts', ['ARR ($k)', 'Churn risk /10', 'Touchpoints / week'], ['C-suite pilot', 'Global rollout', 'Strategic partner', 'Major renewer'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['C-suite pilot', 'Global rollout', 'Strategic partner', 'Major renewer']
      const arrW = M.map((r) => (r[0] || 0) * ((r[1] || 0) / 10))
      const top = arrW.indexOf(Math.max(...arrW))
      const churnArr = arrW.reduce((s, x) => s + x, 0) * 1000
      const touch = M.reduce((s, r) => s + (r[2] || 0), 0) / M.length
      return [
        res('Priority account', labels[top], T.bad, `${M[top][1] || 0}/10 churn risk weighted.`),
        res('Churn-weighted ARR', money(churnArr), T.warn, 'ARR at risk across the VIP book.'),
        res('Avg touches / week', numD(touch, 1), touch >= 2 ? T.good : T.warn),
        res('Accounts tracked', `${M.length}`, T.neutral),
      ]
    },
  },
  {
    id: 'support-documentation-outdated-alert-planner',
    archetype: 'tracker',
    blurb: 'Plans the next documentation review from cycle length and flags citation load.',
    fields: [dt('r', 'Last review date'), n('n', 'Review cycle (days)', { def: 90 }), n('o', 'Docs flagged outdated', { def: 12 }), n('w', 'Tickets citing docs', { def: 45 })],
    compute: (v) => {
      const iso = (v.r as string) || '2026-03-01'
      const n = Math.max(1, Math.round(v.n as number))
      const o = Math.max(0, Math.round(v.o as number))
      const w = Math.max(0, Math.round(v.w as number))
      const last = new Date(iso + 'T00:00:00')
      const next = new Date(last.getTime() + n * 864e5)
      const fmt = (x: Date) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const perMonth = o / (n / 30)
      return [
        res('Next review', fmt(next), T.warn, 'Reviews drift silently \u2014 calendarize them.'),
        res('Review cycle', `${num(n, 0)} days`, n <= 90 ? T.good : T.warn),
        res('Outdated docs', num(o, 0), o <= 10 ? T.good : T.warn),
        res('Tickets citing docs', num(w, 0), w <= 30 ? T.good : T.warn, 'High citations on outdated docs = churn on known gaps.'),
        res('Docs to review / month', numD(perMonth, 1), T.neutral),
      ]
    },
  },
  {
    id: 'support-knowledge-gap-finder',
    archetype: 'checklist',
    blurb: 'Checks which high-fail topics are missing a solid article, exposing KB gaps.',
    fields: [ck('c', 'High-fail topics (tick if NO good article)', ['Password reset flow', 'Integrations setup', 'Billing dispute', 'Advanced permissions', 'Migration guide', 'Feature how-tos'])],
    compute: (v) => {
      const items = (v.c as boolean[]) || []
      const missing = items.filter(Boolean).length
      const total = items.length
      const readiness = ((total - missing) / total) * 100
      return [
        res('KB coverage', pct(readiness, 0), readiness >= 80 ? T.good : readiness >= 60 ? T.warn : T.bad, 'Topics ticked = known gaps.'),
        res('Open gaps', `${missing} topic(s)`, missing === 0 ? T.good : T.warn),
        res('Search abandonment', missing >= 4 ? 'Rising \u2014 fix gaps this sprint' : 'Contained', missing >= 4 ? T.bad : T.good),
        res('Fix priority', missing ? 'Write the top 3 gaps with screenshots' : 'Refresh-only cycle', missing ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'vip-service-escalation-hierarchy-builder',
    archetype: 'fmt',
    blurb: 'Builds a VIP escalation tree with response targets at every layer.',
    fields: [txt('c', 'Organization'), txt('d', 'Account / exec'), ck('l', 'Escalation layers', ['L1 support', 'L2 specialist', 'Dedicated CSM', 'Escalation manager', 'Executive sponsor', 'Crisis line']), n('t', 'Initial response target (min)', { def: 15 })],
    compute: (v) => {
      const org = ((v.c as string) || '').trim() || 'Company'
      const acct = ((v.d as string) || '').trim() || 'VIP account'
      const l = v.l as boolean[]
      const layers = ['L1 support', 'L2 specialist', 'Dedicated CSM', 'Escalation manager', 'Executive sponsor', 'Crisis line']
      const count = l.filter(Boolean).length
      const t = v.t as number
      let doc = `VIP ESCALATION TREE \u2014 ${org.toUpperCase()} / ${acct.toUpperCase()}\n\nInitial response target: ${num(t, 0)} min\n\nLayers:\n`
      doc += layers.map((x, i) => `${i + 1}. ${x} ${l[i] ? '\u2713' : '(\u2013 not defined)'}`).join('\n')
      doc += '\n\nOn open: L1 within 15 min, CSM within 1 hr, exec sponsor within 4 hr for red-tier.'
      return [
        res('Escalation layers', `${count}/6`, count >= 5 ? T.good : count >= 3 ? T.warn : T.bad, 'A red-tier VIP needs all six defined.'),
        res('Initial response', `${num(t, 0)} min`, t <= 15 ? T.good : t <= 30 ? T.warn : T.bad),
        docRes('VIP escalation tree', doc),
      ]
    },
  },
  {
    id: 'support-agent-burnout-index-calculator',
    archetype: 'index',
    blurb: 'Estimates burnout risk from occupancy, stretch, absenteeism and QA trend.',
    fields: [n('o', 'Occupancy %', { def: 88 }), n('c', 'Consecutive hours (avg)', { def: 6 }), n('a', 'Absenteeism last 30d (days)', { def: 3 }), n('q', 'QA score', { def: 75 })],
    compute: (v) => {
      const o = v.o as number, c = v.c as number, a = v.a as number, q = v.q as number
      const burn = clamp(o * 0.5 + (c - 4) * 10 + a * 4 + (100 - q) * 0.4, 0, 100)
      return [
        res('Burnout index', pct(burn, 1), burn >= 65 ? T.bad : burn >= 35 ? T.warn : T.good, 'Above 65 treat staffing before coaching.'),
        res('Occupancy', pct(o, 1), o <= 90 ? T.good : o <= 95 ? T.warn : T.bad),
        res('Consecutive hours', `${num(c, 0)} hr`, c <= 5 ? T.good : c <= 6 ? T.warn : T.bad),
        res('Absenteeism', `${num(a, 0)} days`, a <= 2 ? T.good : a <= 4 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'customer-success-quarterly-business-review-qbr-builder',
    archetype: 'fmt',
    blurb: 'Builds a CS QBR agenda around value, health and roadmap for the quarter.',
    fields: [txt('c', 'Customer'), txt('s', 'CSM / sponsor'), sel('f', 'Focus', ['Value expansion', 'Renewal defense', 'Product roadmap', 'Operational review']), ck('t', 'QBR sections', ['Metrics vs goals', 'Health & risk', 'Adoption deep dive', 'Roadmap alignment', 'Action items', 'Next quarter plan'])],
    compute: (v) => {
      const cust = ((v.c as string) || '').trim() || 'Account'
      const csm = ((v.s as string) || '').trim() || 'CSM'
      const f = v.f as string
      const t = v.t as boolean[]
      const sections = ['Metrics vs goals', 'Health & risk', 'Adoption deep dive', 'Roadmap alignment', 'Action items', 'Next quarter plan']
      const count = t.filter(Boolean).length
      const runLen = 60 + Math.max(0, count - 4) * 15
      let doc = `QBR AGENDA \u2014 ${cust.toUpperCase()}\nCSM: ${csm}    Focus: ${f}\n\nSections:\n`
      doc += sections.map((x, i) => `${i + 1}. ${x}${t[i] ? ' \u2713' : ' \u2013 (add)'}`).join('\n')
      doc += `\n\nRun length: ~${num(runLen, 0)} min. Book the next QBR before you leave the room.`
      return [
        res('QBR coverage', `${count}/6`, count >= 5 ? T.good : count >= 4 ? T.warn : T.bad),
        res('Focus', f, T.neutral, f === 'Renewal defense' ? 'Spend the meeting eliminating churn signals.' : 'Anchor on expansion value.'),
        res('Run length', `${num(runLen, 0)} min`, runLen <= 90 ? T.good : T.warn),
        docRes('QBR agenda', doc),
      ]
    },
  },
  {
    id: 'customer-service-kpi-summary-dashboard',
    archetype: 'scorecard',
    blurb: 'Rolls the core support KPIs into one weighted service-health score.',
    fields: [mxd('m', 'KPI areas', ['Area', 'Weight %', 'Score /10'], ['CSAT / NPS', 'FCR & AHT', 'SLA compliance', 'Escalations', 'Self-service rate'], [[25, 7], [25, 8], [20, 8], [15, 7], [15, 5]]), sel('d', 'Period', ['Last 7 days', 'Last month', 'Quarter to date'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['CSAT / NPS', 'FCR & AHT', 'SLA compliance', 'Escalations', 'Self-service rate']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      const below = M.filter((r) => (r[1] || 0) < 7).length
      return [
        res('Service health', `${num(wScore, 0)}/100`, wScore >= 80 ? T.good : wScore >= 65 ? T.warn : T.bad, 'Weighted roll-up of the core KPIs.'),
        res('Weakest KPI', labels[minI], T.warn, 'Sequence the improvement sprint here.'),
        res('Below-target areas', `${below} of ${M.length}`, below === 0 ? T.good : T.warn),
        res('Period', v.d as string, T.neutral),
      ]
    },
  },
]