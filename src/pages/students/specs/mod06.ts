import { n, sel, txt, res, T, asNum, asSel, asStr, asMatrix, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Math & Science Calculators'

function gcf(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a || 1
}

function fracStr(numr: number, den: number): string {
  if (den === 0) return 'undefined'
  const sign = den < 0 ? -1 : 1
  const nn = Math.abs(Math.round(numr))
  const dd = Math.abs(Math.round(den))
  const g = gcf(nn, dd)
  const n2 = (sign * nn) / g
  const d2 = dd / g
  return d2 === 1 ? String(n2) : `${n2}/${d2}`
}

const shapeGrid = (key: string, label: string, rows: string, cols: string, defs?: (number | null)[][]) => ({ kind: 'matrix' as const, key, label, columns: cols.split(','), rows: rows.split(','), defaults: defs as number[][] | undefined })

const FUNCS: Record<string, { args: number; fn: (a: number[]) => number }> = {
  abs: { args: 1, fn: (a) => Math.abs(a[0]) },
  acos: { args: 1, fn: (a) => Math.acos(a[0]) },
  acosh: { args: 1, fn: (a) => Math.acosh(a[0]) },
  asin: { args: 1, fn: (a) => Math.asin(a[0]) },
  asinh: { args: 1, fn: (a) => Math.asinh(a[0]) },
  atan: { args: 1, fn: (a) => Math.atan(a[0]) },
  atanh: { args: 1, fn: (a) => Math.atanh(a[0]) },
  cbrt: { args: 1, fn: (a) => Math.cbrt(a[0]) },
  ceil: { args: 1, fn: (a) => Math.ceil(a[0]) },
  cos: { args: 1, fn: (a) => Math.cos(a[0]) },
  cosh: { args: 1, fn: (a) => Math.cosh(a[0]) },
  exp: { args: 1, fn: (a) => Math.exp(a[0]) },
  floor: { args: 1, fn: (a) => Math.floor(a[0]) },
  ln: { args: 1, fn: (a) => Math.log(a[0]) },
  log: { args: 1, fn: (a) => Math.log10(a[0]) },
  log10: { args: 1, fn: (a) => Math.log10(a[0]) },
  log2: { args: 1, fn: (a) => Math.log2(a[0]) },
  round: { args: 1, fn: (a) => Math.round(a[0]) },
  sign: { args: 1, fn: (a) => Math.sign(a[0]) },
  sin: { args: 1, fn: (a) => Math.sin(a[0]) },
  sinh: { args: 1, fn: (a) => Math.sinh(a[0]) },
  sqrt: { args: 1, fn: (a) => Math.sqrt(a[0]) },
  tan: { args: 1, fn: (a) => Math.tan(a[0]) },
  tanh: { args: 1, fn: (a) => Math.tanh(a[0]) },
  max: { args: 2, fn: (a) => Math.max(a[0], a[1]) },
  min: { args: 2, fn: (a) => Math.min(a[0], a[1]) },
  pow: { args: 2, fn: (a) => Math.pow(a[0], a[1]) },
}

const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E }

const FUNCS_RE = new RegExp(`^(${Object.keys(FUNCS).sort((a, b) => b.length - a.length).join('|')})\\s*\\(`)

const OP_PREC: Record<string, number> = { 'u+': 4, 'u-': 4, '**': 3, '*': 2, '/': 2, '%': 2, '+': 1, '-': 1 }

function evalExpr(src: string, x: number): number {
  const s = String(src).replace(/\s+/g, '').replace(/\^/g, '**')
  if (!s) return NaN
  const out: number[] = []
  const ops: string[] = []
  let expectValue = true
  const reduce = () => {
    const op = ops.pop()
    if (op === undefined) return false
    if (op === 'u-' || op === 'u+') {
      const a = out.pop()
      if (a === undefined) return false
      out.push(op === 'u-' ? -a : a)
      return true
    }
    const b = out.pop()
    const a = out.pop()
    if (a === undefined || b === undefined) return false
    out.push(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : op === '%' ? a % b : op === '**' ? Math.pow(a, b) : NaN)
    return true
  }
  const popFor = (p: number, rightAssoc: boolean) => {
    while (ops.length) {
      const top = ops[ops.length - 1]
      if (top === '(' || OP_PREC[top] === undefined) break
      if (rightAssoc ? OP_PREC[top] <= p : OP_PREC[top] < p) break
      if (!reduce()) return false
    }
    return true
  }
  const pushMul = () => {
    if (!popFor(2, false)) return false
    ops.push('*')
    return true
  }
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch === '+' || ch === '-') {
      if (expectValue) ops.push(ch === '-' ? 'u-' : 'u+')
      else {
        if (!popFor(1, false)) return NaN
        ops.push(ch)
      }
      i++
      expectValue = true
      continue
    }
    if (ch === '*' || ch === '/' || ch === '%') {
      if (s[i + 1] === '*') {
        while (ops.length) {
          const top = ops[ops.length - 1]
          if (top === '(' || top === 'u-' || top === 'u+' || OP_PREC[top] <= 3) break
          if (!reduce()) return NaN
        }
        ops.push('**')
        i += 2
        expectValue = true
        continue
      }
      if (!popFor(2, false)) return NaN
      ops.push(ch)
      i++
      expectValue = true
      continue
    }
    if (ch === '(') {
      if (!expectValue && !pushMul()) return NaN
      ops.push(ch)
      i++
      expectValue = true
      continue
    }
    if (ch === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        if (!reduce()) return NaN
      }
      ops.pop()
      i++
      expectValue = false
      continue
    }
    const rest = s.slice(i)
    const fm = rest.match(FUNCS_RE)
    if (fm) {
      if (!expectValue && !pushMul()) return NaN
      const call = FUNCS[fm[1]]
      let depth = 1
      let j = i + fm[0].length
      for (; j < s.length && depth > 0; j++) {
        if (s[j] === '(') depth++
        else if (s[j] === ')') depth--
      }
      if (depth !== 0) return NaN
      const inner = s.slice(i + fm[0].length, j - 1)
      const vals: number[] = []
      let depth2 = 0
      let start = 0
      const flush = (end: number) => {
        const piece = inner.slice(start, end)
        if (piece.length) {
          const r = evalExpr(piece, x)
          if (!Number.isFinite(r)) return false
          vals.push(r)
        }
        return true
      }
      for (let k = 0; k < inner.length; k++) {
        const c = inner[k]
        if (c === '(') depth2++
        else if (c === ')') depth2--
        else if (c === ',' && depth2 === 0) {
          if (!flush(k)) return NaN
          start = k + 1
        }
      }
      if (!flush(inner.length)) return NaN
      if (vals.length !== call.args) return NaN
      const r = call.fn(vals)
      if (!Number.isFinite(r)) return NaN
      out.push(r)
      i = j
      expectValue = false
      continue
    }
    const restL = rest.toLowerCase()
    if (restL.startsWith('pi')) {
      out.push(CONSTS.pi)
      i += 2
      expectValue = false
      continue
    }
    if (restL.startsWith('e')) {
      out.push(CONSTS.e)
      i += 1
      expectValue = false
      continue
    }
    const numM = rest.match(/^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/)
    if (numM) {
      out.push(Number(numM[0]))
      i += numM[0].length
      expectValue = false
      continue
    }
    if (rest.startsWith('x')) {
      if (!expectValue && !pushMul()) return NaN
      out.push(x)
      i += 1
      expectValue = false
      continue
    }
    return NaN
  }
  while (ops.length) {
    if (!reduce()) return NaN
  }
  return out.length === 1 ? out[0] : NaN
}

export const mod06: StudentSpec[] = [
  {
    id: 'basic-calculator',
    name: 'Basic Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Runs the four arithmetic operations on two numbers with the result, checks and a quick reference of common study calculations.',
    tip: 'Estimate before you calculate. If a shop total “feels” like ~40 but the calculator says 4,012, you misplaced a decimal point.',
    usage: ['Enter two numbers.', 'Choose the operation.', 'Read the result and the sanity check.'],
    method: ['Arithmetic operators apply directly to the inputs.', 'Division guards against a zero denominator.', 'A reference panel offers common exam shortcuts.'],
    fields: [n('a', 'First number', { def: 12, step: 0.5 }), n('b', 'Second number', { def: 4, step: 0.5 }), sel('op', 'Operation', ['Add', 'Subtract', 'Multiply', 'Divide', 'Power', 'Modulo'], 'Add')],
    compute: (v) => {
      const a = asNum(v.a)
      const b = asNum(v.b)
      const op = asSel(v.op)
      let r = 0
      let label = ''
      if (op === 'Add') { r = a + b; label = 'a + b' } else if (op === 'Subtract') { r = a - b; label = 'a − b' } else if (op === 'Multiply') { r = a * b; label = 'a × b' } else if (op === 'Divide') { r = b === 0 ? NaN : a / b; label = 'a ÷ b' } else if (op === 'Power') { r = Math.pow(a, b); label = 'a^b' } else { r = b === 0 ? NaN : a % b; label = 'a mod b' }
      const ok = Number.isFinite(r)
      return [
        sres('Result', ok ? num(r, 4) : 'Undefined (division by zero)', ok ? T.good : T.bad, label),
        res('Expression', `${a} ${op === 'Add' ? '+' : op === 'Subtract' ? '−' : op === 'Multiply' ? '×' : op === 'Divide' ? '÷' : op === 'Power' ? '^' : 'mod'} ${b} = ${ok ? num(r, 4) : 'error'}`, T.neutral),
        docr('Study references', '• 30% of 250 = 0.3 × 250 = 75\n• Average of 8, 12, 20 = 40 ÷ 3 = 13.3\n• Square root of 1521 = 39'),
      ]
    },
  },
  {
    id: 'scientific-calculator',
    name: 'Scientific Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Evaluates logarithms, trigonometry, exponentials and roots with degree/radian awareness and a full expression breakdown.',
    tip: 'Your calculator’s mode matters: sin(30) is 0.5 in DEG and 0.147 in RAD. Check the mode indicator before every trig answer.',
    usage: ['Enter a number.', 'Choose the function and angle unit.', 'Read the result with its identity.'],
    method: ['Log, ln, sqrt, exp map to standard functions.', 'Trig honors the chosen angle unit.', 'Results are shown with an identity label.'],
    fields: [n('x', 'Value', { def: 30, step: 0.1 }), sel('fn', 'Function', ['sin', 'cos', 'tan', 'ln', 'log10', 'sqrt', 'e^x', '|x|'], 'sin'), sel('unit', 'Angle unit', ['Degrees', 'Radians'], 'Degrees')],
    compute: (v) => {
      const x = asNum(v.x)
      const fn = asSel(v.fn)
      const rad = asSel(v.unit) === 'Radians'
      const toRad = rad ? x : (x * Math.PI) / 180
      let r = 0
      if (fn === 'sin') r = Math.sin(toRad)
      else if (fn === 'cos') r = Math.cos(toRad)
      else if (fn === 'tan') r = Math.tan(toRad)
      else if (fn === 'ln') r = Math.log(x)
      else if (fn === 'log10') r = Math.log10(x)
      else if (fn === 'sqrt') r = Math.sqrt(x)
      else if (fn === 'e^x') r = Math.exp(x)
      else r = Math.abs(x)
      const valid = fn === 'sqrt' ? x >= 0 : fn === 'ln' || fn === 'log10' ? x > 0 : true
      return [
        sres(`${fn}(${x})`, valid ? ratio(r, 5) : 'undefined (domain)', valid ? T.good : T.bad, rad ? 'radian mode' : 'degree mode'),
        res('Input in radians', ratio(toRad, 5), T.neutral),
        docr('Identities to remember', 'sin² + cos² = 1\ntan θ = sin θ / cos θ\nlog₁₀ e = ln e / 2.303\n√x = x^(1/2)'),
      ]
    },
  },
  {
    id: 'fraction-calculator',
    name: 'Fraction Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb: 'Adds, subtracts, multiplies and divides fractions — automatically reduced to lowest terms with decimal and percentage views.',
    tip: 'Always check with the decimal: 3/4 must read 0.75. A fraction answer that surprises you is usually a reduction or sign error.',
    usage: ['Enter two fractions.', 'Choose the operation.', 'Copy the reduced result.'],
    method: ['Common denominators handle addition and subtraction.', 'Products cross-multiply and cancel.', 'Results reduce by the greatest common factor.'],
    fields: [n('n1', 'Numerator 1', { def: 2, step: 1 }), n('d1', 'Denominator 1', { def: 3, min: 1, step: 1 }), n('n2', 'Numerator 2', { def: 1, step: 1 }), n('d2', 'Denominator 2', { def: 4, min: 1, step: 1 }), sel('op', 'Operation', ['Add', 'Subtract', 'Multiply', 'Divide'], 'Add')],
    compute: (v) => {
      const a = asNum(v.n1)
      const b = asNum(v.d1) || 1
      const c = asNum(v.n2)
      const d = asNum(v.d2) || 1
      const op = asSel(v.op)
      let rn = 0
      let rd = 1
      if (op === 'Add') { rn = a * d + c * b; rd = b * d } else if (op === 'Subtract') { rn = a * d - c * b; rd = b * d } else if (op === 'Multiply') { rn = a * c; rd = b * d } else { rn = a * d; rd = b * c }
      const fs = fracStr(rn, rd)
      const dec = rd === 0 ? NaN : rn / rd
      return [
        sres('Result (reduced)', fs, T.good),
        res('As decimal', Number.isFinite(dec) ? dec.toFixed(6).replace(/0+$/, '').replace(/\.$/, '.0') : 'undefined', T.neutral),
        res('As percentage', Number.isFinite(dec) ? (dec * 100).toFixed(2) + '%' : '—', T.neutral),
      ]
    },
  },
  {
    id: 'percentage-calculator-math',
    name: 'Percentage Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Handles the five percentage operations — of, increase, decrease, difference and change — with step-by-step arithmetic shown.',
    tip: 'Reverse percentages: if 20% of X is 80, then X = 80 ÷ 0.2 = 400. Marks are always reversed this way.',
    usage: ['Enter the base value.', 'Choose the operation.', 'Follow the arithmetic steps.'],
    method: ['“Percent of” multiplies by p/100.', 'Increase/decrease scale by (1 ± p/100).', 'Percent change compares two values.'],
    fields: [n('base', 'Value', { def: 200, step: 1 }), n('p', 'Percentage', { def: 15, step: 0.5 }), sel('op', 'Operation', ['% of value', 'Increase by %', 'Decrease by %', 'What % is A of B', '% change from A to B'], '% of value')],
    compute: (v) => {
      const base = asNum(v.base)
      const p = asNum(v.p)
      const op = asSel(v.op)
      const b2 = asNum(v.b) || 0
      let r = 0
      let steps = ''
      if (op === '% of value') { r = (base * p) / 100; steps = `${base} × ${p}/100 = ${num(r, 2)}` } else if (op === 'Increase by %') { r = base * (1 + p / 100); steps = `${base} + ${num((base * p) / 100, 2)} = ${num(r, 2)}` } else if (op === 'Decrease by %') { r = base * (1 - p / 100); steps = `${base} − ${num((base * p) / 100, 2)} = ${num(r, 2)}` } else if (op === 'What % is A of B') { r = b2 ? (base / b2) * 100 : 0; steps = `${base} ÷ ${b2} × 100 = ${num(r, 2)}%` } else { r = base ? ((b2 - base) / base) * 100 : 0; steps = `(${b2} − ${base}) ÷ ${base} × 100 = ${num(r, 2)}%` }
      return [sres('Result', num(r, 2), T.good), res('Steps', steps, T.neutral), res('Tip', 'Marks: reverse with “what % is A of B”.', T.neutral)]
    },
  },
  {
    id: 'ratio-calculator',
    name: 'Ratio Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Simplifies and scales ratios — simplifies to lowest terms, shares a total, and checks whether two ratios are equivalent.',
    tip: 'A ratio is not a fraction of a whole. 3:2 means 3 for every 2, and shares need the sum (5 parts) as the denominator.',
    usage: ['Enter ratio parts.', 'Optionally give a total to divide.', 'Read simplified and share values.'],
    method: ['Ratio parts share a GCD that reduces them.', 'Shares divide each part by the sum of parts.', 'Equivalence compares cross-products.'],
    fields: [n('a', 'Part A', { def: 3, min: 0, step: 1 }), n('b', 'Part B', { def: 2, min: 0, step: 1 }), n('total', 'Total to divide (optional)', { def: 50, min: 0, step: 1 })],
    compute: (v) => {
      const a = asNum(v.a)
      const b = asNum(v.b)
      const g = gcf(a, b)
      const t = asNum(v.total)
      const sum = a + b
      return [
        sres('Simplified ratio', `${a / g}:${b / g}`, a && b ? T.good : T.warn, `GCD ${g}`),
        res('Equivalent check', sum ? `${a}:${b} = ${(a / sum).toFixed(3)} : ${(b / sum).toFixed(3)}` : '—', T.neutral),
        res(sum && sum > 0 ? `Shares of ${t}` : 'Shares', sum ? `${num((a / sum) * t, 2)} and ${num((b / sum) * t, 2)}` : '—', T.neutral),
      ]
    },
  },
  {
    id: 'average-calculator',
    name: 'Average Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes the arithmetic mean of any dataset, with a weighted-average mode for graded coursework and split bills.',
    tip: 'A simple mean is skewed by one outlier. In a stats class, always report the median alongside when data is skewed.',
    usage: ['Enter your numbers.', 'Choose simple or weighted.', 'Read the mean and count.'],
    method: ['Simple mean sums values and divides by count.', 'Weighted mean multiplies each value by its weight.', 'Weights are normalized by their total.'],
    fields: [
      txt('nums', 'Numbers (comma or line separated)', 3, '12, 15, 9, 18, 21'),
      sel('mode', 'Mode', ['Simple mean', 'Weighted mean'], 'Simple mean'),
      txt('wts', 'Weights (only for weighted)', 2, '0.2, 0.3, 0.5'),
    ],
    compute: (v) => {
      const nums = asStr(v.nums).split(/[\s,]+/).map(Number).filter((x) => Number.isFinite(x))
      if (nums.length === 0) return [res('Average', 'Enter at least one number', T.warn)]
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length
      const wts = asStr(v.wts).split(/[\s,]+/).map(Number).filter((x) => Number.isFinite(x) && x > 0)
      const wSum = wts.reduce((a, b) => a + b, 0)
      const wMean = wts.length === nums.length && wSum ? nums.reduce((a, x, i) => a + x * wts[i], 0) / wSum : null
      return [
        sres('Count', num(nums.length), T.good),
        sres('Simple mean', ratio(mean, 4), T.good),
        res('Weighted mean', wMean !== null ? ratio(wMean, 4) : 'weights must match count', wMean !== null ? T.neutral : T.warn),
        res('Sum', num(nums.reduce((a, b) => a + b, 0), 2), T.neutral),
      ]
    },
  },
  {
    id: 'algebra-calculator',
    name: 'Algebra Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves linear and quadratic equations symbolically, then substitutes the roots back into your original equation to prove they work.',
    tip: 'Always substitute your answer back into the original equation. Substitution is the only proof that a solution exists.',
    usage: ['Enter the equation with = in the middle.', 'Read the collected form, the roots and the check.', 'Type both sides: 3x + 7 = 22, or x^2 - 5x + 6 = 0.'],
    method: ['Each side is parsed, then sampled at x = 0, 1, 2 to recover its x², x and constant terms exactly.', 'Bringing everything to one side gives ax² + bx + c = 0.', 'Roots come from the linear or quadratic formula, and each is substituted back.'],
    fields: [txt('eq', 'Equation (e.g. 3x + 7 = 22)', 2, '3x + 7 = 22'), n('at', 'Also evaluate the left side at x =', { def: 2, step: 0.5 })],
    compute: (v) => {
      const eq = asStr(v.eq).trim()
      const parts = eq.split('=')
      if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
        return [res('Solve', 'Use one equation with a single = sign', T.warn, 'for example 3x + 7 = 22 or x^2 - 5x + 6 = 0')]
      }
      const coefs = (src: string): [number, number, number] | null => {
        const f = (x: number) => evalExpr(src, x)
        const f0 = f(0)
        const f1 = f(1)
        const f2 = f(2)
        if (![f0, f1, f2].every(Number.isFinite)) return null
        const a = (f2 - 2 * f1 + f0) / 2
        const b = f1 - f0 - a
        return [a, b, f0]
      }
      const L = coefs(parts[0])
      const R = coefs(parts[1])
      if (!L || !R) {
        return [
          sres('Solve', 'I could not read both sides', T.bad, 'numbers, x, + - * / ^, parentheses and functions only'),
          docr('Left side', parts[0].trim()),
          docr('Right side', parts[1].trim()),
          res('Tip', 'implicit multiplication works, so 3x and 2(x+1) are fine', T.neutral),
        ]
      }
      const A = L[0] - R[0]
      const B = L[1] - R[1]
      const C = L[2] - R[2]
      const collected = `${ratio(A, 4)}x² ${B < 0 ? '−' : '+'} ${ratio(Math.abs(B), 4)}x ${C < 0 ? '−' : '+'} ${ratio(Math.abs(C), 4)} = 0`
      const at = asNum(v.at)
      const leftAt = evalExpr(parts[0], at)
      if (Math.abs(A) < 1e-9 && Math.abs(B) < 1e-9) {
        return [
          sres('Collected form', collected, T.neutral),
          sres('Solutions', Math.abs(C) < 1e-9 ? 'Infinitely many' : 'No solution', T.bad, Math.abs(C) < 1e-9 ? 'the right side is identical to the left for every x' : 'the two sides never meet — they are parallel'),
          sres('Left side at x = ' + ratio(at, 2), Number.isFinite(leftAt) ? ratio(leftAt, 4) : 'undefined', T.neutral),
        ]
      }
      const check = (x: number) => {
        const l = evalExpr(parts[0], x)
        const r = evalExpr(parts[1], x)
        return `x = ${ratio(x, 4)}: left = ${ratio(l, 4)}, right = ${ratio(r, 4)}, difference = ${ratio(l - r, 8)}`
      }
      if (Math.abs(A) < 1e-9) {
        const x = -C / B
        return [
          sres('Collected form', collected, T.neutral, 'the x² terms cancelled, so this is linear'),
          sres('x =', ratio(x, 6), T.good, 'x = −c / b'),
          docr('Check', check(x)),
          sres('Left side at x = ' + ratio(at, 2), Number.isFinite(leftAt) ? ratio(leftAt, 4) : 'undefined', T.neutral, 'substitute any x to evaluate the left side'),
        ]
      }
      const disc = B * B - 4 * A * C
      if (disc < -1e-9) {
        return [
          sres('Collected form', collected, T.neutral),
          sres('Discriminant', ratio(disc, 4), T.bad, 'negative, so there are no real roots'),
          sres('Complex roots', `${ratio(-B / (2 * A), 4)} ± ${ratio(Math.sqrt(-disc) / (2 * Math.abs(A)), 4)}i`, T.neutral, 'over the complex numbers there are always two roots'),
          sres('Left side at x = ' + ratio(at, 2), Number.isFinite(leftAt) ? ratio(leftAt, 4) : 'undefined', T.neutral),
        ]
      }
      const sq = Math.sqrt(Math.max(0, disc))
      const r1 = (-B + sq) / (2 * A)
      const r2 = (-B - sq) / (2 * A)
      const roots = Math.abs(disc) < 1e-9 ? [r1] : [Math.max(r1, r2), Math.min(r1, r2)]
      return [
        sres('Collected form', collected, T.neutral, 'brought to one side so a = ' + ratio(A, 4)),
        sres('Discriminant b² − 4ac', ratio(disc, 4), Math.abs(disc) < 1e-9 ? T.warn : T.good, Math.abs(disc) < 1e-9 ? 'zero — one repeated root' : disc > 0 ? 'positive — two real roots' : 'negative — no real roots'),
        ...roots.map((x, i) => sres(i === 0 ? 'Root 1' : 'Root 2', ratio(x, 6), T.good, i === 0 ? 'x = (−b + √Δ) / 2a' : 'x = (−b − √Δ) / 2a')),
        docr('Check', roots.map(check).join('\n')),
        sres('Left side at x = ' + ratio(at, 2), Number.isFinite(leftAt) ? ratio(leftAt, 4) : 'undefined', T.neutral, 'substitute any x to evaluate the left side'),
      ]
    },
  },
  {
    id: 'equation-solver-math',
    name: 'Equation Solver',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves systems of simultaneous linear equations (2×2 and 3×3) by Cramer’s rule, with the determinant, back-substitution residuals and the consistency verdict.',
    tip: 'For simultaneous equations, the determinant is your health check. If det = 0, expect infinitely many or no solutions — never a unique one.',
    usage: ['Enter the coefficients; the last column is the right-hand side.', 'Choose whether you have two or three equations (z is ignored for two).', 'Read x, y, z, the determinant and the residuals.'],
    method: ['Coefficients are read as an augmented matrix, last column = right-hand side.', 'Cramer’s rule replaces one column at a time to get D, Dx, Dy, Dz.', 'A zero determinant signals non-unique solutions, and residuals verify the answer.'],
    fields: [
      sel('sys', 'System', ['2 equations', '3 equations'], '2 equations'),
      shapeGrid('k', 'Augmented matrix — the last column is always the right-hand side (ignore z for 2 equations)', 'Eq 1,Eq 2,Eq 3', ',x,y,z,= d', [
        [2, 1, 0, 5],
        [1, -1, 0, 1],
        [1, 3, 3, 9],
      ]),
    ],
    compute: (v) => {
      const k = asSel(v.sys) === '2 equations' ? 2 : 3
      const grid = asMatrix(v.k)
      const rowsAll = grid.filter((r) => r && r.length >= k + 1).slice(0, k)
      if (rowsAll.length < k) return [sres('System', 'Fill in every coefficient cell', T.warn, `each of the ${k} equations needs ${k} coefficients plus the right-hand side`)]
      const A = rowsAll.map((r) => r.slice(0, k).map((c) => (Number.isFinite(Number(c)) ? Number(c) : 0)))
      const d = rowsAll.map((r) => (Number.isFinite(Number(r[r.length - 1])) ? Number(r[r.length - 1]) : 0))
      const det3 = (m: number[][]) =>
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
      const det2 = (m: number[][]) => m[0][0] * m[1][1] - m[0][1] * m[1][0]
      const D = k === 2 ? det2(A) : det3(A)
      const names = k === 2 ? ['x', 'y'] : ['x', 'y', 'z']
      const lhs = (i: number) => {
        const parts: string[] = []
        A[i].forEach((c, j) => {
          if (Math.abs(c) < 1e-12) return
          const sign = parts.length === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '
          parts.push(`${sign}${ratio(Math.abs(c), 4)}${names[j]}`)
        })
        return parts.length ? parts.join('') : '0'
      }
      if (Math.abs(D) < 1e-9) {
        const consistent =
          k === 2
            ? Math.abs(d[0] * A[1][0] - d[1] * A[0][0]) < 1e-9
            : Math.abs(det3([A[0], A[1], d])) < 1e-9 && Math.abs(det3([A[0], A[2], d])) < 1e-9 && Math.abs(det3([A[1], A[2], d])) < 1e-9
        return [
          sres('Determinant', '0', T.bad, 'the coefficient matrix is singular'),
          sres('Solution', consistent ? 'Infinitely many' : 'No solution', T.bad, consistent ? 'one equation is a combination of the others — the system is under-determined' : 'the same coefficients lead to different right-hand sides — the system is contradictory'),
          docr('Equations as entered', rowsAll.map((_r, i) => `${lhs(i)} = ${ratio(d[i], 4)}`).join('\n')),
        ]
      }
      const sol = names.map((_nm, j) => {
        const M = A.map((row, i) => row.map((c, cj) => (cj === j ? d[i] : c)))
        return (k === 2 ? det2(M) : det3(M)) / D
      })
      const residuals = rowsAll.map((_r, i) => A[i].reduce((acc, c, j) => acc + c * sol[j], 0) - d[i])
      const worst = residuals.reduce((a, b) => Math.max(a, Math.abs(b)), 0)
      const solvedRow = (i: number) => {
        const parts: string[] = []
        A[i].forEach((c, j) => {
          if (Math.abs(c) < 1e-12) return
          const sign = parts.length === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '
          const p = `${ratio(Math.abs(c), 2)} ${names[j]}`
          parts.push(`${sign}${p} (${ratio(Math.abs(c), 2)} × ${ratio(sol[j], 4)} = ${ratio(c * sol[j], 4)})`)
        })
        const total = A[i].reduce((acc, _s, j) => acc + A[i][j] * sol[j], 0)
        return `${parts.length ? parts.join('') : '0'} = ${ratio(total, 4)}  (expected ${ratio(d[i], 4)})`
      }
      return [
        ...names.map((nm, j) => sres(nm, ratio(sol[j], 6), T.good, `${nm} = column ${j + 1} of the solution vector`)),
        sres('Determinant', ratio(D, 4), Math.abs(D) < 1e-6 ? T.warn : T.good, Math.abs(D) < 1e-6 ? 'nearly zero — the solution exists but is hypersensitive to rounding' : 'non-zero, so the solution is unique'),
        res('Back-substitution check', residuals.every((r) => Math.abs(r) < 1e-6) ? `verified, worst residual ${ratio(worst, 8)}` : `residual ${ratio(worst, 6)} — check the coefficients`, Math.abs(worst) < 1e-6 ? T.good : T.bad, 'each equation is re-evaluated with your solution'),
        docr('Equations as solved', rowsAll.map((_r, i) => `${lhs(i)} = ${ratio(d[i], 4)}   →   ${solvedRow(i)}`).join('\n')),
      ]
    },
  },
  {
    id: 'quadratic-equation-solver',
    name: 'Quadratic Equation Solver',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves ax² + bx + c = 0 with the discriminant, both roots, vertex and shape classification for graphing.',
    tip: 'Discriminant tells the story: D > 0 two real roots, D = 0 one (double) root, D < 0 no real roots. Compute it first — it saves time.',
    usage: ['Enter a, b and c.', 'Solve the equation.', 'Read the roots, vertex and discriminant sign.'],
    method: ['The discriminant D = b² − 4ac classifies the roots.', 'Roots use the quadratic formula.', 'The vertex sits at x = −b/2a.'],
    fields: [n('a', 'a (x² coefficient)', { def: 1, step: 0.5 }), n('b', 'b (x coefficient)', { def: -5, step: 0.5 }), n('c', 'c (constant)', { def: 6, step: 0.5 })],
    compute: (v) => {
      const a = asNum(v.a)
      const b = asNum(v.b)
      const c = asNum(v.c)
      if (a === 0) return [res('Solve', 'a = 0 makes this linear, not quadratic', T.warn, `x = ${c !== 0 ? ratio(-c / b, 4) : 'undefined'}`)]
      const D = b * b - 4 * a * c
      const vx = -b / (2 * a)
      const vy = a * vx * vx + b * vx + c
      if (D > 0) {
        const r1 = (-b + Math.sqrt(D)) / (2 * a)
        const r2 = (-b - Math.sqrt(D)) / (2 * a)
        return [sres('Roots (x₁, x₂)', `${ratio(r1, 4)}, ${ratio(r2, 4)}`, T.good, 'two real roots'), res('Discriminant D', ratio(D, 2), T.good), res('Vertex', `(${ratio(vx, 3)}, ${ratio(vy, 3)})`, T.neutral, a > 0 ? 'opens upward' : 'opens downward')]
      }
      if (D === 0) return [sres('Root (double)', ratio(-b / (2 * a), 4), T.warn, 'one repeated root'), res('Discriminant D', '0', T.warn), res('Vertex', `(${ratio(vx, 3)}, ${ratio(vy, 3)})`, T.neutral, 'parabola touches the x-axis')]
      return [sres('Roots', 'no real roots (complex)', T.bad, 'D < 0'), res('Discriminant D', ratio(D, 2), T.bad), res('Vertex', `(${ratio(vx, 3)}, ${ratio(vy, 3)})`, T.neutral, 'parabola misses the x-axis')]
    },
  },
  {
    id: 'matrix-calculator',
    name: 'Matrix Calculator',
    archetype: 'matrix',
    subject: SUBJECT,
    blurb: 'Operates on 2×2 matrices — determinant, inverse, transpose, trace and multiplication — with the intermediate steps shown.',
    tip: 'Determinant zero means no inverse — that is the most common exam trap when you divide by det without checking.',
    usage: ['Enter both matrices.', 'Choose the operation.', 'Read the result with its key intermediate.'],
    method: ['det = ad − bc for 2×2.', 'Inverse = (1/det)·[[d, −b], [−c, a]].', 'Matrix multiply is row × column.'],
    fields: [shapeGrid('g', 'Matrices A and B (2×2 each)', 'r1,r2', ',a11,a12,b11,b12', [[3, 1, 1, 2], [2, 4, 4, 3]]), sel('op', 'Operation', ['Determinant', 'Inverse', 'Transpose', 'Trace', 'A × B', 'A + B'], 'Determinant')],
    compute: (v) => {
      const g = Array.isArray(v.g) ? (v.g as number[][]) : [[3, 1], [2, 4]]
      const A = [[numOr(g[0]?.[0], 3), numOr(g[0]?.[1], 1)], [numOr(g[1]?.[0], 2), numOr(g[1]?.[1], 4)]]
      const B = [[numOr(g[0]?.[2], 1), numOr(g[0]?.[3], 2)], [numOr(g[1]?.[2], 4), numOr(g[1]?.[3], 3)]]
      const det = A[0][0] * A[1][1] - A[0][1] * A[1][0]
      const op = asSel(v.op)
      if (op === 'Determinant') return [sres('det(A)', ratio(det, 2), det !== 0 ? T.good : T.warn, det !== 0 ? 'invertible' : 'singular — no inverse'), docr('Formula', 'det = a·d − b·c = ' + ratio(det, 2))]
      if (op === 'Inverse') {
        if (det === 0) return [sres('A⁻¹', 'undefined (det = 0)', T.bad)]
        return [docr('A⁻¹', `1/${ratio(det, 2)} · [[${A[1][1]}, ${-A[0][1]}], [${-A[1][0]}, ${A[0][0]}]] = [[${ratio(A[1][1] / det, 4)}, ${ratio(-A[0][1] / det, 4)}], [${ratio(-A[1][0] / det, 4)}, ${ratio(A[0][0] / det, 4)}]]`), res('det', ratio(det, 2), T.neutral)]
      }
      if (op === 'Transpose') return [docr('Aᵀ', `[[${A[0][0]}, ${A[1][0]}], [${A[0][1]}, ${A[1][1]}]]`)]
      if (op === 'Trace') return [sres('tr(A)', ratio(A[0][0] + A[1][1], 2), T.good, 'sum of main diagonal')]
      if (op === 'A + B') return [docr('A + B', `[[${ratio(A[0][0] + B[0][0], 2)}, ${ratio(A[0][1] + B[0][1], 2)}], [${ratio(A[1][0] + B[1][0], 2)}, ${ratio(A[1][1] + B[1][1], 2)}]]`)]
      return [docr('A × B', `[[${ratio(A[0][0] * B[0][0] + A[0][1] * B[1][0], 2)}, ${ratio(A[0][0] * B[0][1] + A[0][1] * B[1][1], 2)}], [${ratio(A[1][0] * B[0][0] + A[1][1] * B[1][0], 2)}, ${ratio(A[1][0] * B[0][1] + A[1][1] * B[1][1], 2)}]]`)]
      function numOr(x: number | undefined, d: number) { return typeof x === 'number' && Number.isFinite(x) ? x : d }
    },
  },
  {
    id: 'probability-calculator',
    name: 'Probability Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes union, intersection, conditional and complement probabilities from any set of events, with odds and decimal views.',
    tip: 'P(A and B) ≠ P(A) × P(B) unless A and B are independent. That independence assumption is the #1 source of wrong answers.',
    usage: ['Enter the probabilities of A and B.', 'Choose the combination.', 'Read the result with a validity note.'],
    method: ['Union uses inclusion–exclusion.', 'Intersection assumes independence unless specified.', 'Conditional divides by the conditioning event.'],
    fields: [n('pa', 'P(A)', { def: 0.4, min: 0, max: 1, step: 0.01 }), n('pb', 'P(B)', { def: 0.3, min: 0, max: 1, step: 0.01 }), sel('op', 'Combination', ['P(A ∪ B)', 'P(A ∩ B)', 'P(A | B)', 'P(A′)', 'P(neither)'], 'P(A ∪ B)'), sel('indep', 'A and B', ['Independent', 'Dependent'], 'Independent')],
    compute: (v) => {
      const pa = clamp(asNum(v.pa), 0, 1)
      const pb = clamp(asNum(v.pb), 0, 1)
      const indep = asSel(v.indep) === 'Independent'
      const op = asSel(v.op)
      let r = 0
      let note = ''
      if (op === 'P(A ∪ B)') { r = indep ? pa + pb - pa * pb : pa + pb - Math.min(pa, pb); note = indep ? 'inclusion–exclusion' : 'union (no independence)' } else if (op === 'P(A ∩ B)') { r = indep ? pa * pb : Math.min(pa, pb); note = indep ? 'P(A)×P(B)' : 'take the smaller (bound)' } else if (op === 'P(A | B)') { r = pb ? pa / pb : 0; note = 'P(A)/P(B)' } else if (op === 'P(A′)') { r = 1 - pa; note = 'complement' } else { r = 1 - (op === 'P(A ∪ B)' ? (indep ? pa + pb - pa * pb : pa + pb - Math.min(pa, pb)) : pa + pb - (indep ? pa * pb : Math.min(pa, pb))); note = 'complement of union' }
      return [
        sres('Probability', (r * 100).toFixed(2) + '%', r > 1 || r < 0 ? T.bad : r >= 0.5 ? T.good : T.neutral, note),
        res('Decimal', r.toFixed(4), T.neutral),
        res('Odds', r >= 0 && r < 1 ? `${r.toFixed(3)} : ${(1 - r).toFixed(3)}` : '—', T.neutral),
      ]
    },
  },
  {
    id: 'statistics-calculator-math',
    name: 'Statistics Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Full descriptive-statistics suite on any dataset — mean, median, mode, range, variance, standard deviation and quartiles.',
    tip: 'Report median alongside mean for skewed data like exam marks — a single 0 outlier drags the mean far below the typical score.',
    usage: ['Paste your data.', 'Review all descriptive statistics.', 'Copy the summary for your report.'],
    method: ['Mean, median and mode describe center.', 'Variance is the average squared deviation.', 'Quartiles split the sorted data into quarters.'],
    fields: [txt('data', 'Data (comma separated)', 3, '12, 15, 9, 18, 21, 15, 30')],
    compute: (v) => {
      const d = asStr(v.data).split(/[\s,]+/).map(Number).filter((x) => Number.isFinite(x)).sort((a, b) => a - b)
      if (!d.length) return [res('Statistics', 'Enter some data', T.warn)]
      const mean = d.reduce((a, b) => a + b, 0) / d.length
      const med = d.length % 2 ? d[(d.length - 1) / 2] : (d[d.length / 2 - 1] + d[d.length / 2]) / 2
      const counts = new Map<number, number>()
      d.forEach((x) => counts.set(x, (counts.get(x) || 0) + 1))
      const maxC = Math.max(...counts.values())
      const modes = [...counts.entries()].filter(([, c]) => c === maxC && maxC > 1).map(([v2]) => v2)
      const pop = d.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) / d.length
      const samp = d.length > 1 ? d.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) / (d.length - 1) : 0
      const sd = Math.sqrt(samp)
      return [
        sres('Mean / Median / Mode', `${ratio(mean, 2)} / ${ratio(med, 2)} / ${modes.length ? modes.join(', ') : 'none'}`, T.good, `n = ${d.length}`),
        sres('Std deviation (sample)', ratio(sd, 3), sd > mean * 0.5 ? T.warn : T.good, `variance ${ratio(samp, 3)}`),
        res('Range', `${d[0]} … ${d[d.length - 1]} (span ${d[d.length - 1] - d[0]})`, T.neutral),
        res('Q1 / Q3 (IQR)', `${ratio(d[Math.floor(d.length * 0.25)], 2)} / ${ratio(d[Math.floor(d.length * 0.75)], 2)} (IQR ${ratio(d[Math.floor(d.length * 0.75)] - d[Math.floor(d.length * 0.25)], 2)})`, T.neutral),
        res('Population SD', ratio(Math.sqrt(pop), 3), T.neutral, 'divides by n, not n−1'),
      ]
    },
  },
  {
    id: 'mean-median-mode-calculator',
    name: 'Mean Median Mode Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Focuses on the three measures of central tendency with a worked comparison, a shape interpretation and an exam-style note.',
    tip: 'The three measures agree only for symmetric data. When they disagree, the data is skewed and you should say so in your report.',
    usage: ['Enter your dataset.', 'Compare mean, median and mode.', 'Read the shape interpretation.'],
    method: ['Mean = Σx/n.', 'Median is the middle value.', 'Mode is the most frequent value.'],
    fields: [txt('data', 'Data', 3, '2, 3, 3, 4, 5, 8, 8, 8, 10')],
    compute: (v) => {
      const d = asStr(v.data).split(/[\s,]+/).map(Number).filter((x) => Number.isFinite(x)).sort((a, b) => a - b)
      if (!d.length) return [res('Data', 'Enter some values', T.warn)]
      const mean = d.reduce((a, b) => a + b, 0) / d.length
      const med = d.length % 2 ? d[(d.length - 1) / 2] : (d[d.length / 2 - 1] + d[d.length / 2]) / 2
      const counts = new Map<number, number>()
      d.forEach((x) => counts.set(x, (counts.get(x) || 0) + 1))
      const maxC = Math.max(...counts.values())
      const mode = [...counts.entries()].filter(([, c]) => c === maxC && maxC > 1).map(([x]) => x)
      const shape = mean > med ? 'Right-skewed (mean > median)' : mean < med ? 'Left-skewed (mean < median)' : 'Symmetric (mean = median)'
      return [
        sres('Mean', ratio(mean, 3), T.good),
        sres('Median', ratio(med, 3), T.good),
        sres('Mode', mode.length ? mode.join(', ') : 'none', mode.length ? T.good : T.neutral),
        res('Shape', shape, mean === med ? T.good : T.warn),
        res('n', num(d.length), T.neutral),
      ]
    },
  },
  {
    id: 'standard-deviation-calculator',
    name: 'Standard Deviation Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Computes population and sample standard deviation with variance, coefficient of variation and z-score range for a dataset.',
    tip: 'Coefficient of variation (SD ÷ mean × 100) compares spread across datasets with different means — the fairest comparison in your report.',
    usage: ['Enter your data.', 'Choose sample or population.', 'Read SD, variance and CV.'],
    method: ['Sample SD divides by n − 1; population SD by n.', 'Variance is SD².', 'CV expresses spread as a percentage of the mean.'],
    fields: [txt('data', 'Data', 3, '5, 7, 9, 11, 13, 15, 17'), sel('kind', 'Basis', ['Sample (n−1)', 'Population (n)'], 'Sample (n−1)')],
    compute: (v) => {
      const d = asStr(v.data).split(/[\s,]+/).map(Number).filter((x) => Number.isFinite(x))
      if (d.length < 2) return [res('SD', 'Need at least 2 values', T.warn)]
      const mean = d.reduce((a, b) => a + b, 0) / d.length
      const ss = d.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0)
      const pop = asSel(v.kind) === 'Population (n)'
      const variance = ss / (pop ? d.length : d.length - 1)
      const sd = Math.sqrt(variance)
      const cv = mean ? (sd / Math.abs(mean)) * 100 : 0
      return [
        sres('Standard deviation', ratio(sd, 4), T.good, asSel(v.kind)),
        res('Variance', ratio(variance, 4), T.neutral),
        res('Coefficient of variation', ratio(cv, 1) + '%', cv > 30 ? T.warn : T.good, cv > 30 ? 'wide spread' : 'tight spread'),
        res('Mean ± 1 SD range', `${ratio(mean - sd, 2)} to ${ratio(mean + sd, 2)}`, T.neutral),
      ]
    },
  },
  {
    id: 'graphing-calculator',
    name: 'Graphing Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb: 'Tabulates a function over a range, finds intercepts and turning points, and renders an ASCII plot you can read anywhere.',
    tip: 'Always mark the y-intercept first when sketching — it anchors the whole curve near the origin where most marks are awarded.',
    usage: ['Enter the function (use x).', 'Set the x-range and how many points to sample.', 'Read the table, intercepts and ASCII graph.'],
    method: ['Values are sampled across the x-range.', 'Intercepts solve f(x) = 0 by bisection.', 'Turning points come from the sampled slope changing sign.', 'The ASCII grid plots sampled values.'],
    fields: [txt('f', 'Function f(x) (e.g. x^2-4)', 2, 'x^2-4'), n('x0', 'x start', { def: -6, step: 1 }), n('x1', 'x end', { def: 6, step: 1 }), n('samples', 'Sample points', { def: 25, min: 5, max: 61, step: 2 })],
    compute: (v) => {
      const fsrc = asStr(v.f).trim()
      if (!fsrc) return [sres('Graph', 'Enter a function first', T.warn, 'use x as the variable, e.g. x^2-4 or 0.5*x+1')]
      const probe = evalExpr(fsrc, 0.37)
      if (!Number.isFinite(evalExpr(fsrc, 0)) && !Number.isFinite(probe)) {
        return [
          sres('Graph', 'Could not read that function', T.bad, 'allowed: numbers, x, pi, e, + - * / % ^, parentheses and sin cos tan asin acos atan ln log log2 log10 sqrt cbrt exp abs floor ceil round min max pow'),
          docr('What was read', fsrc),
          res('Tip', 'x^2 means x squared, and 2x is not allowed — write 2*x', T.neutral, 'multiplication must be explicit'),
        ]
      }
      const f = (x: number) => evalExpr(fsrc, x)
      const x0 = asNum(v.x0)
      const x1 = asNum(v.x1)
      const lo = Math.min(x0, x1)
      const hi = Math.max(x0, x1)
      const count = clamp(Math.round(asNum(v.samples)) || 25, 5, 61)
      const step = (hi - lo) / (count - 1)
      const rows: { x: number; y: number }[] = []
      for (let k = 0; k < count; k++) {
        const x = lo + step * k
        rows.push({ x, y: f(x) })
      }
      const valid = rows.filter((r) => Number.isFinite(r.y))
      if (!valid.length) return [sres('Graph', 'No finite values in that x-range', T.bad, 'the function may be undefined everywhere you sampled')]
      const ys = valid.map((r) => r.y)
      const ymin = Math.min(...ys, 0)
      const ymax = Math.max(...ys, 0)
      const span = ymax - ymin || 1
      const bisect = (a: number, b: number, fa: number) => {
        for (let k = 0; k < 60; k++) {
          const m = (a + b) / 2
          const fm = f(m)
          if (!Number.isFinite(fm)) return NaN
          if (fa * fm <= 0) b = m
          else {
            a = m
            fa = fm
          }
        }
        return (a + b) / 2
      }
      const zeros: number[] = []
      for (let k = 1; k < rows.length; k++) {
        const p = rows[k - 1]
        const q = rows[k]
        if (!Number.isFinite(p.y) || !Number.isFinite(q.y)) continue
        if (p.y === 0) zeros.push(p.x)
        else if (p.y * q.y < 0) {
          const z = bisect(p.x, q.x, p.y)
          if (Number.isFinite(z)) zeros.push(z)
        }
      }
      if (Number.isFinite(rows[rows.length - 1].y) && rows[rows.length - 1].y === 0) zeros.push(rows[rows.length - 1].x)
      const turns: string[] = []
      for (let k = 1; k < rows.length - 1; k++) {
        const a = rows[k - 1]
        const b = rows[k]
        const c = rows[k + 1]
        if (![a.y, b.y, c.y].every(Number.isFinite)) continue
        const d1 = b.y - a.y
        const d2 = c.y - b.y
        if (d1 === 0 || d2 === 0) continue
        if (d1 > 0 !== d2 > 0) turns.push(`${d2 > d1 ? 'minimum' : 'maximum'} at x ≈ ${ratio(b.x, 2)} (y ≈ ${ratio(b.y, 2)})`)
      }
      const yInt = f(0)
      const grid: string[] = []
      for (let g = 9; g >= 0; g--) {
        let line = ''
        for (const r of rows) {
          if (!Number.isFinite(r.y)) {
            line += ' '
            continue
          }
          const level = ymin + (span * g) / 9
          if (Math.abs(r.y - 0) < span / 40) line += '-'
          else line += Math.abs(r.y - level) < span / 18 ? '*' : ' '
        }
        grid.push(line)
      }
      return [
        sres('f(0)', Number.isFinite(yInt) ? ratio(yInt, 3) : 'undefined', Number.isFinite(yInt) ? T.good : T.warn, 'y-intercept — plot this first'),
        sres('x-intercepts', zeros.length ? zeros.map((z) => `x ≈ ${ratio(z, 2)}`).join(', ') : 'none in range', zeros.length ? T.good : T.neutral, 'roots of f(x) = 0 found by bisection'),
        res('Turning points', turns.length ? String(turns.length) : 'none detected', turns.length ? T.good : T.neutral, turns.slice(0, 2).join('; ') || 'no local maxima or minima between the samples'),
        sres('x-range sampled', `${ratio(lo, 2)} to ${ratio(hi, 2)}`, T.neutral, `${count} points, step ${ratio(step, 3)}`),
        sres('y-range', `${ratio(ymin, 2)} to ${ratio(ymax, 2)}`, T.neutral, `range ${ratio(span, 2)}`),
        docr('y values', valid.map((r) => `f(${ratio(r.x, 2)}) = ${ratio(r.y, 2)}`).join('\n')),
        docr('ASCII graph (y high → low, "-" is the x-axis)', grid.join('\n')),
      ]
    },
  },
  {
    id: 'geometry-calculator',
    name: 'Geometry Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves triangles and circles — area, perimeter, hypotenuse, angles, arcs and sectors with the relevant theorems applied.',
    tip: 'For triangles, remember the big three: Pythagoras (sides), cosine rule (two sides + angle), sine rule (angles + one side).',
    usage: ['Choose the shape.', 'Enter its measurements.', 'Read area, perimeter and derived angles.'],
    method: ['Triangle: Pythagoras and A = ½bh.', 'Circle: πr² and 2πr.', 'Angles in a triangle sum to 180°.'],
    fields: [sel('shape', 'Shape', ['Right triangle', 'Any triangle', 'Circle', 'Rectangle'], 'Right triangle'), n('a', 'Side a / base', { def: 3, min: 0, step: 0.5 }), n('b', 'Side b / height', { def: 4, min: 0, step: 0.5 }), n('r', 'Radius (circle)', { def: 5, min: 0, step: 0.5 })],
    compute: (v) => {
      const shape = asSel(v.shape)
      const a = asNum(v.a)
      const b = asNum(v.b)
      const r = asNum(v.r)
      if (shape === 'Circle') return [sres('Area', ratio(Math.PI * r * r, 3), T.good, 'πr²'), res('Circumference', ratio(2 * Math.PI * r, 3), T.neutral, '2πr'), res('Diameter', ratio(2 * r, 2), T.neutral), res('Arc (90°)', ratio((Math.PI * r * r) / 4, 3), T.neutral, 'quarter of the circle')]
      if (shape === 'Rectangle') return [sres('Area', ratio(a * b, 2), T.good, 'length × width'), res('Perimeter', ratio(2 * (a + b), 2), T.neutral, '2(l + w)'), res('Diagonal', ratio(Math.hypot(a, b), 3), T.neutral, '√(l² + w²)')]
      if (shape === 'Right triangle') {
        const hyp = Math.hypot(a, b)
        const angA = (Math.atan2(b, a) * 180) / Math.PI
        return [sres('Area', ratio((a * b) / 2, 3), T.good, '½ × base × height'), sres('Hypotenuse', ratio(hyp, 3), T.good, '√(a² + b²)'), res('Angle opposite a', ratio(angA, 2) + '°', T.neutral), res('Angle opposite b', ratio(90 - angA, 2) + '°', T.neutral)]
      }
      const angA = (Math.atan2(b, a) * 180) / Math.PI
      return [sres('Area', ratio((a * b) / 2, 3), T.good, '½ × base × height'), res('Angle at base', ratio(angA, 2) + '°', T.neutral), res('Third angle', ratio(180 - angA, 2) + '°', T.neutral, 'angles sum to 180°'), res('Sides', `a = ${a}, b = ${b}, c = ${ratio(Math.hypot(a, b), 3)} (if perpendicular)`, T.neutral)]
    },
  },
  {
    id: 'trigonometry-calculator',
    name: 'Trigonometry Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Solves for any missing angle or side in a right triangle, showing the SOH-CAH-TOA ratio used at every step.',
    tip: 'SOH-CAH-TOA only works for RIGHT triangles. For oblique triangles, switch to the sine and cosine rules — no exceptions.',
    usage: ['Enter the known sides and angle.', 'Choose what to solve.', 'Read the value with the ratio used.'],
    method: ['sin = opp/hyp, cos = adj/hyp, tan = opp/adj.', 'Inverse trig returns the principal angle.', 'Sides derive from the ratio.'],
    fields: [n('opp', 'Opposite', { def: 3, min: 0, step: 0.5 }), n('adj', 'Adjacent', { def: 4, min: 0, step: 0.5 }), sel('find', 'Find', ['Angle (from sides)', 'Hypotenuse', 'Opposite', 'Adjacent', 'tan of angle'], 'Angle (from sides)'), n('deg', 'Known angle (°) (for side solves)', { def: 30, step: 1 })],
    compute: (v) => {
      const o = asNum(v.opp)
      const a = asNum(v.adj)
      const hyp = Math.hypot(o, a)
      const deg = asNum(v.deg)
      const rad = (deg * Math.PI) / 180
      const find = asSel(v.find)
      if (find === 'Angle (from sides)') return [sres('Angle θ', ratio((Math.atan2(o, a) * 180) / Math.PI, 3) + '°', T.good, 'tan θ = opp/adj'), res('tan θ', ratio(o / a, 4), T.neutral)]
      if (find === 'Hypotenuse') return [sres('Hypotenuse', ratio(hyp, 4), T.good, '√(opp² + adj²)'), res('Angle θ', ratio((Math.atan2(o, a) * 180) / Math.PI, 2) + '°', T.neutral)]
      if (find === 'Opposite') return [sres('Opposite', ratio(a * Math.tan(rad), 4), T.good, 'opp = adj × tan θ'), res('Check hyp', ratio(Math.hypot(a * Math.tan(rad), a), 3), T.neutral)]
      if (find === 'Adjacent') return [sres('Adjacent', ratio(o / Math.tan(rad), 4), T.good, 'adj = opp ÷ tan θ'), res('Check hyp', ratio(Math.hypot(o, o / Math.tan(rad)), 3), T.neutral)]
      return [sres('tan θ', ratio(Math.tan(rad), 5), T.good, `θ = ${deg}°`), res('sin θ', ratio(Math.sin(rad), 5), T.neutral), res('cos θ', ratio(Math.cos(rad), 5), T.neutral)]
    },
  },
  {
    id: 'logarithm-calculator',
    name: 'Logarithm Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Evaluates logarithms in any base, solves log equations for x, and converts between natural and common logarithms.',
    tip: 'log₁₀ e ≈ 0.434 and ln 10 ≈ 2.303. Memorize one of them and every log conversion becomes a single multiplication.',
    usage: ['Enter the value and base.', 'Choose the log form.', 'Read the result with its conversion factor.'],
    method: ['log_b(x) = ln x / ln b.', 'Solving log_b(x) = y gives x = b^y.', 'Change of base: log x = log_b x / log_b b.'],
    fields: [n('x', 'Value x', { def: 100, min: 0.0001, step: 1 }), n('base', 'Base', { def: 10, min: 1.0001, step: 1 }), sel('form', 'Form', ['log_b(x)', 'Solve log_b(x) = y', 'log₂(x)', 'ln(x)'], 'log_b(x)'), n('y', 'y (for solving)', { def: 2, step: 0.5 })],
    compute: (v) => {
      const x = asNum(v.x)
      const b = asNum(v.base) || 10
      const form = asSel(v.form)
      if (x <= 0 || b <= 0) return [sres('Logarithm', 'undefined (x, base > 0 required)', T.bad)]
      if (form === 'log_b(x)') {
        const r = Math.log(x) / Math.log(b)
        return [sres(`log base ${b} of ${x}`, ratio(r, 6), T.good), res('Change of base', `${ratio(Math.log(x), 4)} ÷ ${ratio(Math.log(b), 4)}`, T.neutral), res('As power', `${b}^${ratio(r, 4)} = ${x}`, T.neutral)]
      }
      if (form === 'Solve log_b(x) = y') {
        const y = asNum(v.y)
        const sol = Math.pow(b, y)
        return [sres('x =', ratio(sol, 4), T.good, `x = ${b}^${y}`), res('Verify', `log base ${b} of ${ratio(sol, 4)} = ${y}`, T.neutral)]
      }
      if (form === 'log₂(x)') return [sres(`log₂(${x})`, ratio(Math.log2(x), 5), T.good), res('Equivalent bits', num(Math.log2(x), 2), T.neutral, 'bits needed')]
      return [sres(`ln(${x})`, ratio(Math.log(x), 6), T.good), res('As log₁₀', ratio(Math.log10(x), 6), T.neutral, 'ln x ÷ 2.303')]
    },
  },
  {
    id: 'exponent-calculator',
    name: 'Exponent Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Evaluates powers and roots with real and integer exponents, scientific notation and cube-square-root simplification.',
    tip: 'Exponent rules: (aᵐ)ⁿ = aᵐⁿ. If the base is negative and the exponent is fractional, the answer is complex — check before you claim a real result.',
    usage: ['Enter the base and exponent.', 'Choose the operation.', 'Read the value, scientific notation and root forms.'],
    method: ['aᵇ uses Math.pow.', 'Roots are fractional exponents.', 'Scientific notation normalizes magnitude.'],
    fields: [n('a', 'Base', { def: 2, step: 0.5 }), n('b', 'Exponent', { def: 10, step: 0.5 }), sel('op', 'Operation', ['a^b', '√a (nth root)', 'a! (factorial)', 'a mod b'], 'a^b')],
    compute: (v) => {
      const a = asNum(v.a)
      const b = asNum(v.b)
      const op = asSel(v.op)
      if (op === 'a^b') {
        const r = Math.pow(a, b)
        const sci = r !== 0 ? r.toExponential(3) : '0'
        return [sres(`${a}^${b}`, Number.isFinite(r) ? (Math.abs(r) >= 1e6 || (Math.abs(r) < 1e-4 && r !== 0) ? sci : ratio(r, 5)) : 'undefined', Number.isFinite(r) ? T.good : T.bad), res('Scientific notation', sci, T.neutral), res('Rule check', `(aᵐ)ⁿ = aᵐⁿ — e.g. (2²)³ = 2⁶ = 64`, T.neutral)]
      }
      if (op === '√a (nth root)') {
        const r = Math.pow(a, 1 / (b || 2))
        return [sres(`${b || 2}√${a}`, Number.isFinite(r) ? ratio(r, 5) : 'undefined', Number.isFinite(r) ? T.good : T.warn), res('As exponent', `a^(1/${b || 2})`, T.neutral)]
      }
      if (op === 'a! (factorial)') {
        const k = Math.round(a)
        if (k < 0 || k > 170) return [sres('Factorial', 'undefined for this range', T.bad, '0–170 only')]
        let f = 1
        for (let i = 2; i <= k; i++) f *= i
        return [sres(`${k}!`, num(f), T.good, 'permutations of k items'), res('Growth', 'n! grows faster than any exponential', T.neutral)]
      }
      return [sres('Modulo', b ? ratio(a % b, 4) : 'undefined', b ? T.good : T.bad, 'remainder of integer division')]
    },
  },
  {
    id: 'unit-conversion-calculator',
    name: 'Unit Conversion Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb: 'Converts between SI-prefixed metric units — nano to giga — with dimensional check, so 1 m = 1000 mm and 1 L = 1000 mL.',
    tip: 'SI prefixes are all powers of ten. From yotta (10²⁴) down to yocto (10⁻²⁴) is 48 steps — memorize 1, 10, 100, 1k, 1M, 1G and extrapolate the rest.',
    usage: ['Choose the base unit family.', 'Enter value, from and to prefixes.', 'Read the factor chain used.'],
    method: ['Each prefix is a power of ten.', 'Conversion = value × 10^(expFrom − expTo).', 'The factor chain is displayed for verification.'],
    fields: [n('val', 'Value', { def: 1, step: 0.1 }), sel('fam', 'Unit family', ['Length (m)', 'Mass (g)', 'Time (s)', 'Data (B)'], 'Length (m)'), sel('from', 'From prefix', ['nano', 'micro', 'milli', 'none (10⁰)', 'kilo', 'mega', 'giga'], 'none (10⁰)'), sel('to', 'To prefix', ['nano', 'micro', 'milli', 'none (10⁰)', 'kilo', 'mega', 'giga'], 'kilo')],
    compute: (v) => {
      const ex: Record<string, number> = { nano: -9, micro: -6, milli: -3, 'none (10⁰)': 0, kilo: 3, mega: 6, giga: 9 }
      const from = asSel(v.from)
      const to = asSel(v.to)
      const e1 = ex[from] ?? 0
      const e2 = ex[to] ?? 0
      const factor = Math.pow(10, e1 - e2)
      const r = asNum(v.val) * factor
      return [
        sres(`${asNum(v.val)} ${from === 'none (10⁰)' ? '' : from} → ${to === 'none (10⁰)' ? '' : to}`, `${r.toExponential(3).replace('e+', '×10^')}`, T.good, `${asSel(v.fam)}`),
        res('Factor chain', `10^${e1} ÷ 10^${e2} = 10^${e1 - e2} = ${num(factor, 0)}`, T.neutral),
        res('Dimensional check', asSel(v.fam) === 'Length (m)' ? '1 km = 1000 m = 10⁶ mm ✓' : asSel(v.fam) === 'Mass (g)' ? '1 kg = 1000 g ✓' : asSel(v.fam) === 'Time (s)' ? '1 hour = 3600 s ✓' : '1 MB = 10⁶ bytes ✓', T.neutral),
      ]
    },
  },
]