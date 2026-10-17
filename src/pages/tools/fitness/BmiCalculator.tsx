import { useMemo, useState } from 'react'
import { HeartPulse } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round, toNumber } from '../../../lib/numbers'

const CATS = [
  { name: 'Underweight', min: 15, max: 18.5, seg: 13, fill: 'bg-sky-500', text: 'text-sky-500' },
  { name: 'Normal', min: 18.5, max: 24.9, seg: 24, fill: 'bg-emerald-500', text: 'text-emerald-600' },
  { name: 'Overweight', min: 25, max: 29.9, seg: 18, fill: 'bg-amber-500', text: 'text-amber-600' },
  { name: 'Obese', min: 30, max: 45, seg: 45, fill: 'bg-rose-500', text: 'text-rose-600' },
]

export default function BmiCalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const result = useMemo(() => {
    const h = toNumber(height) / 100
    const m = toNumber(weight)
    if (!Number.isFinite(h) || !Number.isFinite(m) || h <= 0 || m <= 0) return null
    const bmi = m / (h * h)
    const cat = CATS.find((c) => bmi >= c.min && bmi < c.max) ?? CATS[3]
    const lo = 18.5 * h * h
    const hi = 24.9 * h * h
    return { bmi, cat, lo, hi, mid: (lo + hi) / 2 }
  }, [height, weight])

  const pct = result ? clamp((result.bmi - 15) / 30, 0, 1) * 100 : 0

  return (
    <>
      <Seo
        title="Smart BMI & Healthy Weight Range Calculator - vimz Tools"
        description="Calculates BMI score and determines the target weight required to reach a normal BMI range."
      />
      <ToolShell
        title="Smart BMI & Healthy Weight Range Calculator"
        description="Calculates BMI score and determines the target weight required to reach a normal BMI range."
        icon={<HeartPulse className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter your height and weight to see your BMI and healthy weight range."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your measurements</h3>
            <div className="space-y-3">
              <Field label="Height (cm)">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 175" />
              </Field>
              <Field label="Weight (kg)">
                <TextInput type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 82" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your BMI</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{result ? round(result.bmi, 1) : '—'}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result ? result.cat.fill : 'bg-slate-300'}`} />
                <span className={result ? result.cat.text : 'text-slate-400'}>
                  {result ? result.cat.name : 'Waiting for inputs'}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">BMI category band</h3>
              <div className="relative">
                <div className="flex h-3 overflow-hidden rounded-full">
                  {CATS.map((c) => (
                    <div key={c.name} className={c.fill} style={{ width: `${c.seg}%` }} />
                  ))}
                </div>
                {result && (
                  <div className="absolute -top-6 z-10" style={{ left: `${pct}%` }}>
                    <div className="-translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                      {round(result.bmi, 1)}
                    </div>
                    <div className="mx-auto h-2 w-0.5 bg-slate-900" />
                  </div>
                )}
              </div>
              <div className="mt-2 flex">
                {CATS.map((c) => (
                  <div key={c.name} style={{ width: `${c.seg}%` }}>
                    <p className="text-[10px] font-semibold text-slate-500">{c.name}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Healthy weight range (BMI 18.5 - 24.9)</h3>
              <div className="grid grid-cols-3 gap-3">
                {result ? (
                  [
                    { label: 'Min', value: result.lo },
                    { label: 'Target', value: result.mid },
                    { label: 'Max', value: result.hi },
                  ].map((t) => (
                    <div key={t.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <p className="text-[11px] font-semibold uppercase text-slate-400">{t.label}</p>
                      <p className="mt-1 text-xl font-extrabold text-slate-800">{round(t.value, 1)} kg</p>
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 text-xs text-slate-400">Enter your height and weight to see target weights.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}