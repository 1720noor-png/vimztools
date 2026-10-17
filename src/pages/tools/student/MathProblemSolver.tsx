import { useMemo, useState } from 'react'
import { SquareFunction, Wand2, ChevronDown, ChevronRight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Solved {
  input: string
  value: string
  steps: string[]
}

function evaluate(expr: string): { value: number; steps: string[]; ok: boolean; error?: string } {
  const steps: string[] = []
  const tokens = expr.replace(/\s+/g, '').match(/(?:\d+\.?\d*|\.\d+|[()+\-*/^])/g)
  if (!tokens || tokens.length === 0) return { value: 0, steps, ok: false, error: 'No expression found.' }

  const apply = (a: number, b: number, op: string) => {
    if (op === '+') return a + b
    if (op === '-') return a - b
    if (op === '*') return a * b
    if (op === '/') {
      if (b === 0) throw new Error('Division by zero')
      return a / b
    }
    return Math.pow(a, b)
  }

  const prec: Record<string, number> = { '^': 3, '*': 2, '/': 2, '+': 1, '-': 1 }
  const isOp = (t: string) => t in prec
  const isNum = (t: string) => /^-?(?:\d+\.?\d*|\.\d+)$/.test(t)

  try {
    const out: string[] = []
    const ops: string[] = []
    for (const t of tokens) {
      if (isNum(t)) out.push(t)
      else if (t === '(') ops.push(t)
      else if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop()!)
        ops.pop()
      } else if (isOp(t)) {
        while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[t]) {
          out.push(ops.pop()!)
        }
        ops.push(t)
      } else throw new Error(`Unexpected token ${t}`)
    }
    while (ops.length) {
      const o = ops.pop()
      if (o === undefined || o === '(') throw new Error('Mismatched parentheses')
      out.push(o)
    }

    const vals: number[] = []
    for (const t of out) {
      if (isNum(t)) vals.push(parseFloat(t))
      else {
        const b = vals.pop()!
        const a = vals.pop()!
        const v = apply(a, b, t)
        vals.push(v)
        steps.push(`${a} ${t} ${b} = ${v}`)
      }
    }
    if (vals.length !== 1) throw new Error('Invalid expression')
    return { value: vals[0], steps, ok: true }
  } catch (e) {
    return { value: 0, steps, ok: false, error: (e as Error).message }
  }
}

function makePractice(): string {
  const r = () => Math.floor(Math.random() * 18) + 2
  const ops = ['+', '-', '*', '^']
  const o = () => ops[Math.floor(Math.random() * ops.length)]
  const wrap = Math.random() > 0.5
  const a = r()
  const b = r()
  const c = r()
  let e = `${a} ${o()} ${b} ${wrap ? '' : ''}`
  if (Math.random() > 0.5) {
    e = `${Math.random() > 0.5 ? '(' : ''}${a} ${o()} ${b}${Math.random() > 0.5 ? ')' : ''} ${o()} ${c}`
  }
  return wrap ? `(${e}) ${o()} ${c}` : e
}

export default function MathProblemSolver() {
  const [input, setInput] = useState('12 + 4 * (9 - 3) ^ 2')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [ran, setRan] = useState(false)

  const results = useMemo<Solved[]>(() => {
    void ran
    return input
      .split(/[\n,]/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const r = evaluate(l)
        return { input: l, value: r.ok ? String(r.value) : r.error ?? '', steps: r.steps }
      })
  }, [input, ran])

  const toggle = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <>
      <Seo
        title="Math Problem Solver - vimz Tools"
        description="Solve arithmetic and algebraic expressions step by step, with practice problems on demand."
      />
      <ToolShell
        title="Math Problem Solver"
        description="Solve one or many expressions at once, each with a step-by-step working."
        icon={<SquareFunction className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Type an expression per line (or comma separated) and expand any row to see the steps."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Expressions (one per line or comma separated)">
              <TextArea rows={6} value={input} onChange={(e) => setInput(e.target.value)} placeholder={'12 + 4 * (9 - 3) ^ 2\n5 * 6 - 8 / 2\n(2 + 3) * 4'} />
            </Field>
            <div className="flex gap-2">
              <Button onClick={() => setRan((r) => !r)} disabled={!input.trim()}>
                <Wand2 className="h-4 w-4" /> Solve
              </Button>
              <Button variant="secondary" onClick={() => setInput((v) => (v.trim() ? v + '\n' : '') + makePractice())}>
                Add practice problem
              </Button>
            </div>
            <p className="text-xs text-slate-400">Supported: + - * / ^ ( ) and decimals. Operators follow standard precedence.</p>
          </div>

          <div className="space-y-3">
            {results.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Solutions will appear here.
              </div>
            )}
            {results.map((r, i) => {
              const open = expanded.has(i)
              return (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white">
                  <button onClick={() => toggle(i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <span className="font-mono text-sm text-slate-800">{r.input}</span>
                    <span className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-bold ${/^-?\d/.test(r.value) ? 'text-emerald-600' : 'text-rose-600'}`}>{r.value}</span>
                      {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                    </span>
                  </button>
                  {open && (
                    <ol className="space-y-1.5 border-t border-slate-100 px-4 py-3">
                      {r.steps.length === 0 && <li className="text-sm text-slate-500">No workable steps.</li>}
                      {r.steps.map((s, j) => (
                        <li key={j} className="flex gap-2 text-sm text-slate-600">
                          <span className="text-violet-500">{j + 1}.</span>
                          <code className="font-mono">{s}</code>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </ToolShell>
    </>
  )
}