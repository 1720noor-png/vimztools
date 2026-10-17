import { useMemo, useState } from 'react'
import { FlaskConical, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

class Frac {
  static zero = new Frac(0n, 1n)
  static one = new Frac(1n, 1n)
  n: bigint
  d: bigint
  constructor(n: bigint, d: bigint = 1n) {
    if (d < 0n) { n = -n; d = -d }
    if (d === 0n) throw new Error('Zero denominator')
    const g = gcd(BigInt(n) < 0n ? -n : n, d)
    this.n = n / g
    this.d = d / g
  }
  add(o: Frac): Frac { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d) }
  sub(o: Frac): Frac { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d) }
  mul(o: Frac): Frac { return new Frac(this.n * o.n, this.d * o.d) }
  div(o: Frac): Frac { return new Frac(this.n * o.d, this.d * o.n) }
  isZero(): boolean { return this.n === 0n }
}

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b) { const t = a % b; a = b; b = t }
  return a || 1n
}

function lcm(a: bigint, b: bigint): bigint {
  return a === 0n || b === 0n ? 0n : (a / gcd(a, b)) * b
}

type Counts = Record<string, number>

function parseFormula(tok: string): { counts: Counts; coef: number } {
  const m = tok.match(/^\s*(\d*)\s*(.*)\s*$/)
  const coef = m![1] ? parseInt(m![1], 10) : 1
  const formula = m![2].trim().replace(/_{(\d+)}/g, '$1')
  const counts: Counts = {}
  const parseGroup = (s: string): Counts => {
    const out: Counts = {}
    let i = 0
    const read = (mult: number) => {
      while (i < s.length) {
        const c = s[i]
        if (c === '(') {
          i++
          let j = i
          while (j < s.length && s[j] !== ')') j++
          if (j >= s.length) throw new Error('Mismatched parentheses')
          const sub = s.slice(i, j)
          i = j + 1
          const digits = s.slice(i).match(/^\d+/)
          const subMult = digits ? parseInt(digits[0], 10) : 1
          if (digits) i += digits[0].length
          const innerCounts = parseGroup(sub)
          for (const [el, n] of Object.entries(innerCounts)) out[el] = (out[el] ?? 0) + n * subMult * mult
        } else if (/[A-Z]/.test(c)) {
          let el = c
          i++
          while (i < s.length && /[a-z]/.test(s[i])) { el += s[i]; i++ }
          const digits = s.slice(i).match(/^\d+/)
          const n = digits ? parseInt(digits[0], 10) : 1
          if (digits) i += digits[0].length
          out[el] = (out[el] ?? 0) + n * mult
        } else if (c === ')' || !c.trim()) {
          break
        } else {
          i++
        }
      }
      return out
    }
    Object.assign(counts, read(1))
    return counts
  }
  const inner = parseGroup(formula)
  for (const [el, n] of Object.entries(inner)) counts[el] = n * coef
  return { counts, coef }
}

function rref(M: Frac[][]): Frac[][] {
  const rows = M.length
  const cols = M[0]?.length ?? 0
  const A = M.map((r) => r.slice())
  let lead = 0
  for (let r = 0; r < rows && lead < cols; lead++) {
    let pivot = -1
    for (let i = r; i < rows; i++) if (!A[i][lead].isZero()) { pivot = i; break }
    if (pivot === -1) continue
    ;[A[r], A[pivot]] = [A[pivot], A[r]]
    const div = A[r][lead]
    for (let j = 0; j < cols; j++) A[r][j] = A[r][j].div(div)
    for (let i = 0; i < rows; i++) {
      if (i === r) continue
      const f = A[i][lead]
      if (f.isZero()) continue
      for (let j = 0; j < cols; j++) A[i][j] = A[i][j].sub(f.mul(A[r][j]))
    }
    r++
  }
  return A
}

function balanceEquation(equation: string): { ok: boolean; text?: string; error?: string; coeffs?: number[] } {
  const sides = equation.split(/\s*(?:->|=>|=)\s*/)
  if (sides.length !== 2) return { ok: false, error: 'Use the form "A + B -> C + D".' }
  const split = (s: string) => s.split('+').map((t) => t.trim()).filter(Boolean)
  const reactants = split(sides[0])
  const products = split(sides[1])
  if (reactants.length === 0 || products.length === 0) return { ok: false, error: 'Both sides need at least one molecule.' }
  const molecules = [...reactants, ...products]
  if (molecules.length > 8) return { ok: false, error: 'Too many molecules - keep it to 8 or fewer species.' }

  const counts = molecules.map((mol) => parseFormula(mol).counts)
  const elements: string[] = []
  for (const c of counts) for (const el of Object.keys(c)) if (!elements.includes(el)) elements.push(el)
  if (elements.length > 12) return { ok: false, error: 'Too many elements to balance here.' }

  const rows = elements.map((el) =>
    molecules.map((_, i) => {
      const n = counts[i][el] ?? 0
      return new Frac(BigInt(i < reactants.length ? n : -n), 1n)
    }),
  )
  const reduced = rref(rows)
  const pivotCols: boolean[] = new Array(molecules.length).fill(false)
  for (const row of reduced) {
    for (let j = 0; j < molecules.length; j++) if (!row[j].isZero()) { if (j >= 0 && row[j].n === 1n && row[j].d === 1n) pivotCols[j] = true; break }
  }

  const freeIdx = pivotCols.findIndex((p) => !p)
  if (freeIdx === -1) return { ok: false, error: 'No non-trivial solution exists for this equation.' }

  const x: Frac[] = new Array(molecules.length).fill(Frac.zero)
  x[freeIdx] = Frac.one
  for (let i = reduced.length - 1; i >= 0; i--) {
    const row = reduced[i]
    let pivot = -1
    for (let j = 0; j < molecules.length; j++) if (!row[j].isZero()) { pivot = j; break }
    if (pivot === -1) continue
    let sum = Frac.zero
    for (let j = pivot + 1; j < molecules.length; j++) sum = sum.add(row[j].mul(x[j]))
    x[pivot] = Frac.zero.sub(sum)
  }

  if (x.some((v) => v.n === 0n)) return { ok: false, error: 'Some substances drop out - nothing to balance.' }
  if (x.every((v) => v.n > 0n) === false && x.every((v) => v.n < 0n) === false) {
    return { ok: false, error: 'This equation does not balance with positive coefficients.' }
  }
  const sign = x[0].n > 0n ? 1n : -1n
  const denoms = x.map((v) => v.d)
  const scale = denoms.reduce((acc, d) => lcm(acc, d), 1n)
  const raw = x.map((v) => sign * v.n * (scale / v.d))
  const g = raw.reduce((acc, v) => gcd(acc, v < 0n ? -v : v), 0n) || 1n
  const ints = raw.map((v) => Number(v / g))

  const checkOk = elements.every((el) => {
    const lhs = reactants.reduce((a, _mol, idx) => a + (counts[idx][el] ?? 0) * ints[idx], 0)
    const rhs = products.reduce((a, _mol, idx) => a + (counts[idx + reactants.length][el] ?? 0) * ints[idx + reactants.length], 0)
    return lhs === rhs
  })
  if (!checkOk) return { ok: false, error: 'Could not find integer coefficients - check the formula.' }

  const render = (list: string[], offset: number) =>
    list.map((mol, i) => (ints[i + offset] === 1 ? mol : `${ints[i + offset]} ${mol.replace(/^\s*\d*\s*/, '')}`)).join(' + ')

  return { ok: true, text: `${render(reactants, 0)} -> ${render(products, reactants.length)}`, coeffs: ints }
}

export default function ChemistryEquationBalancer() {
  const [equation, setEquation] = useState('H2 + O2 -> H2O')
  const [ran, setRan] = useState(false)

  const stepLines = useMemo(() => {
    void ran
    const counts: Record<string, number> = {}
    for (const tok of equation.split('+').flatMap((s) => s.split(/->|=/)).map((t) => t.trim()).filter(Boolean)) {
      const f = parseFormula(tok)
      for (const [el, n] of Object.entries(f.counts)) counts[el] = (counts[el] ?? 0) + n
    }
    return Object.entries(counts).map(([el, n]) => `${el}: ${n} atom${n === 1 ? '' : 's'}`)
  }, [equation, ran])

  const result = useMemo(() => (void ran, balanceEquation(equation)), [equation, ran])

  return (
    <>
      <Seo
        title="Chemistry Equation Balancer - vimz Tools"
        description="Balance chemical equations automatically with an exact linear-algebra solver."
      />
      <ToolShell
        title="Chemistry Equation Balancer"
        description="Balance chemical equations in one click - the solver finds exact integer coefficients."
        icon={<FlaskConical className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Write an equation with ->
 (for example H2 + O2 -> H2O) and balance it."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Unbalanced equation">
              <TextInput value={equation} onChange={(e) => setEquation(e.target.value)} placeholder="H2 + O2 -> H2O" spellCheck={false} />
            </Field>
            <p className="text-xs text-slate-400">
              Supports subscripts like <code className="rounded bg-slate-100 px-1">H2O</code>, parentheses like{' '}
              <code className="rounded bg-slate-100 px-1">Fe2(SO4)3</code> and integer coefficients.
            </p>
            <Button onClick={() => setRan((r) => !r)} disabled={!equation.trim()}>
              <Wand2 className="h-4 w-4" /> Balance
            </Button>
            {result.error && <p className="text-sm font-medium text-rose-600">{result.error}</p>}
          </div>

          <div className="space-y-4">
            {result.ok && result.text && (
              <>
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-500">Balanced equation</p>
                  <p className="font-mono text-base font-bold text-emerald-900">{result.text}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Atom inventory</p>
                  <ul className="space-y-1.5">
                    {stepLines.map((s) => (
                      <li key={s} className="text-sm text-slate-600">{s}</li>
                    ))}
                  </ul>
                </div>
                <CodeBlock title="Balanced equation (text)" code={result.text} lang="plain" />
              </>
            )}
            {!result.ok && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                The balanced equation will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}