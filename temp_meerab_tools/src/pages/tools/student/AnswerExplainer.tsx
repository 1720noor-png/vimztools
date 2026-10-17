import { useMemo, useState } from 'react'
import { Lightbulb, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

function simpleSteps(expr: string): { steps: string[]; ok: boolean; error?: string } {
  const tokens = expr.replace(/\s+/g, '').match(/(?:\d+\.?\d*|\.\d+|[()+\-*/^])/g)
  if (!tokens || tokens.length === 0) return { steps: [], ok: false, error: 'Enter a numeric expression like (8 + 2) * 3^2.' }
  const steps: string[] = []
  let s = tokens.join('')

  const findParen = () => {
    const open = s.lastIndexOf('(')
    if (open === -1) return null
    const close = s.indexOf(')', open)
    if (close === -1) return null
    return { open, close, inner: s.slice(open + 1, close) }
  }

  const reduceLevel = (input: string, op: string) => {
    const re = op === '^' ? /(?:-?)(?:\d+\.?\d*|\.\d+)\^(-?)(?:\d+\.?\d*|\.\d+)/ : op === '*' || op === '/' ? /(-?(?:\d+\.?\d*|\.\d+))([*/])(-?(?:\d+\.?\d*|\.\d+))/ : /(-?(?:\d+\.?\d*|\.\d+))([+-])(-?(?:\d+\.?\d*|\.\d+))/
    const find = input.match(re)
    if (!find) return input
    const [full, a, opSign, b] = find
    const x = parseFloat(a)
    const y = parseFloat(b)
    let v: number
    if (opSign === '+') v = x + y
    else if (opSign === '-') v = x - y
    else if (opSign === '*') v = x * y
    else if (opSign === '/') {
      if (y === 0) throw new Error('Division by zero.')
      v = x / y
    } else v = Math.pow(x, y)
    steps.push(`${full} = ${v}`)
    return input.replace(full, String(v))
  }

  try {
    let guard = 0
    while (s.includes('(')) {
      const paren = findParen()
      if (!paren) return { steps: [], ok: false, error: 'Mismatched parentheses.' }
      let inner = paren.inner
      for (const op of ['^', '*/', '+-']) {
        const ops = op.length === 1 ? [op] : op.split('').map((c) => `${c}`)
        for (const o of ops) {
          let g = 0
          while (inner.includes(o === '^' ? '^' : o) && g < 40) {
            const next = reduceLevel(inner, o)
            if (next === inner) break
            inner = next
            g++
          }
        }
      }
      steps.push(`(${paren.inner}) = ${inner}`)
      s = s.slice(0, paren.open) + inner + s.slice(paren.close + 1)
      if (++guard > 60) break
    }
    for (const o of ['^', '*', '/', '+', '-']) {
      let g = 0
      while (s.includes(o) && g < 60) {
        const next = reduceLevel(s, o)
        if (next === s) break
        s = next
        g++
      }
    }
    if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(s)) return { steps, ok: false, error: 'Could not reduce the whole expression.' }
    return { steps, ok: true }
  } catch (e) {
    return { steps, ok: false, error: (e as Error).message }
  }
}

export default function AnswerExplainer() {
  const [expr, setExpr] = useState('(8 + 2) * 3^2')
  const [ran, setRan] = useState(false)

  const result = useMemo(() => (void ran, simpleSteps(expr)), [expr, ran])

  return (
    <>
      <Seo
        title="Answer Explainer - vimz Tools"
        description="Get step-by-step breakdowns for arithmetic and algebraic expressions."
      />
      <ToolShell
        title="Answer Explainer"
        description="Watches every operation and explains a calculation one step at a time."
        icon={<Lightbulb className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Type any numeric expression and watch it be resolved rule by rule."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Expression">
              <TextArea rows={3} value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="e.g. (8 + 2) * 3^2" />
            </Field>
            <div className="flex gap-2">
              <Button onClick={() => setRan((r) => !r)} disabled={!expr.trim()}>
                <Wand2 className="h-4 w-4" /> Explain
              </Button>
              <Button variant="secondary" onClick={() => setExpr('(8 + 2) * 3^2')}>Example</Button>
            </div>
            {result.error && <p className="text-sm font-medium text-rose-600">{result.error}</p>}
          </div>

          <div className="space-y-4">
            {result.ok ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Order of operations</p>
                  <ol className="space-y-2">
                    {result.steps.length === 0 && <li className="text-sm text-slate-500">Nothing to reduce.</li>}
                    {result.steps.map((st, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{i + 1}</span>
                        <code className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-slate-700">{st}</code>
                      </li>
                    ))}
                  </ol>
                </div>
                <CodeBlock title="Full working" code={result.steps.join('\n')} lang="plain" />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Step-by-step working will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}