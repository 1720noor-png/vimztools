import { useMemo, useState } from 'react'
import { Atom, Calculator, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Scenario {
  id: string
  label: string
  formula: string
  fields: Array<{ key: string; label: string; unit: string; def: string }>
  compute: (v: Record<string, number>) => { value: number; unit: string; steps: string[] }
}

const SCENARIOS: Scenario[] = [
  {
    id: 'kinematics',
    label: 'Kinematics (v = u + at)',
    formula: 'v = u + a·t',
    fields: [
      { key: 'u', label: 'Initial velocity', unit: 'm/s', def: '0' },
      { key: 'a', label: 'Acceleration', unit: 'm/s²', def: '9.8' },
      { key: 't', label: 'Time', unit: 's', def: '3' },
    ],
    compute: (v) => ({
      value: v.u + v.a * v.t,
      unit: 'm/s',
      steps: ['v = u + a·t', `v = ${v.u} + (${v.a} × ${v.t})`, `v = ${v.u + v.a * v.t} m/s`],
    }),
  },
  {
    id: 'force',
    label: 'Force (F = ma)',
    formula: 'F = m·a',
    fields: [
      { key: 'm', label: 'Mass', unit: 'kg', def: '10' },
      { key: 'a', label: 'Acceleration', unit: 'm/s²', def: '3' },
    ],
    compute: (v) => ({ value: v.m * v.a, unit: 'N', steps: ['F = m·a', `F = ${v.m} × ${v.a}`, `F = ${v.m * v.a} N`] }),
  },
  {
    id: 'ke',
    label: 'Kinetic energy (KE = ½mv²)',
    formula: 'KE = ½·m·v²',
    fields: [
      { key: 'm', label: 'Mass', unit: 'kg', def: '2' },
      { key: 'v', label: 'Velocity', unit: 'm/s', def: '10' },
    ],
    compute: (v) => {
      const ke = 0.5 * v.m * v.v * v.v
      return { value: ke, unit: 'J', steps: ['KE = ½·m·v²', `KE = 0.5 × ${v.m} × ${v.v}²`, `KE = ${ke} J`] }
    },
  },
  {
    id: 'work',
    label: 'Work (W = F·d)',
    formula: 'W = F·d',
    fields: [
      { key: 'F', label: 'Force', unit: 'N', def: '50' },
      { key: 'd', label: 'Distance', unit: 'm', def: '4' },
    ],
    compute: (v) => ({ value: v.F * v.d, unit: 'J', steps: ['W = F·d', `W = ${v.F} × ${v.d}`, `W = ${v.F * v.d} J`] }),
  },
  {
    id: 'power',
    label: 'Power (P = W/t)',
    formula: 'P = W ÷ t',
    fields: [
      { key: 'W', label: 'Work', unit: 'J', def: '600' },
      { key: 't', label: 'Time', unit: 's', def: '15' },
    ],
    compute: (v) => ({ value: v.W / v.t, unit: 'W', steps: ['P = W / t', `P = ${v.W} / ${v.t}`, `P = ${v.W / v.t} W`] }),
  },
  {
    id: 'ohms',
    label: "Ohm's law (V = IR)",
    formula: 'V = I·R',
    fields: [
      { key: 'I', label: 'Current', unit: 'A', def: '2' },
      { key: 'R', label: 'Resistance', unit: 'Ω', def: '12' },
    ],
    compute: (v) => ({ value: v.I * v.R, unit: 'V', steps: ['V = I·R', `V = ${v.I} × ${v.R}`, `V = ${v.I * v.R} V`] }),
  },
  {
    id: 'density',
    label: 'Density (ρ = m/V)',
    formula: 'ρ = m ÷ V',
    fields: [
      { key: 'm', label: 'Mass', unit: 'kg', def: '30' },
      { key: 'V', label: 'Volume', unit: 'm³', def: '2' },
    ],
    compute: (v) => ({ value: v.m / v.V, unit: 'kg/m³', steps: ['ρ = m / V', `ρ = ${v.m} / ${v.V}`, `ρ = ${v.m / v.V} kg/m³`] }),
  },
  {
    id: 'pressure',
    label: 'Pressure (P = F/A)',
    formula: 'P = F ÷ A',
    fields: [
      { key: 'F', label: 'Force', unit: 'N', def: '200' },
      { key: 'A', label: 'Area', unit: 'm²', def: '0.5' },
    ],
    compute: (v) => ({ value: v.F / v.A, unit: 'Pa', steps: ['P = F / A', `P = ${v.F} / ${v.A}`, `P = ${v.F / v.A} Pa`] }),
  },
]

const fmtP = (n: number) => (Number.isFinite(n) ? Number(n.toPrecision(6)).toString() : '—')

export default function PhysicsProblemSolver() {
  const [id, setId] = useState('force')
  const [values, setValues] = useState<Record<string, string>>({})
  const [ran, setRan] = useState(false)

  const scenario = SCENARIOS.find((s) => s.id === id)!
  const num = (key: string) => parseFloat(values[key] ?? '')
  const ready = scenario.fields.every((f) => Number.isFinite(num(f.key)))
  const result = useMemo(() => {
    void ran
    if (!ready) return null
    const rec: Record<string, number> = {}
    for (const f of scenario.fields) rec[f.key] = parseFloat(values[f.key])
    return scenario.compute(rec)
  }, [scenario, values, ran, ready])

  return (
    <>
      <Seo
        title="Physics Problem Solver - vimz Tools"
        description="Solve common physics problems with worked steps across mechanics, electricity and more."
      />
      <ToolShell
        title="Physics Problem Solver"
        description="Pick a classic formula, plug in your numbers, and get worked steps."
        icon={<Atom className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Choose a scenario, fill in the inputs, and read off the answer with its working."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Scenario">
              <Select value={id} onChange={(e) => { setId(e.target.value); setValues({}) }}>
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </Select>
            </Field>
            <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
              <p className="font-mono text-sm font-bold text-violet-800">{scenario.formula}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {scenario.fields.map((f) => (
                <Field key={f.key} label={`${f.label} (${f.unit})`}>
                  <TextInput type="number" step="any" value={values[f.key] ?? f.def} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                </Field>
              ))}
            </div>
            <Button onClick={() => setRan((r) => !r)} disabled={!ready}>
              <Calculator className="h-4 w-4" /> Solve
            </Button>
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-500">Answer</p>
                  <p className="mt-1 font-mono text-3xl font-extrabold text-violet-900">
                    {fmtP(result.value)} <span className="text-base font-bold text-violet-600">{result.unit}</span>
                  </p>
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
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                The solved answer will appear here.
              </div>
            )}
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Wand2 className="h-3.5 w-3.5" /> Answers assume ideal conditions - units follow the formula shown.
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}