import { ck, clamp, doc as docRes, mx, mxd, n, num, pct, res, sel, txt, money, moneyC, T } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

const CURRENT_YEAR = new Date().getFullYear()

export const specs: OfficeToolSpec[] = [
  // ---------------- Recruitment ----------------
  {
    id: 'job-description-keyword-density-and-bias-checker',
    archetype: 'est',
    blurb: 'Measures how often a target keyword appears in a job description and flags potentially biased phrasing.',
    fields: [n('a', 'Total words in posting'), n('b', 'Target keyword occurrences'), n('c', 'Potentially biased terms found')],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const density = a ? (b / a) * 100 : 0
      const band = c > 2 ? T.bad : c === 1 || c === 2 ? T.warn : T.good
      return [
        res('Keyword density', pct(density), density >= 1 && density <= 2.5 ? T.good : T.warn, 'Ideal range for a primary keyword is 1-2.5%.'),
        res('Keyword mentions', num(b, 0), b >= 3 ? T.good : T.warn, 'Aim for at least 3 natural mentions.'),
        res('Bias scan', `${num(c, 0)} flagged`, band, c > 2 ? 'Rewrite flagged terms for neutral, skills-first language.' : 'Low indication of biased wording.'),
      ]
    },
  },
  {
    id: 'interview-question-matrix-builder',
    archetype: 'matrix',
    blurb: 'Assigns question counts per role competency and estimates the time each candidate spends in panels.',
    fields: [mx('m', 'Question allocation', ['Competency', 'Questions /45 min'], ['Problem solving', 'Communication', 'Cultural fit', 'Technical depth']), n('c', 'Panelists, n')],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const c = v.c as number
      const perQuestion = total ? 45 / total : 0
      return [
        res('Total interview questions', num(total, 0)),
        res('Minutes per question', num(perQuestion, 1)),
        res('Panel coverage', `${Math.max(1, Math.round(c))} panelists`, c >= 2 ? T.good : T.warn, 'Two or more panelists reduce single-rater bias.'),
      ]
    },
  },
  {
    id: 'cost-per-hire-calculator',
    archetype: 'est',
    blurb: 'Turns internal sourcing, external spend and headcount gains into a cost-per-hire figure.',
    fields: [n('a', 'Internal & recruiter cost', { def: 2000 }), n('b', 'External spend (ads, agencies)', { def: 1500 }), n('c', 'Hires completed', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = Math.max(1, v.c as number)
      const cph = (a + b) / c
      return [
        res('Cost per hire', money(cph), cph <= 3500 ? T.good : T.warn, 'Benchmark: 1.5x monthly salary is typical during growth.'),
        res('Total hiring spend', money(a + b)),
        res('External share', pct((a + b) ? (b / (a + b)) * 100 : 0), b / (a + b || 1) > 0.6 ? T.warn : T.good, 'High agency share often indicates weak sourcing.'),
      ]
    },
  },
  {
    id: 'worker-classification-compliance-checker',
    archetype: 'scorecard',
    blurb: 'Scores behavioural, financial and relationship control to flag misclassification risk of independent contractors.',
    fields: [
      mxd('m', 'Control factors', ['Factor', 'Weight %', 'Score /10'], ['Behavioural control', 'Financial control', 'Relationship'], [[25, 0], [40, 0], [35, 0]]),
      sel('reg', 'Test framework', ['IRS common-law', 'ABC (CA-style)', 'EU/UK hybrid']),
    ],
    compute: (v) => {
      const M = v.m as number[][]
      const w = M.map((r) => r[0] || 0)
      const s = M.map((r) => r[1] || 0)
      const tot = w.reduce((a, b) => a + b, 0) || 1
      const wScore = M.reduce((a, r) => a + ((r[0] || 0) * (r[1] || 0)), 0) / tot
      return [
        res('Misclassification risk', pct(wScore * 10), wScore >= 7 ? T.bad : wScore >= 5 ? T.warn : T.good, v.reg as string + ': higher score = more likely an employee relationship.'),
        res('Weighted control score', num(wScore, 1) + '/10'),
        res('Dominant factor', s[0] >= 7 ? 'Behavioural control' : s[1] >= 7 ? 'Financial control' : s[2] >= 7 ? 'Relationship' : 'Balanced'),
      ]
    },
  },
  {
    id: 'contractor-vs-full-time-employee-cost-comparator',
    archetype: 'est',
    blurb: 'Compares the fully-loaded annual cost of a contractor versus a salaried employee.',
    fields: [n('a', 'Contractor hourly rate'), n('b', 'Contractor hours / week'), n('c', 'Salary + fully-loaded cost', { suffix: '/yr' })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const annual = a * b * 46
      const diff = c - annual
      return [
        res('Contractor annual cost', money(annual), annual < c ? T.good : T.warn, 'Assumes 46 working weeks.'),
        res('Employee annual cost', money(c)),
        res('Delta choosing FT', money(Math.abs(diff)), Math.abs(diff) / (c || 1) > 0.15 ? T.warn : T.good, diff >= 0 ? 'FT employee is the more expensive path.' : 'Contractor is the more expensive path.'),
      ]
    },
  },
  {
    id: 'headcount-forecasting-calculator',
    archetype: 'est',
    blurb: 'Projects headcount and the hires needed to reach a target team size over a planning window.',
    fields: [n('a', 'Current headcount', { def: 25 }), n('b', 'Annual growth %', { def: 15 }), n('c', 'Planning years', { def: 2 }), n('d', 'Expected annual attrition %', { def: 10 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      let projected = a
      let hires = 0
      for (let y = 0; y < c; y++) {
        const natural = projected * (d / 100)
        hires += Math.max(0, Math.round(projected * (b / 100) + natural))
        projected = Math.round(projected * (1 + b / 100))
      }
      return [res('Projected headcount', num(projected, 0)), res('Total hires needed', num(hires, 0), hires > 0 ? T.good : T.warn, 'Includes replacement hiring for attrition.'), res('Growth multiple', num(projected / (a || 1), 2) + 'x')]
    },
  },
  {
    id: 'internship-stipend-vs-minimum-wage-estimator',
    archetype: 'index',
    blurb: 'Converts a monthly stipend into an effective hourly rate and checks it against minimum wage.',
    fields: [n('a', 'Monthly stipend', { def: 1200 }), n('b', 'Hours per week', { def: 20 }), n('c', 'Minimum wage ($/hr)', { def: 16 }), sel('d', 'Weeks counted', ['12-week term (240h)', '10-week term (200h)', 'Semester (15 weeks)'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const weeks = (v.d as string).includes('15 weeks') || (v.d as string).includes('15 ') ? 15 : (v.d as string).includes('10-week') ? 10 : 12
      const termHrs = b * weeks
      const stipend = a * (weeks / 4.33)
      const hr = termHrs ? stipend / termHrs : 0
      const rate = c ? (hr / c) * 100 : 0
      return [
        res('Rate vs minimum wage', pct(rate, 1), rate >= 100 ? T.good : T.bad, hr < c ? 'Stipend falls below minimum wage at these hours.' : 'At or above minimum wage.'),
        res('Effective hourly rate', moneyC(hr)),
        res('Total term stipend', money(stipend)),
        res('Hours in term', num(termHrs, 0)),
      ]
    },
  },
  {
    id: 'employee-referral-bonus-estimator',
    archetype: 'est',
    blurb: 'Works out total referral payout and how it compares to the new hire salary.',
    fields: [n('a', 'Referral bonus per hire', { def: 1500 }), n('b', 'Referrals accepted', { def: 3 }), n('c', 'Median hire salary', { def: 60000 }), sel('d', 'Payout schedule', ['All on day 1', 'Half at 90 days', 'Split 30/30/40'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const total = a * b
      const pctSalary = c ? (total / c) * 100 : 0
      return [
        res('Total referral payout', money(total)),
        res('Share of median salary', pct(pctSalary), pctSalary < 10 ? T.good : T.warn, 'Above 10% of salary is aggressive for most grade bands.'),
        res('Payout schedule', v.d as string, total > 5000 ? T.warn : T.good, 'Staged schedules improve retention tie-ins.'),
      ]
    },
  },
  {
    id: 'background-check-turnaround-estimator',
    archetype: 'est',
    blurb: 'Models background screening turnaround from county, national and education components.',
    fields: [n('a', 'County-level checks', { def: 8 }), n('b', 'National checks', { def: 2 }), n('c', 'Education / reference checks', { def: 3 }), n('d', 'Proportion offshore', { def: 0 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const daysMath = (a * 1.6 + b * 1.1 + c * 1.4) * (1 - (d / 100) * 0.35)
      return [
        res('Estimated turnaround', `${num(daysMath, 1)} business days`, daysMath <= 5 ? T.good : daysMath <= 8 ? T.warn : T.bad, 'Offshoring typically cuts 30-35% of cycle time.'),
        res('Critical-path screen', a > 0 ? 'County criminal' : 'National records', a > 0 ? T.warn : T.neutral, 'County searches usually dominate the timeline.'),
        res('Offer-risk window', `${num(Math.ceil(daysMath), 0)} days clean`, daysMath > 8 ? T.warn : T.good, 'Longer windows raise offer competition risk.'),
      ]
    },
  },
  {
    id: 'alumni-network-engagement-tracker',
    archetype: 'log',
    blurb: 'Logs alumni touchpoints and hires to measure whether the network converts into talent.',
    fields: [mx('m', 'Outreach log', ['Quarter', 'Contacted', 'Hired'], ['Q1', 'Q2', 'Q3', 'Q4']), n('c', 'Alumni database size', { def: 500 })],
    compute: (v) => {
      const M = v.m as number[][]
      const contacted = M.reduce((s, r) => s + (r[0] || 0), 0)
      const hired = M.reduce((s, r) => s + (r[1] || 0), 0)
      const c = v.c as number
      const rate = contacted ? (hired / contacted) * 100 : 0
      return [
        res('Total contacts', num(contacted, 0)),
        res('Hires from alumni', num(hired, 0)),
        res('Touch-to-hire rate', pct(rate, 1), rate >= 4 ? T.good : rate >= 2 ? T.warn : T.bad, '2-5% of contacted alumni typically convert to hires.'),
        res('Database penetration', pct(c ? (contacted / c) * 100 : 0, 1), c ? (contacted / c) * 100 >= 25 ? T.good : T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'non-disclosure-agreement-nda-hr-template-builder',
    archetype: 'fmt',
    blurb: 'Assembles a mutual NDA skeleton for HR use with selectable confidentiality clauses.',
    fields: [txt('c', 'Company name'), txt('p', 'Counterparty name'), sel('j', 'Governing law', ['Delaware', 'California', 'New York', 'England & Wales']), ck('i', 'Include clauses', ['Mutual confidentiality', 'Exclusions from confidential info', 'Term survival', 'Return of materials', 'Non-solicitation of employees'])],
    compute: (v) => {
      const c = v.c as string, p = v.p as string, j = v.j as string
      const items = (v.i as boolean[]) ?? []
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'OMITTED')
      const doc = `MUTUAL NON-DISCLOSURE AGREEMENT\n\nBETWEEN: ${c || '[Company]'}  AND  ${p || '[Counterparty]'}\n\n1. PURPOSE - parties evaluate a relationship and may exchange CONFIDENTIAL INFORMATION.\n2. CONFIDENTIAL INFORMATION - includes trade secrets and non-public business data. [${incl(0)}]\n3. EXCLUSIONS - Info already public or independently developed. [${incl(1)}]\n4. LIMITS - Neither party is restricted from retaining records required by law; legal counsel noted. \n5. TERM - Obligations survive termination for 5 years, or perpetuity for trade secrets. [${incl(2)}]\n6. RETURN OF MATERIALS - On request, materials are returned or destroyed with certification. [${incl(3)}]\n7. NON-SOLICITATION - No soliciting the other party's employees for 12 months. [${incl(4)}]\n8. GOVERNING LAW - ${j}. Disputes to binding arbitration.`
      return [res('Draft agreement', 'Ready for legal review', T.neutral, 'Placeholder formatting only — not legal advice.'), docRes('Document', doc)]
    },
  },
  {
    id: 'non-compete-geographic-radius-estimator',
    archetype: 'est',
    blurb: 'Estimates a defensible non-compete radius from role scope and compensation.',
    fields: [sel('a', 'Role scope', ['C-suite / exec', 'Director / senior', 'Mid-level IC', 'Entry / junior']), n('b', 'Employee reach radius (miles)', { def: 30 }), n('c', 'Compensation ($/yr)', { def: 90000 }), n('d', 'Customer overlap %', { def: 40 })],
    compute: (v) => {
      const scopeMult = (v.a as string).startsWith('C') ? 1.25 : (v.a as string).startsWith('D') ? 1.1 : v.a === 'Mid-level IC' ? 0.9 : 0.7
      const b = v.b as number, c = v.c as number, d = v.d as number
      const limit = b * scopeMult * (0.8 + d / 500)
      const defendable = c >= 120000 || d >= 60
      return [
        res('Defensible radius', `${num(limit, 1)} miles`, limit <= b * 1.35 && limit >= b * 0.6 ? T.good : T.warn, 'Proportional to employee reach and customer overlap.'),
        res('Enforceability signal', defendable ? 'Strong grounds' : 'Weak grounds', defendable ? T.good : T.bad, 'Courts weigh compensation level and legitimate business need.'),
        res('Overlap factor', pct(d, 0)),
      ]
    },
  },

  // ---------------- Operations ----------------
  {
    id: 'employee-onboarding-checklist-generator',
    archetype: 'checklist',
    blurb: 'Tracks day-one through first-quarter onboarding items to a readiness score.',
    fields: [ck('i', 'Onboarding checklist', ['Offer letter signed & background check cleared', 'IT account, laptop and badge provisioned', 'Day 1 welcome, manager & buddy introduced', 'Policy & compliance training completed', '90-day goal plan written and reviewed', 'Payroll, benefits and tax docs confirmed', 'Quarterly check-in scheduled', 'Permissions and systems audit completed'])],
    compute: (v) => {
      const items = (v.i as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const p = done / items.length
      const score = Math.round(p * 100)
      return [
        res('Onboarding readiness', pct(score, 0), score >= 90 ? T.good : score >= 60 ? T.warn : T.bad, `${items.length - done} item(s) outstanding.`),
        res('Items complete', `${done}/${items.length}`),
        res('New-hire risk window', done >= 4 ? 'Past peak risk' : 'Critical early period', score < 40 ? T.bad : T.good, 'Most attrition risk sits in the first 45 days.'),
      ]
    },
  },
  {
    id: 'offboarding-and-asset-recovery-checklist-builder',
    archetype: 'checklist',
    blurb: 'Ensures departing employees have their access and assets recovered before exit.',
    fields: [ck('i', 'Offboarding checklist', ['Account & SSO access revoked', 'Device returned and wiped (MDM)', 'Badge / keys returned', 'Email forwarding & auto-reply set', 'Company data transferred to owner', 'Final payslip & exit docs issued', 'Knowledge transfer completed', 'Vendor / external access removed'])],
    compute: (v) => {
      const items = (v.i as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const p = done / items.length
      const score = Math.round(p * 100)
      return [
        res('Exit clearance', pct(score, 0), score >= 95 ? T.good : score >= 70 ? T.warn : T.bad, 'Aim for full clearance before last working day.'),
        res('Unrecovered items', `${items.length - done}`, score < 70 ? T.bad : T.warn, 'Unclosed items create security and billing risk.'),
        res('Day-one compliance', score === 100 ? 'Fully both-sides signed' : 'Action needed', score === 100 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'new-hire-equipment-provisioning-formatter',
    archetype: 'bdown',
    blurb: 'Prices a standard new-hire equipment package and the cost per seat.',
    fields: [mx('m', 'Equipment package', ['Label', 'Qty', 'Unit cost'], ['Laptop', '27" monitor', 'Headset & webcam', 'Peripherals & supplies'])],
    compute: (v) => {
      const m = v.m as number[][]
      const grand = m.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0)
      const seats = Math.max(1, (m[0] || [0])[0] || 1)
      return [
        res('Package cost', money(grand)),
        res('Per-seat cost', money(grand / seats)),
        res('Fully-loaded target', grand > 0 ? 'Within typical $1,500-3,000 budget' : 'Enter quantities', grand > 12000 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'annual-leave-pto-accrual-calculator',
    archetype: 'est',
    blurb: 'Accrues PTO across the year and estimates usable days by a target date.',
    fields: [n('a', 'Annual PTO days', { def: 20 }), n('b', 'Months elapsed', { def: 3 }), n('c', 'Days already taken', { def: 4 }), n('d', 'Planned future days', { def: 6 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const accrued = a * clamp(b / 12, 0, 1)
      const remaining = accrued - c
      const projected = Math.max(0, a - c - d)
      return [
        res('Accrued to date', `${num(accrued, 1)} days`),
        res('Balance after use', `${num(remaining, 1)} days`, remaining < 0 ? T.bad : remaining < 3 ? T.warn : T.good),
        res('Year-end projection', `${num(projected, 1)} days remaining`, projected < 0 ? T.bad : T.good, 'Excludes carryover policy.'),
      ]
    },
  },
  {
    id: 'bereavement-and-parental-leave-estimator',
    archetype: 'est',
    blurb: 'Estimates the days and dollar cost of paid leave for a policy window.',
    fields: [sel('a', 'Leave type', ['Bereavement', 'Parental (birth)', 'Parental (adoption)', 'Family caregiving']), n('b', 'Policy days', { def: 10 }), n('c', 'Daily loaded cost', { def: 350 }), n('d', 'Employees per year', { def: 1 })],
    compute: (v) => {
      const type = v.a as string, b = v.b as number, c = v.c as number, d = v.d as number
      const cost = b * c * d
      return [
        res('Total leave days', `${num(b * d, 0)} days (${type})`),
        res('Annualised cost', money(cost), cost > 20000 ? T.warn : T.good, 'Pooled leave banks typically cover 1-2% of headcount annually.'),
        res('Cost per event', money(b * c)),
      ]
    },
  },
  {
    id: 'overtime-pay-estimator-flsa-compliance',
    archetype: 'est',
    blurb: 'Computes time-and-a-half overtime and checks a simple FLSA exemption flag.',
    fields: [n('a', 'Hourly rate', { def: 25 }), n('b', 'Regular hours / week', { def: 40 }), n('c', 'Overtime hours / week', { def: 6 }), sel('d', 'Classification', ['Non-exempt (OT due)', 'Exempt (no OT due)'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const exempt = (v.d as string).startsWith('Exempt')
      const ot = exempt ? 0 : c * a * 1.5
      const total = a * b + (exempt ? c * a : ot)
      return [
        res('Overtime pay / week', money(ot), exempt ? T.neutral : c > 0 ? T.good : T.neutral, exempt ? 'Exempt role — no OT assumed.' : 'Time-and-a-half applied.'),
        res('Total weekly gross', money(total)),
        res('Compliance flag', exempt ? 'Verify salary threshold' : 'OT accounted', exempt ? T.warn : T.good, 'Exemption requires salary basis and duties test, not just label.'),
      ]
    },
  },
  {
    id: 'shift-differential-pay-calculator',
    archetype: 'est',
    blurb: 'Adds a differential premium to base pay for evening or night shifts.',
    fields: [n('a', 'Base hourly rate', { def: 22 }), n('b', 'Differential %', { def: 10 }), n('c', 'Differentiated hours / week', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const extra = a * (b / 100) * c
      return [
        res('Differential premium / week', money(extra)),
        res('Effective rate on shift', money(a * (1 + b / 100))),
        res('Annualised premium', money(extra * 46), extra * 46 > (a * 40 * 46) * 0.1 ? T.warn : T.good, 'Keep differential spend under ~10% of base payroll.'),
      ]
    },
  },
  {
    id: 'salary-inflation-and-merit-increase-adjuster',
    archetype: 'est',
    blurb: 'Separates merit from inflation to show real purchasing-power change.',
    fields: [n('a', 'Current salary', { def: 65000 }), n('b', 'Merit increase %', { def: 4 }), n('c', 'Expected inflation %', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const newS = a * (1 + b / 100)
      const real = ((1 + b / 100) / (1 + c / 100) - 1) * 100
      return [
        res('New salary', money(newS)),
        res('Real change vs inflation', pct(real, 2, true), real > 0 ? T.good : T.bad, real < 0 ? 'Merit is below inflation — real pay falls.' : 'Merit outpaces inflation.'),
        res('Nominal increase', money(newS - a)),
      ]
    },
  },
  {
    id: 'compensation-ratio-compa-ratio-calculator',
    archetype: 'index',
    blurb: 'Compares current pay to the market midpoint as a compa-ratio percentage.',
    fields: [n('a', 'Current salary', { def: 72000 }), n('b', 'Market midpoint', { def: 75000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number
      const cr = b ? (a / b) * 100 : 0
      return [
        res('Compa-ratio', pct(cr, 1), cr >= 80 && cr <= 120 ? T.good : cr > 120 ? T.warn : T.bad, 'Green zone is typically 85-115%.'),
        res('Distance from midpoint', `${cr < 100 ? '-' : '+'}${pct(Math.abs(100 - cr), 1)}`, cr >= 80 && cr <= 120 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'equal-pay-audit-estimator',
    archetype: 'est',
    blurb: 'Compares average compensation between groups to surface pay-gap exposure.',
    fields: [n('a', 'Group A average salary', { def: 68000 }), n('b', 'Group B average salary', { def: 64000 }), n('c', 'Group B headcount', { def: 40 }), n('d', 'Group B as % of payroll', { def: 30 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const gapPct = a ? ((a - b) / a) * 100 : 0
      const gapDollar = a - b
      return [
        res('Pay gap', pct(gapPct, 1), Math.abs(gapPct) <= 5 ? T.good : Math.abs(gapPct) <= 10 ? T.warn : T.bad, gapPct > 0 ? `${a > b ? 'Group A' : 'Group B'} is paid higher.` : ''),
        res('Gap per head / year', money(Math.abs(gapDollar))),
        res('Estimated remediation', money(Math.abs(gapDollar) * c), Math.abs(gapPct) > 5 ? T.warn : T.good, `Rough annual cost to close the gap for Group B (${num(d, 0)}% of payroll).`),
      ]
    },
  },
  {
    id: 'notice-period-buyout-estimator',
    archetype: 'est',
    blurb: 'Prices an early exit by paying out a notice period in lieu of working it.',
    fields: [n('a', 'Monthly base salary', { def: 5000 }), n('b', 'Notice months (contract)', { def: 2 }), n('c', 'Discount % for waiver', { def: 20 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const full = a * b
      const waived = full * (1 - c / 100)
      return [
        res('Full notice liability', money(full)),
        res('Waived amount', money(waived), c >= 40 ? T.good : T.warn, 'Garden-leave waivers typically discount 10-30%.'),
        res('Saved by agreement', money(full - waived)),
      ]
    },
  },
  {
    id: 'termination-pay-and-severance-package-calculator',
    archetype: 'est',
    blurb: 'Sizes a severance package from salary, tenure and accrued entitlements.',
    fields: [n('a', 'Monthly salary', { def: 6000 }), n('b', 'Severance weeks', { def: 4 }), n('c', 'Unused PTO days', { def: 6 }), n('d', 'Years of service', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const sevPay = a * (b / 21)
      const pto = (a / 21) * c
      const total = sevPay + pto
      return [
        res('Severance pay', money(sevPay)),
        res('PTO payout', money(pto)),
        res('Total package', money(total), total / (a || 1) > 2.5 ? T.warn : T.good, `${num(d, 0)} year(s) service, ${num(b, 0)} week(s) basis.`),
      ]
    },
  },
  {
    id: 'commute-stipend-and-mileage-reimbursement-calculator',
    archetype: 'est',
    blurb: 'Estimates monthly mileage reimbursement for office-commuting employees.',
    fields: [n('a', 'Commute days / month', { def: 20 }), n('b', 'Round-trip miles', { def: 40 }), n('c', 'Rate ($/mile)', { def: 0.7 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const monthly = a * b * c
      return [
        res('Monthly reimbursement', money(monthly)),
        res('Annualised cost', money(monthly * 12), monthly * 12 > 2500 ? T.warn : T.good, 'Compare against transit passes or a flat stipend.'),
        res('Per-commute amount', money(b * c)),
      ]
    },
  },
  {
    id: 'remote-work-stipend-allocator',
    archetype: 'est',
    blurb: 'Allocates a remote-work budget across an eligible remote population.',
    fields: [n('a', 'Annual budget', { def: 50000 }), n('b', 'Eligible remote employees', { def: 40 }), n('c', 'Utilization %', { def: 90 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = v.c as number
      const perHead = a / b
      const spent = a * (c / 100)
      return [
        res('Per-employee annual stipend', money(perHead), perHead >= 500 && perHead <= 2000 ? T.good : T.warn, 'Typical remote stipend range $500-2000/yr.'),
        res('Projected spend', money(spent)),
        res('Headroom', money(a - spent), (a - spent) / a > 0.25 ? T.warn : T.good, 'Under-utilization suggests coverage gaps.'),
      ]
    },
  },
  {
    id: 'health-insurance-premium-split-calculator',
    archetype: 'index',
    blurb: 'Shows the employer/employee split of a monthly health premium.',
    fields: [n('a', 'Total monthly premium', { def: 620 }), n('b', 'Employee contribution', { def: 120 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number
      const emp = a ? (b / a) * 100 : 0
      return [
        res('Employee share of premium', pct(emp, 1), emp <= 30 ? T.good : emp <= 45 ? T.warn : T.bad, 'Employer contributions of 65-80% are common in North America.'),
        res('Employer share of premium', pct(100 - emp, 1)),
        res('Employer contributes monthly', money(a - b)),
      ]
    },
  },
  {
    id: 'flexible-spending-account-fsa-hsa-estimator',
    archetype: 'est',
    blurb: 'Models the tax savings of an FSA/HSA annual election.',
    fields: [n('a', 'Annual election', { def: 2500 }), n('b', 'Expected qualifying expenses', { def: 2200 }), n('c', 'Marginal tax rate %', { def: 25 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const saved = Math.min(a, b) * (c / 100)
      const wasted = Math.max(0, a - b)
      return [
        res('Projected tax savings', money(saved)),
        res('At-risk unused balance', money(wasted), wasted > 250 ? T.warn : T.good, 'FSA balances may be forfeited; HSAs carry over.'),
        res('Effective return', pct(c, 0), T.neutral, 'Savings equal your marginal rate on elected spend.'),
      ]
    },
  },
  {
    id: 'employee-retention-credit-erc-estimator',
    archetype: 'est',
    blurb: 'Estimates an ERC-style payroll credit from qualifying wages and credit rate.',
    fields: [n('a', 'Qualifying wages / quarter', { def: 200000 }), n('b', 'Credit rate %', { def: 40 }), n('c', 'Quarters claimed', { def: 3 }), n('d', 'Full-time employees <100 cutoff', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const credit = a * (b / 100) * c
      return [
        res('Estimated credit', money(credit)),
        res('Per-quarter credit', money(a * (b / 100))),
        res('Qualifying basis', d >= 1 ? 'Full wages (small employer)' : 'Limited $10k/emp', d >= 1 ? T.good : T.warn, 'Employer-size thresholds change the wage base.'),
      ]
    },
  },
  {
    id: 'staffing-ratio-estimator',
    archetype: 'index',
    blurb: 'Expresses support-staff coverage as a share of total headcount.',
    fields: [n('a', 'Total headcount', { def: 100 }), n('b', 'People-ops / support staff', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number
      const share = a ? (b / a) * 100 : 0
      return [
        res('Support coverage', pct(share, 2), share >= 2.5 && share <= 5 ? T.good : share < 2.5 ? T.warn : T.warn, '1 HR/people generalist per 50-75 employees is a common baseline.'),
        res('Employees per staff', a ? num(a / b, 1) : '—'),
      ]
    },
  },
  {
    id: 'disciplinary-action-warning-letter-builder',
    archetype: 'fmt',
    blurb: 'Composes a structured disciplinary warning letter with the correct escalation stage.',
    fields: [txt('e', 'Employee name'), sel('s', 'Stage', ['Verbal warning', 'Written warning', 'Final written warning', 'Suspension notice']), txt('r', 'Details of the issue', 3), txt('a', 'Required improvement / action', 2), txt('d', 'Review date')],
    compute: (v) => {
      const e = v.e as string, s = v.s as string, r = v.r as string, a = v.a as string, d = v.d as string
      const doc = `DISCIPLINARY ACTION NOTICE\n\nEmployee: ${e || '[Name]'}\nStage: ${s}\n\nThis letter sets out the Company's concerns and required improvement.\n\n1. ISSUE: ${r || '[Describe the issue]'}\n2. EXPECTATION: ${a || '[Describe required improvement]'}\n3. NEXT STEPS: The employee should demonstrate sustained improvement by ${d || '[date]'}. Continued concerns at this stage may lead to further disciplinary action.\n\nPlease sign and return a copy within 5 working days.`
      return [res('Notice stage', s, s.startsWith('Final') || s.startsWith('Suspension') ? T.bad : s.startsWith('Written') ? T.warn : T.good, 'Escalate only after documented prior steps.'), docRes('Warning letter', doc)]
    },
  },
  {
    id: 'hr-whistleblower-report-log-template',
    archetype: 'fmt',
    blurb: 'Creates an anonymised whistleblower intake record with case fields.',
    fields: [sel('c', 'Channel', ['Email', 'Hotline', 'Boss-exception', 'Post']), sel('s', 'Category', ['Harassment', 'Fraud', 'Safety', 'Conflict of interest', 'Retaliation']), txt('d', 'Summary of report', 4), txt('a', 'Assigned owner / team')],
    compute: (v) => {
      const c = v.c as string, s = v.s as string, d = v.d as string, a = v.a as string
      const doc = `INTAKE RECORD (CONFIDENTIAL)\n\nCase ref: CONF-${CURRENT_YEAR}-${String((d.length + s.length) % 997).padStart(3, '0')}\nChannel: ${c}\nCategory: ${s}\n\nSummary: ${d || '[Report summary]'}\nOwner: ${a || '[Team]'}\n\nStatus: Open | Triage SLA: 5 business days | Escalation: People Lead\n\nNEXT REVIEW - do not include the reporter's identity in downstream notes.`
      return [res('Case opened', 'CONF-' + CURRENT_YEAR, T.neutral, 'Route to People Lead within 5 days.'), docRes('Intake record', doc)]
    },
  },

  // ---------------- Retention ----------------
  {
    id: 'probationary-period-evaluation-calculator',
    archetype: 'scorecard',
    blurb: 'Scores probation criteria into a confirmed / extended recommendation.',
    fields: [mxd('m', 'Probation criteria', ['Criterion', 'Weight %', 'Score /10'], ['Role performance', 'Skill fit', 'Behaviour & culture', 'Attendance & reliability'], [[25, 0], [30, 0], [25, 0], [20, 0]]), sel('w', 'Probation length', ['30 days', '60 days', '90 days', '6 months'])],
    compute: (v) => {
      const M = v.m as number[][]
      const tot = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / tot
      const rec = score >= 7.5 ? 'Confirm' : score >= 5.5 ? 'Extend probation' : 'Do not confirm'
      return [
        res('Probation verdict', rec, score >= 7.5 ? T.good : score >= 5.5 ? T.warn : T.bad, 'Confirm with feedback; extend only with clear remedial plan.'),
        res('Weighted score', num(score, 1) + '/10'),
        res('Review window', v.w as string),
      ]
    },
  },
  {
    id: 'performance-review-rating-matrix',
    archetype: 'matrix',
    blurb: 'Compares self and manager ratings to expose blind spots in the review.',
    fields: [mx('m', 'Competency ratings', ['Competency', 'Self /5', 'Manager /5'], ['Quality of work', 'Initiative', 'Collaboration', 'Skill development', 'Deadline reliability'])],
    compute: (v) => {
      const M = v.m as number[][]
      const self = M.map((r) => r[0] || 0)
      const mgr = M.map((r) => r[1] || 0)
      const sv = self.reduce((a, b) => a + b, 0) / self.length
      const mv = mgr.reduce((a, b) => a + b, 0) / mgr.length
      const gap = mv - sv
      const maxGap = Math.max(...M.map((r) => Math.abs((r[1] || 0) - (r[0] || 0))))
      return [
        res('Overall rating', num((sv + mv) / 2, 2) + '/5', (sv + mv) / 2 >= 4 ? T.good : (sv + mv) / 2 >= 3 ? T.warn : T.bad),
        res('Self vs manager gap', pct(gap, 2, true), Math.abs(gap) <= 0.75 ? T.good : T.warn, 'Large gaps signal calibration needed.'),
        res('Largest blind spot', `${num(maxGap, 1)} pts`, maxGap > 1 ? T.warn : T.good, 'Discuss the highest-disagreement competency.'),
      ]
    },
  },
  {
    id: 'skill-gap-analysis-matrix',
    archetype: 'matrix',
    blurb: 'Quantifies current vs required proficiency to prioritise upskilling.',
    fields: [mx('m', 'Skill levels', ['Skill', 'Current /10', 'Required /10'], ['Technical core', 'Leadership', 'Communication', 'Data literacy', 'Industry knowledge', 'Tooling'])],
    compute: (v) => {
      const M = v.m as number[][]
      const gaps = M.map((r) => (r[1] || 0) - (r[0] || 0))
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
      const urgent = M.filter((r) => (r[1] || 0) - (r[0] || 0) >= 4).length
      return [
        res('Average gap', num(avgGap, 1), avgGap <= 1.5 ? T.good : avgGap <= 3 ? T.warn : T.bad, 'Positive = more training needed to reach requirement.'),
        res('Urgent gaps (≥4 pts)', num(urgent, 0), urgent > 0 ? T.warn : T.good),
        res('Top priority area', gaps.indexOf(Math.max(...gaps)) >= 0 ? 'Highest-gap skill' : '—', Math.max(...gaps) >= 3 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'internal-mobility-and-career-pathway-planner',
    archetype: 'scorecard',
    blurb: 'Scores readiness for an internal move and suggests the next step in the path.',
    fields: [mxd('m', 'Mobility factors', ['Factor', 'Weight %', 'Score /10'], ['Performance', 'Skill alignment to target role', 'Stretch readiness', 'Organisational impact'], [[25, 0], [35, 0], [20, 0], [20, 0]]), sel('l', 'Current level', ['IC-1', 'IC-2', 'IC-3', 'Manager', 'Senior manager']), sel('p', 'Target pathway', ['Expert track', 'Management track', 'Adjacent function'])],
    compute: (v) => {
      const M = v.m as number[][]
      const tot = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / tot
      const step = score >= 8 ? 'Nominate now' : score >= 6 ? 'Create 6-9 month plan' : 'Develop first'
      return [
        res('Mobility readiness', num(score, 1) + '/10', score >= 7.5 ? T.good : score >= 5 ? T.warn : T.bad),
        res('Recommended action', step),
        res('Pathway', `${v.p as string} from ${v.l as string}`, score >= 6 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'training-roi-calculator',
    archetype: 'est',
    blurb: 'Returns on investment from a training programme measured as productivity gain.',
    fields: [n('a', 'Programme cost', { def: 20000 }), n('b', 'Employees trained', { def: 30 }), n('c', 'Avg productivity gain ($/emp)', { def: 2500 }), n('d', 'Duration of effect (months)', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const gain = b * c * (d / 12)
      const roi = a ? ((gain - a) / a) * 100 : 0
      return [
        res('Estimated benefit 12mo', money(gain)),
        res('Training ROI', pct(roi, 0), roi >= 100 ? T.good : roi >= 0 ? T.warn : T.bad, 'Soft-skill training often shows 100-500% modelled ROI.'),
        res('Break-even months', c && b ? num(a / (b * c) * 12, 1) : '—', T.neutral, 'When cumulative benefit equals cost.'),
      ]
    },
  },
  {
    id: 'employee-turnover-rate-calculator',
    archetype: 'index',
    blurb: 'Annualised turnover as a percentage of average headcount.',
    fields: [n('a', 'Separations in period', { def: 8 }), n('b', 'Average headcount', { def: 120 }), n('c', 'Period months', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = Math.max(1, v.c as number)
      const annual = (a / b) * (12 / c) * 100
      return [
        res('Annualised turnover', pct(annual, 1), annual <= 15 ? T.good : annual <= 25 ? T.warn : T.bad, '15% or under is typically healthy; >25% warrants investigation.'),
        res('Headcount index', num(a / b * 100, 1) + '% of staff left'),
        res('Replacements needed', num(a, 0)),
      ]
    },
  },
  {
    id: 'absenteeism-rate-calculator',
    archetype: 'index',
    blurb: 'Share of scheduled workdays lost to absence in a period.',
    fields: [n('a', 'Sick / absence days', { def: 120 }), n('b', 'Employee count', { def: 80 }), n('c', 'Working days in period', { def: 220 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = Math.max(1, v.c as number)
      const rate = (a / (b * c)) * 100
      return [
        res('Absenteeism rate', pct(rate, 2), rate <= 2.5 ? T.good : rate <= 4 ? T.warn : T.bad, '2-3% is a common baseline; 4%+ merits intervention.'),
        res('Avg days per employee', num(a / b, 1)),
        res('Lost capacity', `${num(a * 8, 0)} staff-hours`, rate > 4 ? T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'employee-net-promoter-score-enps-calculator',
    archetype: 'index',
    blurb: 'NPS-style score from promoters, passives and detractors on employee surveys.',
    fields: [n('a', 'Promoters (9-10)', { def: 54 }), n('b', 'Passives (7-8)', { def: 26 }), n('c', 'Detractors (0-6)', { def: 20 })],
    compute: (v) => {
      const t = (v.a as number) + (v.b as number) + (v.c as number)
      const s = t ? Math.round((((v.a as number) - (v.c as number)) / t) * 100) : 0
      return [
        res('eNPS', String(s), s >= 30 ? T.good : s >= 0 ? T.warn : T.bad, 'Ranges -100 to +100; +30 or higher is strong.'),
        res('Responses', num(t, 0)),
        res('Detractor share', pct(t ? ((v.c as number) / t) * 100 : 0)),
      ]
    },
  },
  {
    id: 'employee-engagement-survey-score-aggregator',
    archetype: 'matrix',
    blurb: 'Averages 1-5 engagement questions into an overall engagement index.',
    fields: [mx('m', 'Engagement items', ['Item', 'Avg score /5'], ['Role clarity', 'Manager support', 'Recognition', 'Growth', 'Wellbeing', 'Mission alignment'])],
    compute: (v) => {
      const M = v.m as number[][]
      const vals = M.map((r) => r[0] || 0)
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
      return [
        res('Engagement index', num(avg, 2) + '/5', avg >= 4 ? T.good : avg >= 3 ? T.warn : T.bad),
        res('As percentage', pct(avg * 20, 0)),
        res('Lowest lever', vals.indexOf(Math.min(...vals)) >= 0 ? 'Lowest-scored item' : '—', Math.min(...vals) < 3 ? T.warn : T.good, 'Feedback loop should target the weakest dimension.'),
      ]
    },
  },
  {
    id: 'employee-wellbeing-index-calculator',
    archetype: 'index',
    blurb: 'Combines physical, mental and social wellbeing subscores into one index.',
    fields: [n('a', 'Physical wellbeing /10', { max: 10 }), n('b', 'Mental wellbeing /10', { max: 10 }), n('c', 'Social / workload balance /10', { max: 10 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const idx = (a * 0.4 + b * 0.4 + c * 0.2)
      return [
        res('Wellbeing index', pct(idx * 10, 0), idx >= 8 ? T.good : idx >= 6 ? T.warn : T.bad, 'Weighted 40/40/20 across physical, mental, social.'),
        res('Composite score', num(idx, 1) + '/10'),
        res('Lowest dimension', a <= b && a <= c ? 'Physical' : b <= c ? 'Mental' : 'Social', Math.min(a, b, c) < 6 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'workplace-ergonomics-risk-estimator',
    archetype: 'matrix',
    blurb: 'Rates workstation ergonomics per equipment class into an overall risk level.',
    fields: [mx('m', 'Workstation risk', ['Component', 'Risk /5'], ['Chair & seating', 'Monitor height', 'Keyboard / mouse', 'Desk height', 'Take-breaks behaviour'])],
    compute: (v) => {
      const M = v.m as number[][]
      const risks = M.map((r) => r[0] || 0)
      const avg = risks.reduce((a, b) => a + b, 0) / risks.length
      return [
        res('Ergonomic risk', num(avg, 1) + '/5', avg <= 1.8 ? T.good : avg <= 3 ? T.warn : T.bad, 'Above 3/5 warrants an ergonomic assessment.'),
        res('Priority fix', risks.indexOf(Math.max(...risks)) >= 0 ? 'Highest-risk item' : '—', Math.max(...risks) >= 4 ? T.warn : T.good),
        res('Action threshold', avg > 3 ? 'Refer for assessment' : 'Monitor', avg > 3 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'workplace-diversity-ratio-calculator',
    archetype: 'index',
    blurb: 'Share of a workforce group as a percentage of total headcount.',
    fields: [n('a', 'Employees in target group', { def: 35 }), n('b', 'Total workforce', { def: 200 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number
      const share = b ? (a / b) * 100 : 0
      const rep = clamp(share, 0, 100)
      return [
        res('Group representation', pct(rep, 1), rep >= 25 && rep <= 60 ? T.good : rep < 15 ? T.warn : T.warn, 'Compare against available labour market + level overlap.'),
        res('Headcount gap to 50/50', `${a <= b / 2 ? num(b / 2 - a, 0) : num(a - b / 2, 0)} ${a <= b / 2 ? 'under' : 'over'}`, a === b / 2 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'peer-to-peer-recognition-point-multiplier',
    archetype: 'est',
    blurb: 'Converts recognition points into rewards and tracks the multiplier levels.',
    fields: [n('a', 'Points earned', { def: 500 }), sel('b', 'Multiplier level', ['Standard (1x)', 'Silver (1.25x)', 'Gold (1.5x)', 'Platinum (2x)']), n('c', 'Budget per point ($)', { def: 0.01 })],
    compute: (v) => {
      const a = v.a as number, c = v.c as number
      const mult = (v.b as string).includes('1.25') ? 1.25 : (v.b as string).includes('1.5') ? 1.5 : (v.b as string).startsWith('Plat') ? 2 : 1
      const value = a * mult * c
      return [
        res('Reward value', money(value)),
        res('Multiplied points', num(a * mult, 0)),
        res('Program cost / month', money(a * c * 12 / 12), value / 12 > 1000 ? T.good : T.warn, 'Recognition spend is typically 0.1-0.5% of payroll.'),
      ]
    },
  },
  {
    id: 'employee-engagement-event-budgeter',
    archetype: 'bdown',
    blurb: 'Builds an engagement event budget and normalises the per-employee cost.',
    fields: [mx('m', 'Event costs', ['Label', 'Qty', 'Unit cost'], ['Venue & hire', 'Catering', 'Activities', 'Swag & marketing']), n('c', 'Expected attendees', { def: 60 })],
    compute: (v) => {
      const m = v.m as number[][]
      const grand = m.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0)
      const c = Math.max(1, v.c as number)
      return [
        res('Total event budget', money(grand)),
        res('Cost per attendee', money(grand / c), grand / c <= 50 ? T.good : grand / c <= 120 ? T.warn : T.warn, 'Under $50/head is lean; $120+ is premium.'),
        res('ROI proxy', `1:${num(((grand / c || 0) ? 0.06 : 0), 2)} engagement lift`, T.neutral, 'Treat as planning only.'),
      ]
    },
  },
  {
    id: 'conflict-resolution-meeting-formatter',
    archetype: 'fmt',
    blurb: 'Structures a mediated conflict meeting with agreed outcomes and next steps.',
    fields: [txt('p', 'Parties involved'), txt('i', 'Issue summary', 3), txt('g', 'Ground rules agreed (comma separated)', 2), txt('a', 'Action owners & deadlines', 2)],
    compute: (v) => {
      const p = v.p as string, i = v.i as string, g = v.g as string, a = v.a as string
      const doc = `CONFLICT RESOLUTION MEETING RECORD (CONFIDENTIAL)\n\nParties: ${p || '[Names]'}\n\n1. ISSUE: ${i || '[Summary]'}\n2. GROUND RULES: ${g || '[rules]'}\n3. ACTIONS:\n   - ${a || '[Owner] - [action] by [date]'}\n4. FOLLOW-UP: reconvene in 2 weeks to review progress.\n\nBoth parties have been heard; this record is shared via People team only.`
      return [res('Meeting structured', 'Neutral facilitation', T.neutral, 'Keep to facts and outcomes.'), docRes('Meeting record', doc)]
    },
  },
  {
    id: 'remote-team-timezone-overlap-finder',
    archetype: 'est',
    blurb: 'Finds shared working hours between two teams in different timezones.',
    fields: [sel('a', 'Team A timezone (UTC)', ['UTC-8', 'UTC-5', 'UTC', 'UTC+1', 'UTC+5:30', 'UTC+8', 'UTC+9', 'UTC+10']), sel('b', 'Team B timezone (UTC)', ['UTC-8', 'UTC-5', 'UTC', 'UTC+1', 'UTC+5:30', 'UTC+8', 'UTC+9', 'UTC+10']), n('c', 'Workday length (hrs)', { def: 8 }), n('d', 'Team A start hour (local)', { def: 9 })],
    compute: (v) => {
      const tz = (s: string) => {
        const t = s.replace('UTC', '').replace('+', '')
        const frac = t.includes(':30') ? 0.5 : 0
        const n = parseFloat(t)
        return (Number.isFinite(n) ? n : 0) + frac
      }
      const off = tz(v.b as string) - tz(v.a as string)
      const d = v.d as number, c = v.c as number
      const startA = d
      const endB = 9 + c - off
      const first = Math.max(startA, 9)
      const last = Math.min(startA + c, endB)
      const overlap = Math.max(0, last - first)
      return [
        res('Overlap window', overlap > 0 ? `${num(first, 1)}-${num(last, 1)} hrs shared` : 'No overlap', overlap >= 3 ? T.good : overlap > 0 ? T.warn : T.bad, 'Target 3+ shared hours for collaboration.'),
        res('Offset', `${off >= 0 ? '+' : ''}${num(off, 1)} hrs`, Math.abs(off) > 8 ? T.warn : T.good),
        res('Suggested sync', 'Standup at shared midpoint', overlap >= 2 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'relocation-package-estimator',
    archetype: 'est',
    blurb: 'Estimates a full relocation package including moving, housing and bonus.',
    fields: [n('a', 'Moving & freight cost', { def: 6000 }), n('b', 'Temporary housing (monthly)', { def: 2500 }), n('c', 'Months of temp housing', { def: 2 }), n('d', 'One-time relocation bonus', { def: 5000 }), sel('e', 'Type', ['Domestic', 'International'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const intl = (v.e as string) === 'International'
      const housing = b * c
      const gross = a + housing + d
      const gip = intl ? gross * 0.22 : 0
      return [
        res('Housing assistance', money(housing)),
        res('Gross package', money(gross)),
        res('Gross-up (intl approx)', money(gip), T.neutral, 'International packages often include 20-25% tax gross-up.'),
        res('Total employer cost', money(gross + gip)),
      ]
    },
  },
  {
    id: 'hr-kpi-and-metrics-dashboard-generator',
    archetype: 'fmt',
    blurb: 'Assembles a monthly HR KPI dashboard ready for leadership review.',
    fields: [txt('d', 'Reporting period'), n('h', 'Headcount', { def: 200 }), n('t', 'Attrition %', { def: 11 }), n('e', 'Engagement index /100', { def: 72 }), n('p', 'Cost per hire', { def: 3200 }), ck('k', 'Sections', ['Attrition & retention', 'Hiring & pipeline', 'Engagement', 'Learning hours', 'Diversity snapshot', 'Wellbeing'])],
    compute: (v) => {
      const d = v.d as string, h = v.h as number, t = v.t as number, e = v.e as number, p = v.p as number
      const k = (v.k as boolean[]) ?? []
      const chk = (x: number) => (k[x] ? '' : ' (omitted)')
      const doc = `MONTHLY PEOPLE DASHBOARD — ${d || '[period]'}\n\nHeadcount ${num(h, 0)} | Attrition ${pct(t, 1)} | Engagement ${num(e, 0)}/100 | Cost-per-hire ${money(p)}\n\nSECTIONS:\n1. Attrition & retention${chk(0)}\n2. Hiring & pipeline${chk(1)}\n3. Engagement index${chk(2)}\n4. Learning hours per FTE${chk(3)}\n5. Diversity snapshot by level${chk(4)}\n6. Wellbeing sentiment${chk(5)}\n\nNARRATIVE: Attrition at ${pct(t, 1)} ${t > 20 ? 'is above the healthy 15% band — escalate retention actions.' : 'is within or near the healthy 15% band.'} Engagement of ${num(e, 0)}/100 ${e >= 75 ? 'supports a stable workforce.' : 'suggests focus on manager feedback loops.'}`
      return [res('Dashboard ready', `${6 - k.filter(Boolean).length} section(s) omitted`, T.neutral), docRes('KPI dashboard', doc)]
    },
  },
]