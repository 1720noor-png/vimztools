import { ck, clamp, days, doc as docRes, dt, lvl, money, moneyC, mx, mxd, n, num, numD, pct, ratio, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

export const specs: OfficeToolSpec[] = [
  // ---------------- Strategy ----------------
  {
    id: 'swot-analysis-matrix-builder',
    archetype: 'matrix',
    blurb: 'Scores strengths, weaknesses, opportunities and threats to derive a net strategic posture.',
    fields: [mx('m', 'SWOT input', ['Factor', 'Count', 'Avg impact /5'], ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'])],
    compute: (v) => {
      const M = v.m as number[][]
      const count = (r: number) => M[r]?.[0] || 0
      const impact = (r: number) => M[r]?.[1] || 0
      const s = count(0) * impact(0) + count(2) * impact(2)
      const w = count(1) * impact(1) + count(3) * impact(3)
      const net = s - w
      const total = count(0) + count(1) + count(2) + count(3)
      return [
        res('Factor count', num(total, 0)),
        res('Net posture', net >= 0 ? 'Offensive' : 'Defensive', net >= 0 ? T.good : T.warn, s >= w ? 'Strengths and opportunities dominate.' : 'Weaknesses and threats outweigh strengths.'),
        res('Strength score', num(s, 0), s > 0 ? T.good : T.neutral),
        res('Vulnerability score', num(w, 0), w > s ? T.bad : T.neutral),
        res('Momentum ratio', ratio(total ? s / (s + w || 1) * 100 : 0, 1), s >= w ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'pestel-analysis-formatter',
    archetype: 'fmt',
    blurb: 'Structures Political, Economic, Social, Technological, Environmental and Legal factors into a formatted brief.',
    fields: [txt('p', 'Political'), txt('e', 'Economic'), txt('s', 'Social'), txt('t', 'Technological'), txt('en', 'Environmental'), txt('l', 'Legal')],
    compute: (v) => {
      const p = v.p as string, e = v.e as string, s = v.s as string, t = v.t as string, en = v.en as string, l = v.l as string
      const filled = [p, e, s, t, en, l].filter((x) => x.trim() !== '').length
      const doc = `PESTEL ANALYSIS BRIEF\n\nP - POLITICAL:\n${p || '(no input)'}\n\nE - ECONOMIC:\n${e || '(no input)'}\n\nS - SOCIAL:\n${s || '(no input)'}\n\nT - TECHNOLOGICAL:\n${t || '(no input)'}\n\nE - ENVIRONMENTAL:\n${en || '(no input)'}\n\nL - LEGAL:\n${l || '(no input)'}`
      return [res('Sections completed', `${filled}/6`, filled === 6 ? T.good : filled >= 3 ? T.warn : T.neutral, 'A complete brief covers all six lenses.'), docRes('Brief', doc)]
    },
  },
  {
    id: 'okr-objectives-and-key-results-cascade-planner',
    archetype: 'est',
    blurb: 'Sizes an OKR cascade across levels and checks whether key results are measurable.',
    fields: [n('a', 'Company objectives', { def: 4 }), n('b', 'Key results per objective', { def: 3 }), n('c', 'Team levels cascading', { def: 3 }), n('d', 'KRs with a numeric measure', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const krs = a * b
      const teamKRs = krs * Math.max(0, c - 1)
      const measurable = d
      const gap = Math.max(0, krs - measurable)
      return [
        res('Total key results', num(krs, 0)),
        res('Cascaded KR volume', num(teamKRs, 0), teamKRs <= krs * 4 ? T.good : T.warn, 'Family trees should stay under 4x the company KRs or they fragment.'),
        res('Measurable KRs', num(measurable, 0), gap === 0 ? T.good : T.warn, `${gap} KR(s) still need a numeric measure.`),
        res('Cascade breadth', `${num(c, 0)} levels`),
      ]
    },
  },
  {
    id: 'balanced-scorecard-bsc-builder',
    archetype: 'scorecard',
    blurb: 'Blends financial, customer, process and people perspectives into a single strategic health score.',
    fields: [mxd('m', 'Perspectives', ['Perspective', 'Weight %', 'Score /5'], ['Financial', 'Customer', 'Internal process', 'Learning & growth'], [[40, 3], [25, 3], [20, 3], [15, 3]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      return [
        res('Strategic health', `${numD(wScore, 2)}/5`, wScore >= 4 ? T.good : wScore >= 3 ? T.warn : T.bad, 'A balanced score stays across all four perspectives.'),
        res('Cast to /100', `${num(wScore * 20, 0)}/100`),
        res('Weakest perspective', ['Financial', 'Customer', 'Internal process', 'Learning & growth'][M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)]),
      ]
    },
  },
  {
    id: 'porters-five-forces-estimator',
    archetype: 'scorecard',
    blurb: 'Weights the five competitive forces to estimate industry attractiveness and rivalry pressure.',
    fields: [mxd('m', 'Five forces', ['Force', 'Weight %', 'Threat /10'], ['New entrants', 'Supplier power', 'Buyer power', 'Substitutes', 'Rivalry'], [[20, 5], [15, 5], [20, 5], [15, 5], [30, 5]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const threat = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const tIdx = M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)
      const flabels = ['New entrants', 'Supplier power', 'Buyer power', 'Substitutes', 'Rivalry']
      return [
        res('Industry threat', lvl(threat), threat >= 7 ? T.bad : threat >= 5 ? T.warn : T.good, 'Higher threat = more hostile economics.'),
        res('Attractiveness', `${numD(10 - threat, 1)}/10`, threat <= 4 ? T.good : T.warn, 'Lower force pressure suggests better margins.'),
        res('Dominant force', flabels[tIdx], M[tIdx][1] >= 7 ? T.bad : T.neutral),
      ]
    },
  },
  {
    id: 'bcg-growth-share-matrix-mapper',
    archetype: 'matrix',
    blurb: 'Plots business units by market growth and relative share to map star, cow, dog and question-mark roles.',
    fields: [mx('m', 'Portfolio', ['Business unit', 'Growth %', 'Relative share'], ['Stars', 'Cash cows', 'Question marks', 'Dogs']), n('c', 'Discount rate %', { def: 10 })],
    compute: (v) => {
      const M = v.m as number[][]
      const starW = (M[0]?.[0] || 0) * (M[0]?.[1] || 0)
      const cowW = (M[1]?.[0] || 0) * (M[1]?.[1] || 0)
      const totalW = starW + cowW + (M[2]?.[0] || 0) * (M[2]?.[1] || 0) + (M[3]?.[0] || 0) * (M[3]?.[1] || 0)
      const balance = totalW ? ((starW + cowW) / totalW) * 100 : 0
      const c = v.c as number
      return [
        res('Value engine balance', pct(balance, 1), balance >= 60 ? T.good : balance >= 40 ? T.warn : T.bad, 'Stars plus cash cows should dominate portfolio value.'),
        res('Star growth leverage', `${numD((M[0]?.[0] || 0) * (M[0]?.[1] || 0), 0)} units`),
        res('Discount-adjusted weight', pct(totalW / (c ? c : 1), 1), T.neutral),
      ]
    },
  },
  {
    id: 'business-model-canvas-bmc-generator',
    archetype: 'fmt',
    blurb: 'Collects the nine canvas blocks and renders them as a structured business model outline.',
    fields: [txt('a', 'Key partnerships'), txt('b', 'Key activities'), txt('c', 'Value proposition'), txt('d', 'Customer relationships'), txt('e', 'Customer segments'), txt('f', 'Revenue streams'), txt('g', 'Cost structure'), txt('h', 'Key resources'), txt('i', 'Channels')],
    compute: (v) => {
      const g = (k: string) => (v[k] as string).trim() || '(no input)'
      const filled = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].filter((k) => (v[k] as string).trim() !== '').length
      const doc = `BUSINESS MODEL CANVAS\n\n1. KEY PARTNERSHIPS\n${g('a')}\n\n2. KEY ACTIVITIES\n${g('b')}\n\n3. VALUE PROPOSITION\n${g('c')}\n\n4. CUSTOMER RELATIONSHIPS\n${g('d')}\n\n5. CUSTOMER SEGMENTS\n${g('e')}\n\n6. REVENUE STREAMS\n${g('f')}\n\n7. COST STRUCTURE\n${g('g')}\n\n8. KEY RESOURCES\n${g('h')}\n\n9. CHANNELS\n${g('i')}`
      return [res('Blocks filled', `${filled}/9`, filled === 9 ? T.good : filled >= 6 ? T.warn : T.bad, 'All nine blocks should be testable hypotheses.'), docRes('Canvas', doc)]
    },
  },
  {
    id: 'vrio-framework-analyzer',
    archetype: 'matrix',
    blurb: 'Scores each resource on value, rarity, imitability and organization to classify its advantage.',
    fields: [mx('m', 'Resources', ['Resource', 'Value (V)', 'Rarity (R)', 'Imitability (I)', 'Organization (O)'], ['Brand equity', 'Proprietary tech', 'Customer data', 'Talent pool'])],
    compute: (v) => {
      const M = v.m as number[][]
      const sustained = M.filter((r) => ((r[0] || 0) >= 1 && (r[1] || 0) >= 1 && (r[2] || 0) >= 1 && (r[3] || 0) >= 1)).length
      const temp = M.filter((r) => ((r[0] || 0) >= 1 && (r[1] || 0) >= 1 && (r[2] || 0) < 1 && (r[3] || 0) >= 1)).length
      return [
        res('Sustained advantage', num(sustained, 0), sustained > 0 ? T.good : T.warn, 'V-R-I-O all present = sustained competitive advantage.'),
        res('Temporary or unused', num(temp, 0), temp > 0 ? T.warn : T.good),
        res('Advantage quality', `${ratio((sustained + temp) / M.length || 0, 2)} of resources`, sustained >= temp ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'strategic-pivot-feasibility-calculator',
    archetype: 'est',
    blurb: 'Weighs the investment and timeline of a pivot against the uplift in revenue and margin.',
    fields: [n('a', 'Current revenue ($/yr)', { def: 5000000 }), n('b', 'Target revenue ($/yr)', { def: 8000000 }), n('c', 'Pivot capex & costs ($)', { def: 1500000 }), n('d', 'Time to pivot (months)', { def: 12 }), n('e', 'New model EBITDA margin %', { def: 18 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const uplift = Math.max(0, b - a)
      const valueGain = uplift * (e / 100) * 3
      const roi = c ? (valueGain / c) * 100 : 0
      const payback = uplift ? (c / uplift) : Infinity
      return [
        res('Revenue uplift', money(uplift), uplift > 0 ? T.good : T.warn),
        res('3-yr value gain', money(valueGain), valueGain >= c ? T.good : T.warn, 'Assumes 3x EBITDA multiple on the margin gained.'),
        res('Payback period', Number.isFinite(payback) ? `${numD(payback, 1)} yrs` : '∞', payback <= d / 12 * 2 ? T.good : T.warn),
        res('Investment ROI', pct(roi, 0), roi >= 100 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'feasibility-study-scoring-matrix',
    archetype: 'scorecard',
    blurb: 'Scores technical, economic, operational and schedule feasibility into a go / no-go signal.',
    fields: [mxd('m', 'Feasibility criteria', ['Criterion', 'Weight %', 'Score /10'], ['Technical', 'Economic', 'Operational', 'Schedule'], [[30, 6], [30, 6], [20, 6], [20, 6]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const low = M.filter((r) => (r[1] || 0) < 5).map((r) => r[0]).join(', ')
      return [
        res('Feasibility index', `${numD(score, 1)}/10`, score >= 7 ? T.good : score >= 5 ? T.warn : T.bad, score >= 7 ? 'Proceed to detailed planning.' : 'Address blockers before committing capital.'),
        res('Red-flag areas', low || 'None', low ? T.warn : T.good, 'Scores below 5 need explicit mitigations.'),
        res('Decision signal', score >= 7 ? 'GO' : score >= 5 ? 'CONDITIONAL' : 'NO-GO', T.neutral),
      ]
    },
  },
  {
    id: 'competitive-benchmarking-matrix',
    archetype: 'matrix',
    blurb: 'Compares feature coverage and pricing across competitors to expose your relative standing.',
    fields: [mx('m', 'Competitors', ['Competitor', 'Feature coverage /10', 'Price index'], ['Market leader', 'Fast follower', 'Challenger', 'Your company']), n('c', 'Feature importance weight', { def: 60 })],
    compute: (v) => {
      const M = v.m as number[][]
      const w = v.c as number
      const score = (r: number) => (M[r]?.[0] || 0) * (w / 100) + (M[r]?.[1] || 0) * (1 - w / 100)
      const mine = score(3)
      const avg = (score(0) + score(1) + score(2)) / 3
      return [
        res('Your relative score', `${numD(mine, 1)}`, mine >= avg ? T.good : T.warn, 'Blends feature coverage and price competitiveness.'),
        res('Competitor average', `${numD(avg, 1)}`, T.neutral),
        res('Feature coverage gap', numD(mine - score(0), 1), mine >= score(0) ? T.good : T.bad, 'vs market leader.'),
      ]
    },
  },
  {
    id: 'strategic-alliance-value-creator-estimator',
    archetype: 'est',
    blurb: 'Estimates the value an alliance creates from revenue uplift, cost savings and the equity contributed.',
    fields: [n('a', 'Revenue uplift ($/yr)', { def: 2000000 }), n('b', 'Cost savings ($/yr)', { def: 500000 }), n('c', 'Equity contributed ($)', { def: 800000 }), n('d', 'Alliance term (yrs)', { def: 3 }), n('e', 'Partner share of value %', { def: 50 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const value = (a + b) * d
      const yourShare = value * (1 - e / 100)
      const net = yourShare - c
      const multiple = c ? yourShare / c : 0
      return [
        res('Gross alliance value', money(value)),
        res('Your net value', money(net), net >= 0 ? T.good : T.bad, 'Equity contributed should be repaid by your value share.'),
        res('Value multiple on equity', ratio(multiple, 2) + 'x', multiple >= 2 ? T.good : T.warn, 'Aim for 2x+ cash return on equity contributed.'),
      ]
    },
  },
  {
    id: 'turnaround-strategy-cost-estimator',
    archetype: 'est',
    blurb: 'Builds the cost envelope for a turnaround from liquidity rescue, restructuring and stabilization programs.',
    fields: [n('a', 'Short-term liquidity need ($)', { def: 3000000 }), n('b', 'Advisor & legal fees ($)', { def: 1500000 }), n('c', 'Restructuring severance ($)', { def: 2000000 }), n('d', 'Enterprise / system fixes ($)', { def: 1000000 }), n('e', 'Funding secured ($)', { def: 7000000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const need = a + b + c + d
      const gap = need - e
      const funded = need ? (e / need) * 100 : 0
      return [
        res('Total turnaround cost', money(need)),
        res('Funding gap', money(gap), gap <= 0 ? T.good : T.bad, gap > 0 ? 'Financing must close before day 90.' : 'Program is fully funded.'),
        res('Liquidity share of cost', pct(need ? (a / need) * 100 : 0, 0), T.neutral),
        res('Funding cover', pct(funded, 0), funded >= 100 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'company-mission-vision-statement-formatter',
    archetype: 'fmt',
    blurb: 'Merges purpose, audience, offering and ambition into a clean mission and vision statement pair.',
    fields: [txt('w', 'Who we serve (audience)'), txt('o', 'What we do (offering)'), txt('d', 'Differentiator'), txt('a', 'Aspiration / 5-yr ambition'), sel('n', 'Tone', ['Inspirational', 'Precise', 'Values-led', 'Customer-first'])],
    compute: (v) => {
      const w = v.w as string, o = v.o as string, d = v.d as string, a = v.a as string
      const tone = v.n as string
      const mission = `${tone === 'Customer-first' ? 'We help' : 'We exist to'} ${w || '[audience]'} ${o ? `by ${o}` : 'deliver [offering]'}${d ? `, differentiated through ${d}` : ''}.`
      const vision = `In five years, ${a || 'we will be [the ambition]; the partner of choice for'} ${w || '[audience]'}.`
      const doc = `MISSION\n${mission}\n\nVISION\n${vision}\n\nGovernance note: statements should be testable — every choice maps to a metric an executive can defend.`
      return [res('Statement pair', 'Ready to review', T.neutral), docRes('Statements', doc)]
    },
  },
  {
    id: 'change-management-readiness-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores communication, leadership, training and incentives to gauge readiness for organizational change.',
    fields: [mxd('m', 'Readiness drivers', ['Driver', 'Weight %', 'Score /10'], ['Sponsorship & leadership', 'Communication', 'Training', 'Incentives & reinforcement'], [[30, 6], [25, 6], [25, 6], [20, 6]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const stage = score >= 8 ? 'Ready to launch' : score >= 6 ? 'Prepare runway' : score >= 4 ? 'Build awareness' : 'Pause & diagnose'
      return [
        res('Change readiness', `${numD(score, 1)}/10`, score >= 7 ? T.good : score >= 5 ? T.warn : T.bad, 'Readiness below 5 means change fatigue or absent sponsorship.'),
        res('Recommended action', stage, T.neutral),
        res('Sponsorship gap', M[0]?.[1] >= 7 ? 'Covered' : 'Critical', M[0]?.[1] >= 7 ? T.good : T.bad, 'Active sponsors double program success odds.'),
      ]
    },
  },
  {
    id: 'global-expansion-country-attractiveness-index',
    archetype: 'index',
    blurb: 'Blends market size, growth, stability, labor cost and infrastructure into a country attractiveness index.',
    fields: [n('a', 'Market size /10', { max: 10 }), n('b', 'Market growth /10', { max: 10 }), n('c', 'Political & legal stability /10', { max: 10 }), n('d', 'Labor cost attractiveness /10', { max: 10 }), n('e', 'Infrastructure quality /10', { max: 10 }), sel('f', 'Entry mode preference', ['Direct subsidiary', 'Joint venture', 'Franchise', 'Distribution partner'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const score = clamp((a + b + c + d + e) / 5, 0, 10)
      const band = score >= 8 ? 'Priority market' : score >= 6 ? 'Monitor & pilot' : score >= 4 ? 'Seek local partner' : 'Defer'
      return [
        res('Attractiveness index', pct(score * 10, 0), score >= 7 ? T.good : score >= 5 ? T.warn : T.bad, `${band} (${v.f as string}).`),
        res('Market maturity', score >= 6 ? 'Developed' : 'Emerging', T.neutral),
      ]
    },
  },
  {
    id: 'stakeholder-influence-interest-grid-builder',
    archetype: 'matrix',
    blurb: 'Plots stakeholders by influence and interest to guide communication and engagement effort.',
    fields: [mx('m', 'Stakeholders', ['Stakeholder', 'Influence /5', 'Interest /5'], ['Sponsor / board', 'Regulator', 'End users', 'Suppliers'])],
    compute: (v) => {
      const M = v.m as number[][]
      const quadrant = (r: number) => {
        const inf = M[r]?.[0] || 0, inter = M[r]?.[1] || 0
        return inf >= 3 && inter >= 3 ? 'Manage closely' : inf >= 3 ? 'Keep satisfied' : inter >= 3 ? 'Keep informed' : 'Monitor'
      }
      const high = M.filter((r) => (r[0] || 0) >= 3).length
      return [
        res('Key players to manage closely', num(M.filter((r) => (r[0] || 0) >= 3 && (r[1] || 0) >= 3).length, 0), high > 0 ? T.warn : T.good, 'Engage directly and frequently.'),
        res('High-influence stakeholders', `${num(high, 0)} of ${M.length}`, T.neutral),
        res('Sponsor quadrant', quadrant(0), T.neutral),
        res('Attention span', high <= 2 ? 'Concentrated' : 'Fragmented', high <= 2 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'divestiture-impact-calculator',
    archetype: 'est',
    blurb: 'Measures the earnings and /margin impact of selling a division, including stranded costs.',
    fields: [n('a', 'Divested revenue ($/yr)', { def: 4000000 }), n('b', 'Divested EBIT ($/yr)', { def: 600000 }), n('c', 'Sale proceeds ($)', { def: 20000000 }), n('d', 'Stranded corporate costs ($/yr)', { def: 400000 }), n('e', 'Remaining revenue ($/yr)', { def: 20000000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const marginBefore = a ? (b / a) * 100 : 0
      const epsImpact = b - d
      const lossRatio = e + a ? (epsImpact / (e + a) * 100) : 0
      const valueRatio = c ? (c / (b * 8)) : 1
      return [
        res('Divested EBIT margin', pct(marginBefore, 1), T.neutral),
        res('Net earnings impact', money(epsImpact), epsImpact >= 0 ? T.good : T.bad, d > 0 ? 'Includes stranded shared-service costs.' : 'No stranded costs booked.'),
        res('Value vs 8x base', ratio(valueRatio, 2) + 'x', valueRatio >= 1 ? T.good : T.warn, 'Proceeds over 8x EBIT looks strong for a non-core unit.'),
        res('Margin dilution effect', pct(lossRatio, 1), lossRatio >= -2 ? T.good : T.warn),
      ]
    },
  },

  // ---------------- Governance ----------------
  {
    id: 'board-meeting-resolution-builder',
    archetype: 'fmt',
    blurb: 'Assembles a formal board resolution with recitals, resolves and the voting mechanism.',
    fields: [txt('c', 'Company name'), txt('r', 'Resolution subject'), txt('d', 'Details / recitals'), sel('m', 'Approval threshold', ['Simple majority', '2/3 supermajority', 'Unanimous']), sel('h', 'Action type', ['Approve and adopt', 'Authorize and fund', 'Engage and instruct'])],
    compute: (v) => {
      const c = v.c as string, r = v.r as string, d = v.d as string, m = v.m as string, h = v.h as string
      const doc = `RESOLUTION OF THE BOARD\nOF\n${c || '[Company]'}\n\nWHEREAS, the board reviewed ${r || 'the matter described below'};\n${d ? `WHEREAS, ${d};\n` : ''}\nNOW, THEREFORE, BE IT RESOLVED, that the board hereby ${h || 'approves'} ${r || 'the identified action'}.\n\nRESOLVED FURTHER, that management is authorized to take all steps necessary to implement this resolution.\n\nADOPTED by ${m} vote at a duly convened meeting.`
      return [res('Resolution', 'Draft ready for counsel', T.neutral, 'Recitals before resolves — never the reverse.'), docRes('Document', doc)]
    },
  },
  {
    id: 'corporate-governance-compliance-audit-matrix',
    archetype: 'matrix',
    blurb: 'Logs tested versus compliant items across governance areas to expose compliance gaps.',
    fields: [mx('m', 'Audit areas', ['Area', 'Items compliant', 'Items tested'], ['Board processes', 'Disclosure & filings', 'Conflict of interest', 'Code of conduct', 'Audit committee'])],
    compute: (v) => {
      const M = v.m as number[][]
      const comp = M.reduce((s, r) => s + (r[0] || 0), 0)
      const tested = M.reduce((s, r) => s + (r[1] || 0), 0)
      const rate = tested ? (comp / tested) * 100 : 0
      const alabels = ['Board processes', 'Disclosure & filings', 'Conflict of interest', 'Code of conduct', 'Audit committee']
      const wIdx = M.reduce((bi, r, i) => (tested ? (r[0] || 0) / ((r[1] || 0) || 1) < (M[bi][0] || 0) / ((M[bi][1] || 0) || 1) ? i : bi : bi), 0)
      return [
        res('Compliance rate', pct(rate, 1), rate >= 90 ? T.good : rate >= 70 ? T.warn : T.bad, 'Target ≥90% across testable items.'),
        res('Items tested', `${num(comp, 0)} of ${num(tested, 0)}`, T.neutral),
        res('Biggest gap area', alabels[wIdx], (M[wIdx][0] || 0) / ((M[wIdx][1] || 0) || 1) < 0.7 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'raci-matrix-generator',
    archetype: 'matrix',
    blurb: 'Counts R, A, C and I assignments per activity to flag overloaded or underspecified roles.',
    fields: [mx('m', 'Activities', ['Activity', 'Responsible (R)', 'Accountable (A)', 'Consulted (C)', 'Informed (I)'], ['Strategy refresh', 'Budget build', 'Product launch', 'Vendor onboarding', 'Risk review'])],
    compute: (v) => {
      const M = v.m as number[][]
      const ok = M.filter((r) => (r[1] || 0) === 1).length
      const noA = M.filter((r) => (r[1] || 0) === 0).length
      const totalAssign = M.reduce((s, r) => s + (r[0] || 0) + (r[1] || 0) + (r[2] || 0) + (r[3] || 0), 0)
      return [
        res('Activities with a single A', `${num(ok, 0)} of ${M.length}`, noA === 0 && ok === M.length ? T.good : T.warn, 'Every activity needs exactly one accountable owner.'),
        res('Missing accountability', num(noA, 0), noA === 0 ? T.good : T.bad),
        res('Assignment density', `${ratio(M.length ? totalAssign / M.length : 0, 1)} per activity`, totalAssign / (M.length || 1) <= 8 ? T.good : T.warn, 'Beyond roughly 8 assignments per activity adds noise.'),
      ]
    },
  },
  {
    id: 'whistleblower-policy-formatter',
    archetype: 'fmt',
    blurb: 'Builds a whistleblower policy covering reporting channels, anonymity and anti-retaliation protections.',
    fields: [txt('c', 'Company name'), sel('r', 'Reporting channels', ['Email + hotline', 'Email only', 'Hotline + external counsel', 'Web portal + email']), sel('y', 'Anonymous reporting', ['Allowed', 'Allowed with caveats', 'Not offered']), ck('i', 'Policy sections', ['Definition of reportable conduct', 'Reporting procedure', 'Anonymity protections', 'Anti-retaliation clause', 'Investigation timeline', 'Confidentiality obligations'])],
    compute: (v) => {
      const c = v.c as string, r = v.r as string, y = v.y as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'OMITTED')
      const doc = `WHISTLEBLOWER POLICY — ${c || '[Company]'}\n\n1. PURPOSE - employees can raise concerns about wrongdoing without fear. [${incl(0)}]\n2. REPORTING CHANNELS - reports may be made via ${r}. [${incl(1)}]\n3. ANONYMITY - ${y}. [${incl(2)}]\n4. ANTI-RETALIATION - any retaliation is a disciplinary offence. [${incl(3)}]\n5. INVESTIGATION - acknowledgment within 5 business days; closure target 45 days. [${incl(4)}]\n6. CONFIDENTIALITY - information shared only on a need-to-know basis. [${incl(5)}]`
      return [res('Whistleblower policy', 'Draft prepared', T.neutral, 'Anti-retaliation language is non-negotiable.'), docRes('Document', doc)]
    },
  },
  {
    id: 'proxy-statement-voting-agenda-formatter',
    archetype: 'fmt',
    blurb: 'Formats an annual meeting agenda with the voting items and board recommendations.',
    fields: [txt('c', 'Company name'), txt('y', 'Meeting date / location'), txt('m', 'Auditor nominee'), txt('d', 'Director nominees (comma list)'), sel('z', 'Say-on-pay approach', ['Advisory vote annually', 'Advisory vote every 2-3 years', 'No say-on-pay'])],
    compute: (v) => {
      const c = v.c as string, y = v.y as string, m = v.m as string, d = v.d as string, z = v.z as string
      const doc = `PROXY STATEMENT — ANNUAL MEETING\n${c || '[Company]'} · ${y || '[date / venue]'}\n\nVOTING AGENDA\n1. Election of directors: ${d || '[nominees]'} — board recommends FOR.\n2. Ratification of independent auditor: ${m || '[auditor]'} — board recommends FOR.\n3. ${z}.\n4. Advisory approval of director compensation — board recommends FOR.\n5. Any other business properly presented.\n\nItems needing a quorum are noted in the notice of meeting. ${c || 'Provide the company'} should confirm broker-non-vote treatment of each item.`
      return [res('Proxy agenda', 'Formatted for filing', T.neutral), docRes('Document', doc)]
    },
  },
  {
    id: 'business-continuity-plan-bcp-outliner',
    archetype: 'fmt',
    blurb: 'Outlines a business continuity plan with recovery-time targets and trigger definitions.',
    fields: [txt('c', 'Company name'), n('a', 'RTO for core apps (hours)', { def: 4 }), n('b', 'RPO tolerated (hours)', { def: 2 }), sel('t', 'Plan scope', ['Site-level outage', 'Regional disruption', 'Application outage', 'Cyber incident']), ck('i', 'Plan elements', ['Critical function inventory', 'Recovery team & call tree', 'Alternate site / cloud failover', 'Data backup & restore', 'Communication plan', 'Testing cycle'])],
    compute: (v) => {
      const c = v.c as string, a = v.a as number, b = v.b as number, t = v.t as string
      const items = v.i as boolean[]
      const done = items.filter(Boolean).length
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'OMITTED')
      const doc = `BUSINESS CONTINUITY PLAN — ${c || '[Company]'}\n\nSCOPE: ${t}\nRECOVERY TARGETS: RTO ${num(a, 0)} hrs · RPO ${num(b, 0)} hrs\n\n1. CRITICAL FUNCTIONS - revenue and compliance systems first. [${incl(0)}]\n2. RECOVERY TEAM - call tree and incident commander. [${incl(1)}]\n3. ALTERNATE CAPACITY - ${t === 'Site-level outage' ? 'secondary site or cloud' : 'documented capacity'}. [${incl(2)}]\n4. BACKUP - restore tested within RPO. [${incl(3)}]\n5. COMMUNICATION - staff, customers, regulators. [${incl(4)}]\n6. TESTING - desktop walkthrough plus full test yearly. [${incl(5)}]`
      return [res('Plan completeness', `${done}/6 elements`, done === 6 ? T.good : done >= 4 ? T.warn : T.bad, 'A plan that is never tested is a document, not a plan.'), docRes('Document', doc)]
    },
  },
  {
    id: 'regulatory-fine-risk-estimator',
    archetype: 'est',
    blurb: 'Approximates regulatory fine exposure from revenue, violation severity and compliance maturity.',
    fields: [n('a', 'Global revenue ($/yr)', { def: 100000000 }), sel('b', 'Violation severity', ['Minor procedural', 'Moderate', 'Serious', 'Systemic / willful']), n('c', 'Compliance maturity /10', { max: 10, def: 6 }), n('d', 'Affected customers (thousands)', { def: 50 })],
    compute: (v) => {
      const a = v.a as number, c = v.c as number, d = v.d as number
      const mult = (v.b as string).startsWith('Minor') ? 0.04 : (v.b as string).startsWith('Moderate') ? 0.09 : (v.b as string).startsWith('Serious') ? 0.18 : 0.35
      const base = a * mult
      const maturityAdj = 1 - c / 20
      const fine = base * maturityAdj + d * 500
      return [
        res('Fine exposure', money(fine), c >= 7 ? T.good : T.warn, 'Maturity above 7/10 materially reduces expected exposure.'),
        res('Base statutory figure', money(base), T.neutral),
        res('Severity class', v.b as string, (v.b as string).includes('Serious') || (v.b as string).includes('Systemic') ? T.bad : T.neutral),
      ]
    },
  },
  {
    id: 'corporate-governance-proxy-voting-formatter',
    archetype: 'fmt',
    blurb: 'Generates voting guidelines and a ballot for the proxy items the board will present.',
    fields: [txt('c', 'Company name'), n('b', 'Board size', { def: 9 }), sel('v', 'Director election style', ['Majority voting', 'Plurality voting', 'Classified board']), ck('i', 'Ballot items', ['Director elections', 'Independent auditor ratification', 'Say-on-pay', 'Equity plan authorization', 'Shareholder proposal'])],
    compute: (v) => {
      const c = v.c as string, b = v.b as number, vv = v.v as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'ON BALLOT' : 'NOT on ballot')
      const doc = `VOTING GUIDELINES — ${c || '[Company]'}\n\nDIRECTOR ELECTION: ${vv}; board consists of ${num(b, 0)} seats.\nBALLOT ITEMS\n1. Elect directors: ${incl(0)}.\n2. Ratify independent auditor: ${incl(1)}.\n3. Advisory say-on-pay: ${incl(2)}.\n4. Approve equity plan: ${incl(3)}.\n5. Shareholder proposal: ${incl(4)}.\n\nGuidance: abstentions count toward the quorum; broker non-votes are excluded from the tally on advisory items.`
      return [res('Voting template', 'Ready for ballot', T.neutral), docRes('Document', doc)]
    },
  },
  {
    id: 'anti-bribery-and-corruption-policy-generator',
    archetype: 'fmt',
    blurb: 'Drafts an anti-bribery and anti-corruption policy with hospitality, gift and third-party controls.',
    fields: [txt('c', 'Company name'), sel('j', 'Jurisdiction anchor', ['US FCPA', 'UK Bribery Act', 'Both policed']), sel('g', 'Gift threshold', ['$50', '$100', '$150', 'No-gift regime']), ck('i', 'Policy sections', ['Prohibited payments', 'Gifts & hospitality limits', 'Third-party due diligence', 'Records & red flags', 'Reporting & discipline'])],
    compute: (v) => {
      const c = v.c as string, j = v.j as string, g = v.g as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'OMITTED')
      const doc = `ANTI-BRIBERY & CORRUPTION POLICY — ${c || '[Company]'}\n\nANCHOR: ${j}.\n1. PROHIBITED PAYMENTS - no cash, favors or kickbacks to secure business. [${incl(0)}]\n2. GIFTS & HOSPITALITY - pre-approval over ${g}; no gifts during active procurement. [${incl(1)}]\n3. THIRD PARTIES - agents covered by written diligence before engagement. [${incl(2)}]\n4. RECORDS - all payments recorded accurately; red flags include round sums and unusual intermediaries. [${incl(3)}]\n5. BREACHES - investigated and disciplined, including referral to counsel. [${incl(4)}]`
      return [res('ABAC policy', 'Draft ready', T.neutral, 'Scope every market your partners operate in.'), docRes('Document', doc)]
    },
  },
  {
    id: 'board-of-directors-skill-matrix-builder',
    archetype: 'matrix',
    blurb: 'Maps directors against required skills to spot coverage gaps on the board.',
    fields: [mx('m', 'Skill coverage', ['Skill area', 'Directors covered', 'Coverage target'], ['Industry insight', 'Financial & audit', 'Technology / cyber', 'People & comp', 'ESG & risk'])],
    compute: (v) => {
      const M = v.m as number[][]
      const covered = M.reduce((s, r) => s + (r[0] || 0), 0)
      const targets = M.reduce((s, r) => s + (r[1] || 0), 0)
      const gapAreas = M.filter((r) => (r[0] || 0) < (r[1] || 0)).map((r) => r[0])
      return [
        res('Average coverage', `${numD(M.length ? covered / M.length : 0, 1)} directors/area`),
        res('Skill gaps', gapAreas.length ? gapAreas.join(', ') : 'None', gapAreas.length ? T.warn : T.good, 'Gaps below target often drive the next director search.'),
        res('Coverage ratio', ratio(targets ? covered / targets : 0, 2), targets ? covered / targets >= 1 ? T.good : T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'corporate-charters-and-bylaws-formatter',
    archetype: 'fmt',
    blurb: 'Assembles a charter-and-bylaws skeleton covering purpose, capital and meeting mechanics.',
    fields: [txt('c', 'Company name'), sel('j', 'State of incorporation', ['Delaware', 'California', 'New York', 'Texas']), sel('s', 'Stock class structure', ['Common only', 'Common + Preferred', 'Multi-class common']), n('a', 'Authorized shares', { def: 10000000 }), sel('p', 'Board election', ['Staggered', 'Annual', 'Annual with cumulative voting'])],
    compute: (v) => {
      const c = v.c as string, j = v.j as string, s = v.s as string, p = v.p as string
      const a = v.a as number
      const doc = `CERTIFICATE OF INCORPORATION & BYLAWS — ${c || '[Company]'}\n\nINCORPORATED IN ${j}.\n\n1. PURPOSE - lawful business purposes permitted under state law.\n2. CAPITAL - ${s}; authorized ${num(a, 0)} shares, par value to be set at filing.\n3. BOARD - ${p} director elections; initial directors named at organization.\n4. MEETINGS - annual meeting of stockholders; special meetings per bylaws; quorum is majority of outstanding shares.\n5. OFFICERS - chief executive and secretary at minimum; indemnification limits defined.\n\nNote: file with the ${j} Secretary of State and attach the certificate to the bylaws package.`
      return [res('Charter & bylaws', 'Skeleton assembled', T.neutral, 'Counsel should tailor indemnification and DGCL default provisions.'), docRes('Document', doc)]
    },
  },
  {
    id: 'esg-score-builder',
    archetype: 'scorecard',
    blurb: 'Weights environment, social and governance pillars into a composite ESG score.',
    fields: [mxd('m', 'ESG pillars', ['Pillar', 'Weight %', 'Score /10'], ['Environmental', 'Social', 'Governance'], [[40, 6], [30, 6], [30, 6]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      return [
        res('ESG score', `${numD(score, 1)}/10`, score >= 7 ? T.good : score >= 5 ? T.warn : T.bad, 'Investor-grade territory starts near 7/10.'),
        res('Converted band', score >= 8 ? 'Leader' : score >= 6 ? 'Improver' : score >= 4 ? 'Laggard' : 'At-risk', T.neutral),
        res('Pillar spread', `${numD(Math.max(...M.map((r) => r[1] || 0)) - Math.min(...M.map((r) => r[1] || 0)), 1)} pts`, Math.max(...M.map((r) => r[1] || 0)) - Math.min(...M.map((r) => r[1] || 0)) <= 3 ? T.good : T.warn, 'Large pillar gaps signal uneven program execution.'),
      ]
    },
  },
  {
    id: 'corporate-social-responsibility-csr-budget-allocator',
    archetype: 'bdown',
    blurb: 'Splits a CSR commitment across programs and reports the share of revenue each line consumes.',
    fields: [mx('m', 'CSR programs', ['Program', 'Programs run', 'Budget each ($)'], ['Community grants', 'Environment / offset', 'Education & volunteering', 'Disaster relief']), n('r', 'Company revenue ($/yr)', { def: 50000000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const r = v.r as number
      const spend = M.reduce((s, x) => s + (x[0] || 0) * (x[1] || 0), 0)
      const share = r ? (spend / r) * 100 : 0
      const gl = ['Community grants', 'Environment / offset', 'Education & volunteering', 'Disaster relief']
      const gIdx = M.reduce((bi, x, i) => ((x[0] || 0) * (x[1] || 0) > ((M[bi][0] || 0) * (M[bi][1] || 0)) ? i : bi), 0)
      return [
        res('Total CSR spend', money(spend)),
        res('Share of revenue', pct(share, 2), share >= 0.5 && share <= 2 ? T.good : share > 2 ? T.warn : T.neutral, 'Typical CSR budgets run 0.5-2% of revenue.'),
        res('Largest program', gl[gIdx], T.neutral),
      ]
    },
  },
  {
    id: 'crisis-communication-decision-tree-builder',
    archetype: 'est',
    blurb: 'Routes a crisis to a communication action plan based on severity, culpability and public exposure.',
    fields: [sel('a', 'Incident severity', ['Minor', 'Moderate', 'Severe', 'Existential']), sel('b', 'Company culpability', ['None / third-party', 'Partial', 'Direct fault']), n('c', 'Public exposure (people affected, k)', { def: 5 }), n('d', 'Response window (hours)', { def: 24 })],
    compute: (v) => {
      const sev = v.a as string, culp = v.b as string, c = v.c as number, d = v.d as number
      const score = (sev === 'Existential' ? 4 : sev === 'Severe' ? 3 : sev === 'Moderate' ? 2 : 1) + (culp === 'Direct fault' ? 3 : culp === 'Partial' ? 2 : 1)
      const sprint = d <= 4 ? 'hold statement inside 4h' : 'acknowledge inside 24h'
      const escalate = score >= 5 || c >= 50
      return [
        res('Crisis level', score >= 6 ? 'Level 3 — hit the war room' : score >= 4 ? 'Level 2 — exec statement' : 'Level 1 — monitor', score >= 5 ? T.bad : score >= 3 ? T.warn : T.good, `First move: ${sprint}.`),
        res('Escalate to board', escalate ? 'Yes — immediate' : 'No — comms team owns it', escalate ? T.bad : T.good),
        res('Legal review', culp !== 'None / third-party' ? 'Required before publish' : 'Advisory', T.neutral),
      ]
    },
  },
  {
    id: 'risk-register-and-heatmap-matrix',
    archetype: 'matrix',
    blurb: 'Scores likelihood and impact per risk to build a live heat-map of enterprise exposure.',
    fields: [mx('m', 'Risk register', ['Risk', 'Likelihood /5', 'Impact /5'], ['Cyber breach', 'Supply disruption', 'Regulatory change', 'Key-person loss', 'FX exposure'])],
    compute: (v) => {
      const M = v.m as number[][]
      const heat = M.map((r) => ((r[0] || 0) * (r[1] || 0)))
      const top = heat.indexOf(Math.max(...heat))
      const rlabels = ['Cyber breach', 'Supply disruption', 'Regulatory change', 'Key-person loss', 'FX exposure']
      const rating = (h: number) => (h >= 15 ? 'High' : h >= 7 ? 'Medium' : 'Low')
      const avg = heat.reduce((a, b) => a + b, 0) / heat.length
      return [
        res('Top risk', rlabels[top], Math.max(...heat) >= 15 ? T.bad : Math.max(...heat) >= 7 ? T.warn : T.good),
        res('Average heat', `${numD(avg, 1)} / 25`, avg >= 12 ? T.warn : avg >= 7 ? T.neutral : T.good),
        res('High-risk count', num(heat.filter((h) => h >= 15).length, 0), heat.filter((h) => h >= 15).length ? T.bad : T.good),
        res('Heat rating', rating(Math.max(...heat)), T.neutral),
      ]
    },
  },
  {
    id: 'cyber-liability-executive-risk-estimator',
    archetype: 'est',
    blurb: 'Estimates the executive cost of a data breach: response, credit, legal and regulatory.',
    fields: [n('a', 'Records exposed', { def: 50000 }), n('b', 'Share of records with PII %', { def: 30 }), n('c', 'Breach probability /yr %', { def: 15 }), n('d', 'Response & forensic cost ($)', { def: 400000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const credit = a * (b / 100) * 2.5
      const legal = a * 0.4
      const total = d + credit + legal
      const expected = total * (c / 100)
      const perRecord = a ? total / a : 0
      return [
        res('Breach response cost', money(total), perRecord <= 8 ? T.good : T.warn, 'Per-record cost above $8 signals expensive notification programs.'),
        res('Expected annual loss', money(expected), T.neutral),
        res('Credit monitoring burden', money(credit), T.neutral),
        res('Cost per record', moneyC(perRecord)),
      ]
    },
  },

  // ---------------- Valuation ----------------
  {
    id: 'venture-capital-dilution-calculator',
    archetype: 'est',
    blurb: 'Tracks founder dilution across successive funding rounds and exit ownership.',
    fields: [n('a', 'Current founder ownership %', { def: 90 }), n('b', 'Pre-money valuation ($)', { def: 5000000 }), n('c', 'Round raised ($)', { def: 2000000 }), n('d', 'Option pool to create %', { def: 10 }), n('e', 'Future expansion rounds', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const post = b + c
      const poolFactor = 1 - d / 100
      const diluted = a * (post ? b / post : 0) * poolFactor
      const finalOwn = diluted * Math.pow(0.8, e)
      return [
        res('Ownership after this round', pct(diluted, 1), diluted >= 50 ? T.good : diluted >= 30 ? T.warn : T.bad, `${num(e, 0)} more rounds at ~20% dilution each to come.`),
        res('Option pool dilution', pct(d * a / 100, 1), T.neutral),
        res('Projected exit ownership', pct(finalOwn, 1), finalOwn >= 25 ? T.good : T.warn, 'Below ~15% founders often lose control consent rights.'),
      ]
    },
  },
  {
    id: 'burn-rate-and-runway-extension-estimator',
    archetype: 'est',
    blurb: 'Computes how many months of runway remain and what extending revenue adds.',
    fields: [n('a', 'Cash on hand ($)', { def: 1200000 }), n('b', 'Monthly burn ($)', { def: 120000 }), n('c', 'Monthly revenue ($)', { def: 30000 }), n('d', 'Revenue growth /month %', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const net = b - c
      const months = net > 0 ? a / net : Infinity
      const monthsNow = b > 0 ? a / b : Infinity
      const plusGMV = net > 0 ? a / (b - c * 1.25) : Infinity
      const breakEven = c > 0 && c < b ? Math.log(b / c) / Math.log(1 + d / 100) : Infinity
      return [
        res('Runway at current revenue', Number.isFinite(months) ? `${numD(months, 1)} months` : '∞ — cash-accretive', months <= 6 ? T.bad : months <= 12 ? T.warn : T.good, `With no revenue: ${Number.isFinite(monthsNow) ? numD(monthsNow, 1) + ' months' : '∞'}.`),
        res('Combined runway (20%+ revenue)', Number.isFinite(plusGMV) ? `${numD(plusGMV, 1)} months` : '∞', plusGMV > months ? T.good : T.neutral),
        res('Months to break-even at growth', Number.isFinite(breakEven) ? numD(breakEven, 1) : '∞', T.neutral, `Monthly net burn ${money(net)}.`),
      ]
    },
  },
  {
    id: 'm-and-a-synergy-valuation-calculator',
    archetype: 'est',
    blurb: 'Adds cost and revenue synergies to a base multiple to estimate combined-company valuation uplift.',
    fields: [n('a', 'Combined revenue ($/yr)', { def: 150000000 }), n('b', 'Combined EBITDA ($/yr)', { def: 18000000 }), n('c', 'Cost synergies ($/yr)', { def: 3000000 }), n('d', 'Revenue synergies ($/yr)', { def: 5000000 }), n('e', 'Applied multiple', { def: 9 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const synEbitda = c + d * 0.35
      const base = b * e
      const withSyn = (b + synEbitda) * e
      const uplift = withSyn - base
      const pctU = base ? (uplift / base) * 100 : 0
      return [
        res('Synergy-adjusted value', money(withSyn), synEbitda > 0 ? T.good : T.warn),
        res('Value uplift', money(uplift), uplift > 0 ? T.good : T.bad),
        res('Uplift %', pct(pctU, 1), pctU >= 10 ? T.good : T.warn, 'Credible synergies add 5-20% to announced value.'),
        res('Synergy margin realized', `${numD(synEbitda / (a || b), 2)} of revenue`, T.neutral),
      ]
    },
  },
  {
    id: 'corporate-restructuring-timeline-builder',
    archetype: 'timeline',
    blurb: 'Lays out restructuring phases on a calendar so workstreams and dates line up.',
    fields: [dt('s', 'Kickoff date'), mx('m', 'Restructuring phases', ['Phase', 'Duration (days)'], ['Diagnosis & data room', 'Workshop & options', 'Board approval', 'Implementation', 'Stabilization review'])],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const critical = Math.max(...M.map((r) => r[0] || 0))
      return [
        res('Total program length', days(total)),
        res('Longest single phase', days(critical), critical <= total * 0.4 ? T.good : T.warn, 'One phase above 40% of the plan strains the critical path.'),
        res('Phase count', `${num(M.length, 0)} phases`, T.neutral),
      ]
    },
  },
  {
    id: 'shareholder-voting-power-calculator',
    archetype: 'est',
    blurb: 'Applies vote multipliers and outstanding shares to show true shareholder voting power.',
    fields: [n('a', 'Shares you hold', { def: 1000 }), n('b', 'Votes per share (your class)', { def: 1 }), n('c', 'Total shares outstanding', { def: 100000 }), n('d', 'Avg votes/share across all', { def: 1 }), n('e', 'Proposal quorum %', { def: 50 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const yourVotes = a * b
      const totalVotes = c * d
      const share = totalVotes ? (yourVotes / totalVotes) * 100 : 0
      const quorumVotes = totalVotes * (e / 100)
      const blocking = yourVotes >= quorumVotes * 0.5
      return [
        res('Voting power', pct(share, 2), share >= 50 ? T.good : share >= 20 ? T.warn : T.neutral),
        res('Votes you cast', num(yourVotes, 0)),
        res('Can block quorum', blocking ? 'Yes — control threshold' : 'No', blocking ? T.bad : T.good, `Quorum at ${e}% needs ${num(quorumVotes, 0)} votes.`),
      ]
    },
  },
  {
    id: 'executive-bonus-pool-allocator',
    archetype: 'bdown',
    blurb: 'Pools target bonus pay across executives and applies individual multipliers to the payout.',
    fields: [mx('m', 'Executives', ['Executive', 'Target bonus ($)', 'Multiplier'], ['CEO', 'CFO', 'COO', 'CRO']), n('p', 'Pool budget ($)', { def: 2000000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const target = M.reduce((s, r) => s + (r[0] || 0), 0)
      const earned = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0)
      const cover = target ? (earned / target) * 100 : 0
      const poolUse = target ? (earned / Math.max(1, v.p as number)) * 100 : 0
      const capped = Math.min(poolUse, 100)
      return [
        res('Pooled target', money(target)),
        res('Earned payouts', money(earned), cover >= 90 && cover <= 110 ? T.good : cover > 120 ? T.warn : T.neutral, 'Payout discipline keeps the pool within budget.'),
        res('Pool utilization', pct(capped, 1), capped > 100 ? T.bad : capped >= 95 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'joint-venture-jv-profit-split-estimator',
    archetype: 'est',
    blurb: 'Computes JV profits and splits them under a chosen economic formula.',
    fields: [n('a', 'Partner A revenue ($)', { def: 8000000 }), n('b', 'Partner A costs ($)', { def: 5000000 }), n('c', 'Partner B revenue ($)', { def: 10000000 }), n('d', 'Partner B costs ($)', { def: 7000000 }), sel('s', 'Split basis', ['Equal 50/50', 'By capital contributed', 'By revenue volume', 'By EBITDA']), n('k', 'Capital A ($)', { def: 3000000 }), n('l', 'Capital B ($)', { def: 5000000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, k = v.k as number, l = v.l as number
      const profit = a + c - b - d
      const basis = v.s as string
      const shareA = basis === 'Equal 50/50' ? 0.5 : basis === 'By capital contributed' ? (k + l ? k / (k + l) : 0.5) : basis === 'By revenue volume' ? (a + c ? a / (a + c) : 0.5) : (a - b) / (Math.abs(a - b) + Math.abs(c - d) || 1)
      const aTake = profit * shareA
      return [
        res('Joint profit', money(profit), profit >= 0 ? T.good : T.bad),
        res(`A share (${basis})`, money(aTake)),
        res('B share (balance)', money(profit - aTake), T.neutral),
        res('A margin', pct(a ? ((a - b) / a) * 100 : 0, 1), T.neutral),
      ]
    },
  },
  {
    id: 'corporate-advisory-board-stipend-calculator',
    archetype: 'est',
    blurb: 'Sizes annual advisory board stipends from member count, meeting fees and equity.',
    fields: [n('a', 'Advisory members', { def: 4 }), n('b', 'Meeting fee ($)', { def: 2000 }), n('c', 'Meetings per year', { def: 4 }), n('d', 'Equity pool for advisors %', { def: 1 }), n('e', 'Company valuation ($)', { def: 50000000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const cash = a * b * c
      const equityVal = e * (d / 100)
      const perMember = (cash + equityVal) / (a || 1)
      const cashShare = equityVal ? cash / (cash + equityVal) : 1
      return [
        res('Annual advisory cost', money(cash + equityVal)),
        res('Cash stipends', money(cash), T.neutral),
        res('Equity value', money(equityVal), T.neutral),
        res('Cost per member', money(perMember), perMember <= 100000 ? T.good : T.warn, 'Advisory comp above ~$100k/member starts to look like an exec fee.'),
        res('Cash / equity blend', `${ratio((cashShare * 100), 0)}/` + `${ratio(100 - cashShare * 100, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'company-valuation-multiplier-estimator',
    archetype: 'est',
    blurb: 'Estimates an EBITDA multiple from growth, margin and rate environment adjustments.',
    fields: [n('a', 'EBITDA ($/yr)', { def: 5000000 }), n('b', 'Revenue growth %', { def: 15 }), n('c', 'EBITDA margin %', { def: 20 }), n('d', 'Base comp multiple', { def: 8 }), n('e', 'Interest rate environment %', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const adj = 1 + (b - 10) / 50 + clamp((c - 15) / 60, -0.2, 0.3) - clamp((e - 4) / 100, 0, 0.15)
      const mult = d * clamp(adj, 0.4, 2)
      const value = a * mult
      return [
        res('Adjusted multiple', ratio(mult, 1) + 'x', mult >= d ? T.good : T.warn, 'Growth and margin lift the base; higher rates compress it.'),
        res('Implied value', money(value)),
        res('Value/rev proxy', pct(value ? (value / (a / (c / 100 || 1)) || 0) : 0, 1), T.neutral),
      ]
    },
  },
  {
    id: 'succession-planning-talent-bench-builder',
    archetype: 'matrix',
    blurb: 'Rates readiness and depth for each candidate to measure bench strength per role.',
    fields: [mx('m', 'Succession bench', ['Candidate', 'Readiness /5', 'Depth /5'], ['Candidate A', 'Candidate B', 'Candidate C', 'Candidate D']), sel('r', 'Role', ['CEO', 'CFO', 'COO', 'CTO', 'CRO'])],
    compute: (v) => {
      const M = v.m as number[][]
      const ready = M.filter((r) => (r[0] || 0) >= 3).length
      const deep = M.filter((r) => (r[0] || 0) >= 3 && (r[1] || 0) >= 3).length
      const todayOnly = M.filter((r) => (r[0] || 0) >= 4 && (r[1] || 0) < 3).length
      const avg = M.reduce((s, r) => s + (r[0] || 0), 0) / M.length
      return [
        res('Ready-now candidates', num(ready, 0), ready >= 2 ? T.good : ready >= 1 ? T.warn : T.bad, 'Two ready-now candidates = true bench depth.'),
        res('Bench strength', `${numD(avg, 2)}/5`, avg >= 3.5 ? T.good : avg >= 2.5 ? T.warn : T.bad),
        res('Long-term trajectories', num(deep, 0), deep >= 2 ? T.good : T.warn),
        res('Single-point risk', todayOnly > 0 ? `${todayOnly} requiring succession now` : 'None', todayOnly > 0 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'corporate-franchising-royalty-estimator',
    archetype: 'est',
    blurb: 'Calculates royalties and ad fees per unit plus the unit volume needed to fund support.',
    fields: [n('a', 'Franchise units', { def: 40 }), n('b', 'Avg unit revenue ($/yr)', { def: 600000 }), n('c', 'Royalty rate %', { def: 6 }), n('d', 'Ad fund rate %', { def: 2 }), n('e', 'Royalty target on cost base ($/yr)', { def: 1500000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const unitRoyalty = b * (c / 100)
      const totalRoyalty = unitRoyalty * a
      const adFund = b * (d / 100) * a
      const breakeven = e ? Math.ceil(e / (unitRoyalty || 1)) : 0
      return [
        res('Royalty income', money(totalRoyalty), totalRoyalty >= e ? T.good : T.warn, 'Support cost target is ' + money(e) + '.'),
        res('Royalty per unit', money(unitRoyalty)),
        res('Ad fund collection', money(adFund), adFund > 0 ? T.good : T.neutral),
        res('Units to cover support', num(breakeven, 0) + (breakeven > a ? ` (need ${num(breakeven - a, 0)} more)` : ''), breakeven <= a ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'subsidized-subsidiary-ownership-allocator',
    archetype: 'est',
    blurb: 'Shows how subsidies and external capital reshape effective ownership of a subsidiary.',
    fields: [n('a', 'Parent equity ($)', { def: 8000000 }), n('b', 'External investor ($)', { def: 2000000 }), n('c', 'Government subsidy ($)', { def: 1000000 }), n('d', 'Effective valuation ($)', { def: 15000000 }), sel('s', 'Subsidy treatment', ['Equity credit (no dilution)', 'Convertible into equity', 'Grant excluded from denominator'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const s = v.s as string
      const denom = s === 'Grant excluded from denominator' ? d : s === 'Convertible into equity' ? d : d + c
      const parent = a / denom * 100
      const investor = b / denom * 100
      const subsidyShare = s !== 'Grant excluded from denominator' ? c / denom * 100 : 0
      return [
        res('Parent ownership', pct(parent, 1), parent >= 60 ? T.good : parent >= 40 ? T.warn : T.bad, `Based on ${d ? '$' + num(d, 0) : '[$]'} valuation.`),
        res('Investor ownership', pct(investor, 1), T.neutral),
        res('Subsidy dilution', pct(subsidyShare, 1), s === 'Grant excluded from denominator' ? T.good : T.warn, `${s}.`),
      ]
    },
  },
  {
    id: 'intellectual-property-ip-portfolio-value-estimator',
    archetype: 'bdown',
    blurb: 'Prices an IP portfolio by asset class and count, with defensive-only vs monetizing values.',
    fields: [mx('m', 'IP portfolio', ['Asset class', 'Assets', 'Avg value ($)'], ['Patents', 'Trademarks', 'Copyrights', 'Trade secrets', 'Domain names'])],
    compute: (v) => {
      const M = v.m as number[][]
      const tsv = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0)
      const count = M.reduce((s, r) => s + (r[0] || 0), 0)
      const vpu = count ? tsv / count : 0
      const monetizable = (M[0]?.[0] || 0) * (M[0]?.[1] || 0) * 3
      return [
        res('Portfolio value', money(tsv)),
        res('Assets counted', num(count, 0), count > 0 ? T.good : T.warn),
        res('Value per asset', money(vpu), vpu >= 25000 ? T.good : T.warn, 'Patents dominate; marketing assets usually trade below $10k.'),
        res('Monetization upside', money(monetizable), monetizable > tsv ? T.good : T.neutral, 'Licensing patents at 3x book value is common when proven.'),
      ]
    },
  },
  {
    id: 'executive-travel-expense-allowance-matrix',
    archetype: 'matrix',
    blurb: 'Builds the exec travel policy by class: trips, allowances and expected annual spend.',
    fields: [mx('m', 'Travel classes', ['Class', 'Trips /yr', 'Allowance /trip ($)'], ['Domestic', 'Intra-regional', 'International', 'Long-haul exec']), n('e', 'Executives covered', { def: 8 })],
    compute: (v) => {
      const M = v.m as number[][]
      const e = v.e as number
      const annCost = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0)
      const heavyCost = (M[3]?.[0] || 0) * (M[3]?.[1] || 0)
      const perExec = e ? annCost / e : 0
      const lonAgg = heavyCost / (annCost || 1) * 100
      return [
        res('Annual travel spend', money(annCost)),
        res('Per-exec budget', money(perExec), perExec <= 50000 ? T.good : T.warn, 'Above $50k/exec usually triggers shareholder scrutiny.'),
        res('Long-haul concentration', pct(lonAgg, 1), lonAgg > 40 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'ceo-pay-ratio-estimator',
    archetype: 'est',
    blurb: 'Computes the CEO-to-median-employee pay ratio that proxy filings disclose.',
    fields: [n('a', 'CEO total compensation ($)', { def: 8000000 }), n('b', 'Median employee pay ($)', { def: 60000 }), n('c', 'Pension / deferred add-on ($)', { def: 200000 }), n('d', 'Peer median ratio', { def: 150 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const ceo = a + c
      const payRatio = b ? ceo / b : 0
      return [
        res('CEO pay ratio', ratio(payRatio, 1) + ':1', payRatio <= 100 ? T.good : payRatio <= d * 1.25 ? T.warn : T.bad, `Peer median is ${ratio(d, 0)}:1.`),
        res('CEO comp incl. deferrals', money(ceo)),
        res('Deferred share', pct(ceo ? (c / ceo) * 100 : 0, 1), c > 0 ? T.neutral : T.good, 'Deferred compensation is usually excluded from ratio tests.'),
      ]
    },
  },
  {
    id: 'stock-option-exercise-strike-price-calculator',
    archetype: 'est',
    blurb: 'Computes the spread and cost of exercising options at the current fair-market value.',
    fields: [n('a', 'Options vested', { def: 10000 }), n('b', 'Strike price ($)', { def: 4 }), n('c', 'Current FMV ($)', { def: 12 }), n('d', 'Tax bracket %', { def: 30 }), n('e', 'Exercise cost coverage ($)', { def: 50000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const cost = a * b
      const value = a * c
      const spread = value - cost
      const tax = spread * (d / 100)
      const net = spread - tax
      return [
        res('Exercise cost', money(cost), e >= cost ? T.good : T.warn, cost > e ? `Cash available covers ${pct(e / cost * 100, 0)}.` : 'Fully covered by cash on hand.'),
        res('Current option value', money(value)),
        res('Pre-tax spread', money(spread), spread >= 0 ? T.good : T.bad),
        res('Estimated tax', money(tax), T.neutral),
        res('Net spread after tax', money(net), net >= 0 ? T.good : T.warn),
      ]
    },
  },
]