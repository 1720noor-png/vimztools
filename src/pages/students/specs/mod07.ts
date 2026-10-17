import { n, sel, txt, res, T, asNum, asSel, asStr, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec, type StudentResult } from './studentSpec'

const SUBJECT = 'Chemistry & Physics Tools'

const ELEMENTS: Record<string, number> = {
  H: 1.008, He: 4.003, Li: 6.94, Be: 9.012, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
  Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.868,
  I: 126.904, Au: 196.967, Hg: 200.592, Pb: 207.2,
}

function parseGroup(s: string): Record<string, number> | null {
  let i = 0
  const readNum = (): number => {
    const m = /^\d+/.exec(s.slice(i))
    if (!m) return 1
    i += m[0].length
    return parseInt(m[0], 10)
  }
  const parseSeq = (): Record<string, number> | null => {
    const acc: Record<string, number> = {}
    let seen = false
    while (i < s.length && s[i] !== ')') {
      if (s[i] === '(') {
        i++
        const inner = parseSeq()
        if (!inner || s[i] !== ')') return null
        i++
        const m = readNum()
        for (const k of Object.keys(inner)) acc[k] = (acc[k] || 0) + inner[k] * m
        seen = true
      } else if (/[A-Z]/.test(s[i])) {
        const m = /^([A-Z][a-z]?)/.exec(s.slice(i))
        if (!m) return null
        i += m[1].length
        acc[m[1]] = (acc[m[1]] || 0) + readNum()
        seen = true
      } else {
        return null
      }
    }
    return seen ? acc : null
  }
  const out = parseSeq()
  return out && i === s.length ? out : null
}

function formulaCounts(formula: string): Record<string, number> | null {
  const parts = formula.replace(/\s/g, '').split(/[.·*]/)
  const total: Record<string, number> = {}
  for (const part of parts) {
    const lead = /^(\d+)/.exec(part)
    const mult = lead ? parseInt(lead[1], 10) : 1
    const body = lead ? part.slice(lead[1].length) : part
    if (!body) return null
    const one = parseGroup(body)
    if (!one) return null
    for (const k of Object.keys(one)) total[k] = (total[k] || 0) + one[k] * mult
  }
  return Object.keys(total).length ? total : null
}

type Fr = { n: number; d: number }

const gcdN = (a: number, b: number): number => {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a || 1
}

const fNorm = (n: number, d: number): Fr => {
  if (d === 0) return { n: 0, d: 1 }
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcdN(n, d)
  return { n: n / g, d: d / g }
}
const fSub = (a: Fr, b: Fr) => fNorm(a.n * b.d - b.n * a.d, a.d * b.d)
const fMul = (a: Fr, b: Fr) => fNorm(a.n * b.n, a.d * b.d)
const fDiv = (a: Fr, b: Fr) => fNorm(a.n * b.d, a.d * b.n)
const fZero = (a: Fr) => a.n === 0

function smallestIntegers(vec: Fr[]): number[] | null {
  const lcm = (a: number, b: number) => (a / gcdN(a, b)) * b
  let den = 1
  for (const f of vec) den = lcm(den, f.d)
  const ints = vec.map((f) => (f.n * den) / f.d)
  const g = ints.reduce((a, b) => gcdN(a, b), 0) || 1
  const prim = ints.map((i) => i / g)
  const hasPos = prim.some((i) => i > 0)
  const hasNeg = prim.some((i) => i < 0)
  if (!hasPos || hasNeg) return null
  return prim
}

function balanceCoefficients(counts: (Record<string, number> | null)[], leftN: number): number[] | null {
  const elems = [...new Set(counts.flatMap((c) => Object.keys(c || {})))]
  const m = elems.length
  const n = counts.length
  if (!m || !n) return null
  const A: Fr[][] = elems.map((e) => counts.map((c, j) => ({ n: (c ? c[e] || 0 : 0) * (j < leftN ? 1 : -1), d: 1 })))
  let r = 0
  const pivotCols: number[] = []
  for (let c = 0; c < n && r < m; c++) {
    let pr = -1
    for (let i = r; i < m; i++) if (!fZero(A[i][c])) { pr = i; break }
    if (pr < 0) continue
    const tmp = A[r]
    A[r] = A[pr]
    A[pr] = tmp
    const p = A[r][c]
    for (let j = 0; j < n; j++) A[r][j] = fDiv(A[r][j], p)
    for (let i = 0; i < m; i++) {
      if (i === r || fZero(A[i][c])) continue
      const f = A[i][c]
      for (let j = 0; j < n; j++) A[i][j] = fSub(A[i][j], fMul(f, A[r][j]))
    }
    pivotCols.push(c)
    r++
  }
  const free = []
  for (let c = 0; c < n; c++) if (!pivotCols.includes(c)) free.push(c)
  for (const fc of free) {
    const vec: Fr[] = new Array(n)
    for (let i = 0; i < n; i++) vec[i] = { n: 0, d: 1 }
    vec[fc] = { n: 1, d: 1 }
    pivotCols.forEach((pc, ri) => {
      vec[pc] = fNorm(-A[ri][fc].n, A[ri][fc].d)
    })
    const prim = smallestIntegers(vec)
    if (prim) return prim
  }
  return null
}

function molarMass(formula: string): { mass: number; parsed: boolean; counts: Record<string, number> | null } {
  const counts = formulaCounts(formula)
  if (!counts) return { mass: 0, parsed: false, counts: null }
  let m = 0
  for (const sym of Object.keys(counts)) {
    if (ELEMENTS[sym] === undefined) return { mass: 0, parsed: false, counts }
    m += ELEMENTS[sym] * counts[sym]
  }
  return { mass: m, parsed: true, counts }
}

export const mod07: StudentSpec[] = [
  {
    id: 'chemical-equation-balancer',
    name: 'Chemical Equation Balancer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Balances chemical equations for you, reporting the smallest whole-number coefficients and a verified atom-by-atom conservation table.',
    tip: 'Balance metals first, then H, then O — and never change subscripts inside a formula, only the leading coefficients.',
    usage: ['Enter the unbalanced equation.', 'Read the balanced form.', 'Check the atom-by-atom conservation.'],
    method: ['Each species is parsed into element counts, parentheses and hydrates included.', 'Coefficients are solved in exact fractions so atoms match on both sides.', 'A conservation table verifies the solution.'],
    fields: [txt('eq', 'Equation (e.g. C3H8 + O2 -> CO2 + H2O)', 3, 'C3H8 + O2 -> CO2 + H2O')],
    compute: (v) => {
      const raw = asStr(v.eq).replace(/→/g, '->').replace(/⇌|⟷/g, '->')
      const parts = raw.split('->')
      if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) return [res('Balance', 'Use the form: A + B -> C + D', T.warn)]
      const strip = (s: string) => s.replace(/^\s*(\d+)\s+/, '').trim()
      const lsp = parts[0].split(/\s*\+\s*/).map(strip).filter(Boolean)
      const rsp = parts[1].split(/\s*\+\s*/).map(strip).filter(Boolean)
      if (!lsp.length || !rsp.length) return [res('Balance', 'Use the form: A + B -> C + D', T.warn)]
      const all = [...lsp, ...rsp]
      const counts = all.map(formulaCounts)
      const badIdx = counts.findIndex((c) => !c)
      if (badIdx >= 0) {
        return [
          sres('Balance', `“${all[badIdx]}” is not a formula I can read`, T.bad, 'each species must look like C3H8, Ca(OH)2 or CuSO4·5H2O'),
          docr('Accepted form', 'element symbols (case-sensitive: C, Na, Cl), subscripts, parentheses like Ca(OH)2, and hydrates like CuSO4·5H2O'),
          res('Tip', 'no charges or state symbols — write H2O, not H2O(l)', T.neutral, 'conditions like heat or catalyst can be noted after the arrow'),
        ]
      }
      const coef = balanceCoefficients(counts as Record<string, number>[], lsp.length)
      const elems = [...new Set(all.flatMap((s) => Object.keys(formulaCounts(s) || {})))].sort()
      if (!coef) {
        const rows = elems.map((e) => {
          const l = counts.slice(0, lsp.length).reduce((a, c) => a + ((c as Record<string, number>)[e] || 0), 0)
          const r = counts.slice(lsp.length).reduce((a, c) => a + ((c as Record<string, number>)[e] || 0), 0)
          return `${e}: left ${l} vs right ${r}`
        })
        return [
          sres('Status', 'No valid single set of coefficients', T.bad, 'this equation is under-determined or cannot be balanced with whole numbers'),
          docr('Atom conservation as written', rows.join('\n')),
          docr('Original', `${lsp.join(' + ')} → ${rsp.join(' + ')}`),
          res('Rule', 'Change coefficients only, never subscripts.', T.neutral),
        ]
      }
      const fmt = (s: string, c: number) => `${c === 1 ? '' : c + ' '}${s}`
      const balancedEq = `${lsp.map((s, i) => fmt(s, coef[i])).join(' + ')} → ${rsp.map((s, i) => fmt(s, coef[i + lsp.length])).join(' + ')}`
      const rows = elems.map((e) => {
        const l = counts.slice(0, lsp.length).reduce((a, c, i) => a + ((c as Record<string, number>)[e] || 0) * coef[i], 0)
        const r = counts.slice(lsp.length).reduce((a, c, i) => a + ((c as Record<string, number>)[e] || 0) * coef[i + lsp.length], 0)
        return `${e}: left ${l} vs right ${r} ${l === r ? '✓' : '✗'}`
      })
      const wasBalanced = coef.every((c) => c === 1)
      const leftMass = lsp.reduce((a, s, i) => a + (molarMass(s).mass || 0) * coef[i], 0)
      const rightMass = rsp.reduce((a, s, i) => a + (molarMass(s).mass || 0) * coef[i], 0)
      return [
        sres('Balanced equation', balancedEq, T.good, wasBalanced ? 'already balanced as written — coefficients are all 1' : 'smallest whole-number coefficients'),
        sres('Coefficients', `left ${lsp.map((_, i) => coef[i]).join(', ')}  |  right ${rsp.map((_, i) => coef[i + lsp.length]).join(', ')}`, T.good, 'change these, never the subscripts'),
        docr('Atom conservation', rows.join('\n')),
        docr('Original', `${lsp.join(' + ')} → ${rsp.join(' + ')}`),
        res('Mass check', `${ratio(leftMass, 2)} g on the left vs ${ratio(rightMass, 2)} g on the right`, leftMass && rightMass ? Math.abs(leftMass - rightMass) < 0.01 ? T.good : T.warn : T.neutral, 'total mass must be identical'),
        res('Rule', 'Change coefficients only, never subscripts.', T.neutral, 'subscripts are part of the substance; coefficients are the bookkeeping'),
      ]
    },
  },
  {
    id: 'molar-mass-calculator',
    name: 'Molar Mass Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Parses any chemical formula — including parentheses and hydrates — and sums atomic masses with a per-element breakdown.',
    tip: 'Molar mass is the bridge between grams and moles: moles = mass ÷ molar mass. Convert grams first, then divide.',
    usage: ['Enter the chemical formula.', 'Review the element breakdown.', 'Use the mass for stoichiometry.'],
    method: ['Each element symbol maps to a standard atomic mass.', 'Parentheses and hydrate multipliers expand before summing.', 'The total is the molar mass in g/mol.'],
    fields: [txt('f', 'Chemical formula', 2, 'Ca(OH)2')],
    compute: (v) => {
      const f = asStr(v.f).trim()
      if (!f) return [res('Molar mass', 'Enter a formula', T.warn)]
      const { mass, parsed, counts } = molarMass(f)
      if (!counts) return [sres('Parse', `“${f}” is not a formula I can read`, T.warn, 'try C6H12O6, Ca(OH)2 or CuSO4·5H2O — element symbols are case-sensitive')]
      if (!parsed) {
        const unknown = Object.keys(counts).filter((sym) => ELEMENTS[sym] === undefined)
        return [sres('Parse', `“${f}” contains elements without a mass in my table`, T.warn, `not covered: ${unknown.join(', ')} — the formula was still read correctly`)]
      }
      const parts = Object.keys(counts)
        .sort()
        .map((sym) => `${sym}: ${counts[sym]} × ${ELEMENTS[sym]} = ${(ELEMENTS[sym] * counts[sym]).toFixed(3)}`)
      return [
        sres('Molar mass', ratio(mass, 3) + ' g/mol', T.good, f),
        docr('Element breakdown', parts.join('\n')),
        res('Total atoms', String(Object.values(counts).reduce((a, b) => a + b, 0)), T.neutral, 'per formula unit'),
        res('Moles in 100 g', ratio(100 / mass, 4), T.neutral, 'm = mass ÷ molar mass'),
      ]
    },
  },
  {
    id: 'mole-calculator',
    name: 'Mole Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts freely between moles, mass in grams, and number of particles for a given substance and quantity.',
    tip: 'The mole is just a counting unit: 1 mole = 6.022 × 10²³ particles. Every mole problem reduces to moles first.',
    usage: ['Enter the quantity and its unit.', 'Choose the substance formula.', 'Read mass, moles and particles together.'],
    method: ['moles = mass ÷ molar mass.', 'particles = moles × Avogadro’s number.', 'Conversions route through moles.'],
    fields: [n('mass', 'Mass (g)', { def: 18, min: 0, step: 0.1 }), txt('f', 'Formula (optional)', 2, 'H2O')],
    compute: (v) => {
      const mass = asNum(v.mass)
      const f = asStr(v.f).replace(/[^A-Za-z0-9]/g, '')
      const { mass: mm2, parsed } = f ? molarMass(f) : { mass: 0, parsed: false }
      const molar = parsed ? mm2 : null
      const moles = molar ? mass / molar : 0
      const particles = moles * 6.02214076e23
      return [
        sres('Moles', molar ? ratio(moles, 5) : 'enter formula for moles', molar ? T.good : T.neutral, f ? '' : 'no formula given'),
        res('Mass', `${ratio(mass, 3)} g`, T.neutral, molar ? `molar mass ${ratio(molar, 3)} g/mol` : ''),
        res('Particles', molar && particles > 1e20 ? particles.toExponential(3) : ratio(particles, 0), T.neutral, 'moles × 6.022 × 10²³'),
      ]
    },
  },
  {
    id: 'molarity-calculator',
    name: 'Molarity Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes molarity (mol/L) from mass or moles and volume, with dilution guidance and unit conversion to molal and normal.',
    tip: 'Molarity = moles ÷ litres of SOLUTION, not solvent. Dilute to the mark, not by eye — always add acid to water.',
    usage: ['Enter moles and solution volume.', 'Optionally add the mass for a molar-mass check.', 'Read molarity and related units.'],
    method: ['M = n / V(L).', 'From mass: n = m / molar mass.', 'Molality uses solvent mass; normality uses equivalents.'],
    fields: [n('moles', 'Moles of solute', { def: 0.5, min: 0, step: 0.01 }), n('vol', 'Solution volume (L)', { def: 0.25, min: 0.0001, step: 0.01 }), n('solvent', 'Solvent mass (kg) — optional', { def: 0.25, min: 0, step: 0.01 })],
    compute: (v) => {
      const n2 = asNum(v.moles)
      const V = asNum(v.vol) || 1e-9
      const M = n2 / V
      const mkg = asNum(v.solvent)
      const molal = mkg ? n2 / mkg : 0
      return [
        sres('Molarity (M)', ratio(M, 4) + ' mol/L', M > 10 ? T.warn : T.good, 'n ÷ V(L)'),
        res('Molality (m)', mkg ? ratio(molal, 4) + ' mol/kg' : '—', T.neutral, 'n ÷ kg solvent'),
        res('Normality (N)', `${ratio(M, 2)} N (1:1 reaction)`, T.neutral, 'equals M when H⁺ = 1'),
        res('Mass concentration', `${ratio(M * 1000, 2)} mg/L`, T.neutral, 'M × 1000'),
      ]
    },
  },
  {
    id: 'molality-calculator',
    name: 'Molality Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes molality (mol/kg solvent) and contrasts it with molarity, including freezing-point and boiling-point elevation.',
    tip: 'Molality is temperature-independent (mass-based), so it is the correct unit for colligative properties like freezing-point depression.',
    usage: ['Enter moles and solvent mass.', 'Read molality and elevation effects.', 'Compare with molarity where relevant.'],
    method: ['m = moles of solute ÷ kg solvent.', 'ΔTf = i·Kf·m and ΔTb = i·Kb·m.', 'Kf (water) = 1.86, Kb = 0.512.'],
    fields: [n('moles', 'Moles of solute', { def: 0.5, min: 0, step: 0.01 }), n('kg', 'Solvent mass (kg)', { def: 0.5, min: 0.0001, step: 0.01 }), sel('solvent', 'Solvent', ['Water', 'Ethanol', 'Benzene', 'Acetic acid'], 'Water'), n('i', 'Van\u2019t Hoff factor i', { def: 1, min: 0.1, max: 10, step: 0.1 })],
    compute: (v) => {
      const m = asNum(v.moles) / (asNum(v.kg) || 1e-9)
      const Kf: Record<string, number> = { Water: 1.86, Ethanol: 1.99, Benzene: 5.12, 'Acetic acid': 3.9 }
      const Kb: Record<string, number> = { Water: 0.512, Ethanol: 1.22, Benzene: 2.53, 'Acetic acid': 2.93 }
      const s = asSel(v.solvent)
      const i = asNum(v.i)
      return [
        sres('Molality', ratio(m, 4) + ' mol/kg', T.good, `${asSel(v.solvent)}`),
        sres('Freezing point', ratio(0 - i * Kf[s] * m, 3) + ' °C', T.good, `ΔTf = i·Kf·m = ${ratio(i * Kf[s] * m, 3)}`),
        res('Boiling point', ratio(100 + i * Kb[s] * m, 3) + ' °C', T.neutral, `ΔTb = ${ratio(i * Kb[s] * m, 3)}`),
        res('Osmotic pressure (π = iMRT, 298K)', ratio(i * m * 0.08206 * 298, 3) + ' atm', T.neutral),
      ]
    },
  },
  {
    id: 'dilution-calculator',
    name: 'Dilution Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Applies the C₁V₁ = C₂V₂ law to find the volume of stock solution and diluent needed to hit a target concentration.',
    tip: 'Moles are conserved: what you remove you replace. Add acid to water, never water to acid — always dilute slowly.',
    usage: ['Enter stock and target concentration.', 'Set the final volume.', 'Read stock volume, diluent and the mix order.'],
    method: ['C₁V₁ = C₂V₂.', 'V₁ = C₂V₂ / C₁.', 'Diluent = V₂ − V₁.'],
    fields: [n('c1', 'Stock concentration (M)', { def: 1, min: 0.0001, step: 0.1 }), n('c2', 'Target concentration (M)', { def: 0.1, min: 0.0001, step: 0.01 }), n('v2', 'Final volume (mL)', { def: 100, min: 0.1, step: 1 })],
    compute: (v) => {
      const c1 = asNum(v.c1)
      const c2 = asNum(v.c2)
      const v2 = asNum(v.v2)
      const v1 = c1 ? (c2 * v2) / c1 : 0
      const dil = v2 - v1
      const factor = c2 && c1 ? c1 / c2 : 0
      return [
        sres('Stock needed', ratio(v1, 2) + ' mL', v1 > v2 ? T.bad : T.good, v1 > v2 ? 'Target exceeds stock — impossible' : 'pipette this volume'),
        sres('Diluent to add', ratio(dil, 2) + ' mL', T.neutral, 'bring to the final mark'),
        res('Dilution factor', ratio(factor, 2) + '×', T.neutral, 'stock ÷ target'),
        res('Safety', 'Add acid/concentrate to water slowly, then top up to the mark.', T.warn),
      ]
    },
  },
  {
    id: 'concentration-calculator',
    name: 'Concentration Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb: 'Converts a solution concentration across units — molar, molal, mass percent, ppm, mg/L and normality.',
    tip: 'ppm = mg/L for dilute aqueous solutions. That single equivalence covers most environmental and drinking-water questions.',
    usage: ['Choose the source concentration unit.', 'Enter value and solution mass.', 'Read every equivalent unit.'],
    method: ['Each unit stores a conversion to a common basis.', 'Mass percent uses solute mass ÷ solution mass.', 'ppm derives from mg per L.'],
    fields: [n('val', 'Concentration value', { def: 5, min: 0, step: 0.1 }), sel('unit', 'Unit', ['Mass %', 'ppm', 'mg/L', 'M (mol/L)', 'm (mol/kg)'], 'Mass %'), n('solMass', 'Solution mass (g)', { def: 100, min: 0.1, step: 1 })],
    compute: (v) => {
      const val = asNum(v.val)
      const u = asSel(v.unit)
      const solMass = asNum(v.solMass) || 1
      const massPct = u === 'Mass %' ? val : u === 'ppm' ? val / 10000 : NaN
      const soluteG = Number.isFinite(massPct) ? (massPct / 100) * solMass : NaN
      const ppm = Number.isFinite(massPct) ? massPct * 10000 : u === 'ppm' ? val : NaN
      return [
        sres('Mass percent', Number.isFinite(massPct) ? ratio(massPct, 4) + '%' : 'convert from M/m first', Number.isFinite(massPct) ? T.good : T.warn),
        res('ppm (mg/kg)', Number.isFinite(ppm) ? num(ppm, 2) : '—', T.neutral, 'mass % × 10,000'),
        res('Solute mass', Number.isFinite(soluteG) ? ratio(soluteG, 3) + ' g' : '—', T.neutral, `in ${solMass} g solution`),
        res('Mole note', 'M needs molar mass: M = (g/1000 ÷ g·mol⁻¹) ÷ L', T.neutral),
      ]
    },
  },
  {
    id: 'ph-calculator',
    name: 'pH Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts between pH, [H⁺] and [OH⁻] for acids and bases, with pOH, buffer guidance and titration-equivalence hints.',
    tip: 'Remember: pH + pOH = 14 at 25 °C. Solve for whichever you are given, then convert — never mix up the two scales.',
    usage: ['Enter pH or concentration.', 'Choose acid or base strength.', 'Read [H⁺], [OH⁻], pOH and classification.'],
    method: ['pH = −log₁₀[H⁺].', '[H⁺][OH⁻] = 1 × 10⁻¹⁴ at 25 °C.', 'Strong acids/bases dissociate fully.'],
    fields: [n('ph', 'pH (or enter concentration below)', { def: 3, min: 0, max: 14, step: 0.1 }), n('conc', 'Concentration (M) — used if provided', { def: 0, min: 0, step: 0.01 }), sel('type', 'Solution', ['Strong acid', 'Weak acid', 'Strong base', 'Weak base'], 'Strong acid')],
    compute: (v) => {
      let ph = asNum(v.ph)
      const c = asNum(v.conc)
      if (c > 0) {
        const t = asSel(v.type)
        ph = t === 'Strong base' ? 14 + Math.log10(c) : -Math.log10(c)
      }
      ph = clamp(ph, 0, 14)
      const h = Math.pow(10, -ph)
      const oh = Math.pow(10, -(14 - ph))
      const kind = ph === 7 ? 'Neutral' : ph < 7 ? `Acidic (${ph < 3 ? 'strongly' : 'weakly'})` : `Alkaline (${ph > 11 ? 'strongly' : 'weakly'})`
      return [
        sres('pH', ratio(ph, 2), ph > 11 || ph < 3 ? T.warn : T.good, c > 0 ? `from ${c} M (${asSel(v.type)})` : 'as entered'),
        sres('[H⁺]', h.toExponential(3) + ' M', T.neutral),
        res('[OH⁻]', oh.toExponential(3) + ' M', T.neutral, 'Kw = 1×10⁻¹⁴'),
        res('pOH', ratio(14 - ph, 2), T.neutral, 'pH + pOH = 14'),
        res('Classification', kind, ph === 7 ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'stoichiometry-calculator',
    name: 'Stoichiometry Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Runs mole ratios through any chemical equation: given reactant moles, find limiting reagent, product moles and excess.',
    tip: 'Find the limiting reagent FIRST by dividing moles by coefficient. It sets the maximum product — excess never helps the yield.',
    usage: ['Enter the two reactants with their moles.', 'Enter the product formula and molar mass.', 'Read limiting reagent and theoretical yield.'],
    method: ['n/coeff gives reaction extents.', 'The smallest extent is the limiting reagent.', 'Theoretical yield = extent × product moles.'],
    fields: [txt('r1', 'Reactant 1 (e.g. H2 3 mol)', 2, 'H2 3'), txt('r2', 'Reactant 2 (e.g. O2 5 mol)', 2, 'O2 5'), n('c1', 'Coefficient 1', { def: 2, min: 1, step: 1 }), n('c2', 'Coefficient 2', { def: 1, min: 1, step: 1 }), n('cp', 'Product coefficient', { def: 2, min: 1, step: 1 }), n('pmolar', 'Product molar mass (g/mol)', { def: 18, min: 0.1, step: 0.5 })],
    compute: (v) => {
      const p1 = asStr(v.r1).trim().split(/\s+/)
      const p2 = asStr(v.r2).trim().split(/\s+/)
      const n1 = parseFloat(p1[p1.length - 1]) || 0
      const n2 = parseFloat(p2[p2.length - 1]) || 0
      const c1 = asNum(v.c1) || 1
      const c2 = asNum(v.c2) || 1
      const cp = asNum(v.cp) || 1
      const e1 = n1 / c1
      const e2 = n2 / c2
      const lim = e1 <= e2 ? p1[0] : p2[0]
      const ext = Math.min(e1, e2)
      const moles = ext * cp
      const grams = moles * asNum(v.pmolar)
      return [
        sres('Limiting reagent', lim, T.good, `extents: ${ratio(e1, 3)} vs ${ratio(e2, 3)}`),
        sres('Product moles', ratio(moles, 4) + ' mol', T.good, `${ext.toFixed(2)} × ${cp}`),
        sres('Theoretical yield', ratio(grams, 3) + ' g', T.good, 'moles × molar mass'),
        res('Excess left', `${ratio(Math.abs(e1 - e2) * c1, 3)} or ${ratio(Math.abs(e1 - e2) * c2, 3)} mol unused`, T.neutral),
      ]
    },
  },
  {
    id: 'gas-law-calculator',
    name: 'Gas Law Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves the combined gas law across pressure, volume, temperature and mole count, reporting each transformed variable.',
    tip: 'Temperature in gas laws is ALWAYS kelvin. Celsius→kelvin adds 273.15; forgetting this is the classic gas-law error.',
    usage: ['Enter P₁, V₁, T₁.', 'Enter the new V₂, T₂ or P₂.', 'Read the solved variable and the kelvin conversions.'],
    method: ['Combined law: P₁V₁/T₁ = P₂V₂/T₂.', 'nRT = PV also relates to n.', 'All temperatures convert to kelvin.'],
    fields: [n('p1', 'P₁ (atm)', { def: 1, min: 0.01, step: 0.1 }), n('v1', 'V₁ (L)', { def: 2, min: 0.01, step: 0.1 }), n('t1', 'T₁ (°C)', { def: 0, step: 1 }), sel('known', 'Known new value', ['V₂', 'T₂', 'P₂'], 'V₂'), n('v2', 'V₂ (L)', { def: 4, min: 0.01, step: 0.1 }), n('t2', 'T₂ (°C)', { def: 0, step: 1 }), n('p2', 'P₂ (atm)', { def: 2, min: 0.01, step: 0.1 })],
    compute: (v) => {
      const p1 = asNum(v.p1)
      const V1 = asNum(v.v1)
      const T1 = asNum(v.t1) + 273.15
      const known = asSel(v.known)
      const V2 = asNum(v.v2)
      const T2 = asNum(v.t2) + 273.15
      const p2 = asNum(v.p2)
      const L = (p1 * V1) / T1
      let out: StudentResult
      if (known === 'V₂') out = sres('V₂', ratio(L * T2 / p2, 4) + ' L', T.good, 'P₁V₁/T₁ = P₂V₂/T₂')
      else if (known === 'T₂') out = sres('T₂', ratio((p2 * V2) / L, 3) + ' K', T.good, 'P₁V₁/T₁ = P₂V₂/T₂')
      else out = sres('P₂', ratio(L * T2 / V2, 4) + ' atm', T.good, 'P₁V₁/T₁ = P₂V₂/T₂')
      return [
        out,
        res('T₁ in kelvin', ratio(T1, 2) + ' K', T.neutral, '°C + 273.15'),
        res('T₂ in kelvin', ratio(T2, 2) + ' K', T.neutral, '°C + 273.15'),
        res('Mole check', 'n = PV/RT, R = 0.08206 L·atm·mol⁻¹·K⁻¹', T.neutral),
      ]
    },
  },
  {
    id: 'ideal-gas-law-calculator',
    name: 'Ideal Gas Law Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Applies PV = nRT to solve for moles, pressure, volume, temperature or density, with the ideal-gas validity note.',
    tip: 'Ideal gas assumes no intermolecular attraction. It breaks down near the condensation point — check the Z-factor in high-pressure work.',
    usage: ['Enter P, V, T and n (or solve for one).', 'Choose the unknown.', 'Read the result and density.'],
    method: ['PV = nRT with R = 0.08206.', 'n = PV/RT.', 'Density = PM/RT.'],
    fields: [n('p', 'Pressure (atm)', { def: 1, step: 0.1 }), n('vol', 'Volume (L)', { def: 22.4, min: 0.01, step: 0.1 }), n('temp', 'Temperature (K)', { def: 273.15, min: 1, step: 1 }), n('mol', 'Moles', { def: 1, min: 0, step: 0.1 }), n('molar', 'Molar mass (g/mol)', { def: 18, step: 0.5 })],
    compute: (v) => {
      const P = asNum(v.p)
      const V = asNum(v.vol)
      const K = asNum(v.temp)
      const givenN = asNum(v.mol)
      const R = 0.08206
      const nCalc = (P * V) / (R * K)
      const dens = (P * asNum(v.molar)) / (R * K)
      void givenN
      return [
        sres('Moles (n = PV/RT)', ratio(nCalc, 5) + ' mol', T.good, 'P·V/(R·T)'),
        sres('Density (PM/RT)', ratio(dens, 4) + ' g/L', T.neutral, 'ρ = PM/RT'),
        res('Molar volume (V/n)', ratio(V / (nCalc || 1), 3) + ' L/mol', T.neutral, '22.4 L at STP'),
        res('Validity', 'Ideal gas is accurate at high T / low P. Check Z-factor near condensation.', T.warn),
      ]
    },
  },
  {
    id: 'half-life-calculator',
    name: 'Half-Life Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves remaining amount, elapsed time, number of half-lives and decay constant for radioactive or first-order processes.',
    tip: 'After 10 half-lives (≈99.9% decayed) the sample is effectively background. In dating, back out from the present amount — the formula is symmetric.',
    usage: ['Enter initial amount and half-life.', 'Set elapsed time or final amount.', 'Read remaining quantity and half-lives elapsed.'],
    method: ['N = N₀ · (1/2)^(t/t½).', 't = t½ · log₂(N₀/N).', 'k = ln2 / t½ is the decay constant.'],
    fields: [n('n0', 'Initial amount', { def: 100, min: 0, step: 1 }), n('hl', 'Half-life (time units)', { def: 5, min: 0.01, step: 0.5 }), n('t', 'Elapsed time', { def: 15, min: 0, step: 0.5 })],
    compute: (v) => {
      const n0 = asNum(v.n0)
      const hl = asNum(v.hl) || 1
      const t = asNum(v.t)
      const remain = n0 * Math.pow(0.5, t / hl)
      const nHl = t / hl
      const k = Math.LN2 / hl
      const tSolve = hl * Math.log2(n0 / (remain || 1e-12))
      return [
        sres('Remaining', ratio(remain, 4), remain / n0 < 0.1 ? T.warn : T.good, `${Math.round(nHl * 100) / 100} half-lives elapsed`),
        sres('Decayed', ratio(n0 - remain, 4), T.neutral, undefined, Math.min(100, Math.round(((n0 - remain) / n0) * 100))),
        res('Decay constant k', ratio(k, 5) + ' per time unit', T.neutral, 'k = ln2 / t½'),
        res('Time to reach this level', ratio(tSolve, 3) + ' time units', T.neutral, 't = t½·log₂(N₀/N)'),
      ]
    },
  },
  {
    id: 'physics-formula-calculator',
    name: 'Physics Formula Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Evaluates the core kinematic and dynamic formulas — v = u + at, s = ut + ½at², F = ma, p = mv, KE, PE, momentum.',
    tip: 'Draw the diagram and label directions before substituting. Sign errors, not formula errors, cause most kinematics mistakes.',
    usage: ['Choose the formula.', 'Enter the known variables.', 'Read the solved variable with the substituted equation.'],
    method: ['Each formula rearranges for the unknown.', 'SI units are assumed throughout.', 'Substitution is echoed back for verification.'],
    fields: [sel('f', 'Formula', ['v = u + at', 's = ut + ½at²', 'F = ma', 'p = mv', 'KE = ½mv²', 'PE = mgh', 'F = G·m₁m₂/r²'], 'v = u + at'), n('a', 'Variable A', { def: 2, step: 0.5 }), n('b', 'Variable B', { def: 3, step: 0.5 }), n('c', 'Variable C', { def: 4, step: 0.5 }), n('d', 'Variable D', { def: 5, step: 0.5 })],
    compute: (v) => {
      const a = asNum(v.a), b = asNum(v.b), c = asNum(v.c), d = asNum(v.d)
      const f = asSel(v.f)
      const out: Record<string, { r: string; note: string }> = {
        'v = u + at': { r: `v = ${a} + ${b}×${c} = ${ratio(a + b * c, 4)} m/s`, note: 'a = acceleration, t = time' },
        's = ut + ½at²': { r: `s = ${a}×${b} + 0.5×${c}×${b}² = ${ratio(a * b + 0.5 * c * b * b, 4)} m`, note: 'u = initial velocity' },
        'F = ma': { r: `F = ${a} × ${b} = ${ratio(a * b, 4)} N`, note: 'Newtons = kg·m/s²' },
        'p = mv': { r: `p = ${a} × ${b} = ${ratio(a * b, 4)} kg·m/s`, note: 'Momentum is vector' },
        'KE = ½mv²': { r: `KE = 0.5 × ${a} × ${b}² = ${ratio(0.5 * a * b * b, 4)} J`, note: 'speed, not velocity' },
        'PE = mgh': { r: `PE = ${a} × ${b} × ${c} = ${ratio(a * b * c, 4)} J`, note: 'h relative to reference' },
        'F = G·m₁m₂/r²': { r: `F = 6.674e−11 × ${a} × ${b} / ${c}² = ${(6.674e-11 * a * b) / (c * c || 1)} N`, note: 'G = 6.674×10⁻¹¹' },
      }
      void d
      const res2 = out[f] || out['v = u + at']
      return [sres('Result', res2.r, T.good, res2.note), res('Substitution', `using A=${a}, B=${b}, C=${c}`, T.neutral), res('SI check', 'kg, m, s → N, J, m/s²', T.neutral)]
    },
  },
  {
    id: 'speed-calculator',
    name: 'Speed Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts between speed, distance and time with km/h, m/s, mph and knot readouts, plus the average-vs-instant distinction.',
    tip: 'Speed is a scalar — no direction. If a problem gives bearing or displacement, you want velocity instead.',
    usage: ['Enter distance and time.', 'Or enter speed and time to find distance.', 'Read all unit equivalents.'],
    method: ['Speed = distance ÷ time.', 'Unit factors: 1 m/s = 3.6 km/h = 2.237 mph.', 'Average speed uses total path over total time.'],
    fields: [n('dist', 'Distance', { def: 100, min: 0, step: 1 }), n('time', 'Time (s)', { def: 20, min: 0.01, step: 1 }), sel('mode', 'Solve for', ['Speed', 'Distance', 'Time'], 'Speed')],
    compute: (v) => {
      const d = asNum(v.dist)
      const t = asNum(v.time) || 1e-9
      const m = asSel(v.mode)
      const speed = m === 'Speed' ? d / t : m === 'Distance' ? asNum(v.dist) : 0
      const dist2 = m === 'Distance' ? speed * t : d
      const time2 = m === 'Time' ? d / (asNum(v.dist) || 1) : t
      const spd = m === 'Speed' ? speed : m === 'Distance' ? asNum(v.dist) / t : d / time2
      void speed
      return [
        sres('Speed', `${ratio(spd, 4)} m/s`, T.good, `${ratio(spd * 3.6, 3)} km/h · ${ratio(spd * 2.23694, 3)} mph`),
        res('Distance', `${ratio(dist2, 3)} m`, T.neutral, `${ratio(dist2 / 1000, 3)} km`),
        res('Time', `${ratio(time2, 3)} s`, T.neutral, `${ratio(time2 / 60, 3)} min`),
        res('Note', 'Speed is distance ÷ time (scalar). Velocity adds direction.', T.neutral),
      ]
    },
  },
  {
    id: 'velocity-calculator',
    name: 'Velocity Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Handles 1D and 2D motion: average velocity from displacement and time, with vector components and instantaneous velocity.',
    tip: 'Velocity is a vector. Average velocity uses DISPLACEMENT, not total distance — going out and back gives zero average velocity.',
    usage: ['Enter displacement (or x positions) and time.', 'For 2D, add the y components.', 'Read average and instantaneous velocity.'],
    method: ['v̄ = Δx / Δt.', 'For 2D, magnitude = √(vx² + vy²).', 'Instantaneous v = limit of Δx/Δt.'],
    fields: [n('x1', 'Initial position x₁ (m)', { def: 0, step: 0.5 }), n('x2', 'Final position x₂ (m)', { def: 20, step: 0.5 }), n('t', 'Time (s)', { def: 4, min: 0.01, step: 0.5 }), n('vy', 'y-velocity (m/s) — optional', { def: 0, step: 0.5 })],
    compute: (v) => {
      const dx = asNum(v.x2) - asNum(v.x1)
      const t = asNum(v.t) || 1e-9
      const vx = dx / t
      const vy = asNum(v.vy)
      const mag = Math.hypot(vx, vy)
      return [
        sres('Average velocity (x)', ratio(vx, 4) + ' m/s', vx >= 0 ? T.good : T.warn, dx >= 0 ? 'rightward (+)' : 'leftward (−)'),
        sres('Speed (2D magnitude)', ratio(mag, 4) + ' m/s', T.neutral, '√(vx² + vy²)'),
        res('Displacement', ratio(dx, 3) + ' m', T.neutral, 'x₂ − x₁'),
        res('Direction', vy ? ratio((Math.atan2(vy, vx) * 180) / Math.PI, 2) + '° above x-axis' : 'along x-axis', T.neutral),
      ]
    },
  },
  {
    id: 'acceleration-calculator',
    name: 'Acceleration Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes acceleration from velocity change and time, and derives velocity, displacement and average speed under constant a.',
    tip: 'Constant acceleration is the hidden assumption in most kinematics problems. If a is not constant, use average a = Δv/Δt only.',
    usage: ['Enter v₁, v₂ and time.', 'Read acceleration and derived kinematics.', 'Check sign for direction.'],
    method: ['a = (v₂ − v₁)/t.', 'v = v₁ + at.', 's = v₁t + ½at².'],
    fields: [n('v1', 'Initial velocity v₁ (m/s)', { def: 0, step: 0.5 }), n('v2', 'Final velocity v₂ (m/s)', { def: 20, step: 0.5 }), n('t', 'Time (s)', { def: 4, min: 0.01, step: 0.5 })],
    compute: (v) => {
      const v1 = asNum(v.v1)
      const v2 = asNum(v.v2)
      const t = asNum(v.t) || 1e-9
      const a = (v2 - v1) / t
      const s = v1 * t + 0.5 * a * t * t
      return [
        sres('Acceleration', ratio(a, 4) + ' m/s²', a >= 0 ? T.good : T.warn, a >= 0 ? 'speeding up' : 'slowing down'),
        res('Velocity check', `${v1} + ${ratio(a, 2)}×${t} = ${ratio(v1 + a * t, 3)} m/s`, T.neutral),
        sres('Displacement', ratio(s, 4) + ' m', T.good, 's = v₁t + ½at²'),
        res('Average speed', ratio((v1 + v2) / 2, 4) + ' m/s', T.neutral, '(v₁+v₂)/2 for constant a'),
      ]
    },
  },
  {
    id: 'force-calculator',
    name: 'Force Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves Newton’s second law problems and resolves angled forces into net magnitude and direction, including friction.',
    tip: 'Friction acts opposite motion and uses F = μN. Always draw the free-body diagram before summing forces — a missing normal force ruins friction.',
    usage: ['Enter net components or mass & acceleration.', 'Add angle, friction coefficient if needed.', 'Read net force and direction.'],
    method: ['F_net = ma.', 'Components: Fx = F·cosθ, Fy = F·sinθ.', 'Friction: f = μN.'],
    fields: [n('m', 'Mass (kg)', { def: 5, min: 0, step: 0.1 }), n('a', 'Acceleration (m/s²)', { def: 3, step: 0.1 }), n('fmag', 'Force magnitude (N) — optional', { def: 0, step: 0.5 }), n('ang', 'Angle (°) — optional', { def: 0, step: 5 }), n('mu', 'Friction coefficient μ', { def: 0.3, min: 0, max: 2, step: 0.05 })],
    compute: (v) => {
      const m = asNum(v.m)
      const a = asNum(v.a)
      const F = asNum(v.fmag)
      const ang = (asNum(v.ang) * Math.PI) / 180
      const Fx = F * Math.cos(ang)
      const Fy = F * Math.sin(ang)
      const fr = asNum(v.mu) * m * 9.81
      return [
        sres('Net force (F = ma)', ratio(m * a, 4) + ' N', T.good, `${m} kg × ${a} m/s²`),
        res('Components of F', `Fx = ${ratio(Fx, 3)} N, Fy = ${ratio(Fy, 3)} N`, T.neutral, `at ${asNum(v.ang)}°`),
        sres('Friction (μmg)', ratio(fr, 3) + ' N', T.neutral, `μ = ${asNum(v.mu)}`),
        res('Net if friction applies', `${ratio(m * a - fr, 3)} N`, T.neutral, 'F = ma − μmg'),
      ]
    },
  },
  {
    id: 'work-calculator',
    name: 'Work Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes work done against a force with angle and displacement, distinguishing positive, negative and zero work.',
    tip: 'Work is negative when force opposes displacement (e.g. friction). W = Fd·cosθ — always draw the angle between force and motion.',
    usage: ['Enter force, displacement and angle.', 'Read work with sign.', 'Add power for a rate view.'],
    method: ['W = F·d·cosθ.', 'Sign follows θ: 0° positive, 90° zero, 180° negative.', 'Power = W/t.'],
    fields: [n('f', 'Force (N)', { def: 50, min: 0, step: 1 }), n('d', 'Displacement (m)', { def: 4, min: 0, step: 0.5 }), n('ang', 'Angle (°)', { def: 0, step: 5 }), n('t', 'Time (s)', { def: 10, min: 0.1, step: 1 })],
    compute: (v) => {
      const F = asNum(v.f)
      const d = asNum(v.d)
      const ang = (asNum(v.ang) * Math.PI) / 180
      const W = F * d * Math.cos(ang)
      const p = asNum(v.t) ? W / asNum(v.t) : 0
      const kind = W > 0 ? 'Positive — force aids motion' : W < 0 ? 'Negative — force opposes motion' : 'Zero — perpendicular force'
      return [
        sres('Work done', ratio(W, 3) + ' J', W > 0 ? T.good : W < 0 ? T.warn : T.neutral, kind),
        res('Power', ratio(p, 4) + ' W', T.neutral, 'P = W/t'),
        res('Formula check', `W = ${F} × ${d} × cos(${asNum(v.ang)}°) = ${ratio(F * d, 1)} × ${ratio(Math.cos(ang), 3)}`, T.neutral),
        res('In eV (if particle)', `${(W / 1.602176634e-19).toExponential(3)} eV`, T.neutral),
      ]
    },
  },
  {
    id: 'power-calculator',
    name: 'Power Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Converts between power, work, time, force, velocity and electrical quantities, reporting horsepower, kilowatts and decibels.',
    tip: 'Power is a RATE — 1000 J of work in 1 s is 1 kW, the same work in 1000 s is just 1 W. Always pair power with a time.',
    usage: ['Enter work and time.', 'Or force and velocity.', 'Read watts, kilowatts and mechanical horsepower.'],
    method: ['P = W/t.', 'P = F·v (collinear).', '1 hp ≈ 746 W.'],
    fields: [n('w', 'Work (J)', { def: 2000, min: 0, step: 10 }), n('t', 'Time (s)', { def: 10, min: 0.01, step: 1 }), n('f', 'Force (N) — optional', { def: 0, step: 1 }), n('vel', 'Velocity (m/s) — optional', { def: 0, step: 0.5 })],
    compute: (v) => {
      const W = asNum(v.w)
      const t = asNum(v.t) || 1e-9
      const P = W / t
      const fv = asNum(v.f) * asNum(v.vel)
      return [
        sres('Power', ratio(P, 4) + ' W', T.good, `P = W/t = ${W}/${t}`),
        res('Kilowatts / horsepower', `${ratio(P / 1000, 4)} kW · ${ratio(P / 746, 4)} hp`, T.neutral, '1 hp = 746 W'),
        res('Force × velocity', fv ? ratio(fv, 4) + ' W' : '—', T.neutral, 'P = F·v when collinear'),
        res('Energy in kWh', ratio(P / 1000, 4) + ' kWh per hour', T.neutral, 'for appliance running cost'),
      ]
    },
  },
  {
    id: 'energy-calculator',
    name: 'Energy Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Adds up energies from every form — kinetic, potential, elastic, chemical, electrical — and converts between J, kJ, kWh, cal and eV.',
    tip: 'Energy is conserved. In a pendulum, mgh at the top becomes ½mv² at the bottom — watch the two terms swap exactly.',
    usage: ['Enter the energy values you have.', 'Read the total in your preferred unit.', 'Spot conservation in free-fall or spring systems.'],
    method: ['Each term uses its own formula.', 'Sum them for total energy.', '1 kWh = 3.6 MJ = 860 kcal.'],
    fields: [n('m', 'Mass (kg)', { def: 2, min: 0, step: 0.1 }), n('v', 'Speed (m/s)', { def: 5, min: 0, step: 0.1 }), n('h', 'Height (m)', { def: 10, min: 0, step: 0.5 }), n('elec', 'Electrical usage (kWh) — optional', { def: 0, step: 0.1 })],
    compute: (v) => {
      const m = asNum(v.m)
      const sp = asNum(v.v)
      const h = asNum(v.h)
      const ke = 0.5 * m * sp * sp
      const pe = m * 9.81 * h
      const el = asNum(v.elec) * 3.6e6
      const total = ke + pe + el
      return [
        sres('Kinetic energy', ratio(ke, 2) + ' J', T.good, '½mv²'),
        sres('Potential energy', ratio(pe, 2) + ' J', T.good, 'mgh'),
        sres('Total energy', ratio(total, 2) + ' J', T.neutral, `${ratio(total / 3.6e6, 4)} kWh`),
        res('In calories', num((total / 4.184) / 1000, 2) + ' kcal', T.neutral, '1 kcal = 4184 J'),
      ]
    },
  },
  {
    id: 'ohms-law-calculator',
    name: "Ohm's Law Calculator",
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves V = IR for voltage, current or resistance, and extends to power (P = VI) and series/parallel equivalent resistance.',
    tip: 'Two unknowns in one equation means you must know two of the three. Never mix volts and amps on the same side of an equation.',
    usage: ['Enter any two of V, I, R.', 'Choose which to solve.', 'Read the third plus power.'],
    method: ['V = IR.', 'P = VI = I²R = V²/R.', 'Series R adds; parallel R uses 1/R = Σ1/R.'],
    fields: [n('vol', 'Voltage (V)', { def: 12, min: 0, step: 0.5 }), n('cur', 'Current (A)', { def: 2, min: 0, step: 0.1 }), n('res', 'Resistance (Ω)', { def: 6, min: 0, step: 0.1 }), sel('find', 'Solve for', ['Voltage', 'Current', 'Resistance'], 'Voltage')],
    compute: (v) => {
      const V = asNum(v.vol)
      const I = asNum(v.cur)
      const R = asNum(v.res)
      const f = asSel(v.find)
      const rV = f === 'Voltage' ? I * R : V
      const rI = f === 'Current' ? (R ? V / R : 0) : I
      const rR = f === 'Resistance' ? (I ? V / I : 0) : R
      return [
        sres('Voltage', ratio(rV, 4) + ' V', T.good, 'V = I·R'),
        sres('Current', ratio(rI, 4) + ' A', T.neutral, 'I = V/R'),
        res('Resistance', ratio(rR, 4) + ' Ω', T.neutral, 'R = V/I'),
        res('Power', `${ratio(rV * rI, 4)} W (${ratio((rV * rI) / 1000, 4)} kW)`, T.neutral, 'P = V·I'),
      ]
    },
  },
  {
    id: 'projectile-motion-calculator',
    name: 'Projectile Motion Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves full 2D projectile motion — launch angle, speed, gravity — giving time of flight, range, max height and impact velocity.',
    tip: 'Ignoring air resistance, range is maximized at 45°. Double the speed doubles the range — the range depends on the square of speed.',
    usage: ['Enter launch speed and angle.', 'Set initial height if launched above ground.', 'Read flight time, range, apex and impact.'],
    method: ['vx = v·cosθ, vy = v·sinθ.', 't = 2·vy/g (same height), Range = vx·t.', 'H = vy²/(2g).'],
    fields: [n('v', 'Launch speed (m/s)', { def: 20, min: 0, step: 0.5 }), n('ang', 'Launch angle (°)', { def: 45, step: 1 }), n('g', 'Gravity (m/s²)', { def: 9.81, min: 0.1, step: 0.01 }), n('h0', 'Initial height (m)', { def: 0, step: 0.5 })],
    compute: (v) => {
      const sp = asNum(v.v)
      const th = (asNum(v.ang) * Math.PI) / 180
      const g = asNum(v.g) || 9.81
      const h0 = asNum(v.h0)
      const vx = sp * Math.cos(th)
      const vy = sp * Math.sin(th)
      const disc = vy * vy + 2 * g * h0
      const t = disc >= 0 ? (vy + Math.sqrt(disc)) / g : 0
      const range = vx * t
      const H = h0 + (vy * vy) / (2 * g)
      const vyImpact = vy - g * t
      return [
        sres('Time of flight', ratio(t, 4) + ' s', T.good, `vx=${ratio(vx, 2)}, vy=${ratio(vy, 2)}`),
        sres('Range', ratio(range, 4) + ' m', T.good, 'R = vx·t'),
        sres('Max height', ratio(H, 4) + ' m', T.neutral, 'H = vy²/(2g)'),
        res('Impact velocity', `${ratio(vx, 2)} m/s horizontal, ${ratio(vyImpact, 2)} m/s vertical`, T.neutral, `speed ${ratio(Math.hypot(vx, vyImpact), 3)} m/s`),
        res('Max range angle', '45° for max range at any speed', T.neutral),
      ]
    },
  },
]