import { days, doc as docRes, money, moneyC, mx, mxd, n, num, numD, pct, ratio, res, sel, T, txt, ck } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

export const specs: OfficeToolSpec[] = [
  // ---------------- Finance ---------------- 
  {
    id: 'capex-vs-opex-financial-classifier',
    archetype: 'est',
    blurb: 'Classifies a purchase as capital or operating spend based on cost, life and ownership terms.',
    fields: [n('a', 'Purchase cost ($)', { def: 15000 }), n('b', 'Useful life (years)', { def: 5 }), n('c', 'Company capitalization threshold ($)', { def: 2500 }), sel('d', 'Ownership structure', ['Owned / physical', 'Leased with buyout', 'Rental / subscription'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as string
      const capex = a >= c && d !== 'Rental / subscription' && b >= 1
      const tco = a + a * 0.08 * b
      return [
        res('Classification', capex ? 'CAPEX — capital asset' : 'OPEX — expense', capex ? T.neutral : T.neutral, d === 'Rental / subscription' ? 'Subscriptions are operational regardless of cost.' : 'Tie the call to the capitalization policy.'),
        res('Total cost over life', money(tco)),
        res('Depreciation / yr', money(b ? a / b : 0), T.neutral),
        res('Capitalization test', a >= c ? 'Passes threshold' : 'Below threshold', a >= c ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'net-present-value-npv-and-irr-calculator',
    archetype: 'est',
    blurb: 'Discounts projected cash flows to NPV and approximates the internal rate of return.',
    fields: [n('a', 'Initial investment ($)', { def: -100000 }), n('b', 'Annual cash flow ($)', { def: 30000 }), n('c', 'Term (years)', { def: 5 }), n('d', 'Discount rate %', { def: 10 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const r = d / 100
      let npv = a
      let irr = 0
      for (let i = 1; i <= Math.round(c); i++) npv += b / Math.pow(1 + r, i)
      let lo = -1, hi = 1
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2
        let f = -a
        for (let i = 1; i <= Math.round(c); i++) f += b / Math.pow(1 + mid, i)
        if (f > 0) lo = mid
        else hi = mid
      }
      irr = (lo + hi) / 2
      return [
        res('Net present value', money(npv), npv >= 0 ? T.good : T.bad, 'Positive NPV at the discount rate adds value.'),
        res('Internal rate of return', pct(irr * 100, 1), irr >= r ? T.good : T.bad, irr >= r ? 'IRR beats the hurdle rate.' : 'IRR below hurdle — reject on rate grounds.'),
        res('Return on investment', pct(a ? (npv - a) / -a * 100 : 0, 1), T.neutral),
      ]
    },
  },
  {
    id: 'weighted-average-cost-of-capital-wacc-calculator',
    archetype: 'est',
    blurb: 'Combines the cost of debt and equity into a weighted average cost of capital.',
    fields: [n('a', 'Equity value ($)', { def: 80000000 }), n('b', 'Debt value ($)', { def: 20000000 }), n('c', 'Cost of equity %', { def: 12 }), n('d', 'Cost of debt %', { def: 5 }), n('e', 'Tax rate %', { def: 21 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const V = a + b
      const wacc = V ? (a / V) * c + (b / V) * d * (1 - e / 100) : 0
      return [
        res('WACC', pct(wacc, 2), wacc <= 12 ? T.good : T.warn, 'Deploy capital only above this hurdle.'),
        res('Debt tax shield', pct(V ? (b / V) * d * (e / 100) : 0, 2), T.neutral),
        res('Equity weight', pct(V ? (a / V) * 100 : 0, 1)),
      ]
    },
  },
  {
    id: 'capital-lease-vs-operating-lease-evaluator',
    archetype: 'est',
    blurb: 'Compares the present cost of a capital lease to an operating lease for the same asset.',
    fields: [n('a', 'Asset value ($)', { def: 50000 }), n('b', 'Lease term (months)', { def: 36 }), n('c', 'Monthly payment ($)', { def: 1500 }), sel('d', 'Transfer of ownership', ['Yes — at end', 'Bargain purchase option', 'No']), sel('e', 'Discount rate basis', ['Implicit ~6%', 'Company WACC ~9%', 'Risk-free ~4%'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as string
      const r = (v.e as string).includes('6%') ? 0.06 : (v.e as string).includes('9%') ? 0.09 : 0.04
      let npv = 0
      for (let i = 1; i <= Math.round(b); i++) npv += c / Math.pow(1 + r / 12, i)
      const capital = d !== 'No'
      return [
        res('PV of lease payments', money(npv), npv <= a * 1.05 ? T.good : T.warn, capital ? 'Likely a capital (finance) lease by ASC 842 tests.' : 'Operating lease treatment likely.'),
        res('Cost of payments vs asset', pct(npv ? (npv / a) * 100 : 0, 0), npv <= a ? T.good : T.warn),
        res('Ownership transfer', d, T.neutral),
      ]
    },
  },
  {
    id: 'zero-based-budgeting-zbb-template-builder',
    archetype: 'scorecard',
    blurb: 'Scores each budget line on necessity and efficiency to rebuild the budget from zero.',
    fields: [mxd('m', 'Budget lines', ['Line', 'Weight %', 'Justification /10'], ['Headcount', 'Software & tools', 'Marketing', 'Facilities', 'Travel'], [[25, 6], [20, 6], [25, 6], [15, 6], [15, 6]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const cuts = M.filter((r) => (r[1] || 0) < 5).map((r) => r[0]).join(', ')
      return [
        res('ZBB justification score', `${numD(score, 1)}/10`, score >= 7 ? T.good : score >= 5 ? T.warn : T.bad, 'Lines under 5/10 are first re-scoped.'),
        res('At-risk lines', cuts || 'None', cuts ? T.warn : T.good),
        res('Funding stance', score >= 7 ? 'Fund as-is' : score >= 5 ? 'Fund conditionally' : 'Rejustify or cut', T.neutral),
      ]
    },
  },
  {
    id: 'corporate-tax-liability-estimator',
    archetype: 'est',
    blurb: 'Estimates corporate income tax from book profit, adjustments and credits.', 
    fields: [n('a', 'Book profit before tax ($)', { def: 20000000 }), n('b', 'Non-deductible add-backs ($)', { def: 1500000 }), n('c', 'Deductions & depreciation ($)', { def: 3000000 }), n('d', 'Statutory tax rate %', { def: 21 }), n('e', 'Credits available ($)', { def: 500000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const taxable = Math.max(0, a + b - c)
      const tax = taxable * (d / 100) - e
      const eff = a ? (tax / a) * 100 : 0
      return [
        res('Taxable income', money(taxable)),
        res('Estimated tax liability', money(Math.max(0, tax)), tax >= 0 ? T.neutral : T.warn),
        res('Effective tax rate', pct(eff, 1), eff <= d ? T.good : T.warn, `Statutory rate ${pct(d, 0)}.`),
      ]
    },
  },
  {
    id: 'asset-depreciation-schedule-straight-line-and-macrs',
    archetype: 'matrix',
    blurb: 'Builds a straight-line or accelerated depreciation schedule for an asset.',
    fields: [n('a', 'Asset cost ($)', { def: 60000 }), n('b', 'Salvage value ($)', { def: 6000 }), n('c', 'Useful life (years)', { def: 5 }), mx('x', 'Annual valuation check', ['Year', 'Remaining value ($)'], ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const annual = c ? (a - b) / c : 0
      const bookEnd = a - annual * c
      return [
        res('Annual depreciation', money(annual)),
        res('End book value', money(bookEnd), bookEnd <= b * 1.01 ? T.good : T.warn),
        res('Depreciation rate', pct(annual ? (annual / a) * 100 : 0, 1)),
        res('Cumulative to salvage', pct(c ? ((a - b) / a) * 100 : 0, 0), T.neutral),
      ]
    },
  },
  {
    id: 'working-capital-ratio-calculator',
    archetype: 'est',
    blurb: 'Computes current and quick ratios from working capital components.',
    fields: [n('a', 'Current assets ($)', { def: 5000000 }), n('b', 'Current liabilities ($)', { def: 3000000 }), n('c', 'Inventory ($)', { def: 1500000 }), n('d', 'Prepaid / other ($)', { def: 300000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const cr = b ? a / b : 0
      const qr = b ? (a - c - d) / b : 0
      const wc = a - b
      return [
        res('Current ratio', ratio(cr, 2), cr >= 1.5 ? T.good : cr >= 1 ? T.warn : T.bad, '1.5-2.0 is the comfort band.'),
        res('Quick ratio', ratio(qr, 2), qr >= 1 ? T.good : T.warn, 'Excludes slow-moving inventory.'),
        res('Working capital', money(wc), wc >= 0 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'cash-conversion-cycle-ccc-calculator',
    archetype: 'est',
    blurb: 'Measures how many days cash is trapped between paying suppliers and collecting from customers.',
    fields: [n('a', 'Days inventory outstanding', { def: 45 }), n('b', 'Days sales outstanding', { def: 50 }), n('c', 'Days payables outstanding', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const ccc = a + b - c
      const cashPerDay = 1000
      const trapped = ccc * cashPerDay
      return [
        res('Cash conversion cycle', `${num(ccc, 0)} days`, ccc <= 30 ? T.good : ccc <= 60 ? T.warn : T.bad, `At ~${money(cashPerDay)}/day that ties up about ${money(trapped)}.`),
        res('Inventory drain', `${num(a, 0)} days`),
        res('Invoicing stretch', `${num(b, 0)} days`, b <= 45 ? T.good : T.warn),
        res('Supplier float', `${num(c, 0)} days`, c >= 30 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'amortization-schedule-for-commercial-loans',
    archetype: 'bdown',
    blurb: 'Builds a commercial loan amortization with principal, interest and balloon view.',
    fields: [n('a', 'Loan amount ($)', { def: 500000 }), n('b', 'Rate % APR', { def: 7 }), n('c', 'Term (years)', { def: 10 }), n('d', 'Payments per year', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const n = c * d
      const r = b / 100 / d
      const pmt = n ? (a * r) / (1 - Math.pow(1 + r, -n)) : 0
      const total = pmt * n
      const interest = total - a
      return [
        res('Payment', moneyC(pmt)),
        res('Total paid', money(total)),
        res('Total interest', money(interest), b <= 8 ? T.good : T.warn, 'Every 100bp of rate adds real cost; stagger draws if possible.'),
        res('Interest share of total', pct(total ? (interest / total) * 100 : 0, 1), T.neutral),
      ]
    },
  },
  {
    id: 'financial-ratio-analysis-dashboard',
    archetype: 'matrix',
    blurb: 'Ingests five ratio families and flags which fall outside healthy bands.',
    fields: [mx('m', 'Ratio suite', ['Ratio', 'Current value', 'Target'], ['Current ratio', 'Debt / EBITDA', 'Gross margin %', 'Inventory turns', 'ROE %'])],
    compute: (v) => {
      const M = v.m as number[][]
      const rl = ['Current ratio', 'Debt / EBITDA', 'Gross margin %', 'Inventory turns', 'ROE %']
      const off = M.filter((r) => {
        const cur = r[0] || 0, target = r[1] || 0
        return Math.abs(cur - target) > 0.3 * (target || 1)
      })
      return [
        res('Ratios in band', `${num(M.length - off.length, 0)} of ${M.length}`, off.length <= 1 ? T.good : off.length <= 2 ? T.warn : T.bad),
        res('Out-of-band', off.map((r) => rl[M.indexOf(r)]).join(', ') || 'None', off.length ? T.warn : T.good, 'Targets are starting references, not covenants.'),
        res('Band tolerance', '±30% of target', T.neutral),
      ]
    },
  },
  {
    id: 'corporate-travel-budget-allocation-planner',
    archetype: 'bdown',
    blurb: 'Splits the travel budget across departments and trips with a per-trip guardrail.',
    fields: [mx('m', 'Travel budget', ['Dept', 'Trips planned', 'Avg cost / trip ($)'], ['Sales', 'Engineering', 'Marketing', 'Leadership'])],
    compute: (v) => {
      const M = v.m as number[][]
      const trips = M.reduce((s, r) => s + (r[0] || 0), 0)
      const spend = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0)
      const avg = trips ? spend / trips : 0
      return [
        res('Trip volume', num(trips, 0)),
        res('Budget required', money(spend)),
        res('Avg cost per trip', money(avg), avg <= 2500 ? T.good : avg <= 4500 ? T.warn : T.bad, 'Intl-heavy books run higher than domestic.'),
        res('Department concentration', pct(spend ? (M.reduce((s, r, i) => i === 0 ? s + (r[0] || 0) * (r[1] || 0) : s, 0)) / spend * 100 : 0, 0), T.neutral),
      ]
    },
  },
  {
    id: 'asset-scrap-value-estimator',
    archetype: 'est',
    blurb: 'Estimates what a decommissioned asset returns at scrap versus its remaining book value.',
    fields: [n('a', 'Asset weight (kg)', { def: 8000 }), n('b', 'Scrap metal price ($/kg)', { def: 0.8 }), n('c', 'Remaining book value ($)', { def: 25000 }), n('d', 'Dismantling cost ($)', { def: 3000 }), sel('e', 'Asset class', ['Steel equipment', 'Machinery / aluminum', 'Cable & copper', 'Mixed office'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const blend = (v.e as string).includes('copper') ? 3.2 : (v.e as string).includes('alu') ? 1.4 : 0.8
      const gross = a * b * (blend / 0.8)
      const net = gross - d
      return [
        res('Gross scrap value', money(gross), T.neutral),
        res('Net after dismantling', money(net), net >= c ? T.good : T.warn, net < c ? 'Scrap proceeds fall short of remaining book value.' : 'Scrap more than covers book.'),
        res('Recovery vs book', pct(net ? (net / c) * 100 : 0, 0), net >= c ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'commercial-real-estate-lease-escalate-calculator',
    archetype: 'est',
    blurb: 'Projects rent across a lease term with annual escalations and CPI adjustments.',
    fields: [n('a', 'Starting rent ($/sqft/yr)', { def: 32 }), n('b', 'Leasable area (sqft)', { def: 12000 }), n('c', 'Term (years)', { def: 7 }), n('d', 'Annual escalation %', { def: 2.5 }), n('e', 'Common area / taxes /yr ($)', { def: 60000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      let year1 = a * b
      let total = 0
      let calc = year1
      for (let i = 0; i < Math.round(c); i++) {
        total += calc + e
        calc *= 1 + d / 100
      }
      return [
        res('Year-1 base rent', money(year1)),
        res('Total 5-yr+effective occupancy', money(total)),
        res('Final year rent', money(calc)),
        res('Effective escalation load', `${numD((calc / year1 - 1) * 100, 1)}% over term`, d <= 3 ? T.good : T.warn, 'Escalators above 3% compound fast.'),
      ]
    },
  },
  {
    id: 'sunk-cost-fallacy-project-evaluator',
    archetype: 'est',
    blurb: 'Separates sunk spend from go-forward economics to judge whether a project still makes sense.',
    fields: [n('a', 'Already invested ($)', { def: 500000 }), n('b', 'Remaining cost to finish ($)', { def: 200000 }), n('c', 'Likely project value ($)', { def: 550000 }), n('d', 'Opportunity return elsewhere ($)', { def: 350000 }), n('e', 'Probability of success %', { def: 70 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const evContinue = c * (e / 100) - b
      const evStop = d
      const go = evContinue >= evStop
      return [
        res('Continue value (EV)', money(evContinue), go && evContinue > 0 ? T.good : T.warn, 'Sunk spend is not recoverable — ignore it in this call.'),
        res('Stop & redeploy value', money(evStop), T.neutral),
        res('Decision', go ? 'CONTINUE' : 'STOP / redeploy', go ? T.good : T.bad, go ? 'Expected value favors finishing.' : 'Expected value favors the alternative.'),
        res('Sunk amount to write off', money(a), T.neutral),
      ]
    },
  },
  {
    id: 'intercompany-loan-interest-calculator',
    archetype: 'est',
    blurb: 'Charges arm’s-length interest on intercompany loans to keep transfer pricing clean.',
    fields: [n('a', 'Loan balance ($)', { def: 2500000 }), n('b', 'Base rate (SOFR %)', { def: 4.5 }), n('c', 'Spread over base (%)', { def: 1.5 }), n('d', 'Days in period', { def: 90 }), sel('e', 'Repricing', ['Fixed for year', 'Quarterly refix', 'Monthly refix'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const rate = b + c
      const interest = a * (rate / 100) * (d / 365)
      return [
        res('Interest charge', moneyC(interest)),
        res('Applied rate', pct(rate, 2), rate <= 8 ? T.good : T.warn, 'Benchmark against local bank pricing for the same tenor.'),
        res('Effective monthly charge', moneyC(interest / (d ? d / 30 : 1))),
        res('Repricing', v.e as string, T.neutral),
      ]
    },
  },
  {
    id: 'vendor-rfq-request-for-quote-formatter',
    archetype: 'fmt',
    blurb: 'Assembles a structured RFQ with scope, commercial terms and response requirements.',
    fields: [txt('c', 'Company name'), txt('v', 'Vendor name'), txt('s', 'Scope / items'), sel('t', 'Incoterms', ['EXW', 'FOB', 'CIF', 'DDP']), sel('p', 'Payment terms', ['Net 30', 'Net 60', '3% / 10 net 30']), ck('i', 'RFQ sections', ['Pricing table requested', 'Delivery schedule', 'Warranty terms', 'SLA & support', 'Insurance & compliance'])],
    compute: (v) => {
      const c = v.c as string, vv = v.v as string, s = v.s as string, t = v.t as string, p = v.p as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'REQUIRED' : 'OMITTED')
      const doc = `REQUEST FOR QUOTATION\n\nFROM: ${c || '[Buyer]'}  TO: ${vv || '[Vendor]'}\n\n1. SCOPE\n${s || '[Describe goods/services]'}\n\n2. COMMERCIAL TERMS\n- Incoterms: ${t}\n- Payment: ${p}\n- Validity: 30 days from quote date\n\n3. RESPONSE REQUIREMENTS\n- Itemized pricing table [${incl(0)}]\n- Delivery schedule with lead time [${incl(1)}]\n- Warranty terms [${incl(2)}]\n- SLA / support description [${incl(3)}]\n- Insurance & compliance certificates [${incl(4)}]\n\nQuotes will be scored on price, lead time and total cost of ownership.`
      return [res('RFQ package', 'Ready to issue', T.neutral, 'Keep all bidders on identical commercial terms.'), docRes('Document', doc)]
    },
  },
  {
    id: 'vendor-comparison-matrix',
    archetype: 'matrix',
    blurb: 'Scores vendors across price, quality, delivery and support to rank the shortlist.',
    fields: [mx('m', 'Vendor shortlist', ['Vendor', 'Price /5', 'Quality /5', 'Delivery /5', 'Support /5'], ['Vendor 1', 'Vendor 2', 'Vendor 3', 'Vendor 4', 'Vendor 5']), n('w', 'Price weight %', { def: 40 })],
    compute: (v) => {
      const M = v.m as number[][]
      const w = v.w as number
      const s = (r: number) => (M[r][0] || 0) * (w / 100) + ((M[r][1] || 0) + (M[r][2] || 0) + (M[r][3] || 0)) / 3 * (1 - w / 100)
      const best = M.reduce((bi, _, i) => (s(i) > s(bi) ? i : bi), 0)
      return [
        res('Top vendor', ['Vendor 1', 'Vendor 2', 'Vendor 3', 'Vendor 4', 'Vendor 5'][best], T.good),
        res('Score spread', `${numD(Math.max(...M.map((_, i) => s(i))) - Math.min(...M.map((_, i) => s(i))), 2)} pts`, T.neutral),
        res('Price-led tailwind', w >= 50 ? 'Price dominant' : 'Quality & service dominant', T.neutral),
      ]
    },
  },
  {
    id: 'purchase-order-po-generator',
    archetype: 'fmt',
    blurb: 'Generates a serialized purchase order from basic terms and line items.',
    fields: [txt('v', 'Supplier'), txt('s', 'Ship to'), txt('l', 'Line items (qty x item)'), sel('t', 'Incoterms', ['EXW', 'FOB', 'CIF', 'DDP']), sel('p', 'Payment terms', ['Net 30', 'Net 60', 'Prepaid', '3% / 10 net 30']), n('a', 'Estimated total ($)', { def: 25000 })],
    compute: (v) => {
      const vv = v.v as string, s = v.s as string, l = v.l as string, t = v.t as string, p = v.p as string, a = v.a as number
      const doc = `PURCHASE ORDER\n\nTO: ${vv || '[Supplier]'}\nSHIP TO: ${s || '[Address]'}\n\nLINE ITEMS\n${l || '[List each item: qty x sku x unit price]'}\n\nESTIMATED TOTAL: $${num(a, 2)}\n\nTERMS\n- Incoterms: ${t}\n- Payment: ${p}\n- Delivery to confirm 5 days prior\n- Damage claims: 7 days from receipt\n- This PO cancels any conflicting quotations.`
      return [res('PO draft', 'Ready to issue', T.neutral, 'Reference your PO number in every delivery.'), docRes('Document', doc)]
    },
  },
  {
    id: 'three-way-matching-audit-formatter',
    archetype: 'fmt',
    blurb: 'Reconciles PO, goods receipt and invoice into a three-way match audit trail.',
    fields: [txt('p', 'PO number / amount'), txt('r', 'Goods receipt notes'), txt('i', 'Invoice number / amount'), sel('s', 'Match status', ['Match — pay', 'Price variance', 'Quantity variance', 'No receipt'])],
    compute: (v) => {
      const p = v.p as string, r = v.r as string, i = v.i as string, s = v.s as string
      const doc = `THREE-WAY MATCH AUDIT\n\nPO: ${p || '[ref]'}  INVOICE: ${i || '[ref]'}\nRECEIPT:\n${r || '[notes]'}\n\nSTATUS: ${s}\n\n├─ PO vs INVOICE  : ${s === 'Match — pay' ? 'AGREED' : 'DISPUTED'}\n├─ INVOICE vs GRN  : ${s === 'No receipt' ? 'NO GRN — HOLD' : 'AGREED'}\n└─ QUANTITY        : ${s === 'Quantity variance' ? 'REMEDIATE' : 'OK'}\n\nAction: ${s === 'Match — pay' ? 'Release for payment' : s === 'No receipt' ? 'Do not pay until goods arrive' : 'Quarantine and reconcile with supplier'}.`
      return [res('Match verdict', s, s === 'Match — pay' ? T.good : T.warn), docRes('Document', doc)]
    },
  },
  {
    id: 'procurement-spend-under-management-sum-calculator',
    archetype: 'est',
    blurb: 'Measures how much indirect spend flows through managed procurement channels.',
    fields: [n('a', 'Total indirect spend ($/yr)', { def: 80000000 }), n('b', 'Managed via contracts ($)', { def: 55000000 }), n('c', 'Through approved catalogs ($)', { def: 30000000 }), n('d', 'Contract savings rate %', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const managed = Math.max(b, c)
      const sum = a ? (managed / a) * 100 : 0
      const savings = b * (d / 100)
      return [
        res('Spend under management', pct(sum, 1), sum >= 70 ? T.good : sum >= 40 ? T.warn : T.bad, 'Best-practice SUM sits above 70%.'),
        res('In-flight savings', money(savings), savings > 0 ? T.good : T.neutral),
        res('Catalog leverage', pct(a ? (c / a) * 100 : 0, 1), a ? (c / a) * 100 >= 40 ? T.good : T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'saas-license-wastage-calculator',
    archetype: 'est',
    blurb: 'Finds unused or lightly-used SaaS seats and the money they waste.',
    fields: [n('a', 'Active licenses', { def: 350 }), n('b', 'Never-logged-in seats', { def: 40 }), n('c', 'Underweight users (<5h/mo)', { def: 60 }), n('d', 'License cost ($/seat/mo)', { def: 45 }), n('e', 'Monthly active ratio %', { def: 75 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const unused = b + c
      const waste = (unused / 2 + b / 2) * d
      const annual = waste * 12
      const recov = Math.max(0, a - (a * (e / 100)) - b)
      return [
        res('Likely wasted spend', money(annual), b + c <= a * 0.15 ? T.good : T.warn, 'Trim or reclaim seats that never log in.'),
        res('Seats in the crosshair', num(unused, 0), T.neutral),
        res('Reclaimable seats', num(recov, 0), recov > 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'vendor-tiering-and-criticality-matrix',
    archetype: 'matrix',
    blurb: 'Tiers vendors by spend and criticality to set oversight depth and risk response.',
    fields: [mx('m', 'Vendors', ['Vendor', 'Spend tier (1-4)', 'Criticality (1-4)'], ['Cloud & hosting', 'Payroll / benefits', 'Raw materials', 'Office services', 'Marketing agencies'])],
    compute: (v) => {
      const M = v.m as number[][]
      const critical = M.filter((r) => (r[1] || 0) >= 3).map((r) => r[0])
      const strategic = M.filter((r) => (r[0] || 0) >= 4).length
      return [
        res('Critical vendors', critical.join(', ') || 'None', critical.length ? T.warn : T.good, 'Tier-1 + criticality-3 vendors need active governance.'),
        res('Strategic (top spend)', num(strategic, 0), T.neutral),
        res('Oversight load', `${num(critical.length, 0)} vendors → quarterly reviews`, critical.length ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'contract-penalty-and-liquidated-damages-estimator',
    archetype: 'est',
    blurb: 'Computes liquidated damages exposure from late delivery windows and penalty rates.',
    fields: [n('a', 'Ceiling on damages ($)', { def: 500000 }), n('b', 'Daily penalty rate ($)', { def: 5000 }), n('c', 'Days late', { def: 12 }), n('d', 'Cap as % of contract', { def: 10 }), n('e', 'Contract value ($)', { def: 10000000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const accrued = b * c
      const cap = Math.min(a, e * (d / 100))
      const due = Math.min(accrued, cap)
      return [
        res('Accrued damages', money(accrued)),
        res('Applied cap', money(cap), T.neutral),
        res('Amount payable', money(due), due < a ? T.good : T.warn, due >= a ? 'Penalty hits the contract ceiling — renegotiate rates.' : 'Below ceiling.'),
        res('Days to ceiling', num(cap ? Math.ceil(cap / (b || 1)) - c : 0, 0)),
      ]
    },
  },
  {
    id: 'procurement-cycle-time-estimator',
    archetype: 'est',
    blurb: 'Breaks procurement lead time into requisition, sourcing and PO stages.',
    fields: [n('a', 'Requisition to RFQ (days)', { def: 4 }), n('b', 'Sourcing & negotiation (days)', { def: 12 }), n('c', 'Approval & PO issue (days)', { def: 3 }), n('d', 'Supplier lead time (days)', { def: 14 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const internal = a + b + c
      const total = internal + d
      return [
        res('Internal cycle', days(internal), internal <= 15 ? T.good : internal <= 25 ? T.warn : T.bad),
        res('Internal share', pct(total ? (internal / total) * 100 : 0, 0), total ? internal / total <= 0.6 ? T.good : T.warn : T.neutral, 'Sourcing drag usually dominates internal time.'),
        res('Total requisition-to-receipt', days(total)),
        res('Bottleneck stage', b >= a && b >= c && b >= d ? 'Sourcing & negotiation' : a >= b && a >= c ? 'Requisition intake' : d > internal ? 'Supplier lead time' : 'Approvals', T.neutral),
      ]
    },
  },
  {
    id: 'maverick-spend-estimator',
    archetype: 'est',
    blurb: 'Quantifies off-contract spend and the savings left on the table.',
    fields: [n('a', 'Total indirect spend ($/yr)', { def: 50000000 }), n('b', 'Maverick share %', { def: 20 }), n('c', 'Contract saving differential %', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const mav = a * (b / 100)
      const lost = mav * (c / 100)
      return [
        res('Maverick spend', money(mav), b <= 10 ? T.good : b <= 20 ? T.warn : T.bad, 'Sub-10% maverick share signals strong channel adoption.'),
        res('Savings leaked', money(lost), lost > 0 ? T.warn : T.good),
        res('Recovery opportunity', pct(lost ? (lost / a) * 100 : 0, 2), T.neutral),
      ]
    },
  },
  {
    id: 'sla-breach-financial-rebate-calculator',
    archetype: 'est',
    blurb: 'Computes service-credit rebates when an SLA falls below the guaranteed threshold.',
    fields: [n('a', 'Monthly service fee ($)', { def: 20000 }), n('b', 'Uptime actual %', { def: 97.5 }), n('c', 'SLA guarantee %', { def: 99 }), sel('d', 'Credit schedule', ['Per outage hour', 'Per 0.1% under', 'Tiered by gap'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const gap = Math.max(0, c - b)
      const credit = (v.d as string).includes('0.1%') || (v.d as string).includes('Tiered') ? Math.min(a * 0.5, Math.floor(gap * 10) * a * 0.05) : a * 0.1 * (gap > 0 ? 1 : 0)
      return [
        res('SLA gap', pct(gap, 2), gap > 0 ? T.bad : T.good),
        res('Credit due', money(credit), gap > 0 ? T.warn : T.good),
        res('Credit share of fee', pct(a ? (credit / a) * 100 : 0, 1), credit / a <= 0.5 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'cross-border-withholding-tax-wht-calculator',
    archetype: 'est',
    blurb: 'Estimates withholding tax on cross-border royalties, dividends and service fees.',
    fields: [n('a', 'Payment amount ($)', { def: 100000 }), n('b', 'Treaty rate %', { def: 10 }), n('c', 'Domestic rate %', { def: 25 }), sel('d', 'Income type', ['Dividend', 'Royalty', 'Service fee', 'Interest']), n('e', 'Foreign tax credit eligible %', { def: 50 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, e = v.e as number
      const rate = Math.min(b > 0 ? b : c, c)
      const wht = a * (rate / 100)
      const credit = wht * (e / 100)
      const netUpstream = a - wht
      return [
        res('WHT at treaty rate', money(wht), b < c ? T.good : T.warn, `${v.d as string} → treaty ${pct(rate, 0)}, domestic ${pct(c, 0)}.`),
        res('Net to recipient', money(netUpstream)),
        res('Usable foreign tax credit', money(credit), T.neutral),
        res('Effective leak', pct(a ? ((wht - credit) / a) * 100 : 0, 2), T.neutral),
      ]
    },
  },
  {
    id: 'requisition-to-pay-r2p-workflow-builder',
    archetype: 'fmt',
    blurb: 'Maps a requisition-to-pay workflow with approval gates and cycle targets.',
    fields: [txt('c', 'Company name'), n('r', 'Auto-approve under ($)', { def: 5000 }), n('d', 'Target cycle (days)', { def: 7 }), ck('i', 'Gates', ['Requisition intake', 'Sourcing & quote', 'Budget check', 'Approval routing', 'PO issue', '3-way receipt', 'Invoice & payment'])],
    compute: (v) => {
      const c = v.c as string, r = v.r as number, d = v.d as number
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'ACTIVE' : 'SKIPPED')
      const doc = `REQUISITION-TO-PAY WORKFLOW — ${c || '[Company]'}\n\n1. REQUISITION INTAKE — catalog-first ordering required. [${incl(0)}]\n2. SOURCING & QUOTE — only where no contract exists. [${incl(1)}]\n3. BUDGET CHECK — hard stop when budget < 110% of est. [${incl(2)}]\n4. APPROVAL ROUTING — auto-approve under $${num(r, 0)}; chain above. [${incl(3)}]\n5. PO ISSUE — rejected invoices require a PO. [${incl(4)}]\n6. THREE-WAY MATCH — receipt then inspect then pay. [${incl(5)}]\n7. INVOICE & PAYMENT — net terms from invoice date. [${incl(6)}]\n\nCYCLE TARGET: ${num(d, 0)} business days from requisition to PO.`
      return [res('R2P map', `${items.filter(Boolean).length}/7 gates active`, items[4] ? T.good : T.warn, 'PO-mandatory gates cut maverick spend hardest.'), docRes('Document', doc)]
    },
  },
  {
    id: 'procurement-savings-hard-vs-soft-calculator',
    archetype: 'est',
    blurb: 'Classifies procurement savings into hard cash savings versus soft cost avoidance.',
    fields: [n('a', 'Hard savings ($/yr)', { def: 1200000 }), n('b', 'Soft savings (avoidance)', { def: 600000 }), n('c', 'Total managed spend ($)', { def: 60000000 }), n('d', 'Debatable inflation offsets ($)', { def: 200000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const total = a + b + d
      const reported = c ? (total / c) * 100 : 0
      const hard = total ? (a / total) * 100 : 0
      return [
        res('Total savings claimed', money(total)),
        res('Reported savings rate', pct(reported, 2), reported >= 5 ? T.good : T.warn, 'Credible rates land at 3-10% of managed spend.'),
        res('Hard-cash share', pct(hard, 1), hard >= 50 ? T.good : T.warn, 'Auditors discount soft savings heavily.'),
        res('Savings = net of inflation', money(a + b), T.neutral),
      ]
    },
  },
  {
    id: 'supplier-sustainability-rating-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores suppliers on environmental, social and governance performance for a sourcing gate.',
    fields: [mxd('m', 'Supplier ESG', ['Area', 'Weight %', 'Score /10'], ['Emissions & energy', 'Labor & human rights', 'Ethics & compliance', 'Transparency'], [[30, 6], [30, 6], [20, 6], [20, 6]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const gate = score >= 7 ? 'Approved' : score >= 5 ? 'Conditional' : 'On watch'
      return [
        res('Sustainability score', `${numD(score, 1)}/10`, score >= 7 ? T.good : score >= 5 ? T.warn : T.bad, 'Below 5/10 blocks preferred-vendor status.'),
        res('Vendor gate', gate, T.neutral),
        res('Lowest pillar', ['Emissions & energy', 'Labor & human rights', 'Ethics & compliance', 'Transparency'][M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)], T.neutral),
      ]
    },
  },
  {
    id: 'auditor-fee-estimator',
    archetype: 'est',
    blurb: 'Benchmarks external audit fees against revenue, entity and complexity drivers.',
    fields: [n('a', 'Revenue ($/yr)', { def: 50000000 }), n('b', 'Legal entities', { def: 6 }), n('c', 'Bank / cash accounts', { def: 14 }), sel('d', 'Complexity', ['Simple services', 'Manufacturing', 'Listed / regulated', 'Multi-currency group']), n('e', 'SOX / internal audit add-on ($)', { def: 150000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, e = v.e as number
      const mult = (v.d as string).startsWith('Simple') ? 0.0009 : (v.d as string).startsWith('Manufacturing') ? 0.0012 : (v.d as string).startsWith('Listed') ? 0.002 : 0.0015
      const fee = a * mult + b * 12000 + c * 4500 + e
      return [
        res('Estimated audit fee', money(fee), e ? a * mult / fee <= 0.6 ? T.good : T.warn : T.neutral),
        res('Fee as % of revenue', pct(a ? (fee / a) * 100 : 0, 3)),
        res('Entity add-on drivers', `$${num(b * 12000 + c * 4500, 0)} from scope`, T.neutral),
      ]
    },
  },
  {
    id: 'corporate-gift-and-hospitality-expense-log',
    archetype: 'log',
    blurb: 'Logs gifts and hospitality to keep spend inside policy thresholds and disclosure limits.',
    fields: [mx('m', 'Gift log', ['Quarter', 'Gifts given', 'Total value ($)'], ['Q1', 'Q2', 'Q3', 'Q4']), n('c', 'Policy limit / recipient ($)', { def: 100 })],
    compute: (v) => {
      const M = v.m as number[][]
      const given = M.reduce((s, r) => s + (r[0] || 0), 0)
      const value = M.reduce((s, r) => s + (r[1] || 0), 0)
      const avg = given ? value / given : 0
      const over = M.filter((r) => given && (r[1] || 0) / r[0] > (v.c as number)).length
      return [
        res('Gifts given', num(given, 0)),
        res('Total value', money(value), over > 0 ? T.warn : T.good, 'Log every gift for disclosure and audit.'),
        res('Avg value / gift', money(avg), avg <= (v.c as number) ? T.good : T.bad, `Policy cap ${money(v.c as number)}/recipient.`),
        res('Periods over cap', num(over, 0), over ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'corporate-credit-card-expense-policy-builder',
    archetype: 'fmt',
    blurb: 'Assembles a card expense policy with limits, required receipts and approval gates.',
    fields: [txt('c', 'Company name'), n('a', 'Single-transaction limit ($)', { def: 5000 }), n('b', 'Receipt threshold ($)', { def: 75 }), sel('p', 'Approval model', ['Auto-approve', 'Manager review', 'Travel desk review']), ck('i', 'Policy sections', ['Eligible expenses', 'Prohibited purchases', 'Personal-use rules', 'Receipt deadlines', 'Card misuse enforcement'])],
    compute: (v) => {
      const c = v.c as string, a = v.a as number, b = v.b as number, p = v.p as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'MISSING')
      const doc = `CORPORATE CARD EXPENSE POLICY — ${c || '[Company]'}\n\n1. ELIGIBLE EXPENSES — business travel, client entertainment, approved software. [${incl(0)}]\n2. PROHIBITED — personal purchases, cash advances unless pre-approved, gifts over limit. [${incl(1)}]\n3. PERSONAL USE — any personal charge must be repaid within 7 days. [${incl(2)}]\n4. RECEIPTS — required above $${num(b, 0)}; itemized within 14 days. [${incl(3)}]\n5. MISUSE — card revoked; disciplinary review. [${incl(4)}]\n\nLIMITS: single transaction $${num(a, 0)}; auto-route exceptions to finance.\nAPPROVAL: ${p}.`
      return [res('Card policy', `${items.filter(Boolean).length}/5 sections`, items[3] ? T.good : T.warn, 'Receipt deadlines drive clean audits.'), docRes('Document', doc)]
    },
  },
  {
    id: 'accounts-payable-aging-schedule-formatter',
    archetype: 'matrix',
    blurb: 'Builds an AP aging schedule with current, 30-60-90 and overdue buckets.',
    fields: [mx('m', 'AP aging', ['Bucket', 'Invoices', 'Amount ($)'], ['Current', '1-30 days', '31-60 days', '61-90 days', 'Over 90'])],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[1] || 0), 0)
      const overdue = (M[2]?.[1] || 0) + (M[3]?.[1] || 0) + (M[4]?.[1] || 0)
      const beyond = (M[3]?.[1] || 0) + (M[4]?.[1] || 0)
      const ovr = total ? (overdue / total) * 100 : 0
      return [
        res('Total payables', money(total)),
        res('Overdue share', pct(ovr, 1), ovr <= 10 ? T.good : ovr <= 25 ? T.warn : T.bad),
        res('60+ risk', money(beyond), beyond > 0 ? T.warn : T.good, 'Aging past 60 days strains supplier terms.'),
        res('Invoice velocity', num(M.reduce((s, r) => s + (r[0] || 0), 0), 0)),
      ]
    },
  },
  {
    id: 'accounts-receivable-aging-schedule-formatter',
    archetype: 'matrix',
    blurb: 'Builds an AR aging schedule and projects collectibility by bucket.',
    fields: [mx('m', 'AR aging', ['Bucket', 'Invoices', 'Amount ($)'], ['Current', '1-30 days', '31-60 days', '61-90 days', 'Over 90'])],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[1] || 0), 0)
      const over = M.reduce((s, r, i) => (i >= 2 ? s + (r[1] || 0) : s), 0)
      const collect = (M[0]?.[1] || 0) * 0.98 + (M[1]?.[1] || 0) * 0.9 + (M[2]?.[1] || 0) * 0.75 + (M[3]?.[1] || 0) * 0.5 + (M[4]?.[1] || 0) * 0.25
      return [
        res('Total receivables', money(total)),
        res('Expected collection', money(collect), T.neutral),
        res('Past-30 share', pct(total ? (over / total) * 100 : 0, 1), over / (total || 1) <= 0.2 ? T.good : over / (total || 1) <= 0.4 ? T.warn : T.bad),
        res('Allowance needed', money(total - collect), over > 0 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'bad-debt-reserve-calculator',
    archetype: 'est',
    blurb: 'Sizes the allowance for doubtful accounts from aging-based write-off expectations.',
    fields: [n('a', 'Total AR ($)', { def: 8000000 }), n('b', 'Historical write-off %', { def: 2.5 }), n('c', 'Over 90-day balance ($)', { def: 600000 }), n('d', 'Recovery on written-off %', { def: 15 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const base = a * (b / 100)
      const spike = c * 0.4
      const reserve = base + spike
      const net = reserve * (1 - d / 100)
      return [
        res('Reserve estimate', money(reserve), reserve / (a || 1) <= (b + 4) / 100 ? T.good : T.warn),
        res('Net write-off expectation', money(net), T.neutral),
        res('Reserve coverage', pct(a ? (reserve / a) * 100 : 0, 2), T.neutral),
        res('90-day spike loading', money(spike), c < a * 0.1 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'early-payment-discount-2-10-net-30-calculator',
    archetype: 'est',
    blurb: 'Annuizes the cost or benefit of early-payment discount terms and late payment.',
    fields: [n('a', 'Invoice amount ($)', { def: 50000 }), n('b', 'Discount %', { def: 2 }), n('c', 'Discount window (days)', { def: 10 }), n('d', 'Net due (days)', { def: 30 }), n('e', 'Company WACC %', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const gap = d - c
      const annualRate = gap ? (b / (100 - b)) * (365 / gap) * 100 : 0
      const save = a * (b / 100)
      const cost = a * (e / 100) * (gap / 365)
      return [
        res('Effective annual discount rate', pct(annualRate, 1), annualRate >= e * 2 ? T.good : T.warn, 'Turning down 2/10 net 30 is like borrowing at that rate.'),
        res('Immediate saving', money(save)),
        res('Cost of financing 20 days', money(cost)),
        res('Net benefit to discount', money(save - cost), save >= cost ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'inventory-holding-cost-calculator',
    archetype: 'est',
    blurb: 'Quantifies annual holding cost per unit from capital, storage, insurance and obsolescence.',
    fields: [n('a', 'Unit cost ($)', { def: 40 }), n('b', 'Annual units held', { def: 5000 }), n('c', 'Capital cost %', { def: 8 }), n('d', 'Storage & handling % of value', { def: 6 }), n('e', 'Obsolescence %', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const costPct = c + d + e
      const perUnit = a * (costPct / 100)
      const annual = perUnit * b
      return [
        res('Annual holding cost', money(annual), costPct <= 18 ? T.good : costPct <= 25 ? T.warn : T.bad, `${pct(costPct, 1)} of average value — typical is 15-25%.`),
        res('Holding cost per unit', moneyC(perUnit)),
        res('Cost as % of value', pct(costPct, 1), T.neutral),
      ]
    },
  },
  {
    id: 'economic-order-quantity-eoq-calculator',
    archetype: 'est',
    blurb: 'Finds the order quantity that minimizes the combined ordering and holding cost.',
    fields: [n('a', 'Annual demand (units)', { def: 12000 }), n('b', 'Order cost ($)', { def: 80 }), n('c', 'Holding cost per unit ($/yr)', { def: 2.4 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const eoq = c ? Math.sqrt((2 * a * b) / c) : 0
      const orders = eoq ? a / eoq : 0
      const total = eoq ? (a / eoq) * b + (eoq / 2) * c : 0
      return [
        res('Economic order quantity', num(eoq, 0), eoq > 0 ? T.good : T.warn, 'Order this many units per replenishment.'),
        res('Orders per year', numD(orders, 1)),
        res('Total annual cost', money(total)),
        res('Order cycle', days(365 / Math.max(1, orders))),
      ]
    },
  },
  {
    id: 'safety-stock-and-reorder-point-calculator',
    archetype: 'est',
    blurb: 'Sizes safety stock from demand variability and lead time, then sets the reorder point.',
    fields: [n('a', 'Average daily demand', { def: 120 }), n('b', 'Lead time (days)', { def: 21 }), n('c', 'Demand std dev/day', { def: 30 }), n('d', 'Lead-time std dev (days)', { def: 3 }), sel('e', 'Service level', ['90% (z=1.28)', '95% (z=1.65)', '97.5% (z=1.96)', '99% (z=2.33)'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const z = (v.e as string).includes('90%') ? 1.28 : (v.e as string).includes('95') ? 1.65 : (v.e as string).includes('97') ? 1.96 : 2.33
      const safety = Math.round(z * Math.sqrt(b * c * c + a * a * d * d))
      const rop = Math.round(a * b + safety)
      const stockDays = safety / (a || 1)
      return [
        res('Safety stock', num(safety, 0), stockDays <= 10 ? T.good : stockDays <= 20 ? T.warn : T.warn, `≈ ${numD(stockDays, 1)} days of demand cover.`),
        res('Reorder point', num(rop, 0)),
        res('Cycle coverage', days(rop / (a || 1))),
      ]
    },
  },
  {
    id: 'petty-cash-reconciler-and-vault-log',
    archetype: 'log',
    blurb: 'Reconciles the petty cash tin across vouchers, receipts and the float.',
    fields: [mx('m', 'Petty cash log', ['Month', 'Vouchers', 'Paid out ($)'], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']), n('f', 'Float amount ($)', { def: 500 })],
    compute: (v) => {
      const M = v.m as number[][]
      const f = v.f as number
      const paid = M.reduce((s, r) => s + (r[1] || 0), 0)
      const remaining = f - paid
      const vouchers = M.reduce((s, r) => s + (r[0] || 0), 0)
      return [
        res('Vouchers issued', num(vouchers, 0)),
        res('Total paid out', money(paid), paid <= f ? T.good : T.bad),
        res('Remaining in tin', money(remaining), remaining >= 0 ? T.good : T.bad, remaining < 0 ? 'Replenish — float overdrawn.' : 'Vault balance reconciles.'),
        res('Avg voucher', money(paid / (vouchers || 1))),
      ]
    },
  },
  {
    id: 'transfer-pricing-risk-estimator',
    archetype: 'est',
    blurb: 'Scores transfer pricing audit risk from entity margins, intercompany flows and documentation.',
    fields: [n('a', 'Intercompany margin %', { def: 4 }), n('b', 'Peer arm\'s-length range (low %)', { def: 2 }), n('c', 'Peer range (high %)', { def: 10 }), n('d', 'Intercompany sales share %', { def: 35 }), sel('e', 'Documentation status', ['Full TP study', 'Local file only', 'None prepared'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const inside = a >= b && a <= c
      const doc = v.e as string
      let risk = 0
      if (!inside) risk += 40
      if (d > 50) risk += 30
      else if (d > 25) risk += 15
      if (doc === 'None prepared') risk += 30
      else if (doc === 'Local file only') risk += 10
      risk = Math.min(95, risk)
      return [
        res('Audit risk', pct(risk, 0), risk >= 60 ? T.bad : risk >= 30 ? T.warn : T.good, inside ? 'Margin sits inside arm\'s-length range.' : 'Margin outside the peer range — justify.'),
        res('Margin position', `${pct(a, 2)} vs ${pct(b, 0)}-${pct(c, 0)}`, inside ? T.good : T.bad),
        res('Intercompany share', pct(d, 1), d <= 25 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'letter-of-credit-lc-cost-calculator',
    archetype: 'est',
    blurb: 'Estimates total LC cost across issuance, negotiation and interest during the route.',
    fields: [n('a', 'LC face amount ($)', { def: 250000 }), n('b', 'Issuance fee %', { def: 0.2 }), n('c', 'Negotiation fee %', { def: 0.15 }), n('d', 'Days outstanding', { def: 60 }), n('e', 'Financing rate %', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const fees = a * ((b + c) / 100)
      const interest = a * (e / 100) * (d / 365)
      const total = fees + interest
      return [
        res('Total LC cost', money(total)),
        res('Fee component', money(fees)),
        res('Financing component', money(interest)),
        res('Cost as % of face', pct(total ? (total / a) * 100 : 0, 3), total / a <= 0.012 ? T.good : T.warn, 'Expect 0.5-1.5% all-in for a 60-day LC.'),
      ]
    },
  },
  {
    id: 'escrow-service-fee-estimator',
    archetype: 'est',
    blurb: 'Projects escrow fees from deposit amount, holding period and bank-rate schedules.',
    fields: [n('a', 'Escrow amount ($)', { def: 1000000 }), n('b', 'Holding period (months)', { def: 6 }), n('c', 'Setup fee ($)', { def: 500 }), sel('d', 'Fee schedule', ['Flat + % per quarter', 'Flat monthly', '% of balance for full term'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const quarters = Math.ceil(b / 3)
      const custody = (v.d as string).includes('monthly') ? a * 0.0008 * b : (v.d as string).includes('term') ? a * 0.0015 : c + a * 0.0005 * quarters
      const total = c + custody
      return [
        res('Escrow fees', money(total)),
        res('Custody charge', money(custody)),
        res('All-in as % of deposit', pct(total ? (total / a) * 100 : 0, 3), total / a <= 0.005 ? T.good : T.warn, 'Below 0.5% of deposit is typical for simple holdings.'),
      ]
    },
  },
  {
    id: 'corporate-treasury-yield-calculator',
    archetype: 'est',
    blurb: 'Projects a treasury portfolio’s yield on cash held across tenors.',
    fields: [n('a', 'Cash balance ($)', { def: 30000000 }), n('b', 'Base money-market rate %', { def: 3.5 }), n('c', 'Alpha from laddering (basis pts)', { def: 60 }), sel('d', 'Ladder profile', ['Fully overnight', '30-day ladder', '90-day ladder', 'Bond ladder 1-2yr'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const tenorAdj = (v.d as string).includes('90') ? 0.35 : (v.d as string).includes('30') ? 0.9 : (v.d as string).includes('1-2yr') ? 1.4 : 0
      const yieldRate = b + c / 100 + tenorAdj
      const annual = a * (yieldRate / 100)
      const monthly = annual / 12
      return [
        res('Effective yield', pct(yieldRate, 2), tenorAdj >= 0 ? T.good : T.warn, 'Lengthening tenor adds yield but liquidity risk.'),
        res('Annual interest income', money(annual)),
        res('Monthly accrual', money(monthly)),
      ]
    },
  },
  {
    id: 'foreign-exchange-fx-exposure-hedging-calculator',
    archetype: 'conv',
    blurb: 'Converts a receivable between currencies at spot, with a forward-hedged variant.',
    fields: [n('a', 'Foreign amount', { def: 1000000 }), sel('from', 'From', ['USD', 'EUR', 'GBP', 'JPY'], 'EUR'), sel('to', 'To', ['USD', 'EUR', 'GBP', 'JPY'], 'USD'), n('f', 'Spot rate (per 1 unit)', { def: 1.1 }), n('d', 'Volatility % over horizon', { def: 6 }), n('e', 'Cost of hedging %', { def: 1.5 })],
    compute: (v) => {
      const a = v.a as number, f = v.f as number, d = v.d as number, e = v.e as number
      const from = v.from as string, to = v.to as string
      const swapped = from === to
      const conv = swapped ? a : a * f
      const hedgeCost = conv * (e / 100)
      const hedged = conv - hedgeCost
      const worst = conv * (1 - d / 100)
      return [
        res(`${from} → ${to}`, money(conv), T.neutral, 'Baked rate is your entered spot; the unit pair shows direction.'),
        res('Forward-hedged proceeds', money(hedged), hedged >= worst ? T.good : T.warn, hedged >= worst ? 'Hedge beats unhinged worst case.' : 'Hedge costs more than the likely move.'),
        res('Unhedged worst case', money(worst), T.neutral),
        res('Hedge cost', money(hedgeCost), T.neutral),
      ]
    },
  },
  {
    id: 'value-at-risk-var-financial-estimator',
    archetype: 'est',
    blurb: 'Approximates daily or monthly value at risk on a portfolio position.',
    fields: [n('a', 'Portfolio value ($)', { def: 100000000 }), n('b', 'Daily volatility %', { def: 1.5 }), n('c', 'Confidence level', { def: 95 }), n('d', 'Horizon (days)', { def: 10 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const z = (v => v >= 99 ? 2.33 : v >= 97 ? 1.96 : v >= 95 ? 1.65 : 1.28)(c)
      const var1 = a * (b / 100) * z * Math.sqrt(d)
      const pctVar = a ? (var1 / a) * 100 : 0
      return [
        res(`Value at Risk (${c}%${d}d)`, money(var1), pctVar <= 5 ? T.good : pctVar <= 10 ? T.warn : T.bad, 'Parametric estimate; stress tests may be higher.'),
        res('Distance to limit', `${numD(10 - pctVar, 2)} pts`),
        res('Annualized vol', pct(b * Math.sqrt(252), 1), T.neutral),
      ]
    },
  },
  {
    id: 'company-credit-rating-estimation-matrix',
    archetype: 'scorecard',
    blurb: 'Estimates a credit rating band from leverage, coverage, liquidity and profitability scores.',
    fields: [mxd('m', 'Credit factors', ['Factor', 'Weight %', 'Score /10'], ['Leverage (Debt/EBITDA)', 'Interest coverage', 'Liquidity', 'Profitability'], [[30, 6], [25, 6], [20, 6], [25, 6]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const band = score >= 8 ? 'A / A-' : score >= 6.5 ? 'BBB / BB+' : score >= 5 ? 'BB / B+' : score >= 3 ? 'B / CCC' : 'D / distress'
      return [
        res('Credit score', `${numD(score, 2)}/10`, T.neutral),
        res('Estimated rating band', band, score >= 6.5 ? T.good : score >= 5 ? T.warn : T.bad, 'Use actual financials for a formal assessment.'),
        res('Leverage flag', M[0]?.[1] >= 7 ? 'Healthy' : 'Caution', M[0]?.[1] >= 7 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'total-cost-of-ownership-tco-calculator',
    archetype: 'est',
    blurb: 'Sums acquisition price, running costs and disposal to show true total cost of ownership.',
    fields: [n('a', 'Purchase / setup cost ($)', { def: 100000 }), n('b', 'Annual operating cost ($/yr)', { def: 25000 }), n('c', 'Life (years)', { def: 6 }), n('d', 'Financing cost (total $)', { def: 12000 }), n('e', 'Residual value ($)', { def: 15000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const tco = a + b * c + d - e
      const perYear = tco / (c || 1)
      return [
        res('Total cost of ownership', money(tco)),
        res('Cost per year', money(perYear), b <= a * 0.2 ? T.good : T.warn, 'Operating costs above 20% of purchase price inflate TCO fast.'),
        res('Operating share', pct(tco ? ((b * c) / tco) * 100 : 0, 1), T.neutral),
        res('Residual recovery', pct(a ? (e / a) * 100 : 0, 1), e >= a * 0.2 ? T.good : T.warn),
      ]
    },
  },
]