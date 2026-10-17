import { ck, days, doc as docRes, dt, hours, money, moneyC, mx, mxd, n, num, numD, pct, ratio, res, sel, T } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

export const specs: OfficeToolSpec[] = [
  // ---------------- Logistics ----------------
  {
    id: 'warehouse-storage-utilization-calculator',
    archetype: 'est',
    blurb: 'Measures how much pallet position volume is actually producing revenue per square foot.',
    fields: [n('a', 'Total floor area (sqft)', { def: 80000 }), n('b', 'Active pallet positions', { def: 4500 }), n('c', 'Position footprint (sqft)', { def: 24 }), n('d', 'Utilized positions', { def: 3900 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const capacity = b * c
      const util = a ? (d * c) / a * 100 : 0
      const fill = d / (b || 1) * 100
      return [
        res('Storage utilization', pct(util, 1), util >= 70 && util <= 90 ? T.good : util < 70 ? T.warn : T.bad, 'Healthy warehouses run 70-90% slot usage.'),
        res('Position fill rate', pct(fill, 1), fill <= 100 ? T.good : T.bad),
        res('Held capacity', `${num((capacity / 1000), 0)}k sqft`, T.neutral),
      ]
    },
  },
  {
    id: 'container-loading-20ft-40ft-cbm-calculator',
    archetype: 'est',
    blurb: 'Computes cubic meters and cargo count that fit typical 20ft and 40ft containers.',
    fields: [n('a', 'Cartons', { def: 1200 }), n('b', 'Carton volume (cu.ft)', { def: 1.2 }), n('c', 'Pallet utilization %', { def: 70 }), sel('d', 'Container', ['20ft (33 CBM)', '40ft (67.5 CBM)', '40ft HC (76 CBM)'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const cbm = a * b / 35.315
      const cap = (v.d as string).includes('20ft') ? 33 : (v.d as string).includes('HC') ? 76 : 67.5
      const usable = cap * (c / 100)
      const containers = cbm / (usable || 1)
      return [
        res('Total load', `${numD(cbm, 1)} CBM`),
        res('Containers needed', numD(containers, 2), containers <= 1 ? T.good : T.warn, `${v.d as string} at ${num(c, 0)}% utilization.`),
        res('Utilized capacity', `${numD(usable, 1)} CBM`),
        res('Boxes per container', num(Math.floor(usable * 35.315 / (b || 1)), 0)),
      ]
    },
  },
  {
    id: 'deadstock-and-slow-moving-inventory-auditor',
    archetype: 'matrix',
    blurb: 'Ages inventory by category to identify dead stock eating capital and floor space.',
    fields: [mx('m', 'Inventory aging', ['Category', 'Units >180 days', 'Value ($)'], ['Raw materials', 'WIP', 'Finished goods', 'Spares']), n('c', 'Holding cost % /yr', { def: 22 })],
    compute: (v) => {
      const M = v.m as number[][]
      const value = M.reduce((s, r) => s + (r[1] || 0), 0)
      const dead = value * ((v.c as number) / 100) * 0.6
      const worst = M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)
      const dg = ['Raw materials', 'WIP', 'Finished goods', 'Spares']
      return [
        res('Dead-stock value', money(value), value > 0 ? T.warn : T.good),
        res('Annual cost of dead stock', money(dead), (v.c as number) <= 22 ? T.good : T.warn),
        res('Worst category', dg[worst], value > (M.reduce((s, r) => s + (r[0] || 0), 0)) ? T.warn : T.good),
        res('Disposition guidance', value > 100000 ? 'Liquidation or donation review' : 'Line-level recurring review', T.neutral),
      ]
    },
  },
  {
    id: 'cross-docking-feasibility-estimator',
    archetype: 'est',
    blurb: 'Scores whether cross-docking makes sense from volume, velocity and dock throughput.',
    fields: [n('a', 'Inbound pallets /day', { def: 300 }), n('b', 'Dock doors', { def: 12 }), n('c', 'Turn time target (hours)', { def: 4 }), n('d', 'Share of flow pre-picked %', { def: 60 }), n('e', 'Transit density (pallets/route)', { def: 20 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const slottable = a * (d / 100)
      const perDoor = a / (b || 1)
      const score = Math.min(100, slottable / (e * 8) * 60 + perDoor * 2 + Math.max(0, 8 - c) * 5)
      return [
        res('Cross-dock fit', pct(score, 0), score >= 60 ? T.good : score >= 35 ? T.warn : T.bad, score >= 60 ? 'Flow features are strong enough to cross-dock.' : 'Mostly palletized inventory — keep in storage.'),
        res('Slottable flow /day', num(slottable, 0)),
        res('Pallets per door', num(perDoor, 0), perDoor <= 30 ? T.good : T.warn, 'Above ~30 pallets/door/day waits build.'),
      ]
    },
  },
  {
    id: 'warehouse-labor-pick-rate-calculator',
    archetype: 'est',
    blurb: 'Turns picks, labor hours and route distance into per-hour and per-mile productivity.',
    fields: [n('a', 'Lines picked', { def: 2200 }), n('b', 'Labor hours', { def: 90 }), n('c', 'Walk distance (miles)', { def: 40 }), n('d', 'Order lines per order', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const pph = b ? a / b : 0
      const ord = a / (d || 1)
      const oph = b ? ord / b : 0
      const perMile = c ? a / c : 0
      return [
        res('Picks per hour', num(pph, 0), pph >= 120 ? T.good : pph >= 60 ? T.warn : T.bad, 'Pick-path design is the biggest lever on this number.'),
        res('Orders per hour', num(oph, 1), oph >= 15 ? T.good : T.warn),
        res('Picks per mile walked', num(perMile, 1), perMile >= 60 ? T.good : T.warn, 'Low picks/mile signals poor slotting.'),
        res('Order size', `${num(d, 1)} lines/order`),
      ]
    },
  },
  {
    id: 'pallet-stacking-height-and-weight-limits',
    archetype: 'est',
    blurb: 'Checks a proposed pallet stack against floor loading, height clearance and weight limits.',
    fields: [n('a', 'Floor load limit (kg/sqft)', { def: 2500 }), n('b', 'Pallet footprint (sqft)', { def: 13.4 }), n('c', 'Load per pallet (kg)', { def: 900 }), n('d', 'Stack height allowed (pallets)', { def: 4 }), n('e', 'Clearance height (m)', { def: 6 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const stackWeight = c * d
      const pressure = stackWeight / b
      const clearanceOk = d * 1.55 <= e
      return [
        res('Stack pressure', `${numD(pressure, 0)} kg/sqft`, pressure <= a ? T.good : T.bad, `Limit ${num(a, 0)} kg/sqft.`),
        res('Height check', d * 1.55 <= e ? 'Fits clearance' : 'Exceeds ceiling', clearanceOk ? T.good : T.bad, `${numD(d * 1.55, 2)} m vs ${numD(e, 2)} m)`),
        res('Weight per stack', `${num(stackWeight, 0)} kg`, T.neutral),
      ]
    },
  },
  {
    id: 'dock-door-scheduling-allocator',
    archetype: 'bdown',
    blurb: 'Sizes dock-door capacity from arrivals, dwell and peak-hour concentration.',
    fields: [mx('m', 'Dock load', ['Shift', 'Arrivals', 'Avg dwell (hrs)'], ['AM shift', 'PM shift', 'Night shift']), n('c', 'Peak-hour factor %', { def: 130 })],
    compute: (v) => {
      const M = v.m as number[][]
      const arrivals = M.reduce((s, r) => s + (r[0] || 0), 0)
      const dwell = M.reduce((s, r) => s + (r[1] || 0), 0) / (M.length || 1)
      const doors = Math.ceil(arrivals * dwell / 24 * ((v.c as number) / 100))
      return [
        res('Doors required', num(doors, 0), doors >= 4 ? T.good : T.warn),
        res('Daily arrivals', num(arrivals, 0)),
        res('Avg dwell', hours(dwell)),
        res('Utilization span', `${numD(dwell / (arrivals ? 24 / (arrivals / 8) : 8), 2)}x peak`, T.neutral),
      ]
    },
  },
  {
    id: 'consignment-inventory-fee-estimator',
    archetype: 'est',
    blurb: 'Models what consignment stock on a customer site costs through fees and financing.',
    fields: [n('a', 'Consignment stock value ($)', { def: 150000 }), n('b', 'Storage fee % of value /yr', { def: 4 }), n('c', 'Insurance %', { def: 0.8 }), n('d', 'Financial cost %', { def: 8 }), n('e', 'Turnover /yr', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const totalRate = b + c + d / e
      const annual = a * (totalRate / 100)
      const perTurn = annual / (e || 1)
      return [
        res('Implied annual cost', money(annual), e >= 4 ? T.good : T.warn, 'Slow turns make consignment expensive.'),
        res('Cost per turn', money(perTurn)),
        res('Effective rate', pct(totalRate, 2), totalRate <= 6 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'distribution-center-location-gravity-model',
    archetype: 'est',
    blurb: 'Weighted center-of-gravity model to pick a distribution point from demand weights.',
    fields: [n('a', 'Demand west (k units)', { def: 40 }), n('b', 'Demand central (k units)', { def: 60 }), n('c', 'Demand east (k units)', { def: 30 }), n('d', 'Distance west-edge (miles)', { def: 300 }), n('e', 'Distance east-edge (miles)', { def: 300 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const total = a + b + c
      const posWest = (a * 0 + b * 0.5 + c * 1)
      const weighted = (posWest / (total || 1))
      const dist = (weighted * (d + e)) / 2
      return [
        res('Demand-weighted position', `${numD(weighted, 2)} (0=west, 1=east)`, T.neutral),
        res('Ideal hub location', `${numD(dist, 0)} miles from west edge`, T.neutral),
        res('Balance ratio', ratio(total ? (a + c) / (b * 2 || 1) : 0, 2), Math.abs(a - c) <= b ? T.good : T.warn, 'Skewed demand argues for an offset hub.'),
      ]
    },
  },
  {
    id: 'warehouse-sku-velocity-mapper',
    archetype: 'matrix',
    blurb: 'Bins SKUs by velocity ABC curve to guide pick-face slotting decisions.',
    fields: [mx('m', 'SKU classes', ['Class', 'SKUs', 'Share of picks %'], ['A (fast)', 'B (medium)', 'C (slow)']), n('c', 'Total picks /period', { def: 50000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const aShare = (M[0]?.[1] || 0)
      const aSkus = (M[0]?.[0] || 0)
      const curve = aSkus ? aShare / aSkus : 0
      return [
        res('A-class pick share', pct(aShare, 1), aShare >= 60 ? T.good : T.warn, 'A-class should carry 60-80% of picks.'),
        res('Concentration ratio', `${numD(curve, 1)}x`, curve >= 3 ? T.good : T.warn, 'A-group of few SKUs driving many picks = prime pick-face candidates.'),
        res('Pick volume', num((v.c as number), 0)),
      ]
    },
  },
  {
    id: 'warehouse-slotting-optimization-estimator',
    archetype: 'est',
    blurb: 'Estimates travel-time savings from regrouping fast movers into prime pick faces.',
    fields: [n('a', 'Current picks /day', { def: 3000 }), n('b', 'Current avg travel (ft)', { def: 450 }), n('c', 'After-slotting travel (ft)', { def: 260 }), n('d', 'Pick labor cost ($/hr)', { def: 28 }), n('e', 'Picks per hour', { def: 90 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const savedFt = (b - c) * a / 5280
      const savedHrs = savedFt / 2.5
      const saved = savedHrs * d
      return [
        res('Daily savings', money(saved), c < b ? T.good : T.warn, `${numD(savedFt, 0)} miles of walking removed.`),
        res('Hours recovered /day', numD(savedHrs, 2)),
        res('Pick pace', `${num(e, 0)} picks/hr`, T.neutral),
        res('Travel reduction', pct(b ? ((b - c) / b) * 100 : 0, 1), b ? (b - c) / b >= 0.3 ? T.good : T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'packaging-material-cost-minimizer',
    archetype: 'est',
    blurb: 'Weighs box overpacking against packaging cost to minimize total supply cost.',
    fields: [n('a', 'Units shipped /yr', { def: 200000 }), n('b', 'Current box oversize %', { def: 25 }), n('c', 'Alternative box cost ($)', { def: 0.45 }), n('d', 'Current box cost ($)', { def: 0.6 }), n('e', 'Cubic savings per unit (cu.ft)', { def: 0.8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const current = a * d
      const alt = a * c
      const freight = a * e * 0.06
      const saving = current - alt + freight
      const cuff = e * a
      return [
        res('Current spend', money(current)),
        res('Alternative & freight', money(alt)),
        res('Potential savings', money(saving), saving > 0 ? T.good : T.warn),
        res('Cube removed', `${num(cuff, 0)} cu.ft`, T.neutral),
        res('Oversize factor', pct(b, 0), b <= 15 ? T.good : b <= 35 ? T.warn : T.bad, 'Oversized boxes ship literal air and inflate cube.'),
      ]
    },
  },
  {
    id: 'safety-data-sheet-sds-chemical-indexer',
    archetype: 'matrix',
    blurb: 'Indexes SDS coverage per chemical family and flags gaps in hazard documentation.',
    fields: [mx('m', 'SDS coverage', ['Family', 'Chemicals with SDS', 'Chemicals in use'], ['Solvents', 'Acids / bases', 'Adhesives', 'Cleaners']), ck('r', 'Review notes', ['SDS < 3 years old', 'Translations available', 'Hazcom labels match', 'Spill kits sized by SDS'])],
    compute: (v) => {
      const M = v.m as number[][]
      const have = M.reduce((s, r) => s + (r[0] || 0), 0)
      const need = M.reduce((s, r) => s + (r[1] || 0), 0)
      const rate = need ? (have / need) * 100 : 0
      const items = v.r as boolean[]
      const checks = items.filter(Boolean).length
      return [
        res('SDS coverage', pct(rate, 1), rate >= 100 ? T.good : rate >= 90 ? T.warn : T.bad, rate < 100 ? `${num(need - have, 0)} SDS missing.` : 'Full documentation in place.'),
        res('Review score', `${num(checks, 0)}/4`, checks === 4 ? T.good : checks >= 2 ? T.warn : T.bad),
        res('Highest-use family', ['Solvents', 'Acids / bases', 'Adhesives', 'Cleaners'][M.reduce((bi, r, i) => ((r[1] || 0) > (M[bi][1] || 0) ? i : bi), 0)], T.neutral),
      ]
    },
  },
  {
    id: 'loss-and-shrinkage-rate-estimator',
    archetype: 'est',
    blurb: 'Quantifies inventory shrinkage from theft, damage, admin errors and supplier variance.',
    fields: [n('a', 'Yearly sales ($)', { def: 40000000 }), n('b', 'Book inventory ($)', { def: 5200000 }), n('c', 'Physical inventory ($)', { def: 5150000 }), n('d', 'Known damage write-offs ($)', { def: 30000 }), n('e', 'Sample count as % of stock', { def: 100 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const shrink = b - c
      const anomaly = shrink - d
      const rate = a ? (shrink / a) * 100 : 0
      const projection = e < 100 ? shrink / (e / 100) : shrink
      return [
        res('Shrinkage value', money(shrink), rate <= 1 ? T.good : rate <= 3 ? T.warn : T.bad, 'Healthy retail shrinkage is under 1.5% of sales.'),
        res('Shrinkage rate', pct(rate, 2)),
        res('Unexplained variance', money(anomaly), anomaly > a * 0.01 ? T.warn : T.good, 'Attribution matters — unexplained variance is theft or error.'),
        res('Projected full shrink', money(projection), T.neutral),
      ]
    },
  },
  {
    id: 'inventory-turnover-ratio-calculator',
    archetype: 'est',
    blurb: 'Measures inventory efficiency as COGS divided by average inventory.',
    fields: [n('a', 'COGS ($/yr)', { def: 24000000 }), n('b', 'Opening inventory ($)', { def: 5000000 }), n('c', 'Closing inventory ($)', { def: 4600000 }), n('d', 'Days in period', { def: 365 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const avg = (b + c) / 2
      const turns = avg ? a / avg : 0
      const dos = turns ? d / turns : 0
      return [
        res('Inventory turnover', `${numD(turns, 2)}×/yr`, turns >= 6 ? T.good : turns >= 4 ? T.warn : T.bad, 'Varies by industry; compare to your own history.'),
        res('Days of supply', num(dos, 1), dos <= 60 ? T.good : dos <= 90 ? T.warn : T.bad),
        res('Average inventory', money(avg), T.neutral),
      ]
    },
  },
  {
    id: 'cold-chain-temperature-variance-estimator',
    archetype: 'est',
    blurb: 'Scores temperature excursion risk across cold-chain segments and shipment share.',
    fields: [n('a', 'Shipments /yr', { def: 2400 }), n('b', 'Avg excursion duration (hrs)', { def: 3 }), n('c', 'Excursion shipments /yr', { def: 96 }), n('d', 'Avg deviation (°C)', { def: 2.5 }), n('e', 'Tolerance window (°C)', { def: 4 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const rate = a ? (c / a) * 100 : 0
      const severity = d / (e || 1)
      const risk = rate * severity * (b / 3)
      return [
        res('Excursion rate', pct(rate, 1), rate <= 4 ? T.good : rate <= 8 ? T.warn : T.bad, 'Above 8% excursions erode cold-chain certification.'),
        res('Severity multiplier', `${numD(severity, 2)}× tolerance`, severity <= 1 ? T.good : T.bad),
        res('Risk index', `${numD(risk, 1)}`, risk <= 6 ? T.good : T.warn),
        res('Excursion exposure', hours(b * c), T.neutral),
      ]
    },
  },
  {
    id: 'demand-forecasting-moving-average-calculator',
    archetype: 'est',
    blurb: 'Forecasts next-period demand using moving-averberg methods and accuracy checks.',
    fields: [n('a', 'Demand last period', { def: 120 }), n('b', 'Demand 2 periods ago', { def: 110 }), n('c', 'Demand 3 periods ago', { def: 100 }), n('d', 'Weighting (recent %)', { def: 50 }), n('e', 'Historical forecast (units)', { def: 118 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const w = d / 100
      const fma = a * w + b * (1 - w)
      const m3 = (a + b + c) / 3
      const blend = fma * 0.7 + m3 * 0.3
      const mape = e ? Math.abs(blend - a) / a * 100 : 0
      return [
        res('Forecast (weighted)', num(blend, 0)),
        res('Smoothing variant', `${num(fma, 0)} vs ${num(m3, 0)}`),
        res('Variability', pct(mape, 1), mape <= 10 ? T.good : mape <= 20 ? T.warn : T.bad, 'MAPE vs prior forecast.'),
      ]
    },
  },
  {
    id: 'freight-class-calculator-us-dot',
    archetype: 'est',
    blurb: 'Estimates NMFC freight class from density, liability and handling characteristics.',
    fields: [n('a', 'Shipment weight (lbs)', { def: 800 }), n('b', 'Shipment cube (cu.ft)', { def: 60 }), n('c', 'Density (lb/cu.ft)', { def: 13 }), sel('d', 'Handling / liability', ['Standard', 'High value / fragile', 'Hazardous regulated']), n('e', 'Value per lb ($)', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, e = v.e as number
      const density = c || (b ? a / b : 0)
      const base = density >= 50 ? 50 : density >= 30 ? 55 : density >= 22 ? 60 : density >= 15 ? 65 : density >= 12 ? 70 : density >= 10 ? 77.5 : density >= 8 ? 85 : density >= 6 ? 92.5 : density >= 5 ? 100 : 110
      const adj = (v.d as string).includes('Hazard') ? Math.min(150, base * 1.3) : (v.d as string).includes('High') ? Math.min(150, base * 1.15) : base
      return [
        res('Estimated freight class', `Class ${num(adj, 0)}`, T.neutral, c > 0 ? `Input density ${numD(c, 1)} lb/cu.ft.` : 'Density input used directly.'),
        res('Freight density', `${numD(density, 1)} lb/cu.ft`),
        res('Classification band', density >= 12 ? 'High density — favorable' : 'Low density — costly', density >= 12 ? T.good : T.warn),
        res('Value proxy', `${money(e * a)}/${num(a, 0)} lbs`, T.neutral),
      ]
    },
  },
  {
    id: 'volumetric-weight-dimensional-weight-calculator',
    archetype: 'est',
    blurb: 'Compares actual weight to volumetric weight to find which charge applies.',
    fields: [n('a', 'Length (in)', { def: 18 }), n('b', 'Width (in)', { def: 14 }), n('c', 'Height (in)', { def: 10 }), n('d', 'Actual weight (lbs)', { def: 22 }), n('e', 'Divisor (139 intl / 166 US)', { def: 139 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const dim = Math.ceil(a * b * c / e)
      const billable = Math.max(dim, d)
      const ratio = billable ? d / billable * 100 : 0
      return [
        res('Volumetric weight', `${num(dim, 0)} lbs`, T.neutral),
        res('Billable weight', `${num(billable, 0)} lbs`, dim > d ? T.warn : T.good, dim > d ? 'Billed on volume, not mass.' : 'Billed on actual weight.'),
        res('Mass utilization', pct(ratio, 1), ratio >= 60 ? T.good : T.warn, 'Low density = pay up for air.'),
      ]
    },
  },
  {
    id: 'incoterms-quick-selection-and-risk-guide',
    archetype: 'fmt',
    blurb: 'Selects the right Incoterms 2020 rule from cargo custody, cost and risk preferences.',
    fields: [sel('a', 'Mode', ['Sea / inland waterway only (FOB, CIF...)', 'Any mode (EXW, DDP...)']), sel('b', 'Who arranges main carriage', ['Seller complies in full (D-series)', 'Buyer arranges internationally', 'Seller arranges to a named point']), sel('c', 'Risk transfer preference', ['At seller premises (min seller risk)', 'On board vessel (FOB)', 'At destination (max seller risk)']), ck('i', 'Include in guide', ['Cost split table', 'Insurance obligations', 'Risk transfer point', 'Docs needed per rule'])],
    compute: (v) => {
      const mode = v.a as string, carriage = v.b as string, risk = v.c as string
      const items = v.i as boolean[]
      const incl = (x: number) => (items[x] ? 'INCLUDED' : 'OMITTED')
      let rule = 'DDP'
      if (risk.startsWith('At seller premises')) rule = 'EXW'
      else if (risk.startsWith('On board') || mode.startsWith('Sea / inland')) rule = 'FOB'
      else if (risk.startsWith('At destination')) rule = carriage.startsWith('Buyer arranges') ? 'DAP' : 'DDP'
      const doc = `INCOTERMS 2020 SELECTION\n\nRECOMMENDED RULE: ${rule}\n\n- COST SPLIT: seller carries origin + export docs until ${rule === 'FOB' ? 'vessel loading' : rule === 'EXW' ? 'collection from premises' : 'destination delivery'}. [${incl(0)}]\n- INSURANCE: ${rule.startsWith('C') ? 'seller must insure' : 'insurance is at buyer\'s option unless CIF/CPP'}. [${incl(1)}]\n- RISK TRANSFER: ${risk}. [${incl(2)}]\n- DOCS: commercial invoice, packing list, ${rule.startsWith('C') || rule.startsWith('D') ? 'transport doc' : 'proof of delivery'}. [${incl(3)}]\n\nConfirm the exact delivery point in the sales contract — Incoterms govern delivery only, not ownership.`
      return [res('Recommended rule', rule, rule !== 'EXW' ? T.good : T.warn, 'EXW leaves compliance to the buyer — risky for large export FOB deals.'), docRes('Guide', doc)]
    },
  },
  {
    id: 'customs-duty-and-import-tariff-estimator',
    archetype: 'est',
    blurb: 'Estimates import duty from HS category, CIF value, duty rate and preferential treatment.',
    fields: [n('a', 'CIF value ($)', { def: 50000 }), n('b', 'Duty rate %', { def: 8 }), n('c', 'VAT/GST rate %', { def: 10 }), sel('d', 'Preference program', ['None', 'Free-trade agreement', 'Drawback eligible']), n('e', 'Freight & insurance ($)', { def: 2000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, e = v.e as number
      const dutiable = a + e
      const duty = dutiable * (b / 100) * ((v.d as string).includes('agreement') ? 0.2 : 1)
      const vat = (dutiable + duty) * (c / 100)
      const total = duty + vat
      return [
        res('Estimable duty', money(duty)),
        res('VAT / import tax', money(vat)),
        res('Total import charges', money(total), vat > duty ? T.neutral : T.good),
        res('Charge on CIF', pct(a ? (total / a) * 100 : 0, 1), T.neutral),
      ]
    },
  },
  {
    id: 'logistics-cost-as-a-percent-of-sales-calculator',
    archetype: 'est',
    blurb: 'Benchmarks total logistics spend against sales revenue.',
    fields: [n('a', 'Annual sales ($)', { def: 100000000 }), n('b', 'Transport spend ($)', { def: 6000000 }), n('c', 'Warehousing spend ($)', { def: 3500000 }), n('d', 'Inventory carrying ($)', { def: 2200000 }), n('e', 'Admin & systems ($)', { def: 800000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const total = b + c + d + e
      const share = a ? (total / a) * 100 : 0
      return [
        res('Total logistics cost', money(total)),
        res('Logistics as % of sales', pct(share, 2), share <= 8 ? T.good : share <= 12 ? T.warn : T.bad, 'Benchmark bands: 6-10% typical; under 6% for lean operators.'),
        res('Transport share', pct(total ? (b / total) * 100 : 0, 1)),
        res('Carrying share', pct(total ? (d / total) * 100 : 0, 1), total ? d / total <= 0.25 ? T.good : T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'third-party-logistics-3pl-cost-comparator',
    archetype: 'matrix',
    blurb: 'Scores 3PL candidates across cost per order, pick accuracy and service levels.',
    fields: [mx('m', '3PL bids', ['3PL', 'Cost /order ($)', 'Accuracy (99.x%)', 'ETA score /5'], ['3PL A', '3PL B', '3PL C']), n('c', 'Orders /mo', { def: 18000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const c = v.c as number
      const ann = (i: number) => (M[i]?.[0] || 0) * c * 12
      const err = (i: number) => (100 - (M[i]?.[1] || 99)) / 100 * (M[i]?.[2] || 3)
      const best = M.reduce((bi, _, i) => (ann(i) * 0.7 + err(i) * 1000 * 10 < ann(bi) * 0.7 + err(bi) * 1000 * 10 ? i : bi), 0)
      return [
        res('Lowest TCO bid', ['3PL A', '3PL B', '3PL C'][best], T.good),
        res('Cost spread', `${money(Math.max(0, ann(0) - ann(2)))} (A vs C)`, T.neutral),
        res('Order volume', num(c, 0), T.neutral),
        res('Mistake-weighted cost', `${money(ann(0))} approx`, T.neutral),
      ]
    },
  },
  {
    id: 'fleet-fuel-consumption-and-route-costing',
    archetype: 'est',
    blurb: 'Computes route fuel cost and total trip economics for a delivery fleet.',
    fields: [n('a', 'Route distance (mi)', { def: 220 }), n('b', 'MPG (loaded)', { def: 7 }), n('c', 'Fuel price ($/gal)', { def: 3.6 }), n('d', 'Driver cost ($/hr)', { def: 32 }), n('e', 'Route time (hrs)', { def: 6 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const fuel = (a / (b || 1)) * c
      const driver = d * e
      const vhcl = a * 0.55
      const total = fuel + driver + vhcl
      const perMile = total / (a || 1)
      return [
        res('Fuel cost', moneyC(fuel)),
        res('Driver cost', money(driver)),
        res('Vehicle & variable', moneyC(vhcl)),
        res('Total trip cost', money(total), perMile <= 4 ? T.good : perMile <= 7 ? T.warn : T.bad, `${moneyC(perMile)} per mile.`),
      ]
    },
  },
  {
    id: 'drop-shipping-margin-estimator',
    archetype: 'est',
    blurb: 'Models drop-shipping margins after freight, fees and return risk.',
    fields: [n('a', 'Retail price ($)', { def: 89 }), n('b', 'Supplier cost ($)', { def: 52 }), n('c', 'Customer freight ($)', { def: 8 }), n('d', 'Fulfillment fee ($)', { def: 5 }), n('e', 'Return rate %', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const gross = a - b - c - d
      const returnCost = Math.max(0, gross * (e / 100) * 0.5 - a * 0) + (a + c) * 0.09 * (e / 100)
      const net = gross - returnCost
      const margin = a ? (net / a) * 100 : 0
      return [
        res('Gross margin /order', moneyC(gross)),
        res('Net after returns', moneyC(net), net > b * 0.3 ? T.good : net > 0 ? T.warn : T.bad, 'Return freight can erase thin margins entirely.'),
        res('Net margin %', pct(margin, 1), margin >= 20 ? T.good : margin >= 10 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'reverse-logistics-and-return-handling-cost-estimator',
    archetype: 'est',
    blurb: 'Costs the full return journey from receipt, inspection, restock and disposition.',
    fields: [n('a', 'Returns /mo', { def: 800 }), n('b', 'Inbound freight /return ($)', { def: 6.5 }), n('c', 'Handling & inspection ($)', { def: 3 }), n('d', 'Restock yield %', { def: 70 }), n('e', 'Disposition loss % of value', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const per = b + c
      const monthly = a * per
      const restocked = a * (d / 100)
      const avgVal = 60
      const loss = (a - restocked) * avgVal * (e / 100)
      const total = monthly + loss
      return [
        res('Monthly return cost', money(total)),
        res('Cost per return', moneyC(per)),
        res('Restock rate', pct(d, 0), d >= 70 ? T.good : d >= 50 ? T.warn : T.bad),
        res('Annualized burden', money(total * 12), T.neutral),
      ]
    },
  },
  {
    id: 'fleet-vehicle-replacement-cycle-estimator',
    archetype: 'est',
    blurb: 'Finds the economic replacement point for vehicles from depreciation and rising maintenance.',
    fields: [n('a', 'Vehicle cost ($)', { def: 52000 }), n('b', 'Annual decline in value %', { def: 15 }), n('c', 'Annual maintenance (yr 1-3 avg)', { def: 1800 }), n('d', 'Maintenance growth %/yr', { def: 20 }), n('e', 'Residual after 4 yrs ($)', { def: 24000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const g = d / 100
      const dep4 = a - e
      const cost3 = dep4 / 4 + c * ((1 + Math.pow(1 + g, 2)) / 3)
      const cost5 = (a - e * 0.6) / 5 + c * ((1 + Math.pow(1 + g, 2) + Math.pow(1 + g, 4)) / 4)
      const swap = cost5 < cost3
      const depRate = (1 - Math.pow(e / a, 1 / 4)) * 100
      return [
        res('3-yr holding cost/yr', money(cost3)),
        res('5-yr holding cost/yr', money(cost5), swap ? T.good : T.warn, swap ? 'Keeping to 5 years is cheaper per year.' : 'Trade before year 4.'),
        res('Implied annual decline', pct(depRate, 1), depRate <= b * 1.1 ? T.good : T.warn, `Your value decline input ${pct(b, 0)}.`),
        res('Residual % after 4', pct(a ? (e / a) * 100 : 0, 0), T.neutral),
      ]
    },
  },
  {
    id: 'last-mile-delivery-cost-estimator',
    archetype: 'est',
    blurb: 'Breaks last-mile cost into stops, distance, fuel, labor and failed-delivery risk.',
    fields: [n('a', 'Deliveries /driver-day', { def: 90 }), n('b', 'Route distance (mi)', { def: 60 }), n('c', 'Driver cost /day ($)', { def: 240 }), n('d', 'Vehicle cost /day ($)', { def: 85 }), n('e', 'Failed delivery rate %', { def: 6 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const fuel = b * 0.42
      const base = (c + d + fuel) / (a || 1)
      const retry = e / 100 * (base * 1.8)
      const total = base + retry
      return [
        res('Cost per stop', moneyC(total), total <= 8 ? T.good : total <= 13 ? T.warn : T.bad, 'Dense urban stops run under $8; suburban sprawl higher.'),
        res('Base cost', moneyC(base)),
        res('Failed delivery add-on', moneyC(retry), e <= 3 ? T.good : e <= 6 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'co2-shipping-footprint-calculator',
    archetype: 'est',
    blurb: 'Estimates the CO2 footprint of freight by mode, distance and load factor.',
    fields: [n('a', 'Distance (km)', { def: 800 }), n('b', 'Payload (t)', { def: 18 }), n('c', 'Load factor %', { def: 80 }), sel('d', 'Mode', ['Truck (long-haul)', 'Ocean (container)', 'Rail', 'Air cargo'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const gCo2 = (v.d as string).includes('Air') ? 550 : (v.d as string).includes('Ocean') ? 12 : (v.d as string).includes('Rail') ? 25 : 95
      const eff = c ? b * (c / 100) : b
      const co2 = a * eff * gCo2 / 1000
      return [
        res('Mode emissions intensity', `${num(gCo2, 0)} g/t-km`),
        res('Trip CO2', `${numD(co2, 1)} t CO2e`),
        res('Per-ton efficiency', `${numD(a ? co2 / a : 0, 3)} t/km`, c >= 80 ? T.good : T.warn, `Load factor ${num(c, 0)}% — raise it to cut per-ton CO2.`),
      ]
    },
  },
  {
    id: 'demurrage-and-detention-fee-calculator',
    archetype: 'est',
    blurb: 'Computes container demurrage/detention exposure from free days and port fees.',
    fields: [n('a', 'Containers /mo', { def: 120 }), n('b', 'Free container days at port', { def: 5 }), n('c', 'Free chassis days', { def: 2 }), n('d', 'Charged days (demurrage)', { def: 1 }), n('e', 'Charge per day ($)', { def: 90 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const exposed = Math.max(0, d - b)
      const cost = a * exposed * e
      const fine = Math.max(0, d - c) * 60
      const total = cost + a * fine
      return [
        res('Monthly demurrage cost', money(total), exposed <= 0 ? T.good : T.warn, `${num(exposed, 0)} day(s) past free time.`),
        res('Chargeable days', num(exposed, 0), T.neutral),
        res('Per-container burden', money(total / (a || 1)), T.neutral),
      ]
    },
  },
  {
    id: 'customs-brokerage-fee-estimator',
    archetype: 'est',
    blurb: 'Estimates brokerage fees per shipment from entry type and documentary complexity.',
    fields: [n('a', 'Shipments /mo', { def: 150 }), n('b', 'Entry fee ($)', { def: 85 }), n('c', 'Bonds & filings ($)', { def: 25 }), n('d', 'Compliance support share %', { def: 40 }), n('e', 'Valuation / protest entries /mo', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const average = b + c + (b * (d / 100))
      const special = e * (b * 0.6 + 40)
      const monthly = a * average + special
      const per = monthly / (a || 1)
      return [
        res('Monthly brokerage spend', money(monthly), per <= 140 ? T.good : T.warn),
        res('Cost per entry', moneyC(per)),
        res('Special handling', money(special), e > a * 0.05 ? T.warn : T.good, 'High protest volume signals classification gaps.'),
      ]
    },
  },
  {
    id: 'carrier-performance-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores carriers on transit, reliability, damage and rate to steer allocation.',
    fields: [mxd('m', 'Carrier metrics', ['Metric', 'Weight %', 'Score /10'], ['On-time transit', 'Condition & claim rate', 'Rate competitiveness', 'Capacity commitment'], [[30, 7], [25, 7], [25, 7], [20, 7]])],
    compute: (v) => {
      const M = v.m as number[][]
      const totW = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + ((r[0] || 0) * (r[1] || 0)), 0) / totW
      const tier = score >= 8.5 ? 'Core long-term' : score >= 7 ? 'Preferred' : score >= 5 ? 'Spot / trial' : 'Exit'
      return [
        res('Carrier score', `${numD(score, 1)}/10`, score >= 7 ? T.good : score >= 5 ? T.warn : T.bad),
        res('Allocation tier', tier, T.neutral),
        res('Weakest metric', ['On-time transit', 'Condition & claim rate', 'Rate competitiveness', 'Capacity commitment'][M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)], T.neutral),
      ]
    },
  },
  {
    id: 'supplier-on-time-in-full-otif-scorer',
    archetype: 'est',
    blurb: 'Measures supplier OTIF as on-time and complete deliveries against promise.',
    fields: [n('a', 'Deliveries due on-time', { def: 190 }), n('b', 'Deliveries complete (no short)', { def: 180 }), n('c', 'Total deliveries measured', { def: 200 }), n('d', 'Other / disputed', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const ot = a / (c || 1) * 100
      const if_ = b / (c || 1) * 100
      const otif2 = c ? Math.min(a, b) / c * 100 : 0
      return [
        res('On-time %', pct(ot, 1), ot >= 92 ? T.good : ot >= 85 ? T.warn : T.bad),
        res('In-full %', pct(if_, 1), if_ >= 95 ? T.good : T.warn),
        res('OTIF score', pct(otif2, 1), otif2 >= 88 ? T.good : otif2 >= 75 ? T.warn : T.bad, 'Weighted-performance measure for scorecards.'),
        res('Disputed lines', num(d, 0), T.neutral),
      ]
    },
  },
  {
    id: 'lead-time-variability-estimator',
    archetype: 'est',
    blurb: 'Quantifies supply lead-time spread and its impact on required safety stock.',
    fields: [n('a', 'Avg lead time (days)', { def: 24 }), n('b', 'Lead-time std dev (days)', { def: 6 }), n('c', 'Daily demand', { def: 110 }), n('d', 'Demand std dev', { def: 40 }), sel('e', 'Service level', ['90% z=1.28', '95% z=1.65', '99% z=2.33'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const z = (v.e as string).includes('99') ? 2.33 : (v.e as string).includes('95') ? 1.65 : 1.28
      const ssFixed = z * Math.sqrt(a * d * d)
      const ssVar = z * Math.sqrt(a * d * d + c * c * b * b)
      const extra = ssVar - ssFixed
      return [
        res('Safety stock — fixed LT', num(ssFixed, 0)),
        res('Safety stock — variable LT', num(ssVar, 0), T.neutral),
        res('Variability penalty', num(extra, 0), extra <= ssFixed * 0.3 ? T.good : T.warn, 'Lead-time spread quietly inflates inventory.'),
        res('LT coefficient of var', pct(b ? (b / a) * 100 : 0, 1), T.neutral),
      ]
    },
  },
  {
    id: 'overall-equipment-effectiveness-oee-calculator',
    archetype: 'est',
    blurb: 'Decomposes OEE into availability, performance and quality to find the loss.',
    fields: [n('a', 'Planned runtime (hrs)', { def: 16 }), n('b', 'Actual runtime (hrs)', { def: 13.5 }), n('c', 'Cycle time ideal (min/unit)', { def: 6 }), n('d', 'Total units produced', { def: 120 }), n('e', 'Good units', { def: 113 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const avail = a ? (b / a) * 100 : 0
      const perf = b ? (c * d / 60) / b * 100 : 0
      const quality = d ? (e / d) * 100 : 0
      const oee = avail * perf * quality / 10000
      return [
        res('OEE', pct(oee, 1), oee >= 85 ? T.good : oee >= 70 ? T.warn : T.bad, 'World-class OEE is ~85%; many plants sit 60-70%.'),
        res('Availability', pct(avail, 1)),
        res('Performance', pct(perf, 1)),
        res('Quality', pct(quality, 1)),
      ]
    },
  },
  {
    id: 'bill-of-materials-bom-cost-exploder',
    archetype: 'bdown',
    blurb: 'Rolls up component costs into product cost with scrap and overhead.',
    fields: [mx('m', 'BOM lines', ['Component', 'Qty per unit', 'Unit cost ($)'], ['Chassis', 'Motor', 'Controller', 'Harness', 'Plastics']), n('c', 'Scrap rate %', { def: 3 })],
    compute: (v) => {
      const M = v.m as number[][]
      const c = v.c as number
      const mat = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0)
      const scrap = mat * (c / 100)
      const burden = mat * 0.12
      const total = mat + scrap + burden
      return [
        res('Material cost', moneyC(mat)),
        res('Scrap loading', moneyC(scrap)),
        res('Burden & overhead', moneyC(burden)),
        res('Unit production cost', moneyC(total), T.neutral),
      ]
    },
  },
  {
    id: 'mean-time-between-failures-mtbf-calculator',
    archetype: 'est',
    blurb: 'Computes average runtime per failure from operating time and failure count.',
    fields: [n('a', 'Operating hours (period)', { def: 4000 }), n('b', 'Failures', { def: 6 }), n('c', 'Preventive downtime (hrs)', { def: 300 }), n('d', 'Esp failures unreported %', { def: 10 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const uptime = a - c
      const eff = b * (1 + d / 100)
      const mtbf = eff ? uptime / eff : 0
      return [
        res('MTBF', `${num(mtbf, 2)} hrs`, mtbf >= 500 ? T.good : mtbf >= 200 ? T.warn : T.bad, 'Adjust for unlogged failures — they’re the silent killer of MTBF.'),
        res('Failure rate /hr', ratio(eff ? eff / uptime : 0, 5)),
        res('Uptime share', pct(uptime / (a || 1) * 100, 1), T.neutral),
      ]
    },
  },
  {
    id: 'mean-time-to-repair-mttr-calculator',
    archetype: 'est',
    blurb: 'Averages repair and restoration time per failure to project downtime cost.',
    fields: [n('a', 'Total repair time (hrs)', { def: 14 }), n('b', 'Failures repaired', { def: 6 }), n('c', 'Spare parts lag (hrs)', { def: 2 }), n('d', 'Downtime cost /hr ($)', { def: 1500 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const mttr = b ? (a + c * b) / b : 0
      const costPer = mttr * d
      return [
        res('MTTR', `${num(mttr, 2)} hrs`, mttr <= 4 ? T.good : mttr <= 8 ? T.warn : T.bad),
        res('Downtime cost /incident', money(costPer)),
        res('Parts lag share', pct(mttr ? (c / mttr) * 100 : 0, 1), c <= mttr * 0.3 ? T.good : T.warn, 'Pre-position spares to cut MTTR.'),
      ]
    },
  },
  {
    id: 'manufacturing-cycle-efficiency-mce-calculator',
    archetype: 'est',
    blurb: 'Measures MCE as value-added processing time divided by total lead time.',
    fields: [n('a', 'Processing time (hrs)', { def: 3 }), n('b', 'Inspection time (hrs)', { def: 1 }), n('c', 'Transport time (hrs)', { def: 2 }), n('d', 'Waiting time (hrs)', { def: 20 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const total = a + b + c + d
      const mce = total ? (a / total) * 100 : 0
      return [
        res('Cycle efficiency (MCE)', pct(mce, 1), mce >= 25 ? T.good : mce >= 10 ? T.warn : T.bad, 'Lean plants reach 25-50%; batch shops often under 10%.'),
        res('Total lead time', hours(total)),
        res('Waste share (non-processing)', pct(total ? 100 - mce : 0, 1), T.neutral),
      ]
    },
  },
  {
    id: 'takt-time-and-cycle-time-calculator',
    archetype: 'est',
    blurb: 'Sets takt time from customer demand and compares it to the work-station cycle time.',
    fields: [n('a', 'Available time (min/shift)', { def: 460 }), n('b', 'Customer demand /shift', { def: 400 }), n('c', 'Cycle time bottleneck (min)', { def: 1.4 }), n('d', 'Shift factor (shifts/day)', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const takt = b ? a / b : 0
      const stations = Math.ceil(c / (takt || 1) * (d || 1))
      const impact = c / (takt || 1)
      return [
        res('Takt time', `${numD(takt, 2)} min/unit`, c <= takt * d ? T.good : T.bad, c > takt * d ? 'Bottleneck exceeds takt — customers outpace the line.' : 'Capacity beats demand on takt.'),
        res('Station loading', stations ? num(stations, 0) + ' stations' : '—', T.neutral),
        res('Load ratio', ratio(impact, 2), impact <= 1 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'kanban-card-and-wip-limit-calculator',
    archetype: 'est',
    blurb: 'Rightsizes Kanban card counts from demand, lead time and safety stock.',
    fields: [n('a', 'Monthly demand (units)', { def: 12000 }), n('b', 'Container capacity', { def: 200 }), n('c', 'Lead time (days)', { def: 4 }), n('d', 'Safety stock (days)', { def: 2 }), n('e', 'Signal steps (kans)', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const daily = a / 20
      const kanban = Math.ceil((daily * (c + d)) / (b || 1) * (e || 1))
      return [
        res('Kanban cards', num(kanban, 0), kanban >= 2 ? T.good : T.warn),
        res('WIP in system', num(kanban * b, 0), T.neutral),
        res('Coverage days', numD(kanban * b / (daily || 1), 1)),
      ]
    },
  },
  {
    id: 'just-in-time-jit-buffer-index-estimator',
    archetype: 'est',
    blurb: 'Builds a JIT buffer index from variability, distance and demand to set stock cover.',
    fields: [n('a', 'Supplier lead-time var (days)', { def: 3 }), n('b', 'Distance (miles)', { def: 250 }), n('c', 'Demand var %', { def: 15 }), n('d', 'Hourly usage (units)', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const transport = b / 900
      const index = (a + transport * 2 + c / 40) * d
      const hrStock = index / (d || 1)
      return [
        res('Buffer index', `${numD(index, 0)} units`, hrStock <= 8 ? T.good : hrStock <= 20 ? T.warn : T.bad, `≈ ${numD(hrStock, 1)} hours of cover.`),
        res('Transport exposure', `${numD(transport, 2)} days`),
        res('Cover recommendation', hours(hrStock)),
      ]
    },
  },
  {
    id: 'supply-chain-bottleneck-finder',
    archetype: 'matrix',
    blurb: 'Scores each supply chain stage on capacity, time and variability to rank bottlenecks.',
    fields: [mx('m', 'Chain stages', ['Stage', 'Capacity score /5', 'Time score /5'], ['Procurement', 'Production', 'Warehousing', 'Transport', 'Retail delivery'])],
    compute: (v) => {
      const M = v.m as number[][]
      const stress = M.map((r) => (r[0] || 0) + (r[1] || 0))
      const worst = stress.indexOf(Math.max(...stress))
      const sl = ['Procurement', 'Production', 'Warehousing', 'Transport', 'Retail delivery']
      const avg = stress.reduce((a, b) => a + b, 0) / stress.length
      return [
        res('Bottleneck stage', sl[worst], Math.max(...stress) >= avg * 1.25 ? T.bad : T.warn),
        res('System stress avg', `${numD(avg, 1)}/10`, avg >= 7 ? T.bad : avg >= 4 ? T.warn : T.good),
        res('Balanced stages', num(stress.filter((s) => Math.abs(s - avg) <= 1.5).length, 0), T.neutral),
      ]
    },
  },
  {
    id: 'equipment-lease-vs-buy-roi-matrix',
    archetype: 'matrix',
    blurb: 'Compares leasing versus buying equipment over the holding period with cash-flow view.',
    fields: [n('a', 'Equipment cost ($)', { def: 45000 }), n('b', 'Lease payment /mo ($)', { def: 1300 }), n('c', 'Holding period (months)', { def: 36 }), n('d', 'Residual after period ($)', { def: 18000 }), mx('q', 'Benefit score', ['Option', 'Cash-flow fit /5', 'Tax fit /5'], ['Lease', 'Buy'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const leaseTotal = b * c
      const buyNPV = a - d * Math.pow(1.06, -c / 12)
      const diff = leaseTotal - buyNPV
      return [
        res('Lease total outflow', money(leaseTotal)),
        res('Buy net outflow (w residual)', money(buyNPV)),
        res('Cheaper path', diff >= 0 ? 'BUY' : 'LEASE', diff >= 0 ? T.good : T.warn, diff >= 0 ? 'Residual makes purchase cheaper.' : 'Lease preserves cash over the horizon.'),
        res('Saving', money(Math.abs(diff))),
      ]
    },
  },
  {
    id: 'assembly-line-balancing-calculator',
    archetype: 'est',
    blurb: 'Balances work-station content against takt and reports balance efficiency.',
    fields: [n('a', 'Total work content (min)', { def: 22 }), n('b', 'Stations', { def: 6 }), n('c', 'Takt time (min)', { def: 4 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const idealStations = a / (c || 1)
      const eff = (idealStations / (b || 1)) * 100
      return [
        res('Balance efficiency', pct(Math.min(eff, 100), 1), eff >= 85 ? T.good : eff >= 70 ? T.warn : T.bad, 'Above 85% is excellent; below 70% rebalance the line.'),
        res('Ideal stations', numD(idealStations, 1)),
        res('Under-load slack', numD(b - idealStations, 1) + ' stations'),
      ]
    },
  },
  {
    id: 'value-stream-mapping-vsm-lead-time-analyzer',
    archetype: 'est',
    blurb: 'Compares processing time to full lead time to expose lean-value ratio.',
    fields: [n('a', 'Sum of processing times (min)', { def: 38 }), n('b', 'Full lead time (days)', { def: 15 }), n('c', 'Non-value add time (hrs)', { def: 320 }), n('d', 'Rework rate %', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const va = b ? (a / 60) / (b * 24) * 100 : 0
      const wasted = c / (b * 24) * 100
      const rework = d
      return [
        res('Value-added ratio', pct(Math.max(0, va), 2), va >= 5 ? T.good : va >= 1 ? T.warn : T.bad, 'Batch value streams rarely exceed 2%.'),
        res('Waste share', pct(wasted, 1)),
        res('Rework drag', pct(rework, 1), rework <= 5 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'batch-size-production-cost-calculator',
    archetype: 'est',
    blurb: 'Finds the batch size that balances set-up cost against inventory holding.',
    fields: [n('a', 'Annual demand (units)', { def: 48000 }), n('b', 'Set-up cost ($)', { def: 400 }), n('c', 'Holding cost /unit/yr ($)', { def: 4 }), n('d', 'Current batch size', { def: 4000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const eoq = c ? Math.sqrt((2 * a * b) / c) : 0
      const cur = (a / d) * b + (d / 2) * c
      const opt = (a / (eoq || 1)) * b + (eoq / 2) * c
      return [
        res('Optimal batch', num(eoq, 0), eoq > 0 && eoq < d ? T.good : T.neutral),
        res('Current annual cost', money(cur)),
        res('Potential saving', money(Math.max(0, cur - opt)), cur > opt ? T.good : T.warn),
        res('Set-ups /yr', numD(a / (eoq || 1), 1)),
      ]
    },
  },
  {
    id: 'preventive-maintenance-schedule-builder',
    archetype: 'timeline',
    blurb: 'Lays out PM intervals per asset on a calendar with day offsets from program start.',
    fields: [dt('s', 'Program start'), mx('m', 'PM plan', ['Task', 'Interval (days)'], ['Lubrication & inspection', 'Calibration', 'Filter & belt change', 'Major overhaul', 'Safety check'])],
    compute: (v) => {
      const M = v.m as number[][]
      const total = Math.max(...M.map((r) => r[0] || 0))
      const load = M.reduce((s, r) => s + Math.max(1, Math.round(365 / (r[0] || 365))), 0)
      return [
        res('Longest to first major', days(total)),
        res('Worker events over 3 yrs', num(load * 3, 0), load <= 12 ? T.good : T.warn, 'PM calendar resource load check.'),
        res('Tasks scheduled', num(M.length, 0)),
      ]
    },
  },
  {
    id: 'quality-yield-and-scrap-rate-calculator',
    archetype: 'est',
    blurb: 'Reports first-pass yield and scrap cost from good, rework and rejected units.',
    fields: [n('a', 'Units started', { def: 10000 }), n('b', 'Good first-pass units', { def: 8800 }), n('c', 'Reworked to good', { def: 600 }), n('d', 'Scrapped units', { def: 600 }), n('e', 'Cost per scrapped unit ($)', { def: 12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const fpy = a ? (b / a) * 100 : 0
      const yield_ = a ? ((b + c) / a) * 100 : 0
      const scrap = d * e
      const rwNow = d
      return [
        res('First-pass yield', pct(fpy, 1), fpy >= 90 ? T.good : fpy >= 80 ? T.warn : T.bad),
        res('Final yield', pct(yield_, 1), yield_ >= 95 ? T.good : T.warn),
        res('Scrap cost', money(scrap), rwNow <= a * 0.05 ? T.good : T.warn),
        res('Rework burden', pct(a ? (c / a) * 100 : 0, 1), T.neutral),
      ]
    },
  },
  {
    id: 'return-on-net-assets-rona-supply-chain-metric',
    archetype: 'est',
    blurb: 'Measures RONA for the supply chain from operating profit and net assets.',
    fields: [n('a', 'Operating profit ($)', { def: 6000000 }), n('b', 'Net assets — supply chain ($)', { def: 30000000 }), n('c', 'Inventory component ($)', { def: 8000000 }), n('d', 'Working capital component ($)', { def: 4000000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const rona = b ? (a / b) * 100 : 0
      const assetTurn = b ? a * 3 / b : 0
      const invShare = b ? (c / b) * 100 : 0
      return [
        res('RONA', pct(rona, 1), rona >= 20 ? T.good : rona >= 12 ? T.warn : T.bad, 'Supply-chain RONA above 20% is strong.'),
        res('Inventory weight', pct(invShare, 1), c <= b * 0.4 ? T.good : T.warn),
        res('WC + inventory tie-up', money(c + d), T.neutral),
        res('Asset efficiency proxy', `${numD(assetTurn, 2)}x`, T.neutral),
      ]
    },
  },
]