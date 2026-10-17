import { ck, clamp, doc as docRes, dt, hours, money, mx, mxd, n, num, numD, pct, ratio, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

export const specs: OfficeToolSpec[] = [
  // ---------------- Pipeline & Leads ----------------
  {
    id: 'sales-pipeline-conversion-rate-calculator',
    archetype: 'index',
    blurb: 'Tracks the conversion of deals through staged funnels down to closed-won.',
    fields: [n('a', 'Deals at stage 1', { def: 100 }), n('b', 'Deals to stage 2', { def: 60 }), n('c', 'Deals to stage 3', { def: 40 }), n('d', 'Deals closed won', { def: 25 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const conv = a ? clamp((d / a) * 100, 0, 100) : 0
      const s1 = a ? clamp((b / a) * 100, 0, 100) : 0
      const s2 = b ? clamp((c / b) * 100, 0, 100) : 0
      const s3 = c ? clamp((d / c) * 100, 0, 100) : 0
      return [
        res('Overall conversion', pct(conv, 1), conv >= 25 ? T.good : conv >= 15 ? T.warn : T.bad, 'Healthy B2B funnels convert 15-30% end to end.'),
        res('Stage 1 \u2192 2', pct(s1, 1), T.neutral),
        res('Stage 2 \u2192 3', pct(s2, 1), T.neutral),
        res('Stage 3 \u2192 won', pct(s3, 1), s3 >= 50 ? T.good : T.warn, 'Closing step below 50% usually signals pricing or champion risk.'),
        res('Won deals', num(d, 0), T.neutral),
      ]
    },
  },
  {
    id: 'sales-velocity-calculator',
    archetype: 'est',
    blurb: 'Measures how quickly pipeline turns into revenue to size the forecast.',
    fields: [n('a', 'Won deals', { def: 20 }), n('b', 'Avg deal size', { def: 25000 }), n('c', 'Win rate %', { def: 30 }), n('d', 'Avg cycle length (days)', { def: 60 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = Math.max(1, v.d as number)
      const vel = (a * b * (c / 100)) / d
      return [
        res('Sales velocity / day', money(vel), vel > 0 ? T.good : T.neutral, 'Win rate and cycle length move it faster than deal size alone.'),
        res('Monthly run-rate', money(vel * 30), T.neutral),
        res('Annualized run-rate', money(vel * 365), vel * 365 > 1000000 ? T.good : T.warn),
        res('Cycle length', `${num(d, 0)} days`, d <= 60 ? T.good : d <= 90 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'lead-scoring-matrix-builder',
    archetype: 'matrix',
    blurb: 'Weights lead-qualification dimensions into a single score and hot/warm/cold tier.',
    fields: [mx('m', 'Scoring dimensions', ['Points /10', 'Weight %'], ['Firmographic fit', 'Behavioural intent', 'Budget signal', 'Engagement recency', 'Decision-maker access'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Firmographic fit', 'Behavioural intent', 'Budget signal', 'Engagement recency', 'Decision-maker access']
      const w = M.reduce((s, r) => s + (r[1] || 0), 0) || 1
      const score = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w
      const s100 = score * 10
      const top = M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Lead score', `${num(clamp(s100, 0, 100), 0)}/100`, s100 >= 70 ? T.good : s100 >= 40 ? T.warn : T.bad),
        res('Lead tier', s100 >= 70 ? 'Hot' : s100 >= 40 ? 'Warm' : 'Cold', s100 >= 70 ? T.good : s100 >= 40 ? T.warn : T.bad, 'Route hot leads to SDR same-day; cold stays in nurture.'),
        res('Highest weighted dimension', labels[top], T.neutral),
        res('Weight coverage', pct(Math.min(100, w), 0), Math.abs(w - 100) <= 1 ? T.good : T.warn, 'Weights should total 100%.'),
      ]
    },
  },
  {
    id: 'ideal-customer-profile-icp-fit-scorer',
    archetype: 'scorecard',
    blurb: 'Scores a deal against the ideal customer profile to gate qualification and focus sales time.',
    fields: [mxd('m', 'ICP criteria', ['Criterion', 'Weight %', 'Score /10'], ['Budget alignment', 'Firm size / segment', 'Pain point urgency', 'Procurement process', 'Competitive fit'], [[25, 7], [20, 8], [25, 6], [15, 7], [15, 5]]), sel('s', 'Fit threshold', ['Qualify only', 'MQL', 'Opportunity'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Budget alignment', 'Firm size / segment', 'Pain point urgency', 'Procurement process', 'Competitive fit']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('ICP fit score', `${num(wScore, 0)}/100`, wScore >= 80 ? T.good : wScore >= 60 ? T.warn : T.bad, 'Gate: below the threshold means nurture, not sales time.'),
        res('Weakest criterion', labels[minI], T.warn, `Score ${num(M[minI][1] || 0, 0)}/10 \u2014 it drags the whole fit count.`),
        res('Gate check', v.s as string, T.neutral),
      ]
    },
  },
  {
    id: 'sales-demo-win-rate-analyzer',
    archetype: 'est',
    blurb: 'Measures demo conversion, demo-to-close lag and competitive exposure for the demo band.',
    fields: [n('a', 'Demos delivered', { def: 50 }), n('b', 'Demos won', { def: 18 }), n('c', 'Avg demo-to-close (days)', { def: 21 }), n('d', 'Competitive demos', { def: 12 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const winRate = (b / a) * 100
      const compRate = (d / a) * 100
      const monthlyWins = b * 30 / Math.max(1, c)
      return [
        res('Demo win rate', pct(winRate, 1), winRate >= 40 ? T.good : winRate >= 25 ? T.warn : T.bad, 'Good demo bands convert 40%+; weak ones stall at closing.'),
        res('Demo-to-close', `${num(c, 0)} days`, c <= 21 ? T.good : c <= 45 ? T.warn : T.bad, 'Long tails point to procurement friction, not demo quality.'),
        res('Competitive exposure', pct(compRate, 1), compRate > 40 ? T.warn : T.good, 'High bake-off share needs battle cards tuned per competitor.'),
        res('Monthly win pace', `${numD(monthlyWins, 1)} deals/mo`, T.neutral),
      ]
    },
  },
  {
    id: 'b2b-outbound-email-response-estimator',
    archetype: 'est',
    blurb: 'Rolls outbound email into opens, replies, meetings and cost-per-meeting.',
    fields: [n('a', 'Emails sent', { def: 1000 }), n('b', 'Open rate %', { def: 40 }), n('c', 'Reply rate % (of opened)', { def: 8 }), n('d', 'Meetings booked per reply %', { def: 30 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const opens = a * (b / 100)
      const replies = opens * (c / 100)
      const meetings = replies * (d / 100)
      const perMeeting = Math.max(1, Math.ceil(a / Math.max(0.01, meetings)))
      return [
        res('Opens', num(opens, 0), opens / a > 0.35 ? T.good : T.warn, 'Subject + sender name drive most open variance.'),
        res('Replies', num(replies, 0), replies / a > 0.03 ? T.good : T.warn),
        res('Meetings booked', num(meetings, 0), meetings / a > 0.01 ? T.good : T.bad),
        res('Meeting conversion', pct((meetings / a) * 100, 2), (meetings / a) * 100 >= 1 ? T.good : T.bad),
        res('Emails per meeting', num(perMeeting, 0), perMeeting <= 200 ? T.good : T.warn, 'Sub-200:1 is a well-tuned sequence.'),
      ]
    },
  },
  {
    id: 'rfp-request-for-proposal-response-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores an RFP response for strength while flagging the sections buyers weigh most.',
    fields: [mxd('m', 'RFP response areas', ['Section', 'Weight %', 'Score /10'], ['Executive summary', 'Technical response', 'Pricing & commercial', 'Implementation plan', 'Risk & compliance'], [[15, 8], [30, 7], [25, 8], [20, 7], [10, 8]]), sel('g', 'Gate check', ['On competitive list?', 'Shortlist only', 'Gap-pass'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Executive summary', 'Technical response', 'Pricing & commercial', 'Implementation plan', 'Risk & compliance']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const maxI = M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Response strength', `${num(wScore, 0)}/100`, wScore >= 80 ? T.good : wScore >= 65 ? T.warn : T.bad, 'Score below 65 usually fails the cut on technical depth.'),
        res('Strongest section', labels[maxI], T.good),
        res('Weakest section', labels[minI], T.warn, 'Buyers notice a weak pricing narrative more than any other miss.'),
        res('Gate check', v.g as string, T.neutral),
      ]
    },
  },
  {
    id: 'sales-funnel-leakage-calculator',
    archetype: 'index',
    blurb: 'Shows where pipeline leaks between stages so you attack the biggest drop-off first.',
    fields: [n('a', 'Leads in', { def: 200 }), n('b', 'Qualified', { def: 90 }), n('c', 'In demo', { def: 45 }), n('d', 'Proposal sent', { def: 20 }), n('e', 'Closed won', { def: 9 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const conv = clamp((e / a) * 100, 0, 100)
      const r1 = clamp((b / a) * 100, 0, 100)
      const r2 = b ? clamp((c / b) * 100, 0, 100) : 0
      const r3 = c ? clamp((d / c) * 100, 0, 100) : 0
      const r4 = d ? clamp((e / d) * 100, 0, 100) : 0
      return [
        res('Funnel conversion', pct(conv, 1), conv >= 8 ? T.good : conv >= 5 ? T.warn : T.bad, 'A 5-10% inlet-to-win funnel is a healthy benchmark.'),
        res('Qualification rate', pct(r1, 1), r1 >= 50 ? T.good : T.warn),
        res('Qualified \u2192 demo', pct(r2, 1), r2 >= 50 ? T.good : T.warn),
        res('Demo \u2192 proposal', pct(r3, 1), r3 >= 45 ? T.good : T.warn),
        res('Proposal \u2192 win', pct(r4, 1), r4 >= 40 ? T.good : T.bad, 'Lowest rung wins fix fastest with pricing discipline.'),
        res('Total leaked', num(Math.max(0, a - e), 0), T.neutral),
      ]
    },
  },
  {
    id: 'sales-lead-decay-estimator',
    archetype: 'est',
    blurb: 'Models how a lead\u2019s close likelihood decays after qualification until you re-engage.',
    fields: [n('a', 'Leads qualified', { def: 100 }), n('b', 'Days since qualification', { def: 10 }), n('c', 'Half-life (days)', { def: 14 }), n('d', 'Baseline close rate %', { def: 25 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = Math.max(1, v.c as number), d = v.d as number
      const rate = d * Math.pow(0.5, b / c)
      const relative = (rate / d) * 100
      const lostValue = (a * (d - rate)) / 100
      return [
        res('Current close likelihood', pct(rate, 1), rate >= d * 0.6 ? T.good : rate >= d * 0.3 ? T.warn : T.bad),
        res('vs fresh leads', pct(relative, 0), relative >= 60 ? T.good : T.warn, 'Time kills pipeline value faster than most realize.'),
        res('Lost conversion value', num(lostValue, 1), lostValue > 0 ? T.warn : T.good, 'Lead count this decayed would deliver today.'),
        res('Half-life', `${num(c, 0)} days`, c >= 14 ? T.good : T.warn, 'Re-touch before half the value decays.'),
      ]
    },
  },
  {
    id: 'b2b-sales-cycle-length-calculator',
    archetype: 'est',
    blurb: 'Converts pipeline coverage and win rate into projected bookings and cycle pressure.',
    fields: [n('a', 'Pipeline value', { def: 600000 }), n('b', 'Avg cycle length (days)', { def: 70 }), n('c', 'Win rate %', { def: 25 }), n('d', 'Pipeline coverage %', { def: 400 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = v.c as number, d = v.d as number
      const wins = a * (c / 100)
      const monthly = wins / (b / 30)
      return [
        res('Projected won value', money(wins), a > 0 ? T.good : T.neutral),
        res('Monthly booking rate', money(monthly), monthly > 0 ? T.good : T.neutral, 'Full pipeline turns once per cycle length.'),
        res('Cycle length', `${num(b, 0)} days`, b <= 70 ? T.good : b <= 105 ? T.warn : T.bad),
        res('Pipeline coverage', pct(d, 1), d >= 300 ? T.good : d >= 200 ? T.warn : T.bad, '3-4x quota is the healthy coverage band.'),
      ]
    },
  },
  {
    id: 'trial-to-paid-conversion-rate-estimator',
    archetype: 'index',
    blurb: 'Measures trial-to-paid conversion with activation as the leading indicator.',
    fields: [n('a', 'Trials started', { def: 500 }), n('b', 'Activated (meaningful use)', { def: 220 }), n('c', 'Paid conversions', { def: 60 }), n('d', 'Median days to convert', { def: 14 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const conv = clamp((c / a) * 100, 0, 100)
      const act = (b / a) * 100
      const ofAct = b ? (c / b) * 100 : 0
      return [
        res('Trial \u2192 paid conversion', pct(conv, 1), conv >= 15 ? T.good : conv >= 8 ? T.warn : T.bad, 'A 15%+ trial conversion is strong; under 8% usually means activation is missing.'),
        res('Activation rate', pct(act, 1), act >= 50 ? T.good : T.warn, 'Meaningful use within the first session drives pay ups.'),
        res('Conversion of activated', pct(ofAct, 1), T.neutral),
        res('Median conversion window', `${num(d, 0)} days`, d <= 21 ? T.good : T.warn, 'Extend free trials past this window hashing diminishing returns.'),
      ]
    },
  },
  {
    id: 'win-back-campaign-conversion-estimator',
    archetype: 'est',
    blurb: 'Prices a win-back campaign by won-back customers, regained ARR and campaign ROI.',
    fields: [n('a', 'Churned customers targeted', { def: 300 }), n('b', 'Win-back rate %', { def: 12 }), n('c', 'Avg regained ARR', { def: 5000 }), n('d', 'Campaign cost', { def: 4000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const won = a * (b / 100)
      const arr = won * c
      const roi = arr - d
      return [
        res('Customers won back', num(won, 0), won >= 10 ? T.good : T.warn),
        res('Regained ARR', money(arr), arr > d ? T.good : T.bad),
        res('Campaign ROI', money(roi), roi >= 0 ? T.good : T.bad, 'A 12-20% win-back rate is realistic if you know why they left.'),
        res('Win-back rate', pct(b, 0), b >= 12 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'lead-response-time-impact-estimator',
    archetype: 'est',
    blurb: 'Quantifies pipeline lost to slow lead follow-up.',
    fields: [n('a', 'Leads / month', { def: 300 }), n('b', 'Avg response time (hr)', { def: 48 }), n('c', 'Qualify rate at 1 hr %', { def: 60 }), n('d', 'Qualify rate at current TTR %', { def: 20 }), n('e', 'Avg opportunity value', { def: 20000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const drop = Math.max(0, c - d)
      const lost = a * (drop / 100)
      const value = lost * e
      const decay = c ? (drop / c) * 100 : 0
      return [
        res('Conversion decay', pct(decay, 0), decay >= 50 ? T.bad : decay >= 25 ? T.warn : T.good, 'Slow response burns most of the lead value.'),
        res('Leads lost / month', num(lost, 0), lost > 0 ? T.warn : T.good),
        res('Lost pipeline value', money(value), value > 0 ? T.bad : T.good),
        res('Current response', `${num(b, 0)} hr`, b <= 1 ? T.good : b <= 24 ? T.warn : T.bad, 'Sub-hour response converts ~7x better than 24+ hours.'),
        res('Qualify-rate delta', pct(drop, 0), T.neutral),
      ]
    },
  },
  {
    id: 'proposal-win-loss-analysis-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores win/loss drivers after a proposal to learn where the deal was really won or lost.',
    fields: [mxd('m', 'Win/loss drivers', ['Driver', 'Weight %', 'Score /10'], ['Price vs budget', 'Competitive position', 'Decision-maker access', 'Timeline fit', 'Product gaps'], [[25, 7], [25, 6], [20, 8], [15, 7], [15, 5]]), sel('o', 'Outcome', ['Won', 'Lost', 'No decision'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Price vs budget', 'Competitive position', 'Decision-maker access', 'Timeline fit', 'Product gaps']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const maxI = M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)
      const dm = M[2][1] || 0
      return [
        res('Proposal strength', `${num(wScore, 0)}/100`, wScore >= 75 ? T.good : wScore >= 55 ? T.warn : T.bad, 'Log this after every outcome to build a decision database.'),
        res('Primary driver', labels[maxI], T.good, 'Lead with the strongest driver in the next room.'),
        res('Decision-maker reach', `${num(dm, 0)}/10`, dm >= 7 ? T.good : T.warn, 'Missing the economic buyer predicts most losses.'),
        res('Outcome', v.o as string, v.o === 'Won' ? T.good : v.o === 'Lost' ? T.bad : T.neutral),
      ]
    },
  },
  {
    id: 'product-demonstration-checklist-generator',
    archetype: 'checklist',
    blurb: 'Runs a demo readiness gate before every product demonstration call.',
    fields: [ck('c', 'Demo checklist', ['Stakeholder discovery notes', 'Environment pre-checked', 'Success metrics agreed', '10-min value moment planned', 'Objection handling mapped', 'Follow-up written in CRM', 'Competitive gap covered'])],
    compute: (v) => {
      const items = (v.c as boolean[]) || []
      const done = items.filter(Boolean).length
      const total = items.length
      const pctDone = (done / total) * 100
      const mustMiss = items.filter((x, i) => !x && (i === 0 || i === 1 || i === 4)).length
      return [
        res('Demo readiness', pct(pctDone, 0), pctDone === 100 ? T.good : pctDone >= 70 ? T.warn : T.bad, 'Reschedule if the value moment or discovery notes are missing.'),
        res('Critical gaps', `${mustMiss} of 3 must-have items missing`, mustMiss === 0 ? T.good : T.bad),
        res('Remaining items', `${total - done}`, T.neutral),
      ]
    },
  },
  {
    id: 'competitor-battle-card-generator',
    archetype: 'fmt',
    blurb: 'Assembles a competitor battle card from verified facts, gaps and deal context.',
    fields: [txt('c', 'Competitor'), ck('f', 'Facts on file', ['Pricing public', 'Feature matrix documented', 'Known gaps tabulated', 'Win/loss records', 'Positioning statement', 'Objection plays']), sel('s', 'Deal context', ['Boards & CFOs', 'ICPs with heavy IT', 'Competitive bake-off'])],
    compute: (v) => {
      const comp = ((v.c as string) || '').trim() || 'Competitor'
      const f = v.f as boolean[]
      const facts = ['Pricing public', 'Feature matrix documented', 'Known gaps tabulated', 'Win/loss records', 'Positioning statement', 'Objection plays']
      const count = f.filter(Boolean).length
      const ctx = v.s as string
      let doc = `BATTLE CARD \u2014 vs ${comp.toUpperCase()}\n\nDeal context: ${ctx}\n\nVerified facts:\n`
      doc += facts.map((x, i) => `  [${f[i] ? 'x' : ' '}] ${x}`).join('\n')
      doc += '\n\nPositioning: lead with the driver that matters most here, concede a real gap honestly, and pivot to a proof point.'
      doc += '\nObjection play: three-counter formula \u2014 reframe, proof point, next step.'
      return [
        res('Battle card coverage', `${count}/6`, count >= 5 ? T.good : count >= 3 ? T.warn : T.bad, 'Facts beat claims in a bake-off.'),
        res('Deal context', ctx, T.neutral),
        res('Wing-gap readiness', f[2] ? 'Gaps tabulated \u2014 craft the concession' : 'Gaps unknown \u2014 risky', f[2] ? T.good : T.warn),
        docRes('Battle card', doc),
      ]
    },
  },
  {
    id: 'sales-collateral-roi-calculator',
    archetype: 'est',
    blurb: 'Measures how much revenue a collateral asset actually lifts in the deals it touches.',
    fields: [n('a', 'Collateral pieces', { def: 5 }), n('b', 'Deals touched', { def: 120 }), n('c', 'Win rate with it %', { def: 35 }), n('d', 'Win rate without %', { def: 20 }), n('e', 'Avg deal size', { def: 25000 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const lift = Math.max(0, c - d)
      const incr = b * (lift / 100)
      const attrib = incr * e
      return [
        res('Incremental wins', numD(incr, 1), incr > 0 ? T.good : T.neutral),
        res('Attributed revenue', money(attrib), attrib > 0 ? T.good : T.warn),
        res('ROI per asset', money(attrib / a), (attrib / a) > e ? T.good : T.warn, 'Each asset should beat the deal value it changes.'),
        res('Win-rate lift', pct(Math.min(100, lift), 1), lift >= 10 ? T.good : lift >= 5 ? T.warn : T.bad),
      ]
    },
  },
  // ---------------- Compensation & Territory ----------------
  {
    id: 'quota-attainment-and-commission-accelerator',
    archetype: 'est',
    blurb: 'Estimates commission with and without an accelerator, and the gap to quota.',
    fields: [n('a', 'Quota', { def: 250000 }), n('b', 'Closed revenue', { def: 210000 }), n('c', 'Base commission %', { def: 16 }), n('d', 'Accelerator threshold %', { def: 110 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const att = (b / a) * 100
      const accel = att >= d
      const comm = b * (c / 100) * (accel ? 1.25 : 1)
      return [
        res('Attainment', pct(att, 1), att >= 100 ? T.good : att >= 80 ? T.warn : T.bad, 'Below 80% of quota, most plans risk accelerators being out of reach.'),
        res('Estimated commission', money(comm), comm > 0 ? T.good : T.neutral),
        res('Accelerator', accel ? 'Active \u00d71.25' : 'Not yet reached', accel ? T.good : T.warn, `Threshold is ${pct(d, 0)} attainment.`),
        res('Gap to quota', money(Math.max(0, a - b)), b >= a ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'deal-discount-approval-matrix',
    archetype: 'matrix',
    blurb: 'Maps discount bands to required approval authority and flags authority gaps.',
    fields: [mx('m', 'Approval tiers', ['Discount %', 'Approval level (1-4)'], ['Under 10%', '10-20%', '20-30%', 'Over 30%'])],
    compute: (v) => {
      const M = v.m as number[][]
      const req = [1, 2, 3, 4]
      const gaps = M.reduce((s, r, i) => s + Math.max(0, req[i] - (Math.round(r[1] || 0))), 0)
      const avgLevel = M.reduce((s, r) => s + Math.min(4, Math.max(0, Math.round(r[1] || 0))), 0) / M.length
      const maxDisc = Math.max(...M.map((r) => Math.max(0, r[0] || 0)))
      return [
        res('Avg approval level', numD(avgLevel, 1), avgLevel >= 3 ? T.good : T.warn, 'Typical plans cap reps at level 2.'),
        res('Authority gaps to fix', num(gaps, 0), gaps === 0 ? T.good : T.bad, 'Level must be: <10% = 1, <20% = 2, <30% = 3, >30% = 4.'),
        res('Max discount tier', `${num(maxDisc, 0)}%`, maxDisc > 20 ? T.warn : T.good),
        res('Tiers defined', `${M.length}`, T.neutral),
      ]
    },
  },
  {
    id: 'sales-compensation-plan-generator',
    archetype: 'fmt',
    blurb: 'Drafts a commission plan with OTE, target variable and the pay elements that define it.',
    fields: [txt('o', 'Company'), n('q', 'Typical quota ($k)', { def: 300 }), n('b', 'Base salary ($k)', { def: 90 }), sel('m', 'Mix model', ['50/50', '60/40', '80/20']), ck('k', 'Pay elements', ['Base tier', 'Straight commission', 'Accelerator kickers', 'Tiered SPIFF', 'Clawback rules'])],
    compute: (v) => {
      const co = ((v.o as string) || '').trim() || 'Company'
      const q = v.q as number, base = v.b as number, mix = v.m as string
      const share = mix === '50/50' ? 0.5 : mix === '60/40' ? 0.6 : 0.8
      const ote = base / share
      const varTarget = ote - base
      const elements = (v.k as boolean[]) || []
      const count = elements.filter(Boolean).length
      const names = ['Base tier', 'Straight commission', 'Accelerator kickers', 'Tiered SPIFF', 'Clawback rules']
      let doc = `SALES COMPENSATION PLAN \u2014 ${co.toUpperCase()}\n\nMix: ${mix}   OTE: $${Math.round(ote)}k   Target variable: $${Math.round(varTarget)}k\nQuota: $${q}k\n\nPay elements:\n`
      doc += names.map((x, i) => `  [${elements[i] ? 'x' : ' '}] ${x}`).join('\n')
      doc += '\n\nRules: commission pays on landed revenue; accelerator x1.25 above 110% attainment; clawback retains 30% for renewals risk.'
      return [
        res('OTE', money(ote * 1000), T.good),
        res('Target variable', money(varTarget * 1000), T.neutral, `${mix} mix at a $${Math.round(base)}k base.`),
        res('Plan coverage', `${count}/5 elements`, count >= 4 ? T.good : T.warn),
        docRes('Compensation plan', doc),
      ]
    },
  },
  {
    id: 'territory-alignment-and-quota-allocation-matrix',
    archetype: 'matrix',
    blurb: 'Balances territory weight against headcount to show where quota coverage thins.',
    fields: [mx('m', 'Territories', ['Weight % of TAM', 'Headcount'], ['East', 'Central', 'West', 'Enterprise', 'Mid-market'])],
    compute: (v) => {
      const M = v.m as number[][]
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const hc = M.reduce((s, r) => s + (r[1] || 0), 0) || 1
      const ratios = M.map((r) => (r[0] || 0) / Math.max(0.01, r[1] || 0.01))
      const maxR = Math.max(...ratios)
      const minR = Math.min(...ratios)
      const spread = maxR / Math.max(0.01, minR)
      return [
        res('Weight per head (avg)', numD(w / hc, 1), T.neutral, 'Higher weight per head = thinner coverage.'),
        res('Coverage balance', `${numD(spread, 1)}\u00d7 spread`, spread <= 1.3 ? T.good : T.warn, 'Below 1.3x means allocations are roughly even.'),
        res('Headcount', num(hc, 0), T.neutral),
        res('Weight coverage', pct(Math.min(100, w), 0), Math.abs(w - 100) <= 1 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'sales-incentive-spiff-budget-allocator',
    archetype: 'est',
    blurb: 'Sizes a spiff budget against expected attainment and per-rep award.',
    fields: [n('a', 'Spiff budget', { def: 25000 }), n('b', 'Included reps', { def: 40 }), n('c', 'Expected attainment %', { def: 70 }), n('d', 'Avg spiff per rep', { def: 700 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const eligible = b * (c / 100)
      const spend = eligible * d
      const perRep = Math.max(0.01, eligible)
      return [
        res('Reps eligible', numD(eligible, 1), eligible > 0 ? T.good : T.neutral, 'Attainment-discounted eligible population.'),
        res('Planned spend', money(spend), spend <= a ? T.good : T.bad),
        res('Budget left / (over)', money(a - spend), spend <= a ? T.good : T.bad),
        res('Per-rep budget', money(spend / perRep), T.neutral),
      ]
    },
  },
  {
    id: 'value-based-pricing-calculator',
    archetype: 'est',
    blurb: 'Prices from customer value instead of cost, then checks it against your benchmark.',
    fields: [n('a', 'Annual customer value ($k)', { def: 500 }), n('b', 'Months to realize value', { def: 6 }), n('c', 'Benchmark price ($k)', { def: 50 }), sel('s', 'Price anchor', ['Cost-plus', 'Competitive', 'Value-capture 30%', 'Value-capture 50%'])],
    compute: (v) => {
      const a = v.a as number, c = v.c as number, s = v.s as string
      const value = a * 1000
      const pick = s.includes('50%') ? value * 0.5 : s.includes('30%') ? value * 0.3 : c * 1000
      const bench = c * 1000
      const custRoi = value - pick
      return [
        res('Value at stake', money(value), T.neutral, `Realized over ${num(v.b as number, 0)} months.`),
        res('Captured price', money(pick), pick >= bench ? T.good : T.warn, `Anchor selected: ${s}.`),
        res('vs benchmark', pct((pick / bench - 1) * 100, 1, true), pick > bench ? T.good : T.warn),
        res('Customer ROI / yr', money(custRoi), custRoi > 0 ? T.good : T.bad, 'Keep customer ROI positive or the renewal is at risk.'),
      ]
    },
  },
  {
    id: 'sales-team-spiff-roi-estimator',
    archetype: 'est',
    blurb: 'Measures spiff spend against the incremental margin it converts.',
    fields: [n('a', 'Reps', { def: 30 }), n('b', 'Avg spiff award', { def: 400 }), n('c', 'Incremental deals', { def: 15 }), n('d', 'Avg deal margin', { def: 12000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const spend = a * b
      const margin = c * d
      const roi = spend ? ((margin - spend) / spend) * 100 : 0
      return [
        res('Spiff spend', money(spend), T.neutral),
        res('Incremental margin', money(margin), margin > spend ? T.good : T.warn),
        res('Spiff ROI', pct(roi, 1), roi > 30 ? T.good : roi > 0 ? T.warn : T.bad, 'Healthy spiffs clear 30% ROI; anything below 0 eats margin.'),
        res('Cost per incremental deal', money(spend / Math.max(1, c)), T.neutral),
      ]
    },
  },
  {
    id: 'territory-travel-cost-estimator',
    archetype: 'est',
    blurb: 'Sizes territory travel spend per quarter and flags the drive-vs-fly mix.',
    fields: [n('a', 'Reps in territory', { def: 4 }), n('b', 'Trips per rep per quarter', { def: 3 }), n('c', 'Avg trip cost', { def: 1200 }), n('d', 'Interstate drives %', { def: 60 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const quarter = a * b * c
      const annual = quarter * 4
      return [
        res('Quarterly travel spend', money(quarter), T.neutral),
        res('Annual travel spend', money(annual), annual > 200000 ? T.warn : T.good),
        res('Per-rep annual', money(annual / a), T.neutral),
        res('Drive share', pct(d, 0), d > 80 ? T.warn : T.good, 'Fly when the one-way drive clears ~3 hours.'),
      ]
    },
  },
  {
    id: 'sales-commission-clawback-estimator',
    archetype: 'est',
    blurb: 'Estimates commission at risk of clawback from early churn and a sensible reserve.',
    fields: [n('a', 'Commissioned deals', { def: 120 }), n('b', 'Commission paid', { def: 250000 }), n('c', 'Clawback rate % (on churn)', { def: 30 }), n('d', 'Early churn rate %', { def: 15 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const churnedDeals = a * (d / 100)
      const exposure = b * (d / 100)
      const claw = exposure * (c / 100)
      return [
        res('Deals at clawback risk', numD(churnedDeals, 1), churnedDeals >= 1 ? T.warn : T.good),
        res('Annual churn exposure', money(exposure), exposure > 0 ? T.warn : T.good, 'Commission on deals that churn inside the earn-out window.'),
        res('Clawback recovery', money(claw), claw > 0 ? T.warn : T.good),
        res('Reserve suggestion', money(b * (c / 100)), T.neutral, 'Hold about ' + num(c, 0) + '% of paid commissions in a clawback reserve.'),
      ]
    },
  },
  {
    id: 'enterprise-pricing-tier-matrix-builder',
    archetype: 'matrix',
    blurb: 'Checks seat minimums, per-seat price and entry basket across pricing tiers.',
    fields: [mx('m', 'Tiers', ['Seat minimum', 'Price ($/seat)'], ['Starter', 'Growth', 'Business', 'Enterprise'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Starter', 'Growth', 'Business', 'Enterprise']
      const seats = M.map((r) => Math.max(1, r[0] || 0))
      const price = M.map((r) => Math.max(0, r[1] || 0))
      const minPrice = Math.min(...price)
      const maxPrice = Math.max(...price)
      const bestIdx = price.indexOf(minPrice)
      const aov = seats.map((s, i) => s * price[i])
      const minAov = Math.min(...aov)
      return [
        res('Entry price / seat', money(minPrice), T.neutral),
        res('Price spread', `${ratio(maxPrice / Math.max(1, minPrice), 1)}\u00d7`, maxPrice / Math.max(1, minPrice) <= 3 ? T.good : T.warn, 'Keep the top tier under 3x the bottom for a sane ladder.'),
        res('Best-value entry tier', labels[bestIdx], T.good),
        res('Cheapest entry basket (AOV)', money(minAov), T.neutral, 'Seat minimum times per-seat price = minimum order value.'),
      ]
    },
  },
  {
    id: 'strategic-partner-referral-fee-calculator',
    archetype: 'est',
    blurb: 'Prices a partner referral program and flags double-pay and attribution risk.',
    fields: [n('a', 'Referral contract value', { def: 50000 }), n('b', 'Commission rate %', { def: 15 }), n('c', 'Partners in program', { def: 12 }), n('d', 'Avg referrals / partner / yr', { def: 4 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const fee = a * (b / 100)
      const programCost = fee * c * d
      const perPartner = fee * d
      return [
        res('Per-deal referral fee', money(fee), T.neutral),
        res('Program annual cost', money(programCost), programCost > 0 ? T.warn : T.good, 'Compare against sourcing cost per acquired customer.'),
        res('Per-partner annual revenue', money(perPartner), T.neutral),
        res('Double-pay risk', b >= 20 ? 'High \u2014 split attribution needed' : 'Single pay \u2014 stay the course', b >= 20 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'b2b-discounting-profit-penalty-matrix',
    archetype: 'matrix',
    blurb: 'Shows average discount, margin retention and the worst profit-eroding band.',
    fields: [mx('m', 'Margin bands', ['Discount %', 'Margin after discount %'], ['New logo', 'Expansion', 'Renewal', 'Strategic'])],
    compute: (v) => {
      const M = v.m as number[][]
      const disc = M.map((r) => r[0] || 0)
      const margin = M.map((r) => r[1] || 0)
      const avgDisc = disc.reduce((s, x) => s + x, 0) / M.length
      const avgMargin = margin.reduce((s, x) => s + x, 0) / M.length
      const maxDisc = Math.max(...disc)
      const minMargin = Math.min(...margin)
      return [
        res('Avg discount', pct(avgDisc, 1), avgDisc <= 15 ? T.good : avgDisc <= 25 ? T.warn : T.bad),
        res('Margin retention', pct(avgMargin, 1), avgMargin >= 35 ? T.good : avgMargin >= 20 ? T.warn : T.bad),
        res('Worst band', `${num(maxDisc, 0)}% off \u2192 ${num(minMargin, 0)}% margin`, maxDisc > 25 ? T.bad : T.warn, 'Every discount point past ~25 eats multiple margin points.'),
        res('Profit guard', minMargin >= 20 ? 'Healthy floor' : 'Guard at 20%', minMargin >= 20 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'field-sales-meeting-density-calculator',
    archetype: 'est',
    blurb: 'Checks whether a field trip\u2019s meeting load exceeds realistic capacity with drive time.',
    fields: [n('a', 'Working days per trip', { def: 5 }), n('b', 'Meetings per day', { def: 4 }), n('c', 'Inter-meeting drive (min)', { def: 30 }), n('d', 'Admin time per day (hr)', { def: 2 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const total = a * b
      const driveHrs = a * Math.max(0, b - 1) * (c / 60)
      const capacity = a * (8 - d)
      const meetingHrs = total * 0.75
      const util = capacity > 0 ? (meetingHrs / capacity) * 100 : 0
      return [
        res('Meetings per trip', num(total, 0), T.neutral),
        res('Drive time', hours(driveHrs), driveHrs > meetingHrs ? T.warn : T.good, 'Drive time above meeting time means the territory is too large.'),
        res('Schedule utilization', pct(Math.min(120, util), 0), util > 100 ? T.bad : util > 85 ? T.warn : T.good, 'Keep ~20% for travel and prep.'),
        res('Net selling hours', `${num(meetingHrs, 0)} hr`, T.neutral),
      ]
    },
  },
  {
    id: 'sales-channel-partner-margin-calculator',
    archetype: 'est',
    blurb: 'Shows the real net margin on a partner-led deal after discount and rebates.',
    fields: [n('a', 'Deal size', { def: 100000 }), n('b', 'Partner discount %', { def: 30 }), n('c', 'Margin on list %', { def: 60 }), n('d', 'Program rebate %', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const gross = a * (c / 100)
      const cost = a * ((b + d) / 100)
      const net = gross - cost
      return [
        res('List gross margin', money(gross), T.neutral),
        res('Partner + rebate cost', money(cost), T.warn),
        res('Net margin', money(net), net > 0 ? T.good : T.bad, 'Negative net margin means the model only pays with expansion.'),
        res('Net rate', pct((net / a) * 100, 1), (net / a) * 100 >= 25 ? T.good : (net / a) * 100 >= 10 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'cross-sell-margin-multiplier',
    archetype: 'est',
    blurb: 'Measures how attach rates compound margin across the portfolio.',
    fields: [n('a', 'Primary margin %', { def: 40 }), n('b', 'Cross-sell margin %', { def: 35 }), n('c', 'Cross-sell attach rate %', { def: 25 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const uplift = b * (c / 100)
      const blended = a + uplift
      return [
        res('Blended margin', pct(blended, 1), blended >= a ? T.good : T.neutral),
        res('Portfolio uplift', pct(uplift, 1), uplift >= 5 ? T.good : T.warn),
        res('Margin multiplier', `${ratio(blended / Math.max(1, a), 2)}\u00d7`, uplift > 0 ? T.good : T.neutral),
        res('Attach rate', pct(c, 0), c >= 25 ? T.good : T.warn, 'Push attach past 25% with bundled offers.'),
      ]
    },
  },
  {
    id: 'sales-rep-capacity-planner',
    archetype: 'est',
    blurb: 'Models how many deals a rep can carry given focus time, cycle length and working days.',
    fields: [n('a', 'Working days / yr', { def: 220 }), n('b', 'Days / week on deals', { def: 3 }), n('c', 'Avg deal cycle (weeks)', { def: 3 }), n('d', 'Working days', { def: 220 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = Math.max(1, v.c as number)
      const cap = (a * b) / (25 * c)
      const focus = (b / 5) * 100
      return [
        res('Annual deal capacity', numD(cap, 1), cap >= 20 ? T.good : cap >= 10 ? T.warn : T.bad, 'Deal-days available divided by cycle length.'),
        res('Quarterly capacity', numD(cap / 4, 1), T.neutral),
        res('Focus share of week', pct(focus, 0), focus <= 60 ? T.good : T.warn, 'High-focus reps spend under 60% of the week on deals.'),
        res('Cycle length', `${num(c, 0)} weeks`, c <= 4 ? T.good : T.warn),
      ]
    },
  },
  // ---------------- Revenue & Accounts ----------------
  {
    id: 'key-account-management-kam-health-index',
    archetype: 'index',
    blurb: 'Turns advocacy, renewal confidence, adoption and risk signals into one account health index.',
    fields: [n('h', 'Advocacy score (0-100)', { def: 65 }), n('w', 'At-risk workflows', { def: 2 }), n('r', 'Renewal confidence %', { def: 80 }), n('g', 'Adoption gap %', { def: 15 })],
    compute: (v) => {
      const h = v.h as number, w = v.w as number, r = v.r as number, g = v.g as number
      const idx = clamp(h * 0.4 + r * 0.3 + (100 - g) * 0.2 - w * 5, 0, 100)
      return [
        res('KAM health index', pct(idx, 1), idx >= 75 ? T.good : idx >= 50 ? T.warn : T.bad, 'Blends advocacy, renewal and adoption signals into one number.'),
        res('Renewal confidence', pct(r, 0), r >= 80 ? T.good : r >= 60 ? T.warn : T.bad),
        res('Adoption gap', pct(g, 0), g <= 15 ? T.good : T.warn, 'Track feature usage each quarter to spot slide early.'),
        res('At-risk workflows', num(w, 0), w === 0 ? T.good : w <= 2 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'total-addressable-market-tam-sam-som-estimator',
    archetype: 'est',
    blurb: 'Sanity-checks market sizing from TAM down to the share you can actually capture.',
    fields: [n('a', 'Market size ($B)', { def: 80 }), n('b', 'Serviceable share %', { def: 20 }), n('c', 'Obtainable share %', { def: 10 }), sel('s', 'Segment expansion', ['Same segment', 'Adjacent segment', 'New geography'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const tam = a * 1e9
      const sam = tam * (b / 100)
      const som = sam * (c / 100)
      const somOfTAM = (b * c) / 100
      return [
        res('TAM', money(tam), T.neutral),
        res('SAM', money(sam), T.neutral),
        res('SOM', money(som), T.good, 'The number your go-to-market plan must actually hit.'),
        res('SOM share of TAM', pct(somOfTAM, 2), T.neutral, `Expansion planned via: ${v.s}.`),
        res('Share reasonableness', somOfTAM >= 0.1 && somOfTAM <= 10 ? 'Plausible band' : 'Re-check assumptions', T.warn),
      ]
    },
  },
  {
    id: 'account-expansion-upsell-opportunity-matrix',
    archetype: 'matrix',
    blurb: 'Sizes the expansion book of business and the potential hidden in each segment.',
    fields: [mx('m', 'Account segments', ['Current ARR ($k)', 'Expansion headroom %'], ['Enterprise', 'Mid-market', 'SMB', 'Strategic'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Enterprise', 'Mid-market', 'SMB', 'Strategic']
      const arrK = M.map((r) => r[0] || 0)
      const boundaries = M.map((r) => r[1] || 0)
      const book = arrK.reduce((s, x) => s + x, 0) * 1000
      const potential = M.reduce((s, r) => s + (r[0] || 0) * ((r[1] || 0) / 100) * 1000, 0)
      const best = labels[arrK.indexOf(Math.max(...arrK))]
      const headroom = boundaries.reduce((s, x) => s + x, 0) / M.length
      return [
        res('Book of business', money(book), T.neutral),
        res('Expansion potential', money(potential), potential > 0 ? T.good : T.warn, 'Upsell headroom applied to current ARR by segment.'),
        res('Largest segment', best, T.neutral),
        res('Avg expansion headroom', pct(headroom, 1), headroom >= 20 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'contract-annual-recurring-revenue-arr-calculator',
    archetype: 'est',
    blurb: 'Annualizes a fixed-term contract into ARR and splits off the one-time components.',
    fields: [n('a', 'Contract value', { def: 120000 }), n('b', 'Term (months)', { def: 24 }), n('c', 'Onboarding fee', { def: 10000 }), sel('s', 'Billing', ['Monthly', 'Quarterly', 'Annual upfront'])],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = v.c as number
      const arr = (a / b) * 12
      const monthly = a / b
      const onetShare = c / (a + c) * 100
      return [
        res('ARR equivalent', money(arr), T.good, 'Recurring revenue annualized from the fixed term.'),
        res('Monthly recurring', money(monthly), T.neutral),
        res('One-time share', pct(onetShare, 1), onetShare <= 20 ? T.good : T.warn),
        res('Billing cadence', v.s as string, T.neutral, 'Annual-upfront shifts working capital strongly in your favor.'),
      ]
    },
  },
  {
    id: 'net-revenue-retention-nrr-calculator',
    archetype: 'index',
    blurb: 'Measures how much ARR a cohort keeps and grows after expansion, contraction and churn.',
    fields: [n('a', 'ARR at start', { def: 1000000 }), n('b', 'Expansion + cross-sell', { def: 150000 }), n('c', 'Downgrades', { def: 30000 }), n('d', 'Churned ARR', { def: 40000 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const ending = a + b - c - d
      const nrr = (ending / a) * 100
      const gross = ((a - d) / a) * 100
      const netOfExpansion = ((b - c - d) / a) * 100
      return [
        res('Net revenue retention', pct(clamp(nrr, 0, 200), 1), nrr >= 110 ? T.good : nrr >= 100 ? T.warn : T.bad, 'Above 100% means the book compounds without new logos.'),
        res('Gross retention', pct(gross, 1), gross >= 90 ? T.good : T.warn, 'Churn floor before expansion.'),
        res('Expansion vs contraction', pct(netOfExpansion * 100 > 0 ? netOfExpansion : 0, 1, netOfExpansion > 0), netOfExpansion > 0 ? T.good : T.bad, 'Expansion must outrun downgrade plus churn.'),
        res('Ending ARR', money(ending), T.neutral),
      ]
    },
  },
  {
    id: 'sales-call-activity-ratio-calculator',
    archetype: 'est',
    blurb: 'Checks connect, booking and daily call activity to spot where the funnel stalls in activity.',
    fields: [n('a', 'Calls made', { def: 300 }), n('b', 'Calls connected', { def: 120 }), n('c', 'Meetings booked', { def: 25 }), n('d', 'Working days', { def: 20 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = Math.max(1, v.d as number)
      const connect = a ? (b / a) * 100 : 0
      const book = b ? (c / b) * 100 : 0
      const perDay = a / d
      const perWeek = (c / d) * 5
      return [
        res('Connect rate', pct(connect, 1), connect >= 40 ? T.good : connect >= 25 ? T.warn : T.bad),
        res('Book rate (per connect)', pct(book, 1), book >= 20 ? T.good : book >= 10 ? T.warn : T.bad),
        res('Calls per day', numD(perDay, 1), perDay >= 15 ? T.good : T.warn),
        res('Meetings per week', numD(perWeek, 1), perWeek >= 6 ? T.good : perWeek >= 3 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'sales-ramp-up-duration-estimator',
    archetype: 'est',
    blurb: 'Plans ramp time for new reps and backfill needs from ramp attrition.',
    fields: [n('a', 'New reps', { def: 6 }), n('b', 'Months to full ramp', { def: 6 }), n('c', 'Quota share at 3 mo %', { def: 50 }), n('d', 'Attrition during ramp %', { def: 15 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const midShare = c / 100
      const avgShare = (1 + midShare) / 2
      const loss = a * (d / 100)
      const backfill = Math.ceil(loss)
      return [
        res('Full ramp time', `${num(b, 0)} months`, b <= 6 ? T.good : T.warn, 'Iterate the ramp plan monthly.'),
        res('Avg ramp productivity', pct(avgShare * 100, 1), avgShare >= 0.6 ? T.good : T.warn, 'Average quota share across the ramp window.'),
        res('Rep loss to attrition', `${numD(loss, 1)} rep(s)`, loss >= 1 ? T.warn : T.good),
        res('Backfill to hold capacity', num(backfill, 0), backfill === 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'saas-churn-rate-logo-vs-revenue-calculator',
    archetype: 'index',
    blurb: 'Separates logo churn from revenue churn so you can see the real book decay.',
    fields: [n('a', 'Customers at start', { def: 1000 }), n('b', 'Customers churned', { def: 40 }), n('c', 'MRR at start', { def: 500000 }), n('d', 'MRR churned', { def: 15000 }), n('e', 'Expansion MRR', { def: 8000 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = Math.max(1, v.c as number), d = v.d as number, e = v.e as number
      const logo = (b / a) * 100
      const revGross = (d / c) * 100
      const net = ((c - d + e) / c) * 100
      return [
        res('Net revenue retention', pct(clamp(net, 0, 200), 1), net >= 100 ? T.good : T.warn, 'Logo churn understates damage; watch revenue churn too.'),
        res('Logo churn', pct(logo, 2), logo <= 4 ? T.good : logo <= 8 ? T.warn : T.bad),
        res('Revenue churn (gross)', pct(revGross, 2), revGross <= 5 ? T.good : T.warn),
        res('Churned MRR', money(d), T.neutral),
        res('Expansion MRR', money(e), e > 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'customer-onboarding-time-to-value-ttv-estimator',
    archetype: 'est',
    blurb: 'Measures how fast new customers hit first value and how many get stuck.',
    fields: [n('a', 'Customers onboarded', { def: 30 }), n('b', 'Avg days to value', { def: 40 }), n('c', 'Stuck accounts (>60d)', { def: 5 }), n('d', 'Onboarding team hours / account', { def: 12 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const hitRate = ((a - c) / a) * 100
      const effort = a * d
      return [
        res('TTV hit rate', pct(hitRate, 1), hitRate >= 85 ? T.good : hitRate >= 70 ? T.warn : T.bad),
        res('Avg time to value', `${num(b, 0)} days`, b <= 30 ? T.good : b <= 60 ? T.warn : T.bad),
        res('Stuck accounts', num(c, 0), c === 0 ? T.good : T.warn, 'Stuck accounts are the top churn predictor.'),
        res('Onboarding effort', `${numD(effort, 0)} hours`, T.neutral, 'Standardize the first-90-days playbook to shrink effort.'),
      ]
    },
  },
  {
    id: 'average-revenue-per-user-arpu-calculator',
    archetype: 'est',
    blurb: 'Disaggregates MRR into per-account, per-seat and per-user revenue lenses.',
    fields: [n('a', 'MRR', { def: 200000 }), n('b', 'Paying accounts', { def: 800 }), n('c', 'Avg users / account', { def: 5 }), sel('s', 'Metric', ['ARPU (per account)', 'ARPA (per seat)', 'Per-user monthly'])],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = Math.max(1, v.c as number)
      const arpa = a / b
      const perSeat = a / (b * c)
      const headline = (v.s as string).includes('seat') ? perSeat : arpa
      return [
        res('Headline metric', money(headline), T.good, `${v.s} lens selected.`),
        res('ARPU per account', money(arpa), T.neutral),
        res('ARPA per seat', money(perSeat), T.neutral),
        res('Per-user monthly', money(perSeat), T.neutral),
      ]
    },
  },
  {
    id: 'sales-enablement-content-usage-log',
    archetype: 'log',
    blurb: 'Logs which sales enablement assets get used and which actually assist wins.',
    fields: [mx('m', 'Content assets', ['Uses', 'Win-assist %'], ['Pitch deck', 'ROI calculator', 'Case studies', 'Battle cards', 'Demo scripts', 'Proposal templates'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Pitch deck', 'ROI calculator', 'Case studies', 'Battle cards', 'Demo scripts', 'Proposal templates']
      const uses = M.reduce((s, r) => s + (r[0] || 0), 0)
      const byUse = M.map((r) => r[0] || 0)
      const assistSat = M.reduce((s, r) => s + (r[1] || 0), 0) / M.length
      const top = labels[byUse.indexOf(Math.max(...byUse))]
      const dead = labels.filter((_, i) => (M[i][0] || 0) < 10)
      return [
        res('Total uses', num(uses, 0), T.neutral),
        res('Avg win-assist', pct(assistSat, 1), assistSat >= 25 ? T.good : T.warn, 'Assets referenced on won deals.'),
        res('Top asset', top, T.good),
        res('Under-utilized assets', dead.length ? dead.join(', ') : 'None', dead.length ? T.warn : T.good, 'Retire or rework dead content each quarter.'),
      ]
    },
  },
  {
    id: 'sales-order-fulfillment-tracker',
    archetype: 'tracker',
    blurb: 'Projects ship, invoice and payment dates from an order date to map cash timing.',
    fields: [dt('c', 'Order date'), n('a', 'Days to ship', { def: 10 }), n('b', 'Days to invoice', { def: 5 }), n('p', 'Payment terms (days)', { def: 30 })],
    compute: (v) => {
      const iso = (v.c as string) || '2026-01-10'
      const a = Math.max(0, Math.round(v.a as number))
      const b = Math.max(0, Math.round(v.b as number))
      const p = Math.max(0, Math.round(v.p as number))
      const base = new Date(iso + 'T00:00:00')
      const ship = new Date(base.getTime() + a * 864e5)
      const inv = new Date(ship.getTime() + b * 864e5)
      const pay = new Date(inv.getTime() + p * 864e5)
      const fmt = (x: Date) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return [
        res('Order date', fmt(base), T.neutral),
        res('Ship date', fmt(ship), T.good, 'Release trigger for revenue recognition planning.'),
        res('Invoice date', fmt(inv), T.warn, 'Invoice the same day as ship to compress DSO.'),
        res('Expected payment', fmt(pay), T.good),
        res('Cash conversion span', `${num(a + b + p, 0)} days`, T.neutral),
      ]
    },
  },
  {
    id: 'customer-success-manager-csm-load-calculator',
    archetype: 'est',
    blurb: 'Checks CSM workload against accounts, contacts and interactive hours per account.',
    fields: [n('a', 'Accounts', { def: 150 }), n('b', 'CSMs', { def: 5 }), n('c', 'Interactive contacts / account', { def: 4 }), n('d', 'Hours per contact / yr', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = v.c as number, d = v.d as number
      const contacts = a * c
      const hours = a * c * d
      const perCsm = hours / b
      const capRatio = b * 480
      return [
        res('Accounts per CSM', numD(a / b, 1), a / b <= 60 ? T.good : a / b <= 100 ? T.warn : T.bad, '~60:1 white-glove; >100:1 only with automation.'),
        res('Contacts in scope', num(contacts, 0), T.neutral),
        res('Interactive hours / CSM', numD(perCsm, 1), perCsm <= 400 ? T.good : perCsm <= 480 ? T.warn : T.bad, 'A 480-hr working year caps senior CSM coverage.'),
        res('Capacity headroom', pct(Math.max(0, 1 - hours / Math.max(1, capRatio)) * 100, 0), hours <= capRatio ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'sales-forecast-accuracy-calculator',
    archetype: 'index',
    blurb: 'Scores forecast versus actuals and flags systematic bias.',
    fields: [n('a', 'Committed forecast', { def: 1000000 }), n('b', 'Actuals closed', { def: 900000 }), n('c', 'Overage deals included', { def: 80000 }), n('d', 'Deals slipped (value)', { def: 60000 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const acc = (b / a) * 100
      const slip = (d / a) * 100
      const bias = acc > 105 ? 'Optimistic' : acc < 95 ? 'Pessimistic' : 'Balanced'
      return [
        res('Forecast accuracy', pct(clamp(acc, 0, 100), 1), Math.abs(acc - 100) <= 5 ? T.good : Math.abs(acc - 100) <= 15 ? T.warn : T.bad, 'Within 5% is world class; 15% drift needs a cleaned stage model.'),
        res('Commit-to-close', pct(acc, 1), T.neutral),
        res('Overage exposure', money(c), c > 0 ? T.warn : T.good, 'Deals above commit create false run-rate.'),
        res('Slip rate', pct(slip, 1), slip <= 10 ? T.good : T.warn),
        res('Bias', bias, bias === 'Balanced' ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'key-account-annual-review-agenda-formatter',
    archetype: 'fmt',
    blurb: 'Builds a structured annual review agenda for key accounts with the right tone.',
    fields: [txt('c', 'Account name'), txt('s', 'Sponsor / exec'), ck('t', 'Agenda topics', ['Performance vs plan', 'Churn & risk review', 'Expansion roadmap', 'Executive sponsorship', 'Success metrics', 'QBR cadence']), sel('d', 'Dialogue tone', ['ROI-led', 'Partnership', 'Challenger'])],
    compute: (v) => {
      const acct = ((v.c as string) || '').trim() || 'Key account'
      const sponsor = ((v.s as string) || '').trim() || 'Exec sponsor'
      const t = v.t as boolean[]
      const topics = ['Performance vs plan', 'Churn & risk review', 'Expansion roadmap', 'Executive sponsorship', 'Success metrics', 'QBR cadence']
      const count = t.filter(Boolean).length
      const tone = v.d as string
      let doc = `ANNUAL REVIEW AGENDA \u2014 ${acct.toUpperCase()}\nSponsor: ${sponsor}    Tone: ${tone}\n\n`
      doc += topics.map((x, i) => `${i + 1}. ${x}${t[i] ? ' \u2713' : ' \u2013 (add)'}`).join('\n')
      doc += '\n\nRun it as a working session, not a slide deck: 60 min, decision list at the end, next QBR booked before you leave.'
      return [
        res('Agenda coverage', `${count}/6`, count >= 5 ? T.good : count >= 4 ? T.warn : T.bad, 'A threadbare agenda signals a hollow relationship.'),
        res('Tone frame', tone, T.neutral, tone === 'Challenger' ? 'Lead with the risk the account ignores.' : 'Anchor on value delivered this year.'),
        docRes('Annual review agenda', doc),
      ]
    },
  },
  {
    id: 'contract-expansion-payback-period',
    archetype: 'est',
    blurb: 'Measures how long an expansion investment takes to pay back in added margin.',
    fields: [n('a', 'Expansion investment (one-time)', { def: 30000 }), n('b', 'Added monthly ARR', { def: 4000 }), n('c', 'Gross margin on expansion %', { def: 80 }), n('d', 'Selling cost of expansion', { def: 5000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const net = b * (c / 100)
      const payback = (a + d) / net
      const yr1 = net * 12 - (a + d)
      return [
        res('Payback period', `${numD(payback, 1)} months`, payback <= 12 ? T.good : payback <= 24 ? T.warn : T.bad, 'Sub-12-month payback is the expansion rule of thumb.'),
        res('Monthly net contribution', money(net), T.neutral),
        res('Total to recover', money(a + d), T.neutral),
        res('12-month return', money(yr1), yr1 > 0 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'revenue-operations-revops-alignment-scorer',
    archetype: 'scorecard',
    blurb: 'Scores the RevOps pillars that keep pipeline, forecast and compensation in one language.',
    fields: [mxd('m', 'RevOps pillars', ['Pillar', 'Weight %', 'Score /10'], ['CRM & data hygiene', 'Forecasting & pipeline', 'Process & handoffs', 'Compensation alignment', 'Reporting cadence'], [[25, 7], [25, 8], [20, 6], [15, 7], [15, 6]]), sel('p', 'Stage focus', ['Demand gen', 'Pipeline', 'Forecast', 'Renew & expand'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['CRM & data hygiene', 'Forecasting & pipeline', 'Process & handoffs', 'Compensation alignment', 'Reporting cadence']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      const dataTrust = (M[0][1] || 0) * 10
      return [
        res('RevOps alignment', `${num(wScore, 0)}/100`, wScore >= 80 ? T.good : wScore >= 65 ? T.warn : T.bad, 'Below 65 the forecast is not reliable enough to commit on.'),
        res('Weakest pillar', labels[minI], T.warn, 'Fix process and handoffs before touching comp rules.'),
        res('Data trust', pct(clamp(dataTrust, 0, 100), 0), dataTrust >= 75 ? T.good : T.warn),
        res('Stage focus', v.p as string, T.neutral),
      ]
    },
  },
]