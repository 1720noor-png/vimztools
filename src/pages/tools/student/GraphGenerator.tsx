import { useMemo, useState } from 'react'
import { ChartLine, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const FUNCS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  log: Math.log10,
  ln: Math.log,
}

function tokenize(s: string): string[] {
  const out: string[] = []
  const re = /\d+(?:\.\d+)?|[a-zA-Z]+|[+\-*/(),^]/g
  let m
  while ((m = re.exec(s)) !== null) out.push(m[0])
  return out
}

function toRpn(tokens: string[]): string[] {
  const out: string[] = []
  const ops: string[] = []
  const prec: Record<string, number> = { '^': 4, '*': 3, '/': 3, '+': 2, '-': 2 }
  const isNum = (t: string) => /^-?(\d+\.?\d*|\.\d+)$/.test(t)
  let prev: string | null = null
  for (const t of tokens) {
    if (isNum(t) || t === 'x' || t === 'pi' || t === 'e') {
      out.push(t)
    } else if (t in FUNCS) {
      ops.push(t)
    } else if (t === '(') {
      ops.push(t)
    } else if (t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop()!)
      if (ops.length && ops[ops.length - 1] === '(') ops.pop()
      if (ops.length && ops[ops.length - 1] in FUNCS) out.push(ops.pop()!)
    } else if (t in prec) {
      if (t === '-' && (prev === null || prev === '(' || prev in prec || prev in FUNCS)) out.push('0')
      while (ops.length && ops[ops.length - 1] !== '(' && ops[ops.length - 1] in prec && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop()!)
      ops.push(t)
    }
    prev = t
  }
  while (ops.length) out.push(ops.pop()!)
  return out
}

function evaluateRpn(rpn: string[], x: number): number {
  const stack: number[] = []
  const value = (t: string) => (t === 'x' ? x : t === 'pi' ? Math.PI : t === 'e' ? Math.E : parseFloat(t))
  for (const t of rpn) {
    if (!(t in FUNCS) && t !== '+' && t !== '-' && t !== '*' && t !== '/' && t !== '^') {
      if (t === 'x' || t === 'pi' || t === 'e' || /^-?(\d+\.?\d*|\.\d+)$/.test(t)) stack.push(value(t))
    } else if (t in FUNCS) {
      stack.push(FUNCS[t](stack.pop()!))
    } else {
      const b = stack.pop()!
      const a = stack.pop()!
      if (t === '+') stack.push(a + b)
      else if (t === '-') stack.push(a - b)
      else if (t === '*') stack.push(a * b)
      else if (t === '/') stack.push(a / b)
      else stack.push(Math.pow(a, b))
    }
  }
  return stack[stack.length - 1]
}

const fmtAxis = (n: number) => (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0) ? n.toExponential(1) : Number(n.toPrecision(3)).toString())

export default function GraphGenerator() {
  const [expr, setExpr] = useState('sin(x)')
  const [minX, setMinX] = useState('-6')
  const [maxX, setMaxX] = useState('6')
  const [ran, setRan] = useState(false)

  const data = useMemo(() => {
    void ran
    const rpn = toRpn(tokenize(expr.replace(/\s+/g, '')))
    const lo = parseFloat(minX)
    const hi = parseFloat(maxX)
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return null
    const points: Array<{ x: number; y: number }> = []
    const N = 240
    for (let i = 0; i <= N; i++) {
      const x = lo + ((hi - lo) * i) / N
      const y = evaluateRpn(rpn, x)
      if (Number.isFinite(y)) points.push({ x, y })
    }
    return { points, lo, hi }
  }, [expr, minX, maxX, ran])

  const { path, ticks } = useMemo(() => {
    if (!data || data.points.length < 2) return { path: '', yMin: 0, yMax: 1, ticks: [] }
    const ys = data.points.map((p) => p.y).filter((y) => Number.isFinite(y))
    let yMin = Math.min(...ys, 0)
    let yMax = Math.max(...ys, 0)
    if (yMax === yMin) { yMax = yMin + 1; yMin = yMin - 1 }
    const pad = (yMax - yMin) * 0.08
    yMin -= pad
    yMax += pad
    const W = 620
    const H = 360
    const toX = (x: number) => ((x - data.lo) / (data.hi - data.lo)) * W
    const toY = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H
    const pts = data.points.map((p) => `${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ')
    const tickVals = [0, ...Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * (i + 1)) / 6)]
    const ticks = tickVals.map((t) => ({ y: toY(t), label: fmtAxis(t) }))
    return { path: pts, yMin, yMax, ticks }
  }, [data])

  const sample = 'Functions: x, sin(x), cos(x), tan(x), sqrt(x), abs(x), log(x), ln(x), x^2, x/2 + 1, 2*x - 3. Operators: + - * / ^ ( ) Constants: pi, e.'

  return (
    <>
      <Seo
        title="Graph Generator - vimz Tools"
        description="Plot algebraic and trigonometric functions instantly as clean vector graphs."
      />
      <ToolShell
        title="Graph Generator"
        description="Plot any function of x as a smooth, zoomable vector graph."
        icon={<ChartLine className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Type a function of x, set the range, and the curve draws itself."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Function f(x)">
              <TextInput value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="sin(x)" spellCheck={false} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="x minimum">
                <TextInput value={minX} onChange={(e) => setMinX(e.target.value)} />
              </Field>
              <Field label="x maximum">
                <TextInput value={maxX} onChange={(e) => setMaxX(e.target.value)} />
              </Field>
            </div>
            <Button onClick={() => setRan((r) => !r)} disabled={!expr.trim()}>
              <Wand2 className="h-4 w-4" /> Plot
            </Button>
            <p className="text-xs leading-relaxed text-slate-400">{sample}</p>
          </div>

          <div className="space-y-4">
            {path ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <svg viewBox="0 0 620 360" className="w-full" role="img" aria-label={`Graph of ${expr}`}>
                  <line x1="0" y1="180" x2="620" y2="180" stroke="#e2e8f0" strokeWidth="1" />
                  {ticks.map((t, i) => (
                    <g key={i}>
                      <line x1="0" y1={t.y} x2="620" y2={t.y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x="4" y={t.y - 4} fontSize="10" fill="#94a3b8" fontFamily="monospace">{t.label}</text>
                    </g>
                  ))}
                  <line x1="310" y1="0" x2="310" y2="360" stroke="#e2e8f0" strokeWidth="1" />
                  <polyline points={path} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="mt-2 text-center font-mono text-xs text-slate-400">f(x) = {expr}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                The graph will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}