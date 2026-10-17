import { ck, clamp, doc as docRes, dt, money, mxd, n, num, numD, pct, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

export const specs: OfficeToolSpec[] = [
  // ---------------- Space & Real Estate ----------------
  {
    id: 'office-floor-space-per-employee-calculator',
    archetype: 'est',
    blurb: 'Runs the benchmark check on how much floor area each employee actually gets.',
    fields: [n('f', 'Leased floor area (sqft)', { def: 24000 }), n('e', 'Employees on site', { def: 150 }), n('d', 'Workstations installed', { def: 132 })],
    compute: (v) => {
      const f = v.f as number, e = Math.max(1, v.e as number), d = v.d as number
      const sfe = f / e
      const ratio = d / e
      return [
        res('Sqft per employee', `${num(sfe, 0)} sqft`, sfe <= 250 ? T.good : sfe <= 350 ? T.warn : T.bad, 'Typical offices run 150\u2013250 sqft per head; above 300 is under-used.'),
        res('Desk ratio', `${numD(ratio, 2)}:1`, ratio >= 0.8 ? T.good : ratio >= 0.7 ? T.warn : T.bad, 'Below 0.8:1 desks per head means hot-desking is really in force.'),
        res('Density', `${numD(e / (f / 1000), 1)} people/1k sqft`, T.neutral),
      ]
    },
  },
  {
    id: 'commercial-real-estate-cre-lease-calculator',
    archetype: 'est',
    blurb: 'Builds a full commercial lease P&L: rent, opex, term and tenant improvements in one view.',
    fields: [n('r', 'Rent ($/sqft/yr)', { def: 85 }), n('a', 'Area (sqft)', { def: 12000 }), n('t', 'Term (years)', { def: 5 }), n('o', 'Opex ($/sqft/yr)', { def: 18 }), n('i', 'TI allowance ($/sqft)', { def: 60 })],
    compute: (v) => {
      const r = v.r as number, a = v.a as number, t = v.t as number, o = v.o as number, i = v.i as number
      const base = r * a
      const opex = o * a
      const totalYr = base + opex
      const ti = i * a
      const total = totalYr * t + ti
      const mo = totalYr / 12
      const eff = total / (t * 12)
      return [
        res('Annual base rent', money(base)),
        res('Annual with opex', money(totalYr), totalYr > 0 ? T.neutral : T.warn),
        res('Monthly occupancy cost', money(mo)),
        res('TI budget', money(ti), T.neutral, 'Often paid as a lump or amortized into rent.'),
        res('Effective / sqft / mo', `${money(eff)}/sqft`, T.neutral),
      ]
    },
  },
  {
    id: 'desk-sharing-hot-desking-ratio-calculator',
    archetype: 'est',
    blurb: 'Tells you how many desks you need for a given headcount and presence pattern.',
    fields: [n('e', 'Employees', { def: 180 }), n('d', 'Desks installed', { def: 120 }), n('p', 'Peak presence %', { def: 85 })],
    compute: (v) => {
      const e = v.e as number, d = v.d as number, p = v.p as number
      const peak = e * (p / 100)
      const ratio = e / Math.max(1, d)
      const occ = peak / Math.max(1, d) * 100
      return [
        res('Peak demand', `${num(peak, 0)} seats`, peak <= d ? T.good : T.bad),
        res('Headcount : desks', `${numD(ratio, 2)}:1`, ratio <= 1.5 ? T.good : ratio <= 2.5 ? T.warn : T.bad, '1.5\u20132:1 is the normal active-hotelering band.'),
        res('Peak occupancy', pct(occ, 1), occ <= 90 ? T.good : occ <= 100 ? T.warn : T.bad),
        res('Desk surplus', `${num(d - peak, 0)}`, d - peak >= 0 ? T.good : T.warn, 'Negative means peak overflow — check for drop-in space.'),
      ]
    },
  },
  {
    id: 'car-parking-slot-allocation-planner',
    archetype: 'est',
    blurb: 'Sizes employee parking demand against available slots and visitor provision.',
    fields: [n('s', 'Parking slots', { def: 120 }), n('v', 'Employees driving', { def: 140 }), n('g', 'Visitor / guest slots', { def: 6 }), n('p', 'Avg days driven / week', { def: 4 }), n('w', 'Working days / week', { def: 5 })],
    compute: (v) => {
      const s = v.s as number, vE = v.v as number, g = v.g as number, p = v.p as number, w = Math.max(1, v.w as number)
      const emp = s - g
      const daily = vE * (p / w)
      const util = daily / Math.max(1, emp) * 100
      const short = daily - emp
      return [
        res('Daily demand', `${num(daily, 0)} spots`, daily <= emp ? T.good : T.bad),
        res('Employee slots', `${num(emp, 0)}`, T.neutral),
        res('Utilization', pct(util, 1), util <= 90 ? T.good : util <= 100 ? T.warn : T.bad),
        res('Peak shortfall', `${num(Math.max(0, short), 0)} spots`, short <= 0 ? T.good : T.warn, 'Offer shuttle/transit incentives before building a deck.'),
      ]
    },
  },
  {
    id: 'office-relocation-move-cost-estimator',
    archetype: 'est',
    blurb: 'Estimates a full office move including freight, IT, furniture, double-rent and downtime.',
    fields: [n('a', 'Packing & freight', { def: 28000 }), n('b', 'IT & cabling', { def: 34000 }), n('c', 'Furniture & install', { def: 22000 }), n('d', 'Cleaning & deep clean', { def: 9000 }), n('e', 'Downtime labor', { def: 15000 }), n('f', 'Employees moving', { def: 160 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number, f = Math.max(1, v.f as number)
      const total = a + b + c + d + e
      const perHead = total / f
      const it = (b / total) * 100
      return [
        res('Total move cost', money(total)),
        res('Cost per employee', money(perHead), perHead <= 1200 ? T.good : perHead <= 2000 ? T.warn : T.bad, 'Full-turnkey moves typically land $800\u2013$1,800/head.'),
        res('IT share', pct(it, 1), it <= 25 ? T.good : it <= 40 ? T.warn : T.bad, 'IT is the least-recoverable cost — rerun cable maps early.'),
        res('Contingency (10%)', money(total * 0.1), T.good, 'Budget it separately from procurement decisions.'),
      ]
    },
  },
  {
    id: 'commercial-lease-termination-penalty-calculator',
    archetype: 'est',
    blurb: 'Prices walking away from a lease early vs paying through to the end of term.',
    fields: [n('r', 'Monthly rent', { def: 32000 }), n('m', 'Months remaining', { def: 18 }), n('u', 'Unamortized TI', { def: 40000 }), n('x', 'Broker / release fee', { def: 15000 }), n('s', 'Expected sublease rent ($/mo)', { def: 22000 })],
    compute: (v) => {
      const r = v.r as number, m = v.m as number, u = v.u as number, x = v.x as number, s = v.s as number
      const payThrough = r * m
      const net = r - s
      const sublease = net * m + x + u
      const choose = sublease < payThrough ? 'Sublease + exit' : 'Pay through'
      return [
        res('Pay-through cost', money(payThrough)),
        res('Sublease exit cost', money(sublease), sublease < payThrough ? T.good : T.warn, 'Net rent + fee + unamortized TI.'),
        res('Better option', choose, sublease < payThrough ? T.good : T.neutral),
        res('Monthly leakage', money(Math.max(0, r - s)), s >= r ? T.good : T.warn, 'A shortfall below market rent is the real exit tax.'),
      ]
    },
  },
  {
    id: 'commercial-tenant-improvement-ti-allowance',
    archetype: 'est',
    blurb: 'Checks whether the landlord TI allowance covers the build-out budget before you sign.',
    fields: [n('a', 'TI allowance ($/sqft)', { def: 60 }), n('f', 'Leased sqft', { def: 8000 }), n('b', 'Build-out budget ($/sqft)', { def: 85 }), n('w', 'Work letter covers %', { def: 100 })],
    compute: (v) => {
      const a = v.a as number, f = v.f as number, b = v.b as number, w = v.w as number
      const allowance = a * f
      const build = b * f
      const covered = allowance / Math.max(1, build) * 100
      const gap = Math.max(0, build - allowance)
      const wCover = allowance * (w / 100)
      return [
        res('TI allowance', money(allowance), covered >= 100 ? T.good : covered >= 75 ? T.warn : T.bad, 'Negotiate shortfalls into a rent reduction, not added rent.'),
        res('Build-out budget', money(build)),
        res('Allowance coverage', pct(covered, 1), w >= 100 && covered >= 100 ? T.good : T.warn),
        res('Tenant gap', money(gap), gap === 0 ? T.good : T.warn),
        res('Work-letter cap', money(wCover), T.neutral),
      ]
    },
  },
  {
    id: 'meeting-room-utilization-rate-calculator',
    archetype: 'est',
    blurb: 'Separates booked meetings from rooms actually used to expose ghost bookings.',
    fields: [n('h', 'Available hrs / room / week', { def: 40 }), n('b', 'Booked hrs / room / week', { def: 26 }), n('u', 'Used hrs / room / week', { def: 18 }), n('r', 'Rooms in pool', { def: 12 })],
    compute: (v) => {
      const h = Math.max(1, v.h as number), b = v.b as number, u = v.u as number, r = v.r as number
      const booked = (b / h) * 100
      const used = (u / h) * 100
      const show = b > 0 ? (u / b) * 100 : 0
      const totalUse = u * r
      return [
        res('Booked utilization', pct(booked, 1), booked <= 75 ? T.good : booked <= 95 ? T.warn : T.bad),
        res('True utilization', pct(used, 1), used >= 60 ? T.good : used >= 40 ? T.warn : T.bad, 'Below ~50% means the room pool is oversized.'),
        res('Ghost booking rate', pct(100 - show, 1), show >= 75 ? T.good : show >= 60 ? T.warn : T.bad, 'Enforce a \u201cconfirm or release\u201d policy 1h before.'),
        res('Pool weekly usage', `${num(totalUse, 0)} hrs`, T.neutral),
      ]
    },
  },
  {
    id: 'commercial-real-estate-sublease-profit-calculator',
    archetype: 'est',
    blurb: 'Models the P&L of subleasing surplus space against the headlease you still pay.',
    fields: [n('a', 'Headlease rent ($/sqft)', { def: 62 }), n('s', 'Sublease rent ($/sqft)', { def: 78 }), n('f', 'Space sublet (sqft)', { def: 5000 }), n('t', 'Sublease term (months)', { def: 24 }), n('c', 'Concessions given ($)', { def: 30000 })],
    compute: (v) => {
      const a = v.a as number, s = v.s as number, f = v.f as number, t = v.t as number, c = v.c as number
      const cost = a * f * t
      const income = s * f * t
      const profit = income - cost - c
      const margin = income ? (profit / income) * 100 : 0
      return [
        res('Headlease cost', money(cost)),
        res('Sublease income', money(income), income > cost ? T.good : T.warn),
        res('Net profit', money(profit), profit >= 0 ? T.good : T.bad),
        res('Margin', pct(margin, 1), margin > 0 ? T.good : T.warn, 'Above ~10% gross margin and subleting beats leaving space dark.'),
        res('Monthly spread', money((s - a) * f), s >= a ? T.good : T.warn, 'A negative spread can still net out via duration.'),
      ]
    },
  },
  {
    id: 'office-layout-traffic-flow-evaluator',
    archetype: 'scorecard',
    blurb: 'Scores an office layout plan on circulation, adjacency and pinch points for the moving team.',
    fields: [mxd('m', 'Layout dimensions', ['Dimension', 'Weight %', 'Score /10'], ['Entry & circulation', 'Desk adjacency', 'Collaboration zones', 'Break / kitchen access', 'Egress & pinch points'], [[25, 7], [25, 6], [20, 8], [15, 7], [15, 6]]), sel('t', 'Layout type', ['Open plan', 'Cubicle', 'Hybrid', 'Serviced office'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Entry & circulation', 'Desk adjacency', 'Collaboration zones', 'Break / kitchen access', 'Egress & pinch points']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const weak = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Flow score', `${numD(score, 1)}/100`, score >= 75 ? T.good : score >= 55 ? T.warn : T.bad, `${v.t as string} plan — keep circulation lanes clear of furniture.`),
        res('Weakest dimension', labels[weak], M[weak]?.[1] && M[weak]?.[1] < 6 ? T.warn : T.good),
        res('Pinch flag', score < 60 ? 'Plan desk re-route' : 'Clear flow', score >= 60 ? T.good : T.warn),
        res('Walk test', score >= 70 ? 'Passes simulation' : 'Simulate before sign-off', T.neutral),
      ]
    },
  },
  {
    id: 'warehouse-vs-office-footprint-ratio',
    archetype: 'est',
    blurb: 'Measures how an operation splits space between handling floor and admin areas.',
    fields: [n('o', 'Office / admin area (sqft)', { def: 14000 }), n('w', 'Warehouse floor (sqft)', { def: 85000 }), n('e', 'Employees', { def: 120 }), n('k', 'SKUs stored', { def: 6400 })],
    compute: (v) => {
      const o = v.o as number, w = v.w as number, e = Math.max(1, v.e as number), k = Math.max(1, v.k as number)
      const total = o + w
      const officeShare = (o / total) * 100
      const sfPerEmp = total / e
      const sfPerSku = total / k
      return [
        res('Office share', pct(officeShare, 1), officeShare <= 20 ? T.good : officeShare <= 30 ? T.warn : T.bad, 'Distribution ops usually keep office/warehouse under 1:4.'),
        res('Sqft / employee', `${num(sfPerEmp, 0)} sqft`),
        res('Sqft / SKU', `${numD(sfPerSku, 1)} sqft`, sfPerSku <= 15 ? T.good : sfPerSku <= 25 ? T.warn : T.bad),
        res('Total footprint', `${num(total, 0)} sqft`, T.neutral),
      ]
    },
  },
  {
    id: 'commercial-lease-security-deposit-return-estimator',
    archetype: 'est',
    blurb: 'Forecasts how much of a security deposit you can argue to get back at the end.',
    fields: [n('d', 'Deposit held', { def: 90000 }), n('e', 'Estimated damages', { def: 12000 }), n('r', 'Rent still owed', { def: 15000 }), n('u', 'Unauthorized improvements', { def: 4000 }), n('m', 'Interest / use factor %', { def: 0 })],
    compute: (v) => {
      const d = v.d as number, e = v.e as number, r = v.r as number, u = v.u as number, m = v.m as number
      const claim = e + r + u
      const wk = d * (1 + m / 100)
      const back = Math.max(0, wk - claim)
      const ratio = claim / Math.max(1, wk) * 100
      return [
        res('Landlord claim', money(claim), claim <= d ? T.good : T.bad),
        res('Return estimate', money(back), back >= d * 0.6 ? T.good : back >= d * 0.35 ? T.warn : T.bad, 'Document move-in condition photos to fight damage clawbacks.'),
        res('Claim vs deposit', pct(ratio, 1), ratio <= 50 ? T.good : ratio <= 75 ? T.warn : T.bad),
        res('Dispute headroom', money(Math.max(0, d - claim)), T.neutral),
      ]
    },
  },
  {
    id: 'pandemic-office-social-distancing-layout',
    archetype: 'est',
    blurb: 'Sizes a socially-distant layout: usable area against six-foot spacing rules.',
    fields: [n('a', 'Usable floor area (sqft)', { def: 20000 }), n('d', 'Min spacing (ft)', { def: 6 }), n('p', 'Target sqft / person', { def: 150 }), n('h', 'High-contact zones to close', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, d = v.d as number, p = Math.max(1, v.p as number), h = v.h as number
      const bubble = 6 * d * d / 1.75
      const byRule = Math.floor(a / Math.max(1, bubble))
      const byTarget = Math.floor(a / p)
      const cap = Math.min(byRule, byTarget)
      const zoneLoss = a * (h / 20)
      return [
        res('Capacity (spacing rule)', `${num(cap, 0)} people`, cap > 0 ? T.good : T.bad),
        res('Spacing footprint', `${numD(bubble, 0)} sqft/person`, T.neutral, 'Approx. bubble for a 6ft radius at safe density.'),
        res('Zone loss', `${num(zoneLoss, 0)} sqft`, T.warn, 'Corridors, huddle rooms and shared counters go to ~15-30%.'),
        res('Check', cap < 50 ? 'Schedule split shifts' : 'Fits single cohort', cap >= 50 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'office-space-consolidation-savings-calculator',
    archetype: 'est',
    blurb: 'Models the payback of collapsing multiple sites into one consolidated footprint.',
    fields: [n('c', 'Current total area (sqft)', { def: 36000 }), n('t', 'Target area (sqft)', { def: 22000 }), n('r', 'Avg rent ($/sqft/yr)', { def: 80 }), n('m', 'Move & fit-out cost ($)', { def: 500000 })],
    compute: (v) => {
      const c = v.c as number, t = v.t as number, r = v.r as number, m = v.m as number
      const cur = c * r
      const tgt = t * r
      const saveYr = cur - tgt
      const payback = saveYr > 0 ? m / saveYr : 0
      const trim = (c - t) / c * 100
      return [
        res('Current cost / yr', money(cur)),
        res('Target cost / yr', money(tgt)),
        res('Annual savings', money(saveYr), saveYr > 0 ? T.good : T.bad),
        res('Footprint trim', pct(trim, 1), trim >= 30 ? T.good : trim >= 15 ? T.warn : T.bad, 'Consolidation below ~25% rarely pays for the move.'),
        res('Payback', `${numD(payback, 1)} years`, payback <= 3 ? T.good : payback <= 5 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'disaster-recovery-facility-backup-location',
    archetype: 'scorecard',
    blurb: 'Scores a standby site across power, network, replication and access to size DR readiness.',
    fields: [mxd('m', 'Standby dimensions', ['Dimension', 'Weight %', 'Score /10'], ['Alternate site bidding', 'Power & UPS', 'Network & links', 'Data replication', 'Testing cadence', 'Staff access'], [[20, 7], [15, 6], [15, 8], [20, 9], [15, 5], [15, 6]]), sel('s', 'Failover model', ['Cold site', 'Warm standby', 'Active-active'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Alternate site bidding', 'Power & UPS', 'Network & links', 'Data replication', 'Testing cadence', 'Staff access']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const weak = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      const ready = (v.s as string) === 'Active-active' ? Math.min(100, score + 10) : score
      return [
        res('DR readiness', `${numD(ready, 1)}/100`, ready >= 80 ? T.good : ready >= 55 ? T.warn : T.bad, `${v.s as string} — document RTO/RPO against this score.`),
        res('Weakest link', labels[weak], M[weak]?.[1] && M[weak]?.[1] < 6 ? T.warn : T.good),
        res('Replication', (M[3]?.[1] ?? 0) >= 8 ? 'Recovery-point ready' : 'Replication inadequate', (M[3]?.[1] ?? 0) >= 8 ? T.good : T.bad),
        res('Test cadence', (M[4]?.[1] ?? 0) >= 7 ? 'Exercised' : 'Untested plan', (M[4]?.[1] ?? 0) >= 7 ? T.good : T.warn, 'An untested plan is a scenario, not a guarantee.'),
      ]
    },
  },
  {
    id: 'commercial-property-tax-appeal-estimator',
    archetype: 'est',
    blurb: 'Estimates the tax saving from valuing your building at market instead of assessment.',
    fields: [n('a', 'Assessed value ($)', { def: 4200000 }), n('m', 'Market / true value ($)', { def: 3300000 }), n('r', 'Tax rate % (mill rate)', { def: 2.2 }), n('e', 'Appeal cost ($)', { def: 15000 })],
    compute: (v) => {
      const a = v.a as number, m = Math.max(1, v.m as number), r = v.r as number, e = v.e as number
      const now = a * (r / 100)
      const then = Math.min(a, m) * (r / 100)
      const save = now - then
      const ratio = m / a * 100
      return [
        res('Current tax bill', money(now)),
        res('Appealed bill', money(then)),
        res('Annual saving', money(save), save > 0 ? T.good : T.bad),
        res('Assessment ratio', pct(ratio, 1), ratio <= 80 ? T.good : ratio <= 90 ? T.warn : T.bad, 'Comp <80% of assessment is the classic appeal trigger.'),
        res('Payback (yrs)', `${numD(save > 0 ? e / save : 0, 1)}`, T.neutral),
      ]
    },
  },
  {
    id: 'standing-desk-converter-requirement-calculator',
    archetype: 'est',
    blurb: 'Sizes the order for standing-desk converters from employee interest and budget.',
    fields: [n('e', 'Employees', { def: 120 }), n('p', 'Requests (%)', { def: 30 }), n('c', 'Unit cost ($)', { def: 420 }), n('d', 'Already convertible', { def: 8 })] ,
    compute: (v) => {
      const e = v.e as number, p = v.p as number, c = v.c as number, d = v.d as number
      const need = Math.max(0, Math.ceil(e * (p / 100) - d))
      const cost = need * c
      return [
        res('Units to order', `${num(need, 0)}`, need > 0 ? T.good : T.neutral),
        res('Incremental cost', money(cost), cost <= 50000 ? T.good : cost <= 90000 ? T.warn : T.bad, 'Phase big rollouts; ergonomic demand always outruns it.'),
        res('Coverage', pct(clamp(need / Math.max(1, e) * 100, 0, 100), 1), T.neutral),
        res('Per-person budget', money(cost / Math.max(1, need)), T.neutral),
      ]
    },
  },
  // ---------------- Safety & Emergency ----------------
  {
    id: 'emergency-evacuation-assembly-plan-formatter',
    archetype: 'fmt',
    blurb: 'Generates a printable evacuation plan with assembly points, routes and roll-call owners.',
    fields: [txt('b', 'Building / site', 1, 'HQ Tower'), txt('a', 'Assembly point', 1, 'North parking lot, marker B2'), sel('t', 'Scenario', ['Fire', 'Bomb threat', 'Gas leak', 'Active threat']), txt('r', 'Roll-call owner (floor by floor)', 3, '2F - Ops Mgr | 3F - Fin Mgr | 4F - Eng Mgr')],
    compute: (v) => {
      const b = v.b as string, a = v.a as string, t = v.t as string, r = v.r as string
      const filled = [b, a, t, r].filter((x) => x.trim() !== '').length
      const doc = `EVACUATION PLAN \u00b7 ${t}\n\nSITE: ${b || '(building)'}\nASSEMBLY POINT: ${a || '(location)'}\n\nPROCEDURE\n1. Sound / hear alarm - stop work immediately.\n2. Leave via nearest exit - no elevators (stairs only).\n3. Assist mobility-impaired colleagues per ward.\n4. Walk to assembly point: ${a || '(location)'}.\n\nROLL CALL\n${r || '(assign floor owners)'}\n\nACTIONS\n- Evacuation marshal: ______\n- First aid lead: ______\n- Confirm headcount to PSAP/warden by: ____`
      const ok = filled === 4
      return [res('Plan completeness', `${filled}/4`, ok ? T.good : filled >= 3 ? T.warn : T.bad, 'Drill quarterly; signage must be glow-in-the-dark.'),
        res('Route rule', 'Stairs only - no elevators', T.good),
        docRes('Evacuation plan', doc)]
    },
  },
  {
    id: 'fire-extinguisher-and-first-aid-inspection-log',
    archetype: 'log',
    blurb: 'Logs inspection age and unit health for fire safety stations and first-aid kits on site.',
    fields: [mxd('m', 'Stations', ['Station', 'Days since inspection', 'Units /10 health'], ['Reception', 'Kitchen', 'Server room', 'Lab', 'Loading dock', 'Storage'], [[12, 9], [45, 8], [60, 7], [18, 10], [120, 6], [30, 9]]), n('i', 'Inspection interval (days)', { def: 30 })],
    compute: (v) => {
      const M = v.m as number[][]
      const interval = v.i as number
      const overdue = M.filter((r) => (r[0] || 0) > interval).length
      const low = M.filter((r) => (r[1] || 0) < 8).length
      const maxAge = Math.max(...M.map((r) => r[0] || 0))
      return [
        res('Stations overdue', `${num(overdue, 0)}`, overdue === 0 ? T.good : overdue <= 2 ? T.warn : T.bad),
        res('Under-health units', `${num(low, 0)}`, low === 0 ? T.good : low <= 2 ? T.warn : T.bad, 'Swap refills/replacements under 8/10 health.'),
        res('Oldest inspection', `${num(maxAge, 0)} days`, maxAge <= interval ? T.good : T.warn),
        res('Due check', overdue ? `Run inspections within ${num(3, 0)} days` : 'All current', overdue ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'office-noise-level-decibel-risk-evaluator',
    archetype: 'est',
    blurb: 'Stacks daily noise exposure against the 85 dB \u00b7 8h limit to call the hearing-risk verdict.',
    fields: [n('d', 'Avg sound level (dB)', { def: 78 }), n('e', 'Hours exposed / day', { def: 6 }), n('h', 'Headphone whitelist %', { def: 40 })],
    compute: (v) => {
      const d = v.d as number, e = v.e as number, h = v.h as number
      const t = 8 / Math.pow(2, (Math.max(80, d) - 85) / 5)
      const ai = d < 70 || e < 4
      const dose = e / Math.max(0.5, t) * 100
      const grade = ai || dose < 50 ? 'Low risk' : dose < 100 ? 'Monitor' : 'Actionable'
      const tone = grade === 'Low risk' ? T.good : grade === 'Monitor' ? T.warn : T.bad
      return [
        res('Daily dose', pct(clamp(dose, 0, 500), 1), tone, 'Dose vs the 85dB/8h allowable energy budget.'),
        res('Grade', grade, tone),
        res('Headset policy', `${num(h, 0)}% whitelisted`, h >= 80 ? T.good : h >= 50 ? T.warn : T.bad, 'Recruit headsets with built-in hearing protection for loud floors.'),
        res('Exchange rate', `${numD(t, 1)} hrs at ${num(d, 0)}dB`, T.neutral, '3dB/2x exposure; higher levels need far less time.'),
      ]
    },
  },
  {
    id: 'building-access-card-issuance-log',
    archetype: 'log',
    blurb: 'Logs issued, active and expired access credentials per zone to keep the card register honest.',
    fields: [mxd('m', 'Zones', ['Zone', 'Cards issued', 'Active'], ['Lobby', 'Data center', 'Lab', 'Storage', 'Roof', 'Server floor'], [[150, 135], [60, 52], [25, 22], [40, 34], [12, 9], [35, 33]]), n('g', 'Employees on payroll', { def: 160 })],
    compute: (v) => {
      const M = v.m as number[][]
      const issued = M.reduce((s, r) => s + (r[0] || 0), 0)
      const active = M.reduce((s, r) => s + (r[1] || 0), 0)
      const ghost = issued - active
      const g = Math.max(1, v.g as number)
      const pal = issued / g * 100
      return [
        res('Issued cards', `${num(issued, 0)}`, pal <= 130 ? T.good : pal <= 180 ? T.warn : T.bad, 'Issued cards exceeding 1.3x payroll signals ghost access.'),
        res('Active vs issued', `${num(active, 0)} / ${num(issued, 0)}`),
        res('Needs revocation', `${num(ghost, 0)}`, ghost <= 10 ? T.good : ghost <= 25 ? T.warn : T.bad, 'Revoke on offboarding day \u2014 never end of month.'),
        res('Cards per payroll', `${numD(pal, 1)}x`, T.neutral),
      ]
    },
  },
  {
    id: 'workplace-hazard-identification-matrix',
    archetype: 'matrix',
    blurb: 'Scores hazards by severity, likelihood and existing controls to rank the control backlog.',
    fields: [mxd('m', 'Hazards', ['Severity /5', 'Likelihood /5', 'Controls /5'], ['Slip / trip', 'Electrical', 'Manual handling', 'Machinery entrapment', 'Chemical exposure', 'Confined space'], [[5, 4, 4], [5, 2, 5], [3, 5, 3], [5, 3, 2], [4, 2, 4], [5, 2, 3]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Slip / trip', 'Electrical', 'Manual handling', 'Machinery entrapment', 'Chemical exposure', 'Confined space']
      const risk = M.map((r) => (r[0] || 0) * (r[1] || 0))
      const mit = M.map((r) => (r[0] || 0) * (r[1] || 0) * (1 - (r[2] || 0) / 5))
      const maxI = risk.reduce((bi, x, i) => (x > risk[bi] ? i : bi), 0)
      const avgC = M.reduce((s, r) => s + (r[2] || 0), 0) / Math.max(1, M.length)
      return [
        res('Top hazard', labels[maxI], risk[maxI] >= 15 ? T.bad : risk[maxI] >= 10 ? T.warn : T.good, `Severity ${M[maxI][0]} x Likelihood ${M[maxI][1]} = ${risk[maxI]}.`),
        res('Risk-to-control avg', `${numD(mit.reduce((s, x) => s + x, 0) / M.length, 1)}`, T.neutral),
        res('Control strength', `${numD(avgC, 1)}/5`, avgC >= 4 ? T.good : avgC >= 3 ? T.warn : T.bad, 'Weak controls balloon the residual risk.'),
        res('Backlog', `${num(M.filter((r) => (r[2] || 0) < 4).length, 0)} hazards need controls`, T.warn),
      ]
    },
  },
  {
    id: 'facility-security-guard-shift-allocator',
    archetype: 'matrix',
    blurb: 'Splits guard hours across zones by shift pattern and criticality to hit coverage targets.',
    fields: [mxd('m', 'Zones', ['Zone', 'Shifts / week', 'Hrs / shift', 'Criticality /5'], ['Perimeter', 'Lobby', 'Loading dock', 'Server floor', 'Night patrol'], [[14, 12, 4], [21, 12, 4], [7, 12, 5], [7, 12, 5], [7, 8, 3]]), n('c', 'Budgeted guard-hrs / week', { def: 420 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Perimeter', 'Lobby', 'Loading dock', 'Server floor', 'Night patrol']
      const hrs = M.map((r) => (r[0] || 0) * (r[1] || 0))
      const total = hrs.reduce((s, x) => s + x, 0)
      const c = v.c as number
      const crit = M.reduce((bi, r, i) => ((r[2] || 0) > (M[bi][2] || 0) ? i : bi), 0)
      return [
        res('Guard hours / week', `${num(total, 0)}`, total <= c ? T.good : T.bad),
        res('Budget headroom', `${num(c - total, 0)} hrs`, c - total >= 0 ? T.good : T.warn, 'Over budget cover areas \u2014 rebalance before staffing up.'),
        res('Highest-criticality zone', labels[crit], T.warn),
        res('Avg guard shifts', `${numD(total / 8 / Math.ceil(c / 160), 1)}`),
      ]
    },
  },
  {
    id: 'office-furniture-ergonomic-compliance-audit',
    archetype: 'checklist',
    blurb: 'Walks a workstation floor against the ergonomic compliance checklist so injuries stay low.',
    fields: [ck('c', 'Found compliant', ['Chair height adjustable (5:1)', 'Monitor top at eye level', 'Arms supported / keyboard neutral', 'Sit-stand capability available', 'Screen at 20-28in distance', 'Footrest where needed', 'Document holder / dual-monitor set', 'No pinch or glare sources'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const bad = ['Chair height adjustable (5:1)', 'Monitor top at eye level', 'Arms supported / keyboard neutral', 'Sit-stand capability available', 'Screen at 20-28in distance', 'Footrest where needed', 'Document holder / dual-monitor set', 'No pinch or glare sources'].filter((_, i) => !items[i])
      return [
        res('Compliance', pct(done * 12.5, 1), done >= 7 ? T.good : done >= 5 ? T.warn : T.bad),
        res('Workstations OK', `${done}/8`, T.neutral),
        res('Gaps', bad.length ? bad.slice(0, 3).join('; ') : 'None', bad.length ? T.warn : T.good, 'Fix the top two gaps per floor before the MSD stats bite.'),
      ]
    },
  },
  {
    id: 'disability-access-compliance-checklist',
    archetype: 'checklist',
    blurb: 'Scores the physical accessibility of a building against the standards a facility should meet.',
    fields: [ck('c', 'Verified accessible', ['Ramped / level entrance', 'Door width \u2265 32in clear', 'Accessible restroom & grab bars', 'Braille + tactile signage', 'Counter heights reachable', 'Evacuation chair / refuge', 'Contrast markings on glass', 'Lift controls reachable & audible'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['Ramped / level entrance', 'Door width \u2265 32in clear', 'Accessible restroom & grab bars', 'Braille + tactile signage', 'Counter heights reachable', 'Evacuation chair / refuge', 'Contrast markings on glass', 'Lift controls reachable & audible'].filter((_, i) => !items[i])
      const ready = done === 8 ? 'Accessible' : done >= 6 ? 'Partial access' : 'Non-compliant'
      return [
        res('Access score', pct(done * 12.5, 1), done === 8 ? T.good : done >= 6 ? T.warn : T.bad),
        res('Verdict', ready, ready === 'Accessible' ? T.good : ready === 'Partial access' ? T.warn : T.bad),
        res('Gaps', missing.length ? missing.join('; ') : 'None', missing.length ? T.warn : T.good, 'Priority: entry + restroom + egress before cosmetics.'),
      ]
    },
  },
  {
    id: 'emergency-lighting-battery-test-tracker',
    archetype: 'tracker',
    blurb: 'Tracks emergency-lighting battery tests so units stay ready for the dark.',
    fields: [dt('d', 'Last test date'), n('b', 'Battery health %', { def: 80 }), n('m', 'Runtime achieved (min)', { def: 65 }), sel('s', 'Test result', ['Pass', 'Weak', 'Fail'])],
    compute: (v) => {
      const d = v.d as string, b = v.b as number, m = v.m as number, s = v.s as string
      const dateStr = d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      const min = m >= 90
      const ok = s !== 'Fail' && b >= 60 && min
      return [
        res('Battery health', pct(clamp(b, 0, 100), 1), b >= 80 ? T.good : b >= 60 ? T.warn : T.bad),
        res('Runtime', `${num(m, 0)} min`, m >= 90 ? T.good : m >= 60 ? T.warn : T.bad, 'Battery age claims runtime long before health reads fail.'),
        res('Verdict', ok ? 'Code-ready' : 'Replace / repair', ok ? T.good : T.bad),
        res('Last tested', dateStr, T.neutral),
      ]
    },
  },
  {
    id: 'visitor-management-log-template',
    archetype: 'fmt',
    blurb: 'Prints a visitor log sheet with sign-in steps that keeps a named list of who is in the building.',
    fields: [txt('c', 'Company / site', 1, 'Acme Corp - HQ'), txt('l', 'Reception contacts', 1, 'Front desk ext 2340'), sel('p', 'Pass type', ['Badge', 'Escorted', 'Remote / tap-only']), txt('n', 'Notes / areas', 2, 'Escort required beyond 2F')],
    compute: (v) => {
      const c = v.c as string, l = v.l as string, p = v.p as string, n = v.n as string
      const doc = `VISITOR LOG \u00b7 ${c || '(site)'}\n\nVISITOR\nName: ____________\nCompany: ____________\nPurpose: ____________\n\nSIGN-IN\nTime: ____  Pass: ${p}  Issued by: ____\n\nCONTENTS\n- Badge: ______  Return by: ____\n- Escort required: ${n || '(set by reception)'}\n\nSIGN-OUT\nTime: ____  Badge returned: Y / N\n\nNote for guards: verify badge + purpose against this line before exit.  Contact: ${l || '(reception)'}`
      return [res('Log ready', 'Print one page / 25 visits', T.good, 'Keep 12 months of records for audit trails.'),
        res('Pass type', p, T.neutral),
        docRes('Visitor log', doc)]
    },
  },
  {
    id: 'key-management-and-physical-lock-tracker',
    archetype: 'tracker',
    blurb: 'Tracks physical keys, their rekey cycle and the lock register so lost keys get addressed fast.',
    fields: [dt('d', 'Last rekey date'), n('k', 'Keys outstanding', { def: 34 }), n('s', 'Missing / unaccounted', { def: 2 }), sel('l', 'Lock area', ['Core', 'Perimeter', 'Server', 'Storage', 'Warehouse'])],
    compute: (v) => {
      const d = v.d as string, k = v.k as number, s = v.s as number, l = v.l as string
      const dateStr = d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      const risk = s === 0 ? 'Clean register' : s <= 2 ? 'Review locations' : 'Rekey needed'
      return [
        res('Keys outstanding', `${num(k, 0)}`, T.neutral),
        res('Unaccounted', `${num(s, 0)}`, s === 0 ? T.good : s <= 2 ? T.warn : T.bad, 'Missing master keys = rekey the affected cores.'),
        res('Key health', risk, s === 0 ? T.good : s <= 2 ? T.warn : T.bad),
        res('Last rekey', dateStr, T.neutral),
        res('Area', l, T.neutral),
      ]
    },
  },
  {
    id: 'workplace-temperature-comfort-index',
    archetype: 'index',
    blurb: 'Turns temperature and humidity into a comfort index and flags the HVAC trim needed.',
    fields: [n('t', 'Temperature (°F)', { def: 74 }), n('h', 'Relative humidity %', { def: 45 })],
    compute: (v) => {
      const t = v.t as number, h = v.h as number
      const temp = clamp(100 - Math.abs(t - 72) * 7, 0, 100)
      const hum = clamp(100 - Math.abs(h - 46) * 0.9, 0, 100)
      const idx = clamp(temp * 0.7 + hum * 0.3, 0, 100)
      const ver = t > 78 ? 'Too warm - lower setpoint 1-2°F' : t < 64 ? 'Too cool - raise setpoint' : 'Comfortable'
      return [
        res('Comfort index', pct(idx, 1), idx >= 80 ? T.good : idx >= 60 ? T.warn : T.bad, 'Gauge is a blend of temp and humidity drift from ideal.'),
        res('Verdict', ver, t > 78 || t < 64 ? T.warn : T.good),
        res('Humidity', pct(h, 1), h >= 30 && h <= 60 ? T.good : T.warn, 'Dry air below ~30% causes static and eye discomfort.'),
        res('Feels-like', `${numD(t, 0)}°F`, T.neutral),
      ]
    },
  },
  {
    id: 'workplace-violence-prevention-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores the violence-prevention program across policy, training, reporting and response.',
    fields: [mxd('m', 'Prevention areas', ['Area', 'Weight %', 'Score /10'], ['Written policy', 'Employee training', 'Reporting channels', 'Response team', 'Threat assessment'], [[25, 8], [20, 7], [20, 8], [20, 6], [15, 5]]), sel('r', 'Reporting route', ['Anonymous hotline', 'Manager + HR', 'Digital form', 'All three'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Written policy', 'Employee training', 'Reporting channels', 'Response team', 'Threat assessment']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const weak = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Prevention score', `${numD(score, 1)}/100`, score >= 80 ? T.good : score >= 60 ? T.warn : T.bad, `Reporting: ${v.r as string}.`),
        res('Weakest area', labels[weak], M[weak]?.[1] && M[weak]?.[1] < 6 ? T.bad : T.warn),
        res('Reporting options', (v.r as string) === 'All three' ? 'Robust' : 'Single channel', (v.r as string) === 'All three' ? T.good : T.warn),
        res('Action', score >= 75 ? 'Maintain posture' : 'Schedule review', score >= 75 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'facility-contractor-insurance-auditor',
    archetype: 'checklist',
    blurb: 'Audits contractor certificates before they set foot on the floor to cap your liability.',
    fields: [ck('c', 'Certificate items verified', ['COI on file & current', 'Workers\' comp coverage', 'General liability \u2265 $1M', 'Auto liability', 'Additional insured (you)', 'Expiry tracked in register', 'Subcontractors covered'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['COI on file & current', 'Workers\' comp coverage', 'General liability \u2265 $1M', 'Auto liability', 'Additional insured (you)', 'Expiry tracked in register', 'Subcontractors covered'].filter((_, i) => !items[i])
      const verdict = done === 7 ? 'Approved' : done >= 5 ? 'Conditional' : 'Reject'
      return [
        res('Compliance', pct(done * (100 / 7), 1), done === 7 ? T.good : done >= 5 ? T.warn : T.bad),
        res('Verdict', verdict, verdict === 'Approved' ? T.good : verdict === 'Conditional' ? T.warn : T.bad, 'No COI = no badge = no access. Hard rule.'),
        res('Gaps', missing.length ? missing.join('; ') : 'None', missing.length ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'roof-leaks-and-building-envelope-inspection',
    archetype: 'log',
    blurb: 'Logs active envelope leaks, their age and severity to schedule the remediation queue.',
    fields: [mxd('m', 'Envelope areas', ['Area', 'Leaks active', 'Days open', 'Severity /5'], ['Roof A - east', 'Roof B - west', 'Facade north', 'Facade south', 'Basement walls', 'Penthouse glazing'], [[0, 0, 1], [1, 24, 4], [2, 40, 3], [0, 0, 2], [1, 15, 5], [1, 6, 2]]), n('c', 'Target close (days)', { def: 14 })],
    compute: (v) => {
      const M = v.m as number[][]
      const leaks = M.reduce((s, r) => s + (r[0] || 0), 0)
      const over = M.filter((r) => (r[0] || 0) >= 1 && (r[1] || 0) > (v.c as number)).length
      const sev = M.reduce((s, r) => s + Math.max(0, (r[2] || 0) * (r[0] || 0)), 0) / Math.max(1, leaks)
      return [
        res('Active leaks', `${num(leaks, 0)}`, leaks === 0 ? T.good : leaks <= 3 ? T.warn : T.bad),
        res('Past target age', `${num(over, 0)} areas`, over === 0 ? T.good : T.warn, `Close-out target ${num(v.c as number, 0)} days.`),
        res('Avg severity', `${numD(sev, 1)}/5`, sev <= 2 ? T.good : sev <= 4 ? T.warn : T.bad, 'Severity 5 = emergency drop-cloth + monitor.'),
        res('Mold watch', leaks > 0 ? 'Initiate moisture mgmt' : 'Clear', leaks > 0 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'gym-and-wellness-center-facility-capacity',
    archetype: 'est',
    blurb: 'Sizes an on-site gym to peak concurrent demand without turning it into a waiting line.',
    fields: [n('a', 'Gym area (sqft)', { def: 3200 }), n('p', 'Peak concurrent users', { def: 45 }), n('e', 'Equipment stations', { def: 28 }), n('o', 'Open hrs / week', { def: 80 }), n('m', 'Monthly members (employees)', { def: 210 })],
    compute: (v) => {
      const a = v.a as number, p = v.p as number, e = v.e as number, o = v.o as number, m = v.m as number
      const byArea = Math.floor(a / 50)
      const byEq = Math.floor(e * 1.2)
      const cap = Math.min(byArea, byEq)
      const util = (p / Math.max(1, cap)) * 100
      return [
        res('Design capacity', `${num(cap, 0)} people`, p <= cap ? T.good : T.bad, 'Rule: ~50 sqft/person \u00b7 ~1.2x station count.'),
        res('Peak utilization', pct(util, 1), util <= 90 ? T.good : util <= 100 ? T.warn : T.bad),
        res('Visits / week (est)', `${num(Math.min(m, Math.floor(p * o / 1.2 / 7)), 0)}`, T.neutral),
        res('Sqft per member', `${numD(a / Math.max(1, m), 1)} sqft`, T.neutral),
      ]
    },
  },
  {
    id: 'mailroom-package-volume-allocator',
    archetype: 'est',
    blurb: 'Sizes mailroom staff and sort capacity to peak parcel volume without a pile-up.',
    fields: [n('v', 'Packages / day (base)', { def: 160 }), n('s', 'Sort rate (pkg/hr/person)', { def: 40 }), n('p', 'Mailroom staff', { def: 2 }), n('h', 'Assigned hrs / day', { def: 6 }), n('m', 'Peak month multiplier', { def: 2.2 })],
    compute: (v) => {
      const v0 = v.v as number, s = v.s as number, p = v.p as number, h = v.h as number, m = v.m as number
      const cap = p * s * h
      const peak = v0 * m
      const util = (v0 / cap) * 100
      const need = Math.ceil(peak / (s * h))
      return [
        res('Base workload', `${num(v0, 0)} pkgs`, util <= 85 ? T.good : T.bad),
        res('Capacity / day', `${num(cap, 0)} pkgs`, v0 <= cap ? T.good : T.warn),
        res('Peak demand', `${num(peak, 0)} pkgs`, peak <= cap * 1.5 ? T.good : peak <= cap * 2 ? T.warn : T.bad, `${num(need, 0)} staff needed at peak.`),
        res('Staff addition', p >= need ? 'None' : `+${num(need - p, 0)} temp`, need <= p ? T.good : T.warn, 'Seasonal surge usually justifies 1 temp FTE.'),
      ]
    },
  },
  {
    id: 'hvac-air-change-rate-ach-estimator',
    archetype: 'est',
    blurb: 'Estimates air changes per hour from room volume and supplied airflow to judge IAQ.',
    fields: [n('l', 'Room length (ft)', { def: 40 }), n('w', 'Width (ft)', { def: 30 }), n('h', 'Ceiling height (ft)', { def: 9 }), n('a', 'Airflow supplied (CFM)', { def: 6800 })],
    compute: (v) => {
      const l = v.l as number, w = v.w as number, h = v.h as number, a = v.a as number
      const vol = l * w * h
      const ach = (a * 60) / Math.max(1, vol)
      const pp = Math.floor(vol / 1000 * 4)
      return [
        res('Air changes / hour', `${numD(ach, 1)} ACH`, ach >= 6 ? T.good : ach >= 4 ? T.warn : T.bad, 'Office ASHRAE 62.1-style systems run 4-10 ACH.'),
        res('Room volume', `${num(vol, 0)} cu ft`, T.neutral),
        res('Occupancy estimate', `~${num(pp, 0)} people`, T.neutral, '~400 cfm per 1000 cu ft is a rough crowd calc.'),
        res('CFM / person', `${numD(pp ? a / Math.max(1, pp) : 0, 0)} cfm`, T.neutral, 'Target 15-20 cfm/person minimum.'),
      ]
    },
  },
  {
    id: 'facility-energy-audit-cost-estimator',
    archetype: 'bdown',
    blurb: 'Prices energy usage by bucket and estimates the achievable savings from an audit.',
    fields: [mxd('m', 'Energy buckets', ['Bucket', 'Annual cost ($)', 'Reduction opp %'], ['Lighting', 'HVAC', 'Plug & equipment', 'Process loads', 'Water heating'], [[42000, 25], [88000, 30], [26000, 20], [12000, 15], [9000, 20]]), n('l', 'Payback limit (years)', { def: 3 })],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const save = M.reduce((s, r) => s + (r[0] || 0) * ((r[1] || 0) / 100), 0)
      const cap = M.reduce((s, r) => s + (r[0] || 0) * ((r[1] || 0) / 100), 0)
      const lim = v.l as number
      const payback = 'capital apply'
      return [
        res('Annual energy spend', money(total)),
        res('Achievable saving', money(save), save / Math.max(1, total) >= 0.2 ? T.good : save / Math.max(1, total) >= 0.1 ? T.warn : T.neutral, `~${numD(save / Math.max(1, total) * 100, 0)}% of the bill.`),
        res('Simple payback (est)', `${numD(cap > 0 ? (total * 0.35) / Math.max(1, save) : 0, 1)} yrs`, T.neutral, 'CapEx ~35% of spend amortizes against savings.'),
        res('Repay limit', `${num(lim, 0)} yrs limit`, lim >= 2 ? T.good : T.warn, payback === 'capital apply' ? 'Prioritize < limit first.' : ''),
      ]
    },
  },
  {
    id: 'janitorial-and-cleaning-frequency-schedule-builder',
    archetype: 'fmt',
    blurb: 'Generates a cleaning schedule from scope, staffing and service model inputs.',
    fields: [txt('z', 'Zones to cover', 2, 'Lobby, restrooms, breakrooms, huddle rooms, lab'), n('h', 'Janitorial hrs / day', { def: 8 }), n('d', 'Service days / week', { def: 5 }), sel('m', 'Service model', ['Daily full clean', 'Daily + deep weekly', 'Twice daily', 'On-call only'])],
    compute: (v) => {
      const z = v.z as string, h = v.h as number, d = v.d as number, m = v.m as string
      const hrsWk = h * d
      const zones = z.split(',').map((x) => x.trim()).filter(Boolean)
      const per = zones.length ? hrsWk / zones.length : 0
      const doc = `CLEANING SCHEDULE \u00b7 ${m}\n\nSERVICE HOURS: ${num(h, 0)} hrs/day \u00b7 ${num(d, 0)} days/wk\nWEEKLY BUDGET: ${num(hrsWk, 0)} hrs\n\nZONES: ${zones.join(', ') || '(add zones)'}\n\nFREQUENCY MAP\n${zones.map((zone) => `- ${zone}: ${per >= 2 ? 'daily' : per >= 1 ? '3x/wk' : 'weekly'} (${numD(per, 1)} hrs/week)`).join('\n') || '(empty)'}\n\nDEEP CLEAN ROTATION\n- Restrooms & kitchen: weekly\n- Carpets & windows: quarterly\n- Air vents: seasonal`
      return [res('Weekly budget', `${num(hrsWk, 0)} hrs`, hrsWk >= zones.length ? T.good : T.warn, 'Allocate at least 1 hr/zone/week or clean quality slips.'),
        res('Service model', m, T.neutral),
        docRes('Cleaning schedule', doc)]
    },
  },
  {
    id: 'waste-management-and-recycling-rate-calculator',
    archetype: 'est',
    blurb: 'Splits waste between recycling, compost and landfill to track the real diversion rate.',
    fields: [n('t', 'Total waste (tons / yr)', { def: 120 }), n('r', 'Recycled (tons)', { def: 48 }), n('c', 'Composted (tons)', { def: 15 }), n('l', 'Landfill (tons)', { def: 57 }), n('h', 'Hauler cost ($/ton)', { def: 90 })],
    compute: (v) => {
      const t = Math.max(1, v.t as number), r = v.r as number, c = v.c as number, l = v.l as number, h = v.h as number
      const diverted = r + c
      const rate = (diverted / t) * 100
      const dart = (l / t) * 100
      const cost = t * h
      const saving = (diverted / t) * t * 22
      return [
        res('Diversion rate', pct(rate, 1), rate >= 50 ? T.good : rate >= 30 ? T.warn : T.bad, '50%+ is the corporate target band.'),
        res('Landfill share', pct(dart, 1), dart <= 50 ? T.good : T.bad),
        res('Hauler cost', money(cost), T.neutral),
        res('Rebate opportunity', money(saving), saving > 0 ? T.good : T.neutral, 'Recyclables rebates often offset hauler lines 15-25%.'),
      ]
    },
  },
  {
    id: 'facility-maintenance-ticket-escalator',
    archetype: 'tracker',
    blurb: 'Tracks a maintenance ticket by age and priority against the SLA you promised the floor.',
    fields: [dt('o', 'Opened date'), n('d', 'Days open', { def: 4 }), sel('p', 'Priority', ['P4 - Low', 'P3 - Normal', 'P2 - High', 'P1 - Critical']), sel('s', 'Status', ['Open', 'In progress', 'Awaiting parts', 'Escalated'])],
    compute: (v) => {
      const o = v.o as string, d = v.d as number, p = v.p as string, s = v.s as string
      const lim = p.includes('P1') ? 1 : p.includes('P2') ? 3 : p.includes('P3') ? 5 : 10
      const late = d > lim
      const dateStr = o ? new Date(o + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      return [
        res('SLA', `${num(d, 0)}d / ${num(lim, 0)}d`, late ? T.bad : T.good),
        res('Status', s, s === 'Escalated' ? T.bad : s === 'Open' ? T.warn : T.good),
        res('Escalate?', late && s !== 'Escalated' ? 'Yes - route to FM lead' : 'Under control', late ? T.warn : T.good),
        res('Opened', dateStr, T.neutral),
      ]
    },
  },
  {
    id: 'solar-panel-roi-for-commercial-property',
    archetype: 'est',
    blurb: 'Models the economics of rooftop solar: install cost, output, savings and payback.',
    fields: [n('c', 'Install cost ($)', { def: 260000 }), n('k', 'System size (kW)', { def: 165 }), n('s', 'Annual savings ($)', { def: 38000 }), n('g', 'Incentive / credit (30%)', { def: 30 }), n('r', 'Rate escalation %/yr', { def: 3 })],
    compute: (v) => {
      const c = v.c as number, k = v.k as number, s = v.s as number, g = v.g as number, r = v.r as number
      const net = c * (1 - g / 100)
      const payback = net / Math.max(1, s)
      const annualE = k * 1200
      const tenYr = s * (1 + r / 100 * 5) * 6
      return [
        res('Net cost', money(net), T.neutral),
        res('Payback', `${numD(payback, 1)} yrs`, payback <= 6 ? T.good : payback <= 9 ? T.warn : T.bad, 'Under 6 years with incentives is a strong commercial case.'),
        res('Energy / yr (est)', `${num(annualE, 0)} kWh`, T.neutral, '~1,200 kWh/kW/yr at decent sun.'),
        res('10-yr value', money(tenYr), tenYr > net * 1.6 ? T.good : T.warn, 'Lifetime value should clear 1.6x net cost.'),
      ]
    },
  },
  {
    id: 'office-plant-and-biophilic-design-planner',
    archetype: 'est',
    blurb: 'Scores a green-office plan on planting density, water features and natural light access.',
    fields: [n('a', 'Floor area (sqft)', { def: 20000 }), n('p', 'Plants installed', { def: 140 }), n('w', 'Water feature area (sqft)', { def: 120 }), n('l', 'Windows / glazing %', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, p = v.p as number, w = v.w as number, l = v.l as number
      const dens = p / (a / 1000)
      const vp = 100 - Math.abs(dens - 8) * 8
      const score = clamp(vp * 0.55 + Math.min(100, l * 1.4) * 0.35 + Math.min(100, w / 10) * 0.1, 0, 100)
      return [
        res('Plant density', `${numD(dens, 1)} / 1k sqft`, dens >= 6 && dens <= 12 ? T.good : dens < 6 ? T.warn : T.bad, 'Aim ~6-12 plants per 1,000 sqft for measurable effect.'),
        res('Biophilic score', `${numD(score, 1)}/100`, score >= 70 ? T.good : score >= 50 ? T.warn : T.bad, 'Daylight does the heavy lifting; water is a plus.'),
        res('Windows', pct(l, 1), l >= 35 ? T.good : l >= 25 ? T.warn : T.bad),
        res('Plant count', `${num(p, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'coffee-machine-and-pantry-consumable-estimator',
    archetype: 'est',
    blurb: 'Forecasts pantry consumables and coffee spend from headcount and cups per day.',
    fields: [n('e', 'Employees', { def: 120 }), n('c', 'Cups / person / day', { def: 1.8 }), n('d', 'Workdays / month', { def: 22 }), n('g', 'Cups per kg beans', { def: 55 }), n('k', 'Bean cost ($/kg)', { def: 18 })],
    compute: (v) => {
      const e = v.e as number, c = v.c as number, d = v.d as number, g = Math.max(1, v.g as number), k = v.k as number
      const cups = e * c * d
      const kg = cups / g
      const costB = kg * k
      const costC = cups * 0.08
      const total = costB + costC
      return [
        res('Cups / month', `${num(cups, 0)}`, T.neutral),
        res('Beans (kg) / month', `${numD(kg, 1)} kg`, T.neutral),
        res('Monthly coffee cost', money(total), total / e <= 8 ? T.good : total / e <= 14 ? T.warn : T.bad, 'Benchmark ~$6-10/head/month on pantry coffee.'),
        res('Per cup', `${numD(total / Math.max(1, cups), 2)}`, T.good),
      ]
    },
  },
  {
    id: 'e-waste-disposal-compliance-formatter',
    archetype: 'fmt',
    blurb: 'Prints an e-waste disposal record with the regime, disposition and recycler chain.',
    fields: [txt('o', 'Organization', 1, 'Acme Corp'), sel('r', 'Regime', ['US EPA / R2', 'EU WEEE', 'CA DTSC', 'Global CB / ISO']), sel('d', 'Disposition', ['Certified recycler', 'Data wipe + resale', 'Donation', 'Hazardous drain']), txt('v', 'Recycler / vendor', 1, 'GreenCycle LLC (R2)')],
    compute: (v) => {
      const o = v.o as string, r = v.r as string, d = v.d as string, vv = v.v as string
      const doc = `E-WASTE DISPOSAL RECORD\n\nORGANIZATION: ${o || '(org)'}\nREGULATORY REGIME: ${r}\nDISPOSITION: ${d}\nRECYCLER: ${vv || '(vendor)'}\n\nMANIFEST (one line per batch)\nDate: ______  Items: ______  Serials: ______\nWeights (kg) / units: ______\n\nREMOVAL CHECKS\n- Data sanitized: Y / N  (standard: ______)\n- Certificate of destruction(CoD) on file: Y / N\n- Manifest kept 5 years: Y / N\n- Hazardous stream segregated: Y / N\n\nSIGN-OFF\nEntered by: ______  FM: ______`
      return [res('Record type', `${r} \u00b7 ${d}`, d === 'Hazardous drain' ? T.warn : T.good, 'Cross-check CoD before the truck leaves the dock.'),
        res('Recycler', vv || '(vendor)', T.neutral),
        docRes('E-waste record', doc)]
    },
  },
  {
    id: 'building-water-consumption-metric',
    archetype: 'est',
    blurb: 'Benchmarks building water use per person and per square foot to find the leak curve.',
    fields: [n('w', 'Monthly water use (gal)', { def: 52000 }), n('e', 'Employees', { def: 150 }), n('a', 'Floor area (sqft)', { def: 80000 }), n('l', 'Leak alarms raised', { def: 1 })],
    compute: (v) => {
      const w = v.w as number, e = Math.max(1, v.e as number), a = Math.max(1, v.a as number), l = v.l as number
      const perCap = w / e
      const perSf = w / a
      const popLeak = l === 0 ? 'No confirmed leak' : 'Leak signs present'
      return [
        res('Per employee', `${numD(perCap, 0)} gal/mo`, perCap <= 400 ? T.good : perCap <= 700 ? T.warn : T.bad, 'Office norms sit ~250-500 gal/head/month.'),
        res('Per sqft', `${numD(perSf, 1)} gal`, perSf <= 0.7 ? T.good : perSf <= 1.2 ? T.warn : T.bad),
        res('Leak watch', popLeak, l ? T.warn : T.good),
        res('Annualized', `${num(w * 12, 0)} gal`, T.neutral),
      ]
    },
  },
  {
    id: 'facility-management-cost-per-sq-ft',
    archetype: 'est',
    blurb: 'Normalizes total facility spend into the $/sqft metric that benchmarking rewards.',
    fields: [n('c', 'Total FM cost ($/yr)', { def: 890000 }), n('a', 'Gross leasable area (sqft)', { def: 80000 }), n('o', 'Occupancy %', { def: 92 })],
    compute: (v) => {
      const c = v.c as number, a = Math.max(1, v.a as number), o = v.o as number
      const perSf = c / a
      const perMo = c / a / 12
      const adj = c / (o / 100)
      return [
        res('FM cost / sqft / yr', `${numD(perSf, 2)}`, perSf <= 8 ? T.good : perSf <= 12 ? T.warn : T.bad, 'Ideal office band $6-10/sqft/yr all-in for links, cleaning, M&E.'),
        res('Monthly', `${numD(perMo, 2)}`),
        res('At full occupancy', `${numD(adj / a, 2)}`, T.neutral),
        res('Benchmark vs $8', pct(perSf / 8 * 100, 1), perSf <= 8 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'smart-building-iot-sensor-density-calculator',
    archetype: 'est',
    blurb: 'Sizes IoT sensor density for a smart-building rollout against a target per 1,000 sqft.',
    fields: [n('a', 'Floor area (sqft)', { def: 150000 }), n('s', 'Sensors installed', { def: 420 }), n('t', 'Target / 1,000 sqft', { def: 3 }), n('o', 'Operational %', { def: 88 })],
    compute: (v) => {
      const a = v.a as number, s = v.s as number, t = v.t as number, o = v.o as number
      const dens = s / (a / 1000)
      const need = Math.max(0, Math.ceil(t * (a / 1000) - s))
      const op = (o / 100) * dens
      return [
        res('Density', `${numD(dens, 2)} / 1k sqft`, dens >= t ? T.good : T.warn, `Target ${num(t, 0)} per 1k sqft for room-level insight.`),
        res('Gap to install', `${num(need, 0)} sensors`, need === 0 ? T.good : T.warn),
        res('Operational density', `${numD(op, 2)}`, op >= t * 0.8 ? T.good : T.warn, 'Dead/battery sensors quietly cut coverage.'),
        res('Health', pct(o, 1), o >= 90 ? T.good : o >= 80 ? T.warn : T.bad, 'Watch the battery drain story in the dashboard.'),
      ]
    },
  },
  {
    id: 'corporate-ev-charging-station-estimator',
    archetype: 'est',
    blurb: 'Predicts the EV charging demand your fleet and staff will put on the lot.',
    fields: [n('e', 'Employee EVs', { def: 70 }), n('g', 'Company fleet EVs', { def: 15 }), n('c', 'Chargers planned', { def: 12 }), n('h', 'Charging hrs / day', { def: 12 }), n('p', '% charging on any day', { def: 60 })],
    compute: (v) => {
      const e = v.e as number, g = v.g as number, c = v.c as number, h = v.h as number, p = v.p as number
      const demand = (e + g) * (p / 100)
      const sessions = c * (h / 4)
      const ratio = demand / Math.max(1, sessions)
      return [
        res('Charging demand / day', `${numD(demand, 1)} sessions`, demand <= sessions ? T.good : T.bad, 'Assume ~4h per session, staggered.'),
        res('Charger capacity', `${numD(sessions, 1)} sessions`, T.neutral),
        res('Coverage ratio', `${numD(ratio, 2)}:1`, ratio <= 1 ? T.good : ratio <= 1.2 ? T.warn : T.bad, 'Above 1:1 the lot starts lining up.'),
        res('Add chargers', ratio > 1 ? `+${num(Math.ceil(demand - sessions), 0)}` : 'Sufficient', ratio <= 1 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'building-insurance-premium-allocator',
    archetype: 'bdown',
    blurb: 'Allocates a total property premium across buildings by insured value and claims history.',
    fields: [mxd('m', 'Buildings', ['Building', 'Insured value ($)', 'Claims / 3yr ($)'], ['HQ Tower', 'Annex', 'Warehouse', 'Lab'], [[12000000, 18000], [3500000, 25000], [5000000, 9000], [6000000, 8000]]), n('p', 'Total premium ($)', { def: 240000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const val = M.reduce((s, r) => s + (r[0] || 0), 0)
      const claims = M.reduce((s, r) => s + (r[1] || 0), 0)
      const p = v.p as number
      const hq = (M[0][0] / Math.max(1, val)) * p
      const w = (M[2][0] / Math.max(1, val)) * p
      const ratio = claims / Math.max(1, val) * 1000
      return [
        res('Insured values', money(val), T.neutral),
        res('Premium / HQ', money(hq), T.neutral),
        res('Premium / warehouse', money(w), T.neutral),
        res('Loss ratio / 3yr', pct(ratio / 10, 1), ratio < 6 ? T.good : ratio <= 10 ? T.warn : T.bad, 'Claims-heavy sites drag the whole schedule up.'),
      ]
    },
  },
  {
    id: 'office-lighting-lux-level-calculator',
    archetype: 'est',
    blurb: 'Estimates the lux you deliver per fixture and flags over- or under-lit workstations.',
    fields: [n('l', 'Total lumens (fixtures)', { def: 168000 }), n('a', 'Room area (sqft)', { def: 4500 }), n('u', 'Utilization factor %', { def: 70 }), n('m', 'Maintenance factor %', { def: 80 })],
    compute: (v) => {
      const l = v.l as number, a = Math.max(1, v.a as number), u = v.u as number, m = v.m as number
      const areaM2 = a * 0.0929
      const lux = (l * (u / 100) * (m / 100)) / areaM2
      const ver = lux < 300 ? 'Under-lit - add layers' : lux <= 500 ? 'Office standard' : lux <= 750 ? 'Task-appropriate' : 'Over-bright - glare risk'
      return [
        res('Delivered lux', `${numD(lux, 0)} lx`, lux >= 300 && lux <= 500 ? T.good : lux < 300 ? T.warn : lux <= 750 ? T.good : T.warn, '300-500 lx is the open-office band.'),
        res('Verdict', ver, lux >= 300 && lux <= 750 ? T.good : T.warn),
        res('Efficacy (lm/sf)', `${numD(l / a, 1)}`, T.neutral),
        res('Glare guard', lux > 750 ? 'Add diffusers / dim' : 'OK', lux > 750 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'facility-utility-surge-penalty-estimator',
    archetype: 'est',
    blurb: 'Measures the demand-charge penalty your peak kW creates against the contracted demand.',
    fields: [n('p', 'Peak demand (kW)', { def: 420 }), n('a', 'Avg demand (kW)', { def: 310 }), n('c', 'Contracted demand (kW)', { def: 380 }), n('r', 'Rate ($/kW)', { def: 15 })],
    compute: (v) => {
      const p = v.p as number, a = v.a as number, c = v.c as number, r = v.r as number
      const billed = Math.max(c, p)
      const surge = Math.max(0, p - c) * r
      const eff = a * r
      return [
        res('Billed demand', `${num(billed, 0)} kW`, p <= c ? T.good : T.warn),
        res('Demand charge', money(billed * r), p <= c ? T.good : T.bad),
        res('Surge penalty', money(surge), surge === 0 ? T.good : T.warn, 'Trim peaks by staggering HVAC startups and EV charging.'),
        res('Share of avg bill', pct(billed / Math.max(1, a) * 100 - 100, 1), billed / Math.max(1, a) <= 1.35 ? T.good : T.warn),
        res('Nominal (avg) charge', money(eff), T.neutral),
      ]
    },
  },
]