import { useMemo, useState } from 'react'
import { Equal, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Result {
  type: 'linear' | 'quadratic' | 'degenerate' | 'error'
  steps: string[]
  solution: string
}

function solveLinear(expr: string): Result {
  const cleaned = expr.replace(/\s+/g, '')
  const m = cleaned.match(/^([+-]?[\d.]+)?x([+-][\d.]+)?=(.+)$/)
  if (!m) return { type: 'error', steps: [], solution: 'Use the form ax + b = c' }
  const a = parseFloat(m[1] || '1')
  const b = parseFloat(m[2] || '0')
  const rhs = parseFloat(m[3])
  if (!Number.isFinite(a + b + rhs)) return { type: 'error', steps: [], solution: 'Numbers only, please.' }
  const steps = [
    `Start: ${a}x ${b >= 0 ? '+ ' : '- '}${Math.abs(b)} = ${rhs}`,
    `Move the constant: ${a}x = ${rhs} ${b >= 0 ? '-' : '+'} ${Math.abs(b)}`,
    `${a}x = ${rhs - b}`,
    `Divide by ${a}: x = ${(rhs - b) / a}`,
  ]
  if (a === 0) return { type: 'degenerate', steps, solution: b === rhs ? 'Infinite solutions' : 'No solution' }
  return { type: 'linear', steps, solution: `x = ${(rhs - b) / a}` }
}

function solveQuadratic(a: number, b: number, c: number): Result {
  const disc = b * b - 4 * a * c
  const steps = [
    `Standard form: ${a}x² ${b >= 0 ? '+ ' : '- '}${Math.abs(b)}x ${c >= 0 ? '+ ' : '- '}${Math.abs(c)} = 0`,
    `Discriminant: Δ = b² - 4ac = ${b}² - 4(${a})(${c}) = ${disc}`,
  ]
  if (disc < 0) return { type: 'quadratic', steps, solution: `No real roots (Δ = ${disc} < 0)` }
  if (disc === 0) {
    const x = -b / (2 * a)
    steps.push(`x = -b / 2a = ${(-b).toFixed(2)} / ${(2 * a).toFixed(2)}`)
    return { type: 'quadratic', steps, solution: `One repeated root: x = ${x}` }
  }
  const sq = Math.sqrt(disc)
  const x1 = (-b + sq) / (2 * a)
  const x2 = (-b - sq) / (2 * a)
  steps.push(`x = (-b ± √Δ) / 2a = (${-b} ± ${sq.toFixed(4)}) / ${2 * a}`)
  return { type: 'quadratic', steps, solution: `x = ${x1}  or  x = ${x2}` }
}

export default function EquationSolver() {
  const [mode, setMode] = useState<'linear' | 'quadratic'>('linear')
  const [linear, setLinear] = useState('3x + 5 = 20')
  const [a, setA] = useState('1')
  const [b, setB] = useState('-3')
  const [c, setC] = useState('2')
  const [ran, setRan] = useState(false)

  const result = useMemo<Result>(() => {
    if (mode === 'linear') return solveLinear(linear)
    const A = parseFloat(a)
    const B = parseFloat(b)
    const C = parseFloat(c)
    void ran
    if (!Number.isFinite(A + B + C)) return { type: 'error', steps: [], solution: 'Enter numeric coefficients.' }
    if (A === 0) return { type: 'degenerate', steps: [`a = 0 so the equation is linear, not quadratic.`], solution: `x = ${B === 0 ? 'no solution' : -C / B}` }
    return solveQuadratic(A, B, C)
  }, [mode, linear, a, b, c, ran])

  return (
    <>
      <Seo
        title="Equation Solver - vimz Tools"
        description="Solve linear and quadratic equations with a full worked derivation."
      />
      <ToolShell
        title="Equation Solver"
        description="Solve linear and quadratic equations with the whole working shown."
        icon={<Equal className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Choose linear or quadratic, enter the equation, and read the step-by-step solution."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Equation type">
              <Select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                <option value="linear">Linear (ax + b = c)</option>
                <option value="quadratic">Quadratic (ax² + bx + c = 0)</option>
              </Select>
            </Field>
            {mode === 'linear' ? (
              <Field label="Linear equation">
                <TextInput value={linear} onChange={(e) => setLinear(e.target.value)} placeholder="3x + 5 = 20" />
              </Field>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Field label="a">
                  <TextInput value={a} onChange={(e) => setA(e.target.value)} />
                </Field>
                <Field label="b">
                  <TextInput value={b} onChange={(e) => setB(e.target.value)} />
                </Field>
                <Field label="c">
                  <TextInput value={c} onChange={(e) => setC(e.target.value)} />
                </Field>
              </div>
            )}
            <Button onClick={() => setRan((r) => !r)}>
              <Wand2 className="h-4 w-4" /> Solve
            </Button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-500">Solution</p>
              <p className="font-mono text-lg font-bold text-violet-900">{result.solution}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Working</p>
              <ol className="space-y-2">
                {result.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                    <code className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-slate-700">{s}</code>
                  </li>
                ))}
              </ol>
            </div>
            <CodeBlock title="Working (plain text)" code={result.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')} lang="plain" />
          </div>
        </div>
      </ToolShell>
    </>
  )
}