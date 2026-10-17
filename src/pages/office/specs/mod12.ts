import { ck, clamp, doc as docRes, dt, money, mxd, n, num, numD, pct, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec, Tone } from '../archetypes/spec'

const tonePct = (x: number, hi: number, lo: number): Tone => (x >= hi ? T.good : x >= lo ? T.warn : T.bad)

export const specs: OfficeToolSpec[] = [
  // ---------------- Environmental ----------------
  {
    id: 'corporate-greenhouse-gas-ghg-scope-1-2-3-calculator',
    archetype: 'est',
    blurb: 'Totals Scope 1, 2 and 3 emissions and classifies the footprint against a benchmark.',
    fields: [n('s1', 'Scope 1 (t CO2e)', { def: 4200 }), n('s2', 'Scope 2 (t CO2e)', { def: 3100 }), n('s3', 'Scope 3 (t CO2e)', { def: 9800 }), n('ra', 'Revenue ($M)', { def: 250 })],
    compute: (v) => {
      const s1 = v.s1 as number, s2 = v.s2 as number, s3 = v.s3 as number, ra = v.ra as number
      const total = s1 + s2 + s3
      const intensity = ra > 0 ? total / ra : 0
      return [
        res('Total emissions', `${num(total)} t CO2e`, T.neutral),
        res('Scope 1 share', pct((s1 / Math.max(1, total)) * 100, 1), s1 > s2 ? T.warn : T.good),
        res('Scope 2 share', pct((s2 / Math.max(1, total)) * 100, 1), T.neutral),
        res('Scope 3 share', pct((s3 / Math.max(1, total)) * 100, 1), s3 > 0.6 * total ? T.warn : T.good),
        res('Intensity per $M', `${numD(intensity, 1)} t/$M`, intensity > 80 ? T.bad : intensity > 50 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'office-carbon-offset-cost-estimator',
    archetype: 'est',
    blurb: 'Estimates the annual cost of offsetting the office carbon footprint.',
    fields: [n('ghg', 'Office emissions (t CO2e/yr)', { def: 860 }), n('px', 'Offset price ($/t)', { def: 25 }), sel('m', 'Offset type', ['Verified carbon standard', 'Gold Standard', 'Nature-based (REDD+)', 'Community cookstoves']), n('g', 'Target reduction factor (%)', { def: 100 })],
    compute: (v) => {
      const ghg = v.ghg as number, px = v.px as number, g = v.g as number
      const offset = (ghg * g) / 100
      const cost = Math.max(0, offset) * px
      const admin = cost * 0.12
      return [
        res('Offset required', `${num(offset)} t CO2e`),
        res('Credit cost', money(cost), g >= 100 ? T.good : T.warn, 'At ' + numD(px, 0) + '/t on ' + num(g, 0) + '% of footprint.'),
        res('Admin & verification', money(admin), T.neutral),
        res('Total programme', money(cost + admin), T.neutral),
      ]
    },
  },
  {
    id: 'office-paperless-transition-metric',
    archetype: 'est',
    blurb: 'Measures how far the office has moved to digital over paper processes.',
    fields: [n('p', 'Paper sheets used last month', { def: 18000 }), n('pp', 'Paper sheets, prior month baseline', { def: 42000 }), n('c', 'Digital workflow adoption (%)', { def: 55 }), sel('t', 'Print fleet status', ['Few shared printers', 'Per-person printers', 'Print room only'])],
    compute: (v) => {
      const p = v.p as number, pp = v.pp as number, c = v.c as number, t = v.t as string
      const drop = pp > 0 ? (1 - p / pp) * 100 : 0
      const score = clamp((drop * 0.6 + c * 0.4), 0, 100)
      return [
        res('Paperless metric', `${numD(score, 1)} / 100`, tonePct(score, 70, 40), drop >= 0 ? 'Reduction is real.' : 'Paper use rose vs baseline.'),
        res('Month-over-month drop', pct(drop, 1), drop >= 20 ? T.good : drop >= 5 ? T.warn : T.bad),
        res('Digital adoption', pct(clamp(c, 0, 100), 1), c >= 60 ? T.good : T.warn),
        res('Print fleet', t, t === 'Few shared printers' ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'corporate-energy-star-rating-estimator',
    archetype: 'est',
    blurb: 'Estimates an ENERGY STAR 1-100 score from EUI and floor area.',
    fields: [n('d', 'Floor area (sq ft)', { def: 120000 }), n('k', 'Annual energy (kWh)', { def: 3400000 }), n('g', 'Gas (therms)', { def: 0 }), sel('s', 'Property type', ['Office', 'Retail', 'Warehouse', 'Multifamily', 'Bank branch'])],
    compute: (v) => {
      const d = v.d as number, k = v.k as number, g = v.g as number, s = v.s as string
      const eui = (k / 3.412 + g * 29.3) / Math.max(1, d / 1000)
      const base = s === 'Office' ? 68 : s === 'Retail' ? 74 : s === 'Warehouse' ? 41 : s === 'Bank branch' ? 72 : 62
      const lazyScore = Math.round(clamp(base + (70 - eui) * 1.4, 1, 100))
      return [
        res('Energy Star score', `${lazyScore} / 100`, tonePct(lazyScore, 75, 50), 'Proxy rec for properties < 5 years old.'),
        res('EUI', `${numD(eui, 1)} kBtu/sf/yr`, eui <= 55 ? T.good : eui <= 85 ? T.warn : T.bad),
        res('Annual energy spend', money((k + g * 29.3) * 0.115), T.neutral),
        res('Benchmark group', s, T.neutral),
      ]
    },
  },
  {
    id: 'sustainable-supply-chain-audit-matrix',
    archetype: 'matrix',
    blurb: 'Audits suppliers against sustainability gates across emissions, materials and labour.',
    fields: [mxd('m', 'Suppliers', ['Supplier', 'Emissions plan', 'Material cert', 'Labour audit', 'Water use'], ['Tier 1', 'Tier 2', 'Tier 3'], [[1, 1, 1, 0], [1, 0, 1, 0], [0, 0, 0, 0]]), n('tot', 'Total tier-1 suppliers', { def: 5 })],
    compute: (v) => {
      const M = v.m as number[][]
      const pass = M.filter((r) => (r[0] || 0) && (r[1] || 0) && (r[2] || 0)).length
      const coverage = Math.min(100, (M.length / Math.max(1, v.tot as number)) * 100)
      return [
        res('Full-passing suppliers', `${pass} of ${M.length}`, pass === M.length ? T.good : pass >= 2 ? T.warn : T.bad),
        res('Audit coverage', pct(coverage, 1), coverage >= 60 ? T.good : T.warn),
        res('Gaps to close', `${M.filter((r) => !(r[2] || 0)).length}`, T.neutral, 'Material certification is the weakest gate.'),
        res('Water flagged', `${M.filter((r) => !(r[3] || 0)).length}`, T.neutral),
      ]
    },
  },
  {
    id: 'corporate-water-footprint-calculator',
    archetype: 'est',
    blurb: 'Estimates the company water footprint from operations and supply chains.',
    fields: [n('c', 'Cooling & cleaning (m3/yr)', { def: 24000 }), n('p', 'Production water (m3/yr)', { def: 60000 }), n('s', 'Supply chain water (m3/yr)', { def: 140000 }), n('w', 'Water-stressed sites (%)', { def: 18 })],
    compute: (v) => {
      const c = v.c as number, p = v.p as number, s = v.s as number, w = v.w as number
      const total = c + p + s
      const stressed = (total * w) / 100
      return [
        res('Total footprint', `${num(total)} m3/yr`, T.neutral),
        res('Direct water', `${num(c + p)} m3`, c + p > s ? T.warn : T.good),
        res('In stressed basins', `${num(stressed)} m3`, w > 25 ? T.bad : w > 15 ? T.warn : T.good),
        res('Scope share', pct((s / Math.max(1, total)) * 100, 1), s / Math.max(1, total) > 0.5 ? T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'eco-friendly-office-commute-ratio',
    archetype: 'est',
    blurb: 'Calculates the share of commutes that are low-carbon and flags improvement room.',
    fields: [n('c', 'Car commuters', { def: 90 }), n('p', 'Public transit commuters', { def: 60 }), n('b', 'Bike / walk commuters', { def: 25 }), n('t', 'Telework days per week, average', { def: 1.5 })],
    compute: (v) => {
      const c = v.c as number, p = v.p as number, b = v.b as number, t = v.t as number
      const workers = c + p + b
      const green = p + b + (t / 5) * workers
      const ratio = Math.min(100, (green / Math.max(1, workers)) * 100)
      return [
        res('Low-carbon commute ratio', pct(ratio, 1), tonePct(ratio, 50, 30)),
        res('Car dependancy', pct((c / Math.max(1, workers)) * 100, 1), c / Math.max(1, workers) > 0.6 ? T.bad : T.warn),
        res('Telework lift', `≈ ${numD((t / 5) * 100, 1)}% of roles`, t >= 2 ? T.good : T.warn),
        res('Modal mix', `${num(c + p + b)} workers`, T.neutral),
      ]
    },
  },
  {
    id: 'single-use-plastic-office-audit-log',
    archetype: 'log',
    blurb: 'Logs single-use plastic items by zone to target replacement.',
    fields: [mxd('m', 'Zones', ['Zone', 'Water bottles', 'Cups & cutlery', 'Food wrappers'], ['Kitchen', 'Meeting rooms', 'Desks', 'Events / lobby'], [[180, 320, 140], [40, 260, 60], [60, 120, 80], [90, 200, 260]]), n('t', 'Target monthly items', { def: 200 })],
    compute: (v) => {
      const M = v.m as number[][]
      const bottles = M.reduce((s, r) => s + (r[0] || 0), 0)
      const cups = M.reduce((s, r) => s + (r[1] || 0), 0)
      const wrap = M.reduce((s, r) => s + (r[2] || 0), 0)
      const total = bottles + cups + wrap
      return [
        res('Total single-use items', `${num(total)} / mo`, total <= (v.t as number) ? T.good : T.bad),
        res('Bottles', `${num(bottles)}`, T.neutral),
        res('Cups & cutlery', `${num(cups)}`, T.neutral),
        res('Wrap', `${num(wrap)}`, T.neutral),
        res('Top zone', ['Kitchen', 'Meeting rooms', 'Desks', 'Events / lobby'][Math.max(0, M.findIndex((r) => r.reduce((a, x) => a + (x || 0), 0) === Math.max(...M.map((r2) => r2.reduce((a, x) => a + (x || 0), 0)))))]),
      ]
    },
  },
  {
    id: 'renewable-energy-certificate-rec-calculator',
    archetype: 'est',
    blurb: 'Calculates how many RECs are needed to match office electricity consumption.',
    fields: [n('k', 'Annual electricity (MWh)', { def: 3400 }), n('r', 'Green power procured (MWh)', { def: 900 }), n('px', 'REC price ($/MWh)', { def: 2.5 }), sel('m', 'Market mechanism', ['Unbundled RECs', 'Green tariff', 'PPA (physical)'])],
    compute: (v) => {
      const k = v.k as number, r = v.r as number, px = v.px as number, m = v.m as string
      const re = Math.max(0, k - r)
      const cost = re * px
      const cover = Math.min(100, (r / Math.max(1, k)) * 100)
      return [
        res('RECs to retire', `${num(re)}`, re === 0 ? T.good : T.warn, m === 'PPA (physical)' ? 'PPA also counts as wholesale REC.' : 'Retire in registry before reporting.'),
        res('Green coverage', pct(cover, 1), tonePct(cover, 100, 40)),
        res('REC budget', money(cost), T.neutral),
        res('Mechanism', m, T.neutral),
      ]
    },
  },
  {
    id: 'office-recycling-bin-density-allocator',
    archetype: 'bdown',
    blurb: 'Right-sizes recycling and waste bins across floors and zones.',
    fields: [mxd('m', 'Areas', ['Area', 'Waste (L/day)', 'Recycling (L/day)'], ['Open seating', 'Meeting floors', 'Kitchen', 'Reception'], [[120, 90], [180, 160], [240, 300], [60, 50]]), n('cap', 'Bin capacity chosen (L)', { def: 80 })],
    compute: (v) => {
      const M = v.m as number[][]
      const cap = v.cap as number
      return [
        res('Waste stream', `${num(M.reduce((s, r) => s + (r[0] || 0), 0))} L/day`, T.neutral),
        res('Recycling stream', `${num(M.reduce((s, r) => s + (r[1] || 0), 0))} L/day`, T.neutral),
        res('Bins needed', `${num(Math.ceil(M.reduce((s, r) => s + (r[0] || 0) + (r[1] || 0), 0) / cap))} × ${num(cap)} L`, T.neutral),
        res('Density check', `${numD(M.reduce((s, r) => s + (r[1] || 0), 0) / Math.max(1, M.reduce((s, r) => s + (r[0] || 0), 0)), 2)} recycle:1 waste`, M.reduce((s, r) => s + (r[1] || 0), 0) >= M.reduce((s, r) => s + (r[0] || 0), 0) ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'circular-economy-resource-reusability-index',
    archetype: 'est',
    blurb: 'Scores how much office material is reusable, repairable or compostable.',
    fields: [n('i', 'Inputs diverted (kg)', { def: 420 }), n('o', 'Outputs to landfill (kg)', { def: 180 }), n('l', 'Lifetime share reused (%)', { def: 30 }), sel('f', 'Recovery model', ['On-site separation', 'Vendor take-back', 'Muni program'])],
    compute: (v) => {
      const i = v.i as number, o = v.o as number, l = v.l as number, f = v.f as string
      const divert = (i / Math.max(1, i + o)) * 100
      const reuse = clamp(divert * 0.6 + l * 0.4, 0, 100)
      return [
        res('Circularity index', pct(clamp(reuse, 0, 100), 1), tonePct(reuse, 60, 35)),
        res('Diverted share', pct(divert, 1), divert >= 60 ? T.good : T.warn),
        res('Reuse rate', pct(clamp(l, 0, 100), 1), l >= 40 ? T.good : T.warn),
        res('Recovery model', f, f === 'Vendor take-back' ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'green-building-leed-point-estimator',
    archetype: 'est',
    blurb: 'Estimates LEED points from a quick design intent and flags certification band.',
    fields: [n('w', 'Water efficiency features', { def: 6 }), n('e', 'Energy intensity score', { def: 8 }), n('m', 'Materials & resources', { def: 7 }), n('q', 'IEQ features', { def: 9 }), n('s', 'Sustainable sites', { def: 5 })],
    compute: (v) => {
      const w = v.w as number, e = v.e as number, m = v.m as number, q = v.q as number, s = v.s as number
      const pts = clamp(w + e + m + q + s, 0, 100)
      return [
        res('LEED points', `${num(pts)} / 100`, tonePct(pts, 80, 50)),
        res('Certification band', pts >= 80 ? 'Platinum' : pts >= 60 ? 'Gold' : pts >= 50 ? 'Silver' : pts >= 40 ? 'Certified' : 'Below threshold', pts >= 50 ? T.good : T.bad),
        res('Energy pillar', `${num(e)} pts`, e >= 8 ? T.good : T.warn),
        res('Water pillar', `${num(w)} pts`, w >= 5 ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'corporate-ethical-sourcing-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores suppliers on ethical sourcing traits with a weighted matrix.',
    fields: [mxd('m', 'Criteria', ['Criterion', 'Weight %', 'Score 0-10'], ['Labour standards', 'Human rights', 'Anti-corruption', 'Traceability'], [[25, 8], [30, 7], [20, 9], [25, 6]]), sel('o', 'Overall assessment', ['Pass', 'Conditional', 'Fail'])],
    compute: (v) => {
      const M = v.m as number[][]
      const weighted = M.reduce((s, r) => s + (r[1] || 0) * ((r[0] || 0) / 100), 0)
      return [
        res('Weighted score', `${numD(weighted, 1)} / 10`, weighted >= 8 ? T.good : weighted >= 6 ? T.warn : T.bad),
        res('Lowest pillar', `${num(Math.min(...M.map((r) => r[1] || 0)), 1)} / 10`, Math.min(...M.map((r) => r[1] || 0)) >= 6 ? T.good : T.warn),
        res('Assessment', (v.o as string), (v.o as string) === 'Pass' ? T.good : (v.o as string) === 'Conditional' ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'office-indoor-plant-oxygen-output-estimator',
    archetype: 'est',
    blurb: 'Estimates oxygen contribution and air-quality pressure from office plants.',
    fields: [n('g', 'Large-leaf plants', { def: 24 }), n('s', 'Small table plants', { def: 60 }), n('a', 'Office area (m2)', { def: 450 }), sel('sp', 'Species mix', ['Mostly pothos & philodendron', 'Mostly snake & ZZ', 'Mixed tropical'])],
    compute: (v) => {
      const g = v.g as number, s = v.s as number, a = v.a as number, sp = v.sp as string
      const oxygen = g * 22 + s * 8
      const perM2 = oxygen / Math.max(1, a)
      return [
        res('Daily O2 output', `${num(oxygen)} g/day`, perM2 >= 2 ? T.good : T.warn),
        res('Coverage pressure', `${numD(perM2, 1)} g/m2`, perM2 >= 2 ? T.good : T.neutral, sp === 'Mostly snake & ZZ' ? 'Low-maintenance but lower O2 output.' : T.neutral),
        res('Plants total', `${num(g + s)}`, T.neutral),
      ]
    },
  },
  {
    id: 'corporate-carbon-tax-exposure-estimator',
    archetype: 'est',
    blurb: 'Estimates the company bill under a carbon price on direct emissions.',
    fields: [n('e', 'Taxable emissions (t CO2e)', { def: 26000 }), n('r', 'Carbon price ($/t)', { def: 50 }), n('g', 'Free allowance (%)', { def: 10 }), sel('j', 'Jurisdiction', ['EU ETS / CBAM', 'North America', 'Asia-Pacific'])],
    compute: (v) => {
      const e = v.e as number, r = v.r as number, g = v.g as number, j = v.j as string
      const taxable = Math.max(0, e * (1 - g / 100))
      const bill = taxable * r
      return [
        res('Taxable base', `${num(taxable)} t CO2e`, T.neutral),
        res('Annual exposure', money(bill), e > 0 ? T.warn : T.good, j === 'EU ETS / CBAM' ? 'Allowance prices can spike toward compliance date.' : ''),
        res('Allowance shield', pct(clamp(g, 0, 100), 1), g >= 20 ? T.good : T.warn),
        res('Per-month', money(bill / 12), T.neutral),
      ]
    },
  },
  {
    id: 'employee-commute-co2-footprint-calculator',
    archetype: 'est',
    blurb: 'Totals commute CO2 by mode across the workforce.',
    fields: [n('c', 'Car commuters', { def: 90 }), n('d', 'Avg one-way km (car)', { def: 18 }), n('t', 'Transit commuters', { def: 60 }), n('g', 'Green commuters', { def: 25 })],
    compute: (v) => {
      const c = v.c as number, d = v.d as number, t = v.t as number, g = v.g as number
      const carCO2 = c * d * 0.170 * 230
      const transitCO2 = t * d * 0.055 * 230
      const total = carCO2 + transitCO2
      const per = total / Math.max(1, c + t + g)
      return [
        res('Annual commute CO2', `${num(total)} kg`, total > 0 ? T.warn : T.good),
        res('Per worker', `${numD(per, 1)} kg`, per > 600 ? T.bad : per > 350 ? T.warn : T.good),
        res('Transit vs car', pct((transitCO2 / Math.max(1, carCO2)) * 100, 1), transitCO2 < carCO2 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'supplier-human-rights-compliance-matrix',
    archetype: 'matrix',
    blurb: 'Flags supplier human-rights compliance gaps across the tiers.',
    fields: [mxd('m', 'Suppliers', ['Supplier', 'Audited', 'Remediation plan', 'Grievance channel', 'Child-labour risk'], ['Tier 1', 'Tier 2', 'Tier 3'], [[1, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 1]]), n('aud', 'Audits scheduled this year', { def: 6 })],
    compute: (v) => {
      const M = v.m as number[][]
      const audited = M.filter((r) => (r[0] || 0) === 1).length
      const remediated = M.filter((r) => (r[1] || 0) === 1).length
      const childRisk = M.filter((r) => (r[3] || 0) === 1).length
      return [
        res('Audited suppliers', `${audited} / ${M.length}`, audited === M.length ? T.good : T.warn),
        res('Remediation plans', `${remediated}`, remediated >= audited ? T.good : T.warn),
        res('Child-labour flags', `${childRisk}`, childRisk === 0 ? T.good : T.bad),
        res('Audits scheduled', `${num(v.aud as number)}`, (v.aud as number) >= M.length ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'workplace-diversity-index-blau-index',
    archetype: 'est',
    blurb: 'Computes the Blau index of diversity for a workforce breakdown.',
    fields: [n('a', 'Group A size', { def: 140 }), n('b', 'Group B size', { def: 90 }), n('c', 'Group C size', { def: 55 }), n('d', 'Group D size', { def: 35 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const props = [a, b, c, d].filter((x) => x > 0).map((x) => x / Math.max(1, a + b + c + d))
      const blau = 1 - props.reduce((s, x) => s + x * x, 0)
      const nGroups = props.length
      const max = 1 - 1 / nGroups
      return [
        res('Blau index', numD(blau, 3), blau >= max * 0.8 ? T.good : blau >= max * 0.5 ? T.warn : T.bad),
        res('Normalised', pct((blau / Math.max(0.001, max)) * 100, 1), blau / Math.max(0.001, max) >= 0.8 ? T.good : T.warn),
        res('Groups', `${nGroups}`, nGroups >= 3 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'equal-employment-opportunity-eeo-1-formatter',
    archetype: 'fmt',
    blurb: 'Builds an EEO-1 style workforce snapshot from category counts.',
    fields: [n('m', 'Male staff', { def: 120 }), n('f', 'Female staff', { def: 96 }), n('nb', 'Non-binary / undisclosed', { def: 6 }), sel('p', 'Reporting period', ['Calendar year', 'Fiscal year']), txt('b', 'Business unit', 1, 'Corporation (single unit)')],
    compute: (v) => {
      const m = v.m as number, f = v.f as number, nb = v.nb as number, p = v.p as string, b = v.b as string
      const tot = m + f + nb
      const doc = `EEO-1 STYLE SNAPSHOT\n\nUnit: ${b || '(unnamed)'}\nPeriod: ${p} snapshot\n\nMALE  ${num(m)} (${pct((m / Math.max(1, tot)) * 100, 1)})\nFEMALE  ${num(f)} (${pct((f / Math.max(1, tot)) * 100, 1)})\nNON-BINARY / UNDISCLOSED  ${num(nb)} (${pct((nb / Math.max(1, tot)) * 100, 1)})\nTOTAL  ${num(tot)}`
      return [
        res('Total headcount', `${num(tot)}`, T.neutral),
        res('Female share', pct((f / Math.max(1, tot)) * 100, 1), f / Math.max(1, tot) >= 0.4 ? T.good : T.warn),
        res('Snapshot ready', p, tot > 0 ? T.good : T.bad),
        docRes('EEO-1 snapshot', doc),
      ]
    },
  },
  {
    id: 'pay-transparency-band-generator',
    archetype: 'fmt',
    blurb: 'Generates a pay band for a role from a survey midpoint and spread.',
    fields: [n('m', 'Market midpoint ($)', { def: 92000 }), n('s', 'Band spread (%)', { def: 30 }), txt('r', 'Role title', 1, 'Senior Analyst'), sel('z', 'Zone', ['National', 'High-cost metro', 'Remote any-zone'])],
    compute: (v) => {
      const m = v.m as number, s = v.s as number, r = v.r as string, z = v.z as string
      const lo = m * (1 - s / 200)
      const hi = m * (1 + s / 200)
      const doc = `PAY BAND - ${r || '(role)'}\n\nZONE: ${z}\n\nMINIMUM  ${money(lo)}\nMIDPOINT  ${money(m)}\nMAXIMUM  ${money(hi)}\nSPREAD  ${s}% (${z === 'High-cost metro' ? 'premium tier applies' : 'standard tier'})\n\nGUIDANCE\n- Publish band on posting and in offer letters.\n- Keep compa-ratio within 0.80-1.20 of midpoint.`
      return [
        res('Band', `${money(lo)} - ${money(hi)}`, T.neutral),
        res('Spread', pct(s, 1), s >= 20 && s <= 40 ? T.good : T.warn),
        res('Compa-ratio guard', '0.80-1.20', T.neutral),
        docRes('Pay band memo', doc),
      ]
    },
  },
  {
    id: 'workplace-accessibility-audit-formatter',
    archetype: 'fmt',
    blurb: 'Prints a physical and digital accessibility audit checklist memo.',
    fields: [ck('a', 'Audited', ['Entrance ramp & doors', 'Accessible restrooms', 'Desk height adjustability', 'Signage & wayfinding', 'Screen-reader ready portal', 'Captioning on video', 'Braille / tactile cues']), txt('site', 'Site', 1, 'HQ Tower'), n('f', 'Flagged items', { def: 2 })],
    compute: (v) => {
      const items = (v.a as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const doc = `ACCESSIBILITY AUDIT - ${(v.site as string) || '(site)'}\n\nITEM  STATUS\n${['Entrance ramp & doors', 'Accessible restrooms', 'Desk height adjustability', 'Signage & wayfinding', 'Screen-reader ready portal', 'Captioning on video', 'Braille / tactile cues'].map((it, i) => `- ${it}: ${items[i] ? 'OK' : 'ACTION'}`).join('\n')}\n\nFLAGGED ITEMS: ${num(v.f as number)}\nNEXT STEP: raise flag in facilities tracker, owner ETA 30 days.`
      return [
        res('Checked off', `${done} / ${items.length}`, done === items.length ? T.good : done >= items.length / 2 ? T.warn : T.bad),
        res('Flagged', `${num(v.f as number)}`, (v.f as number) === 0 ? T.good : T.warn),
        docRes('Accessibility audit', doc),
      ]
    },
  },
  {
    id: 'inclusive-language-document-checker',
    archetype: 'fmt',
    blurb: 'Scans a draft for flagged terms and suggests inclusive alternatives.',
    fields: [txt('d', 'Draft text', 4, 'Paste or type your draft here.\nWatch for gendered or loaded terms.'), sel('t', 'Tone', ['Standard business', 'Recruiting', 'Public-facing'])],
    compute: (v) => {
      const body = (v.d as string) || ''
      const flagged: string[] = []
      const terms: Array<[string, string]> = [['he / him / his', 'they / their'], ['man-hours', 'person-hours'], ['chairman', 'chair / chairperson'], ['guys', 'everyone / folks'], ['blacklist', 'blocklist'], ['grandfather', 'legacy / pre-existing'], ['crazy', 'extreme / intense'], ['sanity-check', 'soundness-check']]
      for (const [pat, rep] of terms) if (body.toLowerCase().includes(pat.split(' / ')[0].toLowerCase())) flagged.push(`${pat}  ->  ${rep}`)
      const hits = flagged.length
      return [
        res('Flagged phrases', `${hits}`, hits === 0 ? T.good : hits <= 2 ? T.warn : T.bad),
        res('Tone', (v.t as string), T.neutral),
        res('Length', `${num(body.length)} chars`, body.length > 0 ? T.neutral : T.warn),
        ...(hits ? [res('Replacements', flagged.join(' · '), T.warn)] : [res('Clear', 'No inclusive-language flags', T.good)]),
      ]
    },
  },
  {
    id: 'gender-pay-gap-percentage-calculator',
    archetype: 'est',
    blurb: 'Computes the median gender pay gap and classifies pressure to act.',
    fields: [n('w', 'Median male pay ($)', { def: 92000 }), n('x', 'Median female pay ($)', { def: 82400 }), n('g', 'Coverage (%)', { def: 100 })],
    compute: (v) => {
      const w = v.w as number, x = v.x as number, g = v.g as number
      const gap = w > 0 ? ((w - x) / w) * 100 : 0
      const gapGroup = w > 0 ? ((x - w) / w) * 100 : 0
      const signed = w < x ? gapGroup : gap
      return [
        res('Median pay gap', pct(Math.abs(signed), 1, signed > 0), Math.abs(signed) < 5 ? T.good : Math.abs(signed) < 15 ? T.warn : T.bad),
        res('Direction', signed > 0 ? 'Women paid less' : signed < 0 ? 'Women paid more' : 'Equal', Math.abs(signed) < 1 ? T.good : T.warn),
        res('Coverage', pct(clamp(g, 0, 100), 1), g >= 90 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'flexible-working-model-ratio-calculator',
    archetype: 'est',
    blurb: 'Measures the share of the workforce on flexible schedules.',
    fields: [n('w', 'Total workforce', { def: 300 }), n('h', 'Hybrid (fixed days)', { def: 110 }), n('r', 'Remote-first', { def: 60 }), n('c', 'Pressured / flexed hours', { def: 45 })],
    compute: (v) => {
      const w = v.w as number, h = v.h as number, r = v.r as number, c = v.c as number
      const flex = h + r + c
      const noFlex = Math.max(0, w - flex)
      return [
        res('Flexible share', pct((flex / Math.max(1, w)) * 100, 1), flex / Math.max(1, w) >= 0.5 ? T.good : T.warn),
        res('Remote-first', pct((r / Math.max(1, w)) * 100, 1), r / Math.max(1, w) >= 0.2 ? T.good : T.neutral),
        res('On fixed-hours', `${num(noFlex)}`, noFlex <= w / 2 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'workplace-parental-leave-return-rate-metric',
    archetype: 'est',
    blurb: 'Measures parental leave return and retention after 12 months.',
    fields: [n('t', 'Leavers started leave', { def: 24 }), n('r', 'Returned to work', { def: 22 }), n('s', 'Still employed at 12 months', { def: 19 })],
    compute: (v) => {
      const t = v.t as number, r = v.r as number, s = v.s as number
      const ret = (r / Math.max(1, t)) * 100
      const stay = (s / Math.max(1, r)) * 100
      return [
        res('Return rate', pct(ret, 1), ret >= 90 ? T.good : ret >= 75 ? T.warn : T.bad),
        res('12-month retention', pct(stay, 1), stay >= 85 ? T.good : T.warn),
        res('Attrition within year', `${num(Math.max(0, r - s))}`, s >= r * 0.9 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'neurodiversity-workplace-inclusion-matrix',
    archetype: 'matrix',
    blurb: 'Checks neurodiversity-inclusive practices across the employee journey.',
    fields: [mxd('m', 'Stages', ['Stage', 'Recruitment', 'Onboarding', 'Manager training'], ['Job design', 'Interview format', 'Workspace', 'Buddy support'], [[1, 1, 0], [1, 0, 0], [0, 1, 1], [1, 0, 1]]), n('t', 'Adaptations logged', { def: 5 })],
    compute: (v) => {
      const M = v.m as number[][]
      const rec = M.filter((r) => (r[0] || 0)).length
      const onb = M.filter((r) => (r[1] || 0)).length
      const mgr = M.filter((r) => (r[2] || 0)).length
      const gaps = (4 - rec) + (4 - onb) + (4 - mgr)
      return [
        res('Recruitment inclusive', `${rec} / 4`, rec >= 3 ? T.good : T.warn),
        res('Onboarding inclusive', `${onb} / 4`, onb >= 3 ? T.good : T.warn),
        res('Manager training', `${mgr} / 4`, mgr >= 3 ? T.good : T.bad),
        res('Gaps open', `${gaps}`, gaps === 0 ? T.good : T.warn, 'Adaptations logged: ' + num(v.t as number)),
      ]
    },
  },
  {
    id: 'workplace-age-diversity-benchmarker',
    archetype: 'est',
    blurb: 'Benchmarks age-group spread and flags concentration risk.',
    fields: [n('a', '20-29', { def: 40 }), n('b', '30-39', { def: 110 }), n('c', '40-49', { def: 85 }), n('d', '50-59', { def: 40 }), n('e', '60+', { def: 15 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const tot = a + b + c + d + e
      const props = [a, b, c, d, e].map((x) => x / Math.max(1, tot))
      const blau = 1 - props.reduce((s, x) => s + x * x, 0)
      const young = (a / Math.max(1, tot)) * 100
      const depth = (e / Math.max(1, tot)) * 100
      return [
        res('Age diversity (Blau)', numD(blau, 3), blau >= 0.7 ? T.good : blau >= 0.55 ? T.warn : T.bad),
        res('Under-30 share', pct(young, 1), young > 40 ? T.warn : T.good),
        res('60+ share', pct(depth, 1), depth < 2 ? T.warn : T.good),
        res('Largest band', pct(Math.max(...props) * 100, 1), Math.max(...props) > 0.5 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'company-esg-benchmark-vs-industry-index',
    archetype: 'index',
    blurb: 'Ranks your ESG scorecard against the industry average by pillar.',
    fields: [n('e', 'Environmental score', { def: 72 }), n('s', 'Social score', { def: 64 }), n('g', 'Governance score', { def: 81 }), n('i', 'Industry average', { def: 62 })],
    compute: (v) => {
      const e = v.e as number, s = v.s as number, g = v.g as number, i = v.i as number
      const composite = (e + s + g) / 3
      const lead = composite - i
      return [
        res('ESG benchmark', pct(lead, 1, true), lead >= 0 ? T.good : T.bad, 'Composite ' + numD(composite, 1) + ' vs industry ' + numD(i, 1) + '.'),
        res('Environmental', `${numD(e, 0)} / 100`, e >= i ? T.good : T.warn),
        res('Social', `${numD(s, 0)} / 100`, s >= i ? T.good : T.warn),
        res('Governance', `${numD(g, 0)} / 100`, g >= i ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'chief-equality-officer-kpi-generator',
    archetype: 'fmt',
    blurb: 'Generates a monthly equality plan KPI memo from live numbers.',
    fields: [n('hh', 'Headcount', { def: 420 }), n('dv', 'Diverse hires (%)', { def: 55 }), n('pr', 'Promotion equity score', { def: 78 }), n('rg', 'Representation goal (%)', { def: 40 }), sel('q', 'Quarter', ['Q1', 'Q2', 'Q3', 'Q4'])],
    compute: (v) => {
      const hh = v.hh as number, dv = v.dv as number, pr = v.pr as number, rg = v.rg as number, q = v.q as string
      const rep = Math.min(100, (dv * 0.6 + pr * 0.4))
      const doc = `EQUALITY PLAN KPIs - ${q} ${new Date().getFullYear()}\n\nHEADCOUNT  ${num(hh)}\nDIVERSE HIRES  ${pct(dv, 1)}\nREPRESENTATION INDEX  ${numD(rep, 1)} / 100 (goal ${pct(rg, 1)})\nPROMOTION EQUITY  ${numD(pr, 0)} / 100\n\nWATCH ITEMS\n- Re-launch slates before manager sign-off.\n- Review salary band drift at promotion.`
      return [
        res('Representation index', `${numD(rep, 1)} / 100`, rep >= rg ? T.good : T.warn),
        res('Goal gap', pct(Math.max(0, rg - rep), 1), rep >= rg ? T.good : T.bad),
        res('Promotion equity', `${numD(pr, 0)} / 100`, pr >= 75 ? T.good : T.warn),
        docRes('Equality KPI memo', doc),
      ]
    },
  },
  {
    id: 'zero-waste-to-landfill-progress-tracker',
    archetype: 'tracker',
    blurb: 'Tracks the monthly diversion rate on the road to zero waste.',
    fields: [dt('s', 'Start date', 'Jan 2026'), n('d', 'Diverted (tonnes)', { def: 8 }), n('l', 'Landfill (tonnes)', { def: 2 }), sel('m', 'Month', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])],
    compute: (v) => {
      const d = v.d as number, l = v.l as number, m = v.m as string
      const rate = (d / Math.max(1, d + l)) * 100
      const toTarget = 100 - rate
      return [
        res('Diversion rate', pct(rate, 1), rate >= 90 ? T.good : rate >= 70 ? T.warn : T.bad),
        res('To zero-waste', pct(toTarget, 1), rate >= 90 ? T.good : T.neutral),
        res('Residual to landfill', `${numD(l, 1)} t`, l <= 1 ? T.good : T.warn),
        res('Period', `${m} (from ${(v.s as string) || 'start'})`, T.neutral),
      ]
    },
  },
  {
    id: 'sustainable-packaging-transition-cost',
    archetype: 'bdown',
    blurb: 'Budget for switching packaging to certified, recyclable materials.',
    fields: [mxd('m', 'SKUs', ['SKU group', 'Current cost ($/unit)', 'Certified cost ($/unit)'], ['Inner boxes', 'Mailer pouches', 'Labels', 'Filler'], [[0.45, 0.62], [0.30, 0.48], [0.08, 0.11], [0.12, 0.18]]), n('v', 'Units / year', { def: 60000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[1] || 0), 0)
      const premium = total - M.reduce((s, r) => s + (r[0] || 0), 0)
      const yr = premium * (v.v as number)
      return [
        res('Premium per unit', money(premium), T.neutral),
        res('Annual cost uplift', money(yr), yr <= 20000 ? T.good : T.warn, 'Certified substrates are ~30% more than virgin.'),
        res('Packaging budget', money(total), T.neutral),
      ]
    },
  },
  {
    id: 'office-solar-thermal-water-heating-metric',
    archetype: 'est',
    blurb: 'Scores a solar-thermal water heating investment for the office.',
    fields: [n('g', 'Collector area (m2)', { def: 40 }), n('w', 'Hot water use (L/day)', { def: 1800 }), n('el', 'Electric rate ($/kWh)', { def: 0.14 }), sel('c', 'Climate zone', ['Sunny', 'Moderate', 'Cloudy'])],
    compute: (v) => {
      const g = v.g as number, w = v.w as number, el = v.el as number, c = v.c as string
      const zone = c === 'Sunny' ? 1400 : c === 'Moderate' ? 1000 : 600
      const kwh = g * zone * 0.72
      const saving = kwh * el
      const cover = Math.min(100, (kwh / Math.max(1, w * 2.4 * 250)) * 100)
      return [
        res('Annual solar heat', `${num(kwh)} kWh`, T.neutral),
        res('Saved vs electric', money(saving), saving > 1000 ? T.good : T.neutral),
        res('Demand coverage', pct(cover, 1), cover >= 40 ? T.good : cover >= 20 ? T.warn : T.bad),
        res('Zone factor', `${kwh} kWh/m2-yr`, T.neutral),
      ]
    },
  },
  {
    id: 'corporate-fleet-zero-emission-transition-plan',
    archetype: 'est',
    blurb: 'Plans phased fleet electrification with cost and carbon upside.',
    fields: [n('v', 'Fleet size', { def: 60 }), n('ev', 'EVs already', { def: 8 }), n('km', 'Avg annual km per vehicle', { def: 22000 }), n('co2', 'CO2 per km (ICE, g)', { def: 180 })],
    compute: (v) => {
      const veh = v.v as number, ev = v.ev as number, km = v.km as number, co2 = v.co2 as number
      const ice = Math.max(0, veh - ev)
      const tonnes = (ice * km * co2) / 1e6
      const charging = ice * 6500
      const phasing = ice > 20 ? '3-year replacement plan' : 'Immediate next-cycle replacement'
      return [
        res('ICE vehicles to convert', `${num(ice)}`, ice === 0 ? T.good : T.warn),
        res('Annual CO2 from ICE', `${numD(tonnes, 1)} t`, tonnes > 0 ? T.warn : T.good),
        res('Charging budget', money(charging), T.neutral, phasing),
        res('Readiness', ev >= veh * 0.3 ? T.good : ice > 0 ? T.warn : T.bad, T.neutral),
      ]
    },
  },
  {
    id: 'fair-trade-coffee-and-tea-procurement-tracker',
    archetype: 'tracker',
    blurb: 'Tracks fair-trade share of office coffee and tea purchases.',
    fields: [n('s', 'Hot drinks / month', { def: 3200 }), n('f', 'Fair-trade cups', { def: 2100 }), sel('o', 'Purchase channel', ['Certified wholesaler', 'Farm-direct roaster', 'Grocery / generic']), dt('q', 'Quarter start', 'Jan 2026')],
    compute: (v) => {
      const s = v.s as number, f = v.f as number, o = v.o as string
      const ratio = (f / Math.max(1, s)) * 100
      return [
        res('Fair-trade share', pct(ratio, 1), ratio >= 80 ? T.good : ratio >= 50 ? T.warn : T.bad),
        res('Non-certified cups', `${num(Math.max(0, s - f))}`, ratio >= 80 ? T.good : T.neutral),
        res('Channel', o, o === 'Certified wholesaler' ? T.good : T.warn),
        res('Quarter', (v.q as string) || 'Jan 2026', T.neutral),
      ]
    },
  },
  {
    id: 'employee-volunteering-hours-tracker',
    archetype: 'log',
    blurb: 'Logs paid volunteering hours by team and compares to the annual goal.',
    fields: [mxd('m', 'Teams', ['Team', 'Hours logged'], ['R&D', 'Sales', 'Ops', 'Support', 'Finance'], [[60, 40, 80, 30, 20]]), n('g', 'Annual goal (hours/head)', { def: 8 })],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const goal = total / Math.max(1, M.length) >= (v.g as number) ? T.good : T.warn
      return [
        res('Volunteer hours', `${num(total)} hrs`, goal),
        res('Avg per team', `${numD(total / M.length, 1)} hrs`, goal),
        res('Annual goal', `${numD(v.g as number, 1)} hrs/head`, T.neutral),
        res('Top team', `Team ${Math.max(0, M.findIndex((r) => (r[0] || 0) === Math.max(...M.map((x) => x[0] || 0)))) + 1}`, T.neutral),
      ]
    },
  },
  {
    id: 'workplace-psychological-safety-scorer',
    archetype: 'scorecard',
    blurb: 'Scores psychological safety on the standard four-factor model.',
    fields: [mxd('m', 'Factors', ['Factor', 'Weight %', 'Team score 0-10'], ['Speaking up', 'Help-seeking', 'Risk-taking', 'Mistake tolerance'], [[25, 7], [25, 8], [25, 6], [25, 9]]), sel('o', 'Overall environment', ['Improving', 'Stable', 'Declining'])],
    compute: (v) => {
      const M = v.m as number[][]
      const score = M.reduce((s, r) => s + (r[1] || 0) * ((r[0] || 0) / 100), 0)
      return [
        res('Psychological safety', `${numD(score, 1)} / 10`, score >= 8 ? T.good : score >= 6 ? T.warn : T.bad),
        res('Weakest factor', `${num(Math.min(...M.map((r) => r[1] || 0)), 1)} / 10`, Math.min(...M.map((r) => r[1] || 0)) >= 6 ? T.good : T.warn),
        res('Trajectory', (v.o as string), (v.o as string) === 'Improving' ? T.good : (v.o as string) === 'Stable' ? T.neutral : T.bad),
      ]
    },
  },
  {
    id: 'corporate-charitable-matching-budget-estimator',
    archetype: 'est',
    blurb: 'Budgets the yearly employee giving matching programme.',
    fields: [n('e', 'Eligible employees', { def: 400 }), n('p', 'Participation (%)', { def: 24 }), n('g', 'Avg annual gift ($)', { def: 350 }), n('r', 'Match ratio', { def: 1 })],
    compute: (v) => {
      const e = v.e as number, p = v.p as number, g = v.g as number, r = v.r as number
      const gifts = e * (p / 100)
      const total = gifts * g * r
      const admin = total * 0.05
      return [
        res('Estimated match', money(total), T.neutral),
        res('Expected donors', `${num(gifts)}`, T.neutral),
        res('Admin & platform', money(admin), T.neutral),
        res('Total budget', money(total + admin), p >= 20 ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'employee-burnout-prevention-matrix',
    archetype: 'matrix',
    blurb: 'Flags burnout risk by team across hours, breaks and support.',
    fields: [mxd('m', 'Teams', ['Team', 'Avg hours/wk', 'Breaks taken', 'Wellbeing support'], ['Eng', 'Sales', 'Support'], [[46, 1, 1], [50, 0, 1], [52, 0, 0]]), n('cap', 'Hours cap', { def: 45 })],
    compute: (v) => {
      const M = v.m as number[][]
      const overdue = M.filter((r) => (r[0] || 0) > (v.cap as number)).length
      const breaks = M.filter((r) => (r[1] || 0) === 1).length
      return [
        res('Teams over hours cap', `${overdue} / ${M.length}`, overdue === 0 ? T.good : overdue <= 1 ? T.warn : T.bad),
        res('Break habits ok', `${breaks} / ${M.length}`, breaks === M.length ? T.good : T.warn),
        res('Max hours seen', `${num(Math.max(...M.map((r) => r[0] || 0)))} h`, Math.max(...M.map((r) => r[0] || 0)) <= (v.cap as number) ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'workplace-health-and-wellness-program-roi',
    archetype: 'est',
    blurb: 'Returns the ROI estimate of the wellness programme from savings and cost.',
    fields: [n('a', 'Absenteeism saved ($/yr)', { def: 240000 }), n('m', 'Turnover avoided ($/yr)', { def: 150000 }), n('c', 'Programme cost ($/yr)', { def: 180000 }), n('u', 'Utilization (%)', { def: 55 })],
    compute: (v) => {
      const a = v.a as number, m = v.m as number, c = v.c as number, u = v.u as number
      const benefit = (a + m) * (u / 100)
      const roi = c > 0 ? (benefit - c) / c : 0
      return [
        res('Programme ROI', pct(roi * 100, 1), roi >= 0.5 ? T.good : roi >= 0 ? T.warn : T.bad),
        res('Attributed benefit', money(benefit), T.neutral),
        res('Cost', money(c), T.neutral),
        res('Utilization', pct(clamp(u, 0, 100), 1), u >= 50 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'corporate-social-impact-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores corporate social contribution across program lines.',
    fields: [mxd('m', 'Lines', ['Line', 'Weight %', 'Score 0-10'], ['Community giving', 'Employee engagement', 'Local hiring', 'Stakeholder trust'], [[30, 8], [20, 7], [20, 6], [30, 8]]), sel('o', 'Overall standing', ['Above peers', 'In line', 'Below peers'])],
    compute: (v) => {
      const M = v.m as number[][]
      const score = M.reduce((s, r) => s + (r[1] || 0) * ((r[0] || 0) / 100), 0)
      return [
        res('Impact score', `${numD(score, 1)} / 10`, score >= 8 ? T.good : score >= 6 ? T.warn : T.bad),
        res('Leading line', `${num(Math.max(...M.map((r) => r[1] || 0)), 1)} / 10`, Math.max(...M.map((r) => r[1] || 0)) >= 8 ? T.good : T.warn),
        res('Standing', (v.o as string), (v.o as string) === 'Above peers' ? T.good : (v.o as string) === 'In line' ? T.neutral : T.bad),
      ]
    },
  },
  {
    id: 'employee-mental-health-benefits-utilization',
    archetype: 'log',
    blurb: 'Logs mental health benefit usage quarters over quarters.',
    fields: [mxd('m', 'Quarters', ['Quarter', 'Sessions used', 'Employees reached'], ['Q1', 'Q2', 'Q3', 'Q4'], [[18, 90], [26, 130], [31, 165], [40, 210]]), n('cap', 'Headroom (sessions unused)', { def: 60 })],
    compute: (v) => {
      const M = v.m as number[][]
      const sessions = M.reduce((s, r) => s + (r[0] || 0), 0)
      const reached = M.reduce((s, r) => s + (r[1] || 0), 0)
      const last = M[M.length - 1]?.[0] ?? 0
      return [
        res('Total sessions', `${num(sessions)}`, T.neutral),
        res('Employees reached', `${num(reached)}`, T.good),
        res('Latest quarter', `${num(last)} sessions`, last >= 30 ? T.good : T.warn),
        res('Utilization trend', `${num(Math.round(((last - (M[0]?.[0] ?? 0)) / Math.max(1, M[0]?.[0] ?? 0)) * 100))}%`, last > (M[0]?.[0] ?? 0) ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'workplace-microaggression-incident-log',
    archetype: 'log',
    blurb: 'Logs reported incidents by severity with a review cadence.',
    fields: [mxd('m', 'Severity', ['Severity', 'Reported', 'Resolved'], ['Minor', 'Moderate', 'Severe'], [[6, 6], [3, 2], [1, 0]]), n('days', 'Investigation SLA (days)', { def: 15 })],
    compute: (v) => {
      const M = v.m as number[][]
      const reported = M.reduce((s, r) => s + (r[0] || 0), 0)
      const resolved = M.reduce((s, r) => s + (r[1] || 0), 0)
      const unclean = M.reduce((s, r) => s + Math.max(0, (r[0] || 0) - (r[1] || 0)), 0)
      return [
        res('Reported', `${num(reported)}`, T.neutral),
        res('Resolved', `${num(resolved)} (${pct((resolved / Math.max(1, reported)) * 100, 0)})`, resolved === reported ? T.good : T.warn),
        res('Open backlog', `${num(unclean)}`, unclean === 0 ? T.good : T.warn, 'SLA ' + numD(v.days as number, 0) + ' days per case.'),
        res('Severe open', `${num((M[2]?.[0] ?? 0) - (M[2]?.[1] ?? 0))}`, (M[2]?.[0] ?? 0) === (M[2]?.[1] ?? 0) ? T.good : T.bad),
      ]
    },
  },
  {
    id: '4-day-work-week-productivity-index',
    archetype: 'index',
    blurb: 'Scores the 4-day week against output, coverage and wellbeing.',
    fields: [n('wh', 'Weekly hours target', { def: 32 }), n('hl', 'Output index (baseline 100)', { def: 105 }), n('cv', 'Coverage score', { def: 78 }), n('wb', 'Wellbeing score', { def: 88 })],
    compute: (v) => {
      const wh = v.wh as number, hl = v.hl as number, cv = v.cv as number, wb = v.wb as number
      const score = clamp(hl * 0.4 + cv * 0.3 + wb * 0.3, 0, 100)
      return [
        res('4-day week index', `${numD(score, 1)} / 100`, tonePct(score, 80, 60)),
        res('Output', `${num(hl)} vs 100`, hl >= 100 ? T.good : T.warn),
        res('Coverage', `${numD(cv, 0)} / 100`, cv >= 80 ? T.good : T.warn),
        res('Hours', `${num(wh)} h/wk`, wh <= 36 ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'workplace-conflict-frequency-index',
    archetype: 'index',
    blurb: 'Indexes conflict frequency per headcount to size interventions.',
    fields: [n('c', 'Interventions this quarter', { def: 12 }), n('h', 'Headcount', { def: 420 }), n('e', 'Escalated cases', { def: 2 })],
    compute: (v) => {
      const c = v.c as number, h = v.h as number, e = v.e as number
      const per100 = (c / Math.max(1, h)) * 100
      const score = Math.max(0, 100 - per100 * 8 - e * 4)
      return [
        res('Conflict index', `${numD(score, 1)} / 100`, tonePct(score, 75, 55)),
        res('Cases / 100 staff', numD(per100, 2), per100 <= 4 ? T.good : per100 <= 8 ? T.warn : T.bad),
        res('Escalations', `${num(e)}`, e === 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'employee-financial-wellness-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores financial wellness of the workforce from programme telemetry.',
    fields: [mxd('m', 'Pillars', ['Pillar', 'Weight %', 'Score 0-10'], ['Debt & loans', 'Emergency savings', 'Retirement', 'Financial literacy'], [[25, 7], [25, 5], [30, 8], [20, 6]]), sel('o', 'Trend', ['Improving', 'Stable', 'Declining'])],
    compute: (v) => {
      const M = v.m as number[][]
      const score = M.reduce((s, r) => s + (r[1] || 0) * ((r[0] || 0) / 100), 0)
      return [
        res('Financial wellness', `${numD(score, 1)} / 10`, score >= 7 ? T.good : score >= 5 ? T.warn : T.bad),
        res('Savings pillar', `${num((M[1]?.[1] ?? 0), 1)} / 10`, (M[1]?.[1] ?? 0) < 6 ? T.warn : T.good),
        res('Trend', (v.o as string), (v.o as string) === 'Improving' ? T.good : (v.o as string) === 'Stable' ? T.neutral : T.bad),
      ]
    },
  },
  {
    id: 'corporate-governance-ethics-hotline-log',
    archetype: 'log',
    blurb: 'Logs ethics hotline cases with priority weighting and closure time.',
    fields: [mxd('m', 'Priority', ['Priority', 'Cases opened', 'Closed'], ['High', 'Medium', 'Low'], [[1, 1], [4, 3], [9, 8]]), n('days', 'Avg close time (days)', { def: 12 })],
    compute: (v) => {
      const M = v.m as number[][]
      const open = M.reduce((s, r) => s + (r[0] || 0), 0)
      const closed = M.reduce((s, r) => s + (r[1] || 0), 0)
      const backlog = open - closed
      const hi = M[0]?.[0] ?? 0
      return [
        res('Cases opened', `${num(open)}`, T.neutral),
        res('Closed', `${num(closed)} (${pct((closed / Math.max(1, open)) * 100, 0)})`, backlog === 0 ? T.good : T.warn),
        res('Backlog', `${num(backlog)}`, backlog === 0 ? T.good : backlog <= 3 ? T.warn : T.bad),
        res('High-priority open', `${num(hi - (M[0]?.[1] ?? 0))}`, hi === (M[0]?.[1] ?? 0) ? T.good : T.bad, 'Avg close ' + numD(v.days as number, 0) + ' days.'),
      ]
    },
  },
  {
    id: 'remote-worker-isolation-index',
    archetype: 'index',
    blurb: 'Indexes remote isolation risk from interactions and connectivity.',
    fields: [n('tt', 'Avg virtual hrs/week', { def: 12 }), n('on', 'Video meetings/week', { def: 6 }), n('ct', 'Water-cooler chats/week', { def: 2 }), n('of', 'On-site days/month', { def: 2 })],
    compute: (v) => {
      const tt = v.tt as number, on = v.on as number, ct = v.ct as number, of = v.of as number
      const connect = on * 3 + ct * 4 + of * 6
      const risk = Math.round(clamp(100 - connect * 1.4, 0, 100))
      return [
        res('Isolation risk', `${numD(risk, 1)} / 100`, tonePct(100 - risk, 60, 40)),
        res('Informal touchpoints', `${num(ct)} / wk`, ct >= 3 ? T.good : T.warn),
        res('Video meetings', `${num(on)} / wk`, on >= 5 ? T.good : T.warn),
        res('On-site presence', `${num(of)} days/mo`, of >= 4 ? T.good : T.neutral),
        res('Work hours', `${num(tt)} h/wk`, T.neutral),
      ]
    },
  },
  {
    id: 'workplace-sickness-absence-root-cause-index',
    archetype: 'index',
    blurb: 'Indexes why absence happens from breakdown shares.',
    fields: [n('p', 'Physical illness (%)', { def: 40 }), n('m', 'Mental health (%)', { def: 35 }), n('c', 'Care responsibilities (%)', { def: 15 }), n('x', 'Other (%)', { def: 10 })],
    compute: (v) => {
      const p = v.p as number, m = v.m as number, c = v.c as number, x = v.x as number
      const sum = p + m + c + x
      const stress = (m / Math.max(1, sum)) * 100
      const systematic = (c / Math.max(1, sum)) * 100
      const manageClass = stress + systematic
      return [
        res('Management-linked share', pct(manageClass, 1), manageClass > 55 ? T.warn : T.good),
        res('Physical', pct((p / Math.max(1, sum)) * 100, 1), T.neutral),
        res('Mental health', pct(stress, 1), stress > 30 ? T.bad : T.warn),
        res('Care responsibilities', pct(systematic, 1), T.neutral),
        res('Coverage', pct(Math.min(100, sum), 1), sum >= 95 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'employee-idea-innovation-index',
    archetype: 'index',
    blurb: 'Indexes the idea pipeline from submitted to adopted to shipped.',
    fields: [n('h', 'Submissions / month', { def: 140 }), n('a', 'Adopted', { def: 28 }), n('s', 'Shipped', { def: 12 }), n('q', 'Quality score 0-10', { def: 7 })],
    compute: (v) => {
      const h = v.h as number, a = v.a as number, s = v.s as number, q = v.q as number
      const adopt = (a / Math.max(1, h)) * 100
      const ship = (s / Math.max(1, a)) * 100
      const score = clamp(adopt * 0.5 + ship * 0.3 + q * 5, 0, 100)
      return [
        res('Innovation index', `${numD(score, 1)} / 100`, tonePct(score, 60, 40)),
        res('Adoption rate', pct(adopt, 1), adopt >= 20 ? T.good : T.warn),
        res('Ship rate', pct(ship, 1), ship >= 40 ? T.good : T.warn),
        res('Quality', `${numD(q, 1)} / 10`, q >= 7 ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'work-life-balance-policy-compliance-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores how departments comply with work-life balance policy.',
    fields: [mxd('m', 'Policies', ['Policy', 'Weight %', 'Department score 0-10'], ['Core hours only', 'Reply windows', 'Leave approval', 'After-hours email'], [[25, 9], [25, 7], [25, 8], [25, 6]]), sel('o', 'Overall compliance', ['High', 'Partial', 'Low'])],
    compute: (v) => {
      const M = v.m as number[][]
      const score = M.reduce((s, r) => s + (r[1] || 0) * ((r[0] || 0) / 100), 0)
      return [
        res('Policy compliance', `${numD(score, 1)} / 10`, score >= 8 ? T.good : score >= 6 ? T.warn : T.bad),
        res('After-hours weakest', `${num((M[3]?.[1] ?? 0), 1)} / 10`, (M[3]?.[1] ?? 0) >= 6 ? T.good : T.warn),
        res('Overall', (v.o as string), (v.o as string) === 'High' ? T.good : (v.o as string) === 'Partial' ? T.warn : T.bad),
      ]
    },
  },
]