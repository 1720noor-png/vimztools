import { ck, days, doc as docRes, dt, money, mx, mxd, n, num, numD, pct, ratio, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

export const specs: OfficeToolSpec[] = [
  // ---------------- Contracts ----------------
  {
    id: 'contract-expiration-and-renewal-notification-planner',
    archetype: 'tracker',
    blurb: 'Tracks contract expiration dates against renewal notice windows so nothing lapses silently.',
    fields: [dt('d', 'Contract effective date'), n('t', 'Term (months)', { def: 12 }), n('n', 'Renewal notice required (days)', { def: 90 }), sel('r', 'Renewal posture', ['Auto-renew', 'Manual renew', 'Let expire'])],
    compute: (v) => {
      const d = v.d as string, t = v.t as number, n = v.n as number, r = v.r as string
      const expires = d ? new Date(new Date(d + 'T00:00:00').getTime() + t * 30.44 * 86400000) : null
      const expiresStr = expires ? expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      const notice = n > 0 ? `${num(n, 0)}d notice` : `${num(Math.ceil(t * 30.44 / 4), 0)}d expected`
      return [
        res('Contract ends', expiresStr, r === 'Auto-renew' ? T.warn : T.good),
        res('Notice posture', notice, r === 'Manual renew' ? T.warn : T.neutral),
        res('Renewal behavior', r, r === 'Let expire' ? T.bad : r === 'Auto-renew' ? T.warn : T.good),
        res('Actions', r === 'Auto-renew' ? 'Confirm auto-renewal terms' : 'Calendar the notice date now', T.neutral),
      ]
    },
  },
  {
    id: 'indemnification-clause-risk-evaluator',
    archetype: 'est',
    blurb: 'Scores indemnification exposure across scope, caps, carve-outs and survival.',
    fields: [sel('a', 'Indemnity scope', ['Mutual, symmetric', 'One-way against company', 'Broad + third-party claims']), sel('b', 'Cap structure', ['Capped at fees paid', 'Capped at contract value', 'Uncapped + IP/infringement']), n('c', 'Potential exposure ($)', { def: 2500000 }), n('d', 'Cap value ($)', { def: 1000000 })],
    compute: (v) => {
      const a = v.a as string, b = v.b as string, c = v.c as number, d = v.d as number
      let risk = 20
      if (a.includes('One-way')) risk += 20
      if (a.includes('Broad')) risk += 10
      if (b.includes('Uncapped')) risk += 30
      if (b.includes('contract value')) risk += 5
      if (c > d * 2.5) risk += 10
      risk = Math.min(95, risk)
      return [
        res('Indemnity risk', pct(risk, 0), risk >= 60 ? T.bad : risk >= 35 ? T.warn : T.good, b.includes('Uncapped') ? 'Uncapped indemnities rarely survive redlining.' : 'Cap is the strongest risk lever.'),
        res('Exposure vs cap', ratio(d ? c / d : 0, 1) + 'x', c <= d ? T.good : T.warn),
        res('Scope posture', a, T.neutral),
      ]
    },
  },
  {
    id: 'service-level-agreement-sla-penalty-calculator',
    archetype: 'est',
    blurb: 'Computes SLA penalties and whether they compensate for actual business impact.',
    fields: [n('a', 'Monthly fee ($)', { def: 18000 }), n('b', 'Uptime attained %', { def: 98.2 }), n('c', 'Uptime target %', { def: 99.5 }), n('d', 'Prior breaches', { def: 2 }), n('e', 'Impact per outage ($)', { def: 8000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const gap = Math.max(0, c - b)
      const credit = Math.min(a * 0.5, Math.floor(gap * 20) * a * 0.05)
      const repeated = d >= 2 ? 1.5 : 1
      const impact = e * Math.max(1, Math.ceil(gap * 10))
      const real = credit * repeated
      return [
        res('Service credit', money(real), gap > 0 ? T.warn : T.good, `Target ${pct(c, 2)} — achieved ${pct(b, 2)}.`),
        res('Business impact estimate', money(impact), impact > real ? T.bad : T.good, impact > real ? 'Penalty undershoots the real pain.' : 'Credit covers measured impact.'),
        res('Breach multiplier (repeat)', `×${numD(repeated, 1)}`, repeated > 1 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'subcontractor-agreement-generator',
    archetype: 'fmt',
    blurb: 'Drafts a subcontractor agreement covering scope, payment, IP and termination.',
    fields: [txt('c', 'Company name'), txt('s', 'Subcontractor'), txt('w', 'Work / scope'), sel('p', 'Payment model', ['Fixed fee', 'Time & materials', 'Milestone-based']), sel('t', 'IP ownership', ['Assign to company', 'License back to company', 'Co-ownership']), n('f', 'Fee ($)', { def: 25000 })],
    compute: (v) => {
      const c = v.c as string, s = v.s as string, w = v.w as string, p = v.p as string, t = v.t as string, f = v.f as number
      const doc = `SUBCONTRACTOR AGREEMENT\n\nBETWEEN: ${c || '[Company]'} AND ${s || '[Subcontractor]'}\n\n1. SERVICES - subcontractor will perform the following: ${w || '[scope]'}.\n2. PAYMENT - ${p}; fee $${num(f, 0)}; invoices net 30; performance-based punchlist before final payment.\n3. IP - ${t} for deliverables created under this agreement.\n4. RELATIONSHIP - independent contractor; no employment rights; taxes borne by subcontractor.\n5. TERMINATION - either party for convenience with 30 days notice; immediate for material breach.\n6. INSURANCE - subcontractor maintains GL and workers comp as required by law.`
      return [res('Draft agreement', 'Ready for review', T.neutral, 'Confirm the IP clause matches the delivery model.'), docRes('Document', doc)]
    },
  },
  {
    id: 'mutual-non-disclosure-agreement-mnda-formatter',
    archetype: 'fmt',
    blurb: 'Formats a mutual NDA with term, exclusions and return-of-materials clauses.',
    fields: [txt('c', 'Company name'), txt('p', 'Counterparty'), sel('t', 'Term', ['2 years', '3 years', '5 years']), ck('i', 'Clauses', ['Mutual confidentiality', 'Standard exclusions', 'Return/destroy on request', 'Dispute resolution', 'No license implied'])],
    compute: (v) => {
      const c = v.c as string, p = v.p as string, t = v.t as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'OMITTED')
      const doc = `MUTUAL NON-DISCLOSURE AGREEMENT\n\nBETWEEN: ${c || '[Company]'} AND ${p || '[Counterparty]'}\n\n1. CONFIDENTIAL INFORMATION - all non-public data exchanged. [${incl(0)}]\n2. EXCLUSIONS - public knowledge, independent development, prior possession. [${incl(1)}]\n3. OBLIGATIONS - use only for evaluation; protect with reasonable care. \n4. RETURN/DESTROY - on request within 30 days unless retained for compliance. [${incl(2)}]\n5. DISPUTES - [${incl(3)}]; surviving provisions unaffected.\n6. NO LICENSE - disclosure grants no rights. [${incl(4)}]\n7. TERM - obligations survive ${t} after termination.`
      return [res('MNDA draft', 'Ready', T.neutral, 'Keep the term short — confidentiality should outlive it via the survival clause.'), docRes('Document', doc)]
    },
  },
  {
    id: 'force-majeure-contract-clause-checker',
    archetype: 'checklist',
    blurb: 'Checks a force majeure clause against the events and remedies you actually rely on.',
    fields: [ck('i', 'Force majeure checks', ['Covers pandemics / epidemics', 'Lists supply and logistics events', 'Sets notice deadline (≤10 days)', 'Remedies: suspension before termination', 'Defines “feasible alternative performance”', 'States when contract can be terminated'])],
    compute: (v) => {
      const items = v.i as boolean[]
      const done = items.filter(Boolean).length
      const p = done / items.length
      return [
        res('Clause strength', pct(p * 100, 0), p >= 0.83 ? T.good : p >= 0.5 ? T.warn : T.bad, `${items.length - done} element(s) missing.`),
        res('Elements covered', `${done}/${items.length}`, T.neutral),
        res('Exposure note', done < 3 ? 'Events likely outside scope' : 'Clause is defensible', done < 3 ? T.bad : T.good, 'Penalty: an uncovered event equals performance despite the crisis.'),
      ]
    },
  },
  {
    id: 'employment-agreement-standard-clause-generator',
    archetype: 'fmt',
    blurb: 'Generates standard employment agreement clauses with jurisdiction-appropriate defaults.',
    fields: [txt('c', 'Company name'), txt('e', 'Employee'), sel('r', 'Role class', ['Executive', 'Director', 'Staff']), sel('p', 'Notice period', ['1 month', '2 months', '3 months']), ck('i', 'Clauses', ['Restrictive covenants', 'IP assignment', 'Data protection notice', 'Severance terms', 'Arbitration agreement'])],
    compute: (v) => {
      const c = v.c as string, e = v.e as string, r = v.r as string, p = v.p as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'OMITTED')
      const doc = `EMPLOYMENT AGREEMENT — ${c || '[Company]'} / ${e || '[Employee]'}\n\n1. ROLE - ${r}; duties per job description; location and hybrid terms as agreed.\n2. TERM & NOTICE - ${p} notice on either side; probation 6 months.\n3. COMPENSATION - base salary + ${r === 'Executive' ? 'equity and bonus provisions' : 'bonus at company discretion'}.\n4. RESTRICTIVE COVENANTS - non-compete during employment and 12 months post; non-solicit of clients and staff. [${incl(0)}]\n5. IP ASSIGNMENT - all work product assigned to company. [${incl(1)}]\n6. DATA PROTECTION - personal data processed per privacy notice. [${incl(2)}]\n7. SEVERANCE - ${r === 'Executive' ? 'defined severance schedule' : 'statutory minimum'}. [${incl(3)}]\n8. DISPUTES - arbitration first, courts as fallback. [${incl(4)}]`
      return [res('Clause bundle', 'Draft ready', T.neutral, 'Local counsel must validate restrictive covenant enforceability.'), docRes('Document', doc)]
    },
  },
  {
    id: 'commercial-contract-risk-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores a commercial contract across liability, IP, payment, termination and compliance risk.',
    fields: [mxd('m', 'Contract risk', ['Area', 'Weight %', 'Risk /10'], ['Liability & indemnity', 'IP ownership', 'Payment & fees', 'Termination', 'Compliance'], [[25, 5], [20, 4], [20, 4], [15, 4], [20, 3]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const risk = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const verdict = risk <= 3 ? 'Low risk — sign' : risk <= 5 ? 'Negotiate items' : risk <= 7 ? 'Redline & escalate' : 'Do not sign'
      return [
        res('Contract risk index', `${numD(risk, 1)}/10`, risk <= 3 ? T.good : risk <= 5 ? T.warn : T.bad),
        res('Action', verdict, T.neutral),
        res('Top risk area', ['Liability & indemnity', 'IP ownership', 'Payment & fees', 'Termination', 'Compliance'][M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)], T.neutral),
      ]
    },
  },
  {
    id: 'eula-end-user-license-agreement-builder',
    archetype: 'fmt',
    blurb: 'Builds a EULA with license grant, restrictions and liability allocation for your software.',
    fields: [txt('c', 'Company name'), txt('p', 'Product name'), sel('m', 'Model', ['Perpetual license', 'SaaS subscription', 'Free tier + paid']), sel('j', 'Governing law', ['California', 'Delaware', 'New York', 'England & Wales']), n('f', 'Annual fee ($)', { def: 1200 })],
    compute: (v) => {
      const c = v.c as string, p = v.p as string, m = v.m as string, j = v.j as string
      const f = v.f as number
      const doc = `END USER LICENSE AGREEMENT\n\nLICENSOR: ${c || '[Company]'}  PRODUCT: ${p || '[Product]'}\n\n1. GRANT - non-exclusive, non-transferable right to use ${p} ${m === 'SaaS subscription' ? 'during the subscription term' : 'for authorized devices'}.\n2. RESTRICTIONS - no reverse engineering, redistribution, or sublicensing.\n3. SUBSCRIPTION - fee of $${num(f, 0)}/yr billed in advance; auto-renew unless cancelled 30 days prior.\n4. WARRANTY - provided "AS IS"; no implied warranties.\n5. LIABILITY - aggregate liability capped at fees paid in the prior 12 months.\n6. LAW - ${j}; disputes to binding arbitration.\n7. TERM - effective on acceptance; survives termination for audit and IP provisions.`
      return [res('EULA draft', 'Ready for counsel', T.neutral, 'Match the limitation-of-liability clause to your insurance posture.'), docRes('Document', doc)]
    },
  },
  {
    id: 'master-services-agreement-msa-structure-builder',
    archetype: 'fmt',
    blurb: 'Assembles an MSA skeleton with SOW workflow, rates, and global commercial terms.',
    fields: [txt('c', 'Company name'), txt('s', 'Service provider'), sel('r', 'Billing', ['Monthly T&M', 'Fixed SOW milestones', 'Sprint-based']), sel('n', 'Auto-renewal', ['Annual auto-renew', 'Annual manual', 'Multi-year commitment']), n('v', 'Rate card cap ($/hr)', { def: 175 })],
    compute: (v) => {
      const c = v.c as string, s = v.s as string, r = v.r as string, n = v.n as string
      const vv = v.v as number
      const doc = `MASTER SERVICES AGREEMENT\n\nBETWEEN: ${c || '[Company]'} AND ${s || '[Provider]'}\n\n1. ENGAGEMENTS - work scoped in SOWs referencing this MSA; SOW overrides where conflicting.\n2. RATE CARD - approved rates capped at $${num(vv, 0)}/hr; travel at cost.\n3. BILLING - ${r}; invoices net 30.\n4. TERM - ${n}; either party may exit with 30 days notice after the initial term.\n5. IP - service provider assigns deliverables; company grants license to retained pre-existing IP.\n6. LIABILITY - mutual; cap at fees paid over 12 months; excludes consequential.\n7. GOVERNANCE - weekly touchpoint; quarterly business review.`
      return [res('MSA skeleton', 'Ready', T.neutral, 'SOWs should be explicit — the MSA is the safety net.'), docRes('Document', doc)]
    },
  },
  {
    id: 'statement-of-work-sow-scope-creep-legal-shield',
    archetype: 'fmt',
    blurb: 'Builds a change-controlled SOW template that protects scope and budget.',
    fields: [txt('p', 'Project name'), txt('s', 'Deliverables'), n('b', 'Budget max ($)', { def: 50000 }), n('h', 'Hour cap', { def: 350 }), sel('c', 'Change control', ['Formal CR + freeze on spec', 'CR with lead approval only', 'Verbal requests accepted'])],
    compute: (v) => {
      const p = v.p as string, s = v.s as string, b = v.b as number, h = v.h as number, c = v.c as string
      const doc = `STATEMENT OF WORK — ${p || '[Project]'}\n\n1. DELIVERABLES (in scope): ${s || '[list]'}.\n2. BUDGET - fixed cap $${num(b, 0)} and ${num(h, 0)} hours. Out-of-scope work requires a signed change order BEFORE start.\n3. CHANGE CONTROL - ${c}. Any work beyond scope without a CR is deemed a courtesy, not a commitment.\n4. ASSUMPTIONS - client provides timely decisions and access; delays extend milestones.\n5. ACCEPTANCE - two review cycles included; further cycles billable.\n6. EXCLUSIONS - hosting, third-party licenses, post-launch support unless stated.`
      return [res('Scope shield', c.includes('Verbal') ? 'Weak control' : 'Enforced', c.includes('Verbal') ? T.bad : T.good, 'Without formal CR, scope creep is legally ambiguous.'), docRes('Document', doc)]
    },
  },
  {
    id: 'non-solicitation-geographic-scope-checker',
    archetype: 'est',
    blurb: 'Tests whether a non-solicitation clause’s geographic and temporal scope stands up.',
    fields: [sel('a', 'Temporal limit', ['6 months', '12 months', '24 months']), n('b', 'Radius (miles)', { def: 25 }), n('c', 'Role seniority /5', { def: 4 }), n('d', 'Consideration present', { def: 1 }), n('e', 'Comp $/yr', { def: 120000 })],
    compute: (v) => {
      const a = v.a as string, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const months = parseInt(a, 10)
      let score = 0
      if (months <= 12) score += 30
      if (b <= 30) score += 25
      if (c >= 4) score += 25
      if (d === 1) score += 10
      if (e >= 100000) score += 10
      const enforc = score >= 70
      return [
        res('Enforceability odds', pct(score, 0), score >= 70 ? T.good : score >= 45 ? T.warn : T.bad, `${a}, ${num(b, 0)} mi radius, ${num(c, 0)}/5 seniority.`),
        res('Redline advice', enforc ? 'Narrow to named clients only' : 'Defensible as written', enforc ? T.good : T.warn, 'Client lists need identification; blanket bans fail.'),
        res('Compens score', e >= 120000 ? 'High comp supports scope' : 'Modest comp pulls scope in', T.neutral),
      ]
    },
  },
  {
    id: 'legal-billing-rate-and-fee-cap-negotiator',
    archetype: 'est',
    blurb: 'Checks quoted legal rates against market benchmarks and an aggregate fee cap.',
    fields: [n('a', 'Quoted partner rate ($/hr)', { def: 650 }), n('b', 'Junior rate ($/hr)', { def: 260 }), n('c', 'Project hours estimate', { def: 300 }), n('d', 'Market partner benchmark ($)', { def: 580 }), n('e', 'Fee cap sought ($)', { def: 150000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const rateGap = (a / (d || 1) - 1) * 100
      const projFee = c * (a * 0.4 + b * 0.6)
      const capOk = projFee <= e
      return [
        res('Rate vs market', pct(rateGap, 1), a <= d * 1.15 ? T.good : T.warn, `Benchmark ${money(d)}/hr.`),
        res('Blended projected fee', money(projFee), capOk ? T.good : T.warn),
        res('Cap leverage', capOk ? 'Within cap' : `${money(projFee - e)} over cap — negotiate`, capOk ? T.good : T.bad, 'Ask for a not-to-exceed with client control on staffing mix.'),
      ]
    },
  },
  {
    id: 'arbitration-vs-litigation-cost-comparator',
    archetype: 'est',
    blurb: 'Compares expected cost and duration of arbitration versus court litigation.',
    fields: [n('a', 'Claim value ($)', { def: 2000000 }), n('b', 'Arbitration fees ($)', { def: 60000 }), n('c', 'Litigation fees (est $)', { def: 180000 }), n('d', 'Arbitration months', { def: 9 }), n('e', 'Litigation months', { def: 22 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const arbShare = a ? (b / a) * 100 : 0
      const timeSave = e - d
      return [
        res('Arbitration cost', money(b), T.neutral),
        res('Litigation cost', money(c)),
        res('Cost differential', money(c - b), c > b ? T.good : T.warn, 'Arbitration usually wins on fees for claims this size.'),
        res('Time saved', `${num(timeSave, 0)} months`, timeSave >= 6 ? T.good : T.warn, 'But no appeal right and limited discovery.'),
        res('Cost as % of claim (arb)', pct(arbShare, 1), T.neutral),
      ]
    },
  },
  {
    id: 'sublease-legal-liability-calculator',
    archetype: 'est',
    blurb: 'Models sublessor liability across rent shortfall, damages and restoration obligations.',
    fields: [n('a', 'Remaining prime lease rent /mo ($)', { def: 12000 }), n('b', 'Sublease rent /mo ($)', { def: 9000 }), n('c', 'Months remaining', { def: 18 }), n('d', 'Fit-out restoration est ($)', { def: 40000 }), n('e', 'Warranty exposure ($)', { def: 25000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const shortfall = (a - b) * c
      const total = shortfall + d + e
      const sublessee = b * c
      return [
        res('Rent shortfall risk', money(shortfall), b >= a * 0.85 ? T.good : T.warn, 'Sub-85% recovery leaves you on the hook.'),
        res('Total liability exposure', money(total), T.neutral),
        res('Sublease collection', money(sublessee), T.neutral),
        res('Indemnity advice', total > a * c * 0.4 ? 'Demand stronger sublessee indemnity' : 'Risk is contained', total > a * c * 0.4 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'contract-value-lifetime-risk-calculator',
    archetype: 'est',
    blurb: 'Blends contract value, term and fault probabilities into lifetime risk exposure.',
    fields: [n('a', 'Total contract value ($)', { def: 1200000 }), n('b', 'Term (months)', { def: 24 }), n('c', 'Termination risk/mo %', { def: 2 }), n('d', 'Penalty exposure % of value', { def: 12 }), n('e', 'Counterparty failure odds %', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const expectedLife = b * (1 - c / 100)
      const expectedVal = a * (expectedLife / b)
      const penalty = a * (d / 100)
      const failure = expectedVal * (e / 100)
      const risk = penalty * 0.5 + failure
      return [
        res('Expected contract value', money(expectedVal), T.neutral),
        res('Penalty exposure', money(penalty), d <= 10 ? T.good : T.warn),
        res('Counterparty risk', money(failure), e <= 5 ? T.good : e <= 10 ? T.warn : T.bad),
        res('Lifetime risk load', money(risk), risk <= expectedVal * 0.1 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'corporate-legal-spend-vs-budget-tracker',
    archetype: 'log',
    blurb: 'Logs legal spend by practice area against the approved budget quarterly.',
    fields: [mx('m', 'Legal spend log', ['Quarter', 'Spend ($k)', 'Budget ($k)'], ['Q1', 'Q2', 'Q3', 'Q4'])],
    compute: (v) => {
      const M = v.m as number[][]
      const spent = M.reduce((s, r) => s + (r[0] || 0), 0)
      const budget = M.reduce((s, r) => s + (r[1] || 0), 0)
      const over = M.filter((r) => (r[0] || 0) > (r[1] || 0)).length
      const rate = budget ? (spent / budget) * 100 : 0
      return [
        res('Total spend', `${money(spent * 1000)}`),
        res('Budget utilization', pct(rate, 1), rate <= 100 ? T.good : T.warn, `${over} quarter(s) over budget.`),
        res('Variance', money((spent - budget) * 1000), spent <= budget ? T.good : T.bad),
        res('Biggest quarter', `${['Q1', 'Q2', 'Q3', 'Q4'][M.reduce((bi, r, i) => ((r[0] || 0) > (M[bi][0] || 0) ? i : bi), 0)]}`, T.neutral),
      ]
    },
  },

  // ---------------- Compliance ----------------
  {
    id: 'gdpr-data-protection-impact-assessment-dpia-formatter',
    archetype: 'fmt',
    blurb: 'Structures a DPIA with necessity, proportionality and consultation conclusions.',
    fields: [txt('p', 'Processing purpose'), txt('d', 'Data categories'), sel('a', 'High-risk trigger', ['Special category data', 'Profiling / automated decisions', 'Large-scale monitoring']), n('n', 'Data subjects (k)', { def: 50 }), sel('r', 'Consultation status', ['Pending DPO', 'DPO approved', 'Supervisory authority advised'])],
    compute: (v) => {
      const p = v.p as string, d = v.d as string, a = v.a as string, r = v.r as string, n = v.n as number
      const riskItems = ['Special category data', 'Profiling / automated decisions'].some((x) => x === a)
      const doc = `DATA PROTECTION IMPACT ASSESSMENT\n\n1. PROCESSING - ${p || '[purpose]'} involving ${d || '[data]'}.\n2. TRIGGER - ${a}; scale ≈ ${num(n, 0)}k data subjects.\n3. NECESSITY & PROPORTIONALITY - processing is necessary for the documented purpose and limited to the minimum data.\n4. RISK IDENTIFICATION - ${riskItems ? 'HIGH baseline (special category or profiling)' : 'medium baseline'}; mitigations: pseudonymization, retention limits, records of processing.\n5. CONSULTATION - ${r}.\n\nNext: re-run when purpose or scale changes by >20%.`
      return [res('DPIA status', riskItems ? 'High-risk processing' : 'Standard review', riskItems ? T.warn : T.good, 'High-risk triggers may require supervisory consultation.'), docRes('Document', doc)]
    },
  },
  {
    id: 'ccpa-cpra-data-subject-request-dsar-log',
    archetype: 'log',
    blurb: 'Logs DSARs under CCPA/CPRA with deadlines, extensions and completion state.',
    fields: [mx('m', 'DSAR log', ['Quarter', 'Requests', 'Completed on time'], ['Q1', 'Q2', 'Q3', 'Q4']), n('c', 'Data subject requests (est pending)', { def: 3 })],
    compute: (v) => {
      const M = v.m as number[][]
      const req = M.reduce((s, r) => s + (r[0] || 0), 0)
      const done = M.reduce((s, r) => s + (r[1] || 0), 0)
      const sl = M.length ? (M.reduce((s, r) => s + (r[1] || 0) / (r[0] || 1), 0)) / M.length : 0
      const onTime = req ? (done / req) * 100 : 0
      return [
        res('Requests logged', num(req, 0)),
        res('On-time completion', pct(onTime, 1), onTime >= 90 ? T.good : onTime >= 70 ? T.warn : T.bad, 'CPRA allows a 45-day window with one 45-day extension.'),
        res('Backlog', num((v.c as number), 0), T.neutral),
        res('Response lag index', numD(sl, 2), T.neutral),
      ]
    },
  },
  {
    id: 'data-processing-agreement-dpa-template-builder',
    archetype: 'fmt',
    blurb: 'Assembles a data processing agreement with SCC clauses and subprocessor controls.',
    fields: [txt('c', 'Controller'), txt('p', 'Processor'), sel('g', 'Transfer mechanism', ['EU SCCs', 'UK IDTA', 'No international transfers']), ck('i', 'Sections', ['Processing instructions', 'Subprocessor approval', 'Security measures', 'Breach notification', 'Data subject rights support'])],
    compute: (v) => {
      const c = v.c as string, p = v.p as string, g = v.g as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'OMITTED')
      const doc = `DATA PROCESSING AGREEMENT\n\nCONTROLLER: ${c || '[Controller]'}  PROCESSOR: ${p || '[Processor]'}\n\n1. PROCESSING INSTRUCTIONS - processor acts only on documented instructions. [${incl(0)}]\n2. SUBPROCESSORS - prior written approval; objection window 10 days. [${incl(1)}]\n3. SECURITY - technical and organizational measures per Annex. [${incl(2)}]\n4. BREACH - notification within 48 hours plus assistance. [${incl(3)}]\n5. SUBJECT RIGHTS - processor supports requests per instructions. [${incl(4)}]\n6. TRANSFERS - ${g}; SCCs incorporated by reference and completed per Annex.\n7. TERM - DPA survives for the duration of processing and return/deletion clauses.`
      return [res('DPA draft', 'Ready for signature', T.neutral, 'Keep the SCC annex completed before you transfer any personal data.'), docRes('Document', doc)]
    },
  },
  {
    id: 'regulatory-compliance-gap-analysis-matrix',
    archetype: 'matrix',
    blurb: 'Logs controls versus regulatory requirements to expose compliance gaps by framework.',
    fields: [mx('m', 'Compliance areas', ['Area', 'Controls in place', 'Requirements'], ['Security controls', 'Privacy & data', 'Financial reporting', 'Employment law', 'Environment'])],
    compute: (v) => {
      const M = v.m as number[][]
      const have = M.reduce((s, r) => s + (r[0] || 0), 0)
      const need = M.reduce((s, r) => s + (r[1] || 0), 0)
      const rate = need ? (have / need) * 100 : 0
      const gaps = M.filter((r) => (r[0] || 0) < (r[1] || 0)).map((r) => r[0])
      return [
        res('Implementation rate', pct(rate, 1), rate >= 90 ? T.good : rate >= 70 ? T.warn : T.bad),
        res('Gap count', num(M.filter((r) => (r[0] || 0) < (r[1] || 0)).length * (need - have) / 4, 0), T.neutral),
        res('Gap areas', gaps.join(', ') || 'None', gaps.length ? T.warn : T.good, rate < 90 ? 'Target 90%+ before external audit.' : ''),
      ]
    },
  },
  {
    id: 'corporation-annual-return-filing-deadline-tracker',
    archetype: 'tracker',
    blurb: 'Tracks annual return and franchise-tax deadlines with preparation lead-time alerts.',
    fields: [dt('a', 'Fiscal year end'), n('b', 'Filing days after year-end', { def: 150 }), n('c', 'Prep lead time (days)', { def: 30 }), sel('s', 'Jurisdiction', ['Delaware', 'California', 'New York', 'Federal 1120'])],
    compute: (v) => {
      const a = v.a as string, b = v.b as number, c = v.c as number, s = v.s as string
      const due = a ? new Date(new Date(a + 'T00:00:00').getTime() + b * 86400000) : null
      const prep = a ? new Date(new Date(a + 'T00:00:00').getTime() + (b - c) * 86400000) : null
      const str = (d: Date | null) => (d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')
      return [
        res('Filing deadline', str(due), T.neutral, `${s} — statutory window leading from ${b} days after year-end.`),
        res('Start preparation by', str(prep), T.neutral, `Give yourself ${num(c, 0)} days of slack.`),
        res('Grace posture', `${num(b, 0)}-day window`, b >= 150 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'osha-workplace-incident-log-formatter',
    archetype: 'fmt',
    blurb: 'Formats an OSHA-style incident record with classification and corrective action fields.',
    fields: [txt('c', 'Employee / role'), sel('t', 'Incident type', ['First aid', 'Recordable injury', 'Lost-time case', 'Near miss']), txt('d', 'Description'), n('e', 'Lost workdays', { def: 0 }), sel('l', 'Affected body part', ['Upper extremity', 'Back/spine', 'Lower extremity', 'Head/eyes', 'Multiple'])],
    compute: (v) => {
      const c = v.c as string, t = v.t as string, d = v.d as string, l = v.l as string, e = v.e as number
      const doc = `OSHA INCIDENT RECORD\n\nEMPLOYEE/SHIFT: ${c || '[name/role]'}\nTYPE: ${t}${d ? `\nDESCRIPTION: ${d}` : ''}\nAFFECTED: ${l}${e > 0 ? `\nLOST WORKDAYS: ${num(e, 0)}` : ''}\n\nCLASSIFICATION: ${t === 'First aid' ? 'Non-recordable (first aid only)' : t === 'Near miss' ? 'Non-recordable — investigation required' : 'OSHA recordable — log on 300'}\n\nCORRECTIVE ACTIONS:\n- Root cause review\n- Updated controls (engineering/admin/PPE)\n- Supervisor acknowledgment\n- Re-review within 30 days`
      return [res('Classification', t === 'Recordable injury' || t === 'Lost-time case' ? 'Recordable' : 'Non-recordable', t === 'Lost-time case' ? T.bad : t === 'Near miss' ? T.warn : T.good, `${num(e, 0)} lost workday(s).`), docRes('Document', doc)]
    },
  },
  {
    id: 'export-control-and-sanctions-country-checker',
    archetype: 'est',
    blurb: 'Flags export-control risk from jurisdiction, item and end-use signals.',
    fields: [sel('a', 'Destination country', ['EU / NATO allies', 'Asia-Pacific', 'Sensitive regime', 'Sanctioned list']), sel('b', 'Item classification', ['EAR99 / general', 'Commercial encryption', 'Dual-use (CCL)', 'Defense article (ITAR)']), sel('c', 'End use / user', ['Civilian end-use', 'Military end-use', 'Nuclear/missile concern', 'GOV end-user']), n('d', 'Shipment value ($)', { def: 25000 })],
    compute: (v) => {
      const a = v.a as string, b = v.b as string, c = v.c as string
      let risk = 5
      if (a.includes('Sanctioned') || a.includes('Sensitive')) risk += 35
      if (b.includes('ITAR')) risk += 30
      if (b.includes('Dual-use')) risk += 15
      if (c.includes('Military') || c.includes('Nuclear')) risk += 25
      if (c.includes('GOV')) risk += 10
      risk = Math.min(95, risk)
      return [
        res('Export risk', pct(risk, 0), risk >= 60 ? T.bad : risk >= 30 ? T.warn : T.good, risk >= 60 ? 'Hold shipment — engage compliance/legal.' : 'Standard screening level.'),
        res('License likely', b.includes('ITAR') || (b.includes('Dual-use') && (c.includes('Military'))) ? 'Yes — export license' : 'Probably not', T.neutral),
        res('Screening item', `${b} → ${c}`, T.neutral),
      ]
    },
  },
  {
    id: 'regulatory-reporting-calendar-generator',
    archetype: 'timeline',
    blurb: 'Maps regulatory filings to a calendar with preparation start alerts.',
    fields: [dt('start', 'Planning horizon start'), mx('m', 'Filings', ['Filing', 'Days from start'], ['Annual report', 'Semi-annual', 'Quarterly filing', 'Tax prep & extension', 'Board attestation'])],
    compute: (v) => {
      const M = v.m as number[][]
      const total = Math.max(...M.map((r) => r[0] || 0))
      const waves = M.filter((r) => (r[0] || 0) > 0).length
      return [
        res('Reporting horizon', days(total)),
        res('Filing events', `${num(waves, 0)} events`, waves >= 4 ? T.good : T.warn, 'Fewer than 4 discrete filing events risks a year-end pile-up.'),
        res('Busiest window', `${num(Math.ceil(total / 2), 0)}-${num(total, 0)} days`, T.neutral),
      ]
    },
  },
  {
    id: 'affiliate-marketing-legal-compliance-checker',
    archetype: 'checklist',
    blurb: 'Verifies affiliate marketing disclosures and program terms against FTC-style rules.',
    fields: [ck('i', 'Affiliate checks', ['Disclosures are clear & conspicuous', 'Forms include disclosure default-on', 'Affiliate agreement bans fake reviews', 'Coupon/promo terms documented', 'Sweepstakes rules posted', 'Data sharing notice to affiliates'])],
    compute: (v) => {
      const items = v.i as boolean[]
      const done = items.filter(Boolean).length
      const p = done / items.length
      return [
        res('Compliance score', pct(p * 100, 0), p >= 0.83 ? T.good : p >= 0.5 ? T.warn : T.bad, `${items.length - done} check(s) open.`),
        res('Disclosure posture', items[0] ? 'Compliant' : 'Fix first — biggest cite risk', items[0] ? T.good : T.bad, 'Disclosure must be near the endorsement, not the footer.'),
        res('Program health', `${done}/${items.length}`, T.neutral),
      ]
    },
  },
  {
    id: 'regulatory-compliance-training-tracker',
    archetype: 'tracker',
    blurb: 'Tracks mandatory compliance training completion and refresh due dates.',
    fields: [dt('d', 'Training cycle start'), n('c', 'Employees assigned', { def: 220 }), n('p', 'Passed on time', { def: 190 }), sel('t', 'Course', ['Code of conduct', 'Anti-bribery', 'Cybersecurity', 'Harassment prevention']), n('r', 'Refresh cycle (months)', { def: 12 })],
    compute: (v) => {
      const c = v.c as number, p = v.p as number, r = v.r as number
      const rate = c ? (p / c) * 100 : 0
      const due = v.d as string
      const refresh = due ? new Date(new Date(due + 'T00:00:00').getTime() + r * 30.44 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      return [
        res('Completion rate', pct(rate, 1), rate >= 95 ? T.good : rate >= 80 ? T.warn : T.bad, `${num(Math.max(0, c - p), 0)} employee(s) outstanding.`),
        res('Refresh due', refresh, T.neutral),
        res('Course', v.t as string, T.neutral),
      ]
    },
  },
  {
    id: 'bribe-gift-policy-legal-threshold-matrix',
    archetype: 'matrix',
    blurb: 'Sets gift thresholds by recipient type and jurisdiction to enforce anti-bribery limits.',
    fields: [mx('m', 'Gift matrix', ['Recipient', 'Pre-approval threshold ($)', 'Hard cap ($)'], ['Customers', 'Suppliers', 'Government officials', 'Entertainment/hospitality'])],
    compute: (v) => {
      const M = v.m as number[][]
      const govPre = M[2]?.[0] || 0
      const govCap = M[2]?.[1] || 0
      const ok = govPre < govCap
      return [
        res('Gov official review level', money(govPre), govPre < 50 ? T.good : T.warn, 'Below $50 pre-approval is cleanest for public officials.'),
        res('Cap sanity', ok ? 'Pre < cap — consistent' : 'Inverted — fix', ok ? T.good : T.bad),
        res('Customer tolerance', money(M[0]?.[1] || 0), M[0]?.[1] <= 150 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'third-party-data-controller-vs-processor-tagger',
    archetype: 'matrix',
    blurb: 'Tags vendors as controller, processor or joint controller for privacy mapping.',
    fields: [mx('m', 'Vendor roles', ['Vendor', 'Controller (1/0)', 'Processor (1/0)'], ['Payment processor', 'Cloud infra', 'Email platform', 'Analytics', 'HR system'])],
    compute: (v) => {
      const M = v.m as number[][]
      const controllers = M.filter((r) => (r[0] || 0) === 1 && (r[1] || 0) === 0).map((r) => r[0])
      const both = M.filter((r) => (r[0] || 0) === 1 && (r[1] || 0) === 1).length
      const none = M.filter((r) => (r[0] || 0) === 0 && (r[1] || 0) === 0).length
      const vn = ['Payment processor', 'Cloud infra', 'Email platform', 'Analytics', 'HR system']
      const cs = M.map((r, i) => ((r[0] || 0) === 1 && (r[1] || 0) === 0 ? vn[i] : null)).filter(Boolean).join(', ') || 'None'
      return [
        res('Standalone controllers', cs || 'None', controllers.length ? T.warn : T.good, 'Controller vendors may need separate DPAs.'),
        res('Dual-role vendors', num(both, 0), both ? T.warn : T.good, 'Joint controller arrangements need explicit allocation.'),
        res('Untagged', num(none, 0), none ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'cookie-consent-compliance-formatter',
    archetype: 'fmt',
    blurb: 'Formats a cookie banner config with categories, granularity and evidence logs.',
    fields: [txt('c', 'Website'), sel('g', 'Governing law', ['GDPR', 'ePrivacy + GDPR', 'CCPA/CPRA', 'Both regimes']), sel('m', 'Consent model', ['Strict opt-in', 'Granular categories', 'Opt-out preference']), ck('i', 'Requirements', ['Banner before any non-essential load', 'Consent stored with timestamp', 'Withdraw path on every page', 'Cookie table published'])],
    compute: (v) => {
      const c = v.c as string, g = v.g as string, m = v.m as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'MET' : 'GAP')
      const doc = `COOKIE CONSENT CONFIG — ${c || '[site]'}\n\nREGIME: ${g}\nMODEL: ${m}\n\n1. BANNER - shown before non-essential scripts load. [${incl(0)}]\n2. EVIDENCE - consent recorded with timestamp + purpose. [${incl(1)}]\n3. WITHDRAW - link available sitewide. [${incl(2)}]\n4. COOKIE TABLE - published and current. [${incl(3)}]\n\n${m === 'Strict opt-in' ? 'Strict opt-in meets GDPR default settings; enrich with granular categories.' : m === 'Granular categories' ? 'Granular categories satisfy ePrivacy and GDPR guidance.' : 'Opt-out model is CCPA-aligned but risks GDPR non-consent.'}`
      const met = items.filter(Boolean).length
      return [res('Consent readiness', `${met}/4`, met === 4 ? T.good : met >= 2 ? T.warn : T.bad, `${g} ${m}.`), docRes('Document', doc)]
    },
  },
  {
    id: 'environmental-permit-expiration-tracker',
    archetype: 'tracker',
    blurb: 'Tracks environmental permits against renewal windows to avoid operating without authorization.',
    fields: [dt('d', 'Permit issue date'), n('y', 'Validity (years)', { def: 5 }), n('r', 'Apply early (months)', { def: 6 }), sel('p', 'Permit type', ['Air emission', 'Water discharge', 'Waste storage', 'Noise/operator'])],
    compute: (v) => {
      const d = v.d as string, y = v.y as number, r = v.r as number
      const exp = d ? new Date(new Date(d + 'T00:00:00').getTime() + y * 365 * 86400000) : null
      const renew = d ? new Date(new Date(d + 'T00:00:00').getTime() + (y * 365 - r * 30.44) * 86400000) : null
      const str = (x: Date | null) => (x ? x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')
      return [
        res('Permit expires', str(exp), T.neutral, `${v.p as string} — submit renewal by ${str(renew)}.`),
        res('Renewal filing opens', str(renew), T.neutral),
        res('Regulator buffer', `${num(r, 0)} months`, r >= 6 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'consumer-financial-protection-compliance-checker',
    archetype: 'checklist',
    blurb: 'Checks lending and fee disclosures against UDAAP-style consumer-protection rules.',
    fields: [ck('i', 'CFP checks', ['APR & fees disclosed upfront', 'Late-fee policy clear & tested', 'Auto-renewal terms explicit', 'Complaint log with root cause', 'Advertising claims supportable', 'Dispute process documented'])],
    compute: (v) => {
      const items = v.i as boolean[]
      const done = items.filter(Boolean).length
      const p = done / items.length
      return [
        res('Protection score', pct(p * 100, 0), p >= 0.83 ? T.good : p >= 0.5 ? T.warn : T.bad, 'UDAAP risk concentrates in disclosure and fee practices.'),
        res('Complaint posture', items[3] ? 'Logged & reviewed' : 'Gap — build the log', items[3] ? T.good : T.warn),
        res('Items covered', `${done}/${items.length}`, T.neutral),
      ]
    },
  },

  // ---------------- IP & Litigation ----------------
  {
    id: 'corporate-power-of-attorney-poa-document-builder',
    archetype: 'fmt',
    blurb: 'Builds a corporate power-of-attorney authorizing specific actions with limits.',
    fields: [txt('c', 'Company name'), txt('a', 'Attorney-in-fact'), sel('s', 'Scope', ['Specific transaction', 'General business operations', 'Limited to board-defined matters']), sel('p', 'Duration', ['Specific event', '6 months', '1 year', 'Until revoked']), n('l', 'Monetary cap ($)', { def: 250000 })],
    compute: (v) => {
      const c = v.c as string, a = v.a as string, s = v.s as string, p = v.p as string, l = v.l as number
      const doc = `CORPORATE POWER OF ATTORNEY\n\n${c || '[Company]'} (the Principal) appoints ${a || '[Agent]'} as attorney-in-fact, effective as noted.\n\nSCOPE\n1. AUTHORIZED ACTIONS: ${s}.\n2. FINANCIAL LIMIT: transactions up to $${num(l, 0)} per occurrence; excess requires board approval.\n3. DURATION: ${p}.\n4. NO PARTNERSHIP: this POA creates no agency beyond the granted scope.\n5. THIRD PARTIES may rely on a copy until written revocation is delivered.\n\nSEALED by an authorized officer of ${c || '[Company]'}.`
      return [res('POA draft', 'Ready for seal', T.neutral, 'Record the registry of signatories with the corporate secretary.'), docRes('Document', doc)]
    },
  },
  {
    id: 'freedom-of-information-act-foia-request-generator',
    archetype: 'fmt',
    blurb: 'Generates a FOIA request letter with scope, fee limits and timing expectations.',
    fields: [txt('a', 'Agency'), txt('s', 'Records sought'), sel('f', 'Fee limit', ['Waiver — public interest', 'Up to $100', 'Unlimited']), n('d', 'Processing days allowed', { def: 20 })],
    compute: (v) => {
      const a = v.a as string, s = v.s as string, f = v.f as string, d = v.d as number
      const doc = `FREEDOM OF INFORMATION REQUEST\n\nTO: ${a || '[Agency FOIA office]'}\n\n1. Pursuant to the FOIA, I request the following records:\n${s || '[describe records]'}\n\n2. If exempt, please identify the exemption and provide segregable portions.\n3. FEES: ${f}. A fee waiver is requested on public-interest grounds.\n4. I expect a determination within ${num(d, 0)} business days; if delayed, provide a tolling estimate.\n5. This request is made in good faith; do not charge search fees unless required.\n\nPlease respond in writing and confirm receipt.`
      return [res('FOIA request', 'Ready to file', T.neutral, 'Follow up at the statutory deadline with an appeal in hand.'), docRes('Document', doc)]
    },
  },
  {
    id: 'ip-licensing-royalty-rate-estimator',
    archetype: 'est',
    blurb: 'Estimates IP royalty rates from industry norms, exclusivity and selling margins.',
    fields: [n('a', 'Product revenue ($/yr)', { def: 4000000 }), n('b', 'Licensee margin %', { def: 30 }), n('c', 'Licensor profit split %', { def: 22 }), n('d', 'Industry royalty (25% rule)', { def: 4 }), sel('e', 'Exclusivity', ['Non-exclusive', 'Semi-exclusive', 'Exclusive, field-limited'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const uplift = (v.e as string).startsWith('Exclusive') ? 1.4 : (v.e as string).includes('Semi') ? 1.15 : 1
      const rate = Math.min(15, Math.max(d, b * (c / 100)) * uplift)
      const royalty = a * (rate / 100)
      return [
        res('Estimated royalty rate', pct(rate, 2), rate <= 8 ? T.good : T.warn, `vs ${pct(d, 1)} industry base.`),
        res('Annual royalty', money(royalty), royalty > 0 ? T.good : T.neutral),
        res('Exclusivity premium', `+${pct((uplift - 1) * 100, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'litigation-hold-notice-formatter',
    archetype: 'fmt',
    blurb: 'Formats a litigation hold that suspends deletion across custodians and data sources.',
    fields: [txt('c', 'Matter name'), txt('g', 'Custodians'), sel('s', 'Scope', ['Electronically stored info', 'Documents & email', 'All media incl. mobile/cloud']), ck('i', 'Hold elements', ['Suspend auto-delete', 'Preserve backups & recycle', 'No employee instruction to delete', 'Preservation memo for records mgmt'])],
    compute: (v) => {
      const c = v.c as string, g = v.g as string, s = v.s as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'ACTIVE' : 'MISSING')
      const doc = `LITIGATION HOLD NOTICE — MATTER: ${c || '[matter]'}\n\n1. This hold suspends any deletion, deletion schedule or recycling of ${s} relevant to the matter.\n2. CUSTODIANS: ${g || '[list]'} plus anyone who receives a copy of this notice.\n3. [${incl(0)}] AUTO-DELETE must be paused for mailboxes and file shares.\n4. [${incl(1)}] BACKUPS - restore-tape recycling suspended for preserved sources.\n5. [${incl(2)}] No employee may delete or alter responsive materials.\n6. [${incl(3)}] Records management is instructed accordingly.\n\nAcknowledge receipt in writing; escalate any ingestion/destroy process you cannot stop.`
      const ok = items.filter(Boolean).length
      return [res('Hold coverage', `${ok}/4`, ok === 4 ? T.good : ok >= 2 ? T.warn : T.bad, 'A gap = spoliation risk. Coordinate with IT now.'), docRes('Document', doc)]
    },
  },
  {
    id: 'trade-secret-classification-indexer',
    archetype: 'matrix',
    blurb: 'Classifies assets by secrecy controls to rate trade-secret protection maturity.',
    fields: [mx('m', 'Secrecy assets', ['Asset', 'Access control /5', 'Staff knowledge /5'], ['Algorithms & models', 'Customer lists', 'Pricing models', 'Process know-how']), n('c', 'NDA coverage %', { def: 70 })],
    compute: (v) => {
      const M = v.m as number[][]
      const acc = M.reduce((s, r) => s + (r[0] || 0), 0) / (M.length || 1)
      const know = M.reduce((s, r) => s + (r[1] || 0), 0) / (M.length || 1)
      const exposure = acc * know
      return [
        res('Secret exposure index', `${numD(exposure, 1)}/25`, exposure <= 10 ? T.good : exposure <= 16 ? T.warn : T.bad, 'High access + wide knowledge = easy exfiltration.'),
        res('NDA coverage', pct((v.c as number), 1), (v.c as number) >= 90 ? T.good : T.warn),
        res('Control posture', acc >= 3.5 ? 'Strong access controls' : 'Tighten access', acc >= 3.5 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'anti-money-laundering-aml-risk-scoring-matrix',
    archetype: 'scorecard',
    blurb: 'Scores AML risk from customer, product, geography and channel factors.',
    fields: [mxd('m', 'AML factors', ['Factor', 'Weight %', 'Risk /10'], ['Customer profile', 'Product & service', 'Geographic exposure', 'Channel'], [[30, 5], [25, 4], [25, 5], [20, 3]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const risk = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const level = risk >= 7 ? 'HIGH — enhanced due diligence' : risk >= 4 ? 'MEDIUM — standard CDD' : 'LOW — simplified due diligence'
      return [
        res('AML risk score', `${numD(risk, 1)}/10`, risk >= 6 ? T.bad : risk >= 3.5 ? T.warn : T.good),
        res('Due diligence tier', level, T.neutral),
        res('Driving factor', ['Customer profile', 'Product & service', 'Geographic exposure', 'Channel'][M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)], T.neutral),
      ]
    },
  },
  {
    id: 'know-your-customer-kyc-document-checklist-generator',
    archetype: 'checklist',
    blurb: 'Collects the KYC document set needed per customer type before onboarding.',
    fields: [sel('t', 'Customer type', ['Individual', 'Sole trader', 'Private company', 'Listed company', 'Trust/PEP']), ck('i', 'KYC documents', ['Government photo ID', 'Proof of address (<3 months)', 'Certificate of incorporation', 'Beneficial ownership registry', 'UBO declarations', 'Sanctions screening cleared', 'Source of funds evidence'])],
    compute: (v) => {
      const t = v.t as string
      const items = v.i as boolean[]
      const need = t === 'Individual' || t === 'Sole trader' ? ['Government photo ID', 'Proof of address (<3 months)', 'Sanctions screening cleared', 'Source of funds evidence'] : t === 'Listed company' ? ['Certificate of incorporation', 'Sanctions screening cleared'] : ['Certificate of incorporation', 'Beneficial ownership registry', 'UBO declarations', 'Sanctions screening cleared']
      const missing = need.filter((x) => !items[(['Government photo ID', 'Proof of address (<3 months)', 'Certificate of incorporation', 'Beneficial ownership registry', 'UBO declarations', 'Sanctions screening cleared', 'Source of funds evidence'].indexOf(x))])
      const done = items.filter(Boolean).length
      return [
        res('Documents ready', `${done}/${items.length}`, missing.length === 0 ? T.good : missing.length <= 2 ? T.warn : T.bad, `${t} needs: ${need.join(', ')}.`),
        res('Missing for this type', missing.join(', ') || 'None', missing.length ? T.warn : T.good),
        res('Onboarding gate', missing.length === 0 ? 'Clear to onboard' : 'Hold onboarding', missing.length === 0 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'patent-maintenance-fee-schedule-planner',
    archetype: 'timeline',
    blurb: 'Plans patent maintenance fee payment windows by annuity year from filing.',
    fields: [dt('s', 'Filing date'), mx('m', 'Annuities', ['Stage', 'Years after filing'], ['3rd year annuity', '4th year annuity', '5th year annuity', '6th year annuity', '7th year annuity'])],
    compute: (v) => {
      const M = v.m as number[][]
      const stages = M.length
      const lastY = Math.max(...M.map((r) => r[0] || 0))
      return [
        res('Fee events', `${num(stages, 0)} windows`, stages >= 5 ? T.good : T.warn, 'Missing one annuity kills the patent.'),
        res('Last planned annuity', `Year ${num(lastY, 0)}`),
        res('Budget pacing', `${num(Math.ceil(lastY / (stages || 1)), 0)} yr apart`, T.neutral),
      ]
    },
  },
  {
    id: 'cease-and-desist-c-and-d-letter-formatter',
    archetype: 'fmt',
    blurb: 'Writes a cease-and-desist letter with demand, deadline and escalation warning.',
    fields: [txt('r', 'Recipient'), txt('i', 'Offending conduct'), sel('t', 'Claim basis', ['Trademark infringement', 'Copyright infringement', 'Breach of contract', 'Harassment']), n('d', 'Compliance deadline (days)', { def: 10 })],
    compute: (v) => {
      const r = v.r as string, i = v.i as string, t = v.t as string, d = v.d as number
      const doc = `CEASE AND DESIST\n\nTO: ${r || '[Recipient]'}\n\n1. You are engaging in: ${i || '[conduct]'}.\n2. Basis: ${t}. This conduct is not authorized and causes continuing and irreparable harm.\n3. DEMAND: immediately cease and desist; confirm in writing the conduct has stopped and that offending materials are destroyed.\n4. DEADLINE: respond within ${num(d, 0)} days.\n5. RESERVATION: we reserve all rights and remedies, including injunctive relief and costs, if compliance is not confirmed.\n\nThis letter is without prejudice to our claims.`
      return [res('C&D letter', 'Drafted', T.good, 'Send by recorded delivery; keep proof of receipt.'), docRes('Document', doc)]
    },
  },
  {
    id: 'product-liability-risk-rating-matrix',
    archetype: 'scorecard',
    blurb: 'Scores product liability risk across design, manufacturing, warning and usage exposure.',
    fields: [mxd('m', 'Liability factors', ['Factor', 'Weight %', 'Risk /10'], ['Design & defect', 'Manufacturing control', 'Warnings & labeling', 'Reasonable foreseeability'], [[30, 5], [25, 4], [25, 4], [20, 5]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const risk = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const band = risk >= 7 ? 'High — product recall review' : risk >= 4.5 ? 'Moderate — risk committee' : 'Low — standard controls'
      return [
        res('Liability risk', `${numD(risk, 1)}/10`, risk >= 6 ? T.bad : risk >= 4 ? T.warn : T.good),
        res('Rating', band, T.neutral),
        res('Key lever', ['Design & defect', 'Manufacturing control', 'Warnings & labeling', 'Reasonable foreseeability'][M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)], T.neutral),
      ]
    },
  },
  {
    id: 'term-sheet-valuation-and-liquidation-preference-builder',
    archetype: 'fmt',
    blurb: 'Models term sheet economics: valuation, preference and cap table outcomes.',
    fields: [n('a', 'Pre-money ($)', { def: 18000000 }), n('b', 'Round raised ($)', { def: 6000000 }), sel('p', 'Liquidation preference', ['1x non-participating', '1x participating', '2x non-participating']), n('d', 'Option pool post-close %', { def: 12 }), n('e', 'Ownership now %', { def: 68 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, p = v.p as string, d = v.d as number, e = v.e as number
      const post = a + b
      const investorPct = post ? (b / post) * 100 : 0
      const founderPct = e * (post ? a / post : 0) * (1 - d / 100)
      const pref = (b * (p.startsWith('1x') ? 1 : 2)) / post * 100
      return [
        res('Investor ownership', pct(investorPct, 1), investorPct <= 40 ? T.good : T.warn),
        res('Founder post-close', pct(founderPct, 1), founderPct >= 40 ? T.good : founderPct >= 25 ? T.warn : T.bad, `Option pool ${pct(d, 0)} dilutes everyone.`),
        res('Preference economics', p, p.includes('participating') ? T.warn : T.good, `Preference value ≈ ${pct(pref, 1)} of round.`),
      ]
    },
  },
  {
    id: 'copyright-registration-cost-estimator',
    archetype: 'est',
    blurb: 'Estimates copyright registration costs across works, countries and agent fees.',
    fields: [n('a', 'Works to register', { def: 10 }), n('b', 'US fee per work ($)', { def: 65 }), n('c', 'Works in a bundle', { def: 2 }), n('d', 'Intl registrations', { def: 1 }), n('e', 'Agent hourly ($)', { def: 250 }), n('f', 'Agent hours', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number, f = v.f as number
      const bundles = Math.ceil(a / (c || 1))
      const filing = bundles * b + d * b * 2.5
      const agent = e * f
      const total = filing + agent
      return [
        res('Filing fees', money(filing)),
        res('Agent costs', money(agent)),
        res('Total registration cost', money(total), b * a > 0 ? T.good : T.neutral),
        res('Cost per work', money(c ? total / a : total)),
      ]
    },
  },
  {
    id: 'trademark-knockout-search-log',
    archetype: 'log',
    blurb: 'Logs trademark knockout search hits and their blocking severity before filing.',
    fields: [mx('m', 'Search hits', ['Class', 'Hits', 'Blocking hits'], ['Class 9 (software)', 'Class 35 (marketing)', 'Class 41 (services)', 'Class 42 (SaaS)']), n('c', 'Filing decision threshold %', { def: 25 })],
    compute: (v) => {
      const M = v.m as number[][]
      const hits = M.reduce((s, r) => s + (r[0] || 0), 0)
      const blocking = M.reduce((s, r) => s + (r[1] || 0), 0)
      const rate = hits ? (blocking / hits) * 100 : 0
      const go = rate <= (v.c as number)
      return [
        res('Knockout hits', num(hits, 0)),
        res('Blocking share', pct(rate, 1), go ? T.good : T.bad, go ? 'Below threshold — proceeding is defensible.' : 'Blocking load too high — refine mark or classes.'),
        res('Worst class', ['Class 9 (software)', 'Class 35 (marketing)', 'Class 41 (services)', 'Class 42 (SaaS)'][M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)], T.neutral),
      ]
    },
  },
  {
    id: 'data-breach-penalty-estimator',
    archetype: 'est',
    blurb: 'Estimates regulatory fine exposure for a personal-data breach under typical regimes.',
    fields: [n('a', 'Affected individuals', { def: 20000 }), n('b', 'Turnover (€/$m)', { def: 300 }), n('c', 'Obligations breached /10', { def: 6 }), n('d', 'Self-reported promptly', { def: 1 }), n('e', 'Mitigation implemented', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const base = Math.min(b * 0.02 * 1e6, 10000000) * (c / 10)
      const dim = a * 8 * (d ? 0.5 : 1.3) * (e ? 0.7 : 1)
      const total = Math.min(base + dim, b * 0.04 * 1e6)
      return [
        res('Estimated penalty', money(total), T.neutral, d ? 'Self-reporting materially lowers exposure.' : 'Notification delays inflate fines.'),
        res('Gravity base', money(base)),
        res('Per-individual loading', money(dim), T.neutral),
        res('Soundness note', `within 4% turnover cap (${money(b * 0.04 * 1e6)})`, total <= b * 0.04 * 1e6 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'corporate-governance-charter-template-builder',
    archetype: 'fmt',
    blurb: 'Assembles a governance charter defining committee mandates and escalation rights.',
    fields: [txt('c', 'Company name'), txt('m', 'Committee'), sel('s', 'Committee type', ['Audit', 'Compensation', 'Nominating & governance', 'Risk']), n('b', 'Board members', { def: 9 }), ck('i', 'Charter items', ['Membership & independence', 'Meetings cadence', 'Specific duties', 'Delegated powers', 'Reporting to full board', 'Self-evaluation'])],
    compute: (v) => {
      const c = v.c as string, s = v.s as string, b = v.b as number
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'MISSING')
      const doc = `${s.toUpperCase()} COMMITTEE CHARTER — ${c || '[Company]'}\n\n1. MANDATE - assist the full board on ${s.toLowerCase()} matters.\n2. MEMBERSHIP - at least ${num(Math.max(2, Math.min(3, Math.ceil(b / 3))), 0)} directors, independent per applicable rules. [${incl(0)}]\n3. MEETINGS - scheduled ${s === 'Audit' ? 'quarterly' : 'no less than 3x/yr'}; special meetings on call. [${incl(1)}]\n4. DUTIES - as enumerated for the ${s} committee. [${incl(2)}]\n5. POWERS - retains outside advisors at company expense. [${incl(3)}]\n6. REPORTING - minutes to full board. [${incl(4)}]\n7. EVALUATION - annual self-evaluation. [${incl(5)}]`
      const ok = items.filter(Boolean).length
      return [res('Charter coverage', `${ok}/6`, ok === 6 ? T.good : ok >= 4 ? T.warn : T.bad), docRes('Document', doc)]
    },
  },
  {
    id: 'joint-ownership-ip-assignment-generator',
    archetype: 'fmt',
    blurb: 'Documents joint IP ownership with use rights and exploitation rules for co-developers.',
    fields: [txt('a', 'Party A'), txt('b', 'Party B'), sel('u', 'Use rights', ['Each may exploit freely', 'Right of first refusal to license', 'Fields-of-use split']), n('s', 'Registered share (%)', { def: 50 })],
    compute: (v) => {
      const a = v.a as string, b = v.b as string, u = v.u as string, s = v.s as number
      const doc = `JOINT OWNERSHIP & IP ASSIGNMENT\n\nPARTIES: ${a || '[Party A]'} and ${b || '[Party B]'}\n\n1. JOINTLY DEVELOPED IP - any IP created jointly under the collaboration is owned in common in shares ${num(s, 0)}% / ${num(100 - s, 0)}%.\n2. USE RIGHTS - ${u}.\n3. ASSIGNMENT - each party assigns to the other the right to practice the joint IP to the extent of their ownership.\n4. PATENT/REGISTRATION COSTS - shared proportionally to ownership.\n5. HIVE OFF - a party may hive off an exclusive field on written notice and license-back terms.\n6. GOVERNING LAW - place of the lead party\'s registration.`
      return [res('Co-ownership draft', 'Ready', T.neutral, 'Verify that exploitation rights clear patent statutes in every jurisdiction.'), docRes('Document', doc)]
    },
  },
  {
    id: 'statute-of-limitations-legal-calculator',
    archetype: 'est',
    blurb: 'Determines the claim window from the trigger date and applicable limitation period.',
    fields: [dt('d', 'Cause-of-action trigger date'), sel('t', 'Claim type', ['Contract (written)', 'Contract (oral)', 'Tort / negligence', 'Fraud', 'Employment']), n('y', 'Limitation years', { def: 6 }), n('p', 'Partial remedy paid', { def: 0 })],
    compute: (v) => {
      const d = v.d as string, y = v.y as number, p = v.p as number
      const ext = p > 0 ? 1 : 0
      const exp = d ? new Date(new Date(d + 'T00:00:00').getTime() + (y + ext) * 8760 * 3600000) : null
      const remains = exp && d ? (exp.getTime() - Date.now()) / 86400000 : 0
      const str = exp ? exp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      return [
        res('Claims expire', str, remains > 0 ? T.neutral : T.bad, `${v.t as string} — typically ${y} years.`),
        res('Days remaining', num(Math.max(0, Math.floor(remains)), 0), remains > 365 ? T.good : remains > 0 ? T.warn : T.bad, remains <= 0 ? 'Limitation may have lapsed — act immediately.' : ''),
        res('Accrual posture', p > 0 ? 'Partial payment restarts limitation' : 'No restart event', p > 0 ? T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'corporate-seal-stamp-formatter',
    archetype: 'fmt',
    blurb: 'Formats a corporate seal layout with legal name, formation state and registration line.',
    fields: [txt('c', 'Company legal name'), txt('s', 'State / jurisdiction'), txt('y', 'Formation year'), sel('r', 'Style', ['Simple circle', 'Circle with star points', 'Squared emboss', 'Registered agent detail']), ck('i', 'Seal elements', ['Legal name (full)', 'Formation state', 'Year', 'File/registration number', 'Seal number/duplicate'])],
    compute: (v) => {
      const c = v.c as string, s = v.s as string, y = v.y as string, r = v.r as string
      const items = v.i as boolean[]
      const line = (t: string, on: number) => `   ${items[on] ? t : '(' + t.split(' ')[0] + ' omitted)'}`
      const doc = `CORPORATE SEAL SPECIFICATION\n\n  o─────────────────────────o\n  │   ${c || '[Legal name]'.padEnd(20)} │\n  │   ${('INCORPORATED ' + (s || '[STATE]')).padEnd(24)} │\n  │   ${('EST. ' + (y || '[YEAR]')).padEnd(24)} │\n  o─────────────────────────o\n   ${r}\n\nELEMENTS\n${line('1. Legal name rendered in full around circumference', 0)}\n${line('2. State of formation', 1)}\n${line('3. Year formed', 2)}\n${line('4. Registration / file number', 3)}\n${line('5. Seal number for duplicate control', 4)}`
      const ok = items.filter(Boolean).length
      return [res('Seal spec', `${ok}/5 elements`, ok === 5 ? T.good : ok >= 3 ? T.warn : T.bad, 'Keep duplicate seals numbered and logged.'), docRes('Document', doc)]
    },
  },
]