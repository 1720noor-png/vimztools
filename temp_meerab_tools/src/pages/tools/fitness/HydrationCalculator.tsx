import { useMemo, useState } from 'react'
import { Droplets } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const CLIMATES = [
  { name: 'Temperate', factor: 1 },
  { name: 'Hot', factor: 1.2 },
  { name: 'Humid', factor: 1.15 },
]

export default function HydrationCalculator() {
  const [weight, setWeight] = useState('')
  const [workout, setWorkout] = useState('')
  const [climate, setClimate] = useState(0)

  const calc = useMemo(() => {
    const w = toNumber(weight)
    let d = toNumber(workout)
    if (!Number.isFinite(w) || w <= 0) return null
    if (!Number.isFinite(d) || d < 0) d = 0
    const base = w * 33
    const exerciseMl = 350 * (d / 30)
    const total = (base + exerciseMl) * CLIMATES[climate].factor
    return { base, exerciseMl, total, liters: total / 1000, glasses: total / 250 }
  }, [weight, workout, climate])

  const chips = calc
    ? [
        { label: 'Base', value: round(calc.base) },
        { label: 'Workout top-up', value: round(calc.exerciseMl) },
        { label: 'Climate factor', value: `x ${CLIMATES[climate].factor}` },
      ]
    : []

  return (
    <>
      <Seo
        title="Daily Water & Hydration Calculator - vimz Tools"
        description="Calculates daily fluid intake needs based on weight, workout duration, and climate."
      />
      <ToolShell
        title="Daily Water & Hydration Calculator"
        description="Calculates daily fluid intake needs based on body weight, workout duration, and climate conditions."
        icon={<Droplets className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter your weight, activity and climate for a hydration target."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your day</h3>
            <div className="space-y-3">
              <Field label="Body weight (kg)">
                <TextInput type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70" />
              </Field>
              <Field label="Exercise per day (minutes)">
                <TextInput type="number" min={0} value={workout} onChange={(e) => setWorkout(e.target.value)} placeholder="e.g. 45" />
              </Field>
              <Field label="Climate">
                <Select value={climate} onChange={(e) => setClimate(Number(e.target.value))}>
                  {CLIMATES.map((c, i) => (
                    <option key={c.name} value={i}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-sky-200 bg-sky-50 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-500">Daily hydration target</p>
              <p className="mt-2 text-6xl font-extrabold text-sky-700">{calc ? round(calc.liters, 2) : '—'} L</p>
              <p className="mt-1 text-sm text-sky-500">{calc ? `${round(calc.total)} ml` : 'Enter your details to calculate'}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {chips.map((c) => (
                  <span key={c.label} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700">
                    {c.label}: {c.value}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Glass count (250 ml each)</h3>
              <div className="grid grid-cols-6 gap-2">
                {calc
                  ? Array.from({ length: 6 }, (_, i) => i < Math.min(Math.ceil(calc.glasses), 6)).map((on, i) => (
                      <div key={i} className={`flex h-16 items-center justify-center rounded-xl border text-lg font-extrabold ${on ? 'border-sky-300 bg-sky-100 text-sky-700' : 'border-slate-200 bg-slate-50 text-slate-300'}`}>
                        {on ? i + 1 : '·'}
                      </div>
                    ))
                  : <p className="col-span-6 text-xs text-slate-400">Add your weight to see the glass breakdown.</p>}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                {calc ? `${round(calc.glasses)} glasses ≈ ${round(calc.glasses / 6, 1)} refills of a 6-glass jug` : '0 glasses'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}