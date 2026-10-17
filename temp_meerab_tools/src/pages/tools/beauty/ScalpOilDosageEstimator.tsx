import { useState } from 'react'
import { CheckCircle2, Droplet, Gauge, Leaf, Ruler, Timer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select } from '../../../components/ui/Fields'
import { round } from '../../../lib/numbers'

interface LengthOption {
  value: string
  label: string
  drops: number
}

const LENGTHS: LengthOption[] = [
  { value: 'very-short', label: 'Very short', drops: 6 },
  { value: 'chin', label: 'Chin length', drops: 10 },
  { value: 'shoulder', label: 'Shoulder length', drops: 16 },
  { value: 'mid-back', label: 'Mid-back', drops: 24 },
  { value: 'waist', label: 'Waist and longer', drops: 26 },
]

const DENSITY = [
  { value: 'thin', label: 'Thin', factor: 0.8 },
  { value: 'medium', label: 'Medium', factor: 1 },
  { value: 'thick', label: 'Thick', factor: 1.2 },
]

const GOALS = [
  { value: 'normal', label: 'Normal maintenance', factor: 1 },
  { value: 'dry-itch', label: 'Dry or itchy scalp', factor: 1.3 },
  { value: 'oily-prone', label: 'Oily-prone scalp', factor: 0.7 },
]

export default function ScalpOilDosageEstimator() {
  const [length, setLength] = useState('shoulder')
  const [density, setDensity] = useState('medium')
  const [goal, setGoal] = useState('normal')
  const [area, setArea] = useState('scalp-only')

  const lengthIndex = Math.max(0, LENGTHS.findIndex((l) => l.value === length))
  const lengthRow = LENGTHS[lengthIndex]
  const densityIndex = Math.max(0, DENSITY.findIndex((d) => d.value === density))
  const densityRow = DENSITY[densityIndex]
  const goalIndex = Math.max(0, GOALS.findIndex((g) => g.value === goal))
  const goalRow = GOALS[goalIndex]
  const areaFactor = area === 'scalp-lengths' ? 1.3 : 1
  const drops = round(lengthRow.drops * densityRow.factor * goalRow.factor * areaFactor, 0)
  const ml = round(drops * 0.05, 1)

  const breakdown = [
    { label: lengthRow.label, value: `${lengthRow.drops} base drops` },
    { label: densityRow.label, value: `x${densityRow.factor}` },
    { label: goalRow.label, value: `x${goalRow.factor}` },
    {
      label: area === 'scalp-lengths' ? 'Lengths included' : 'Scalp only',
      value: area === 'scalp-lengths' ? 'x1.3' : 'x1.0',
    },
  ]

  return (
    <>
      <Seo
        title="Scalp Oil Dosage Estimator - vimz Tools"
        description="Estimate the right number of scalp oil drops for your hair length, density, and scalp goal."
      />
      <ToolShell
        title="Scalp Oil Dosage Estimator"
        description="Work out a sensible scalp oil dose in drops and milliliters based on hair length, density, and how your scalp behaves."
        icon={<Droplet className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Set your hair profile to estimate a safe oil dose."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Ruler className="h-4 w-4 text-primary-600" /> Hair profile
            </h3>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Length</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {LENGTHS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLength(option.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    length === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <Field label="Density">
                <Select value={density} onChange={(e) => setDensity(e.target.value)}>
                  {DENSITY.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Scalp goal">
                <Select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  {GOALS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Target area">
                <Select value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="scalp-only">Scalp only</option>
                  <option value="scalp-lengths">Scalp + lengths</option>
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-500">Daily scalp oil dose</p>
              <p className="mt-2 text-6xl font-extrabold text-primary-800">{drops} drops</p>
              <p className="mt-1 text-sm text-slate-500">about {ml} ml across your whole routine</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Gauge className="h-4 w-4 text-primary-600" /> How it is calculated
              </h3>
              <div className="flex flex-wrap gap-2">
                {breakdown.map((row) => (
                  <span
                    key={row.label}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    {row.label} - {row.value}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                Estimate assumes about 0.05 ml per drop, roughly 40 drops per 2 ml — a light regime next to a heaped
                teaspoon.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Leaf className="h-4 w-4 text-emerald-600" /> Where to apply
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {area === 'scalp-lengths'
                  ? 'Work a few drops along part lines across the scalp, then glide the rest down mid-lengths and ends. Avoid soaking the roots.'
                  : 'Massage small sections along part lines across the crown, hairline, and nape, adding a few drops at a time.'}
              </p>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800">
                <Timer className="h-4 w-4" /> Less is more
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">
                Start with 30% less than the estimate and build up — heavy oiling attracts dust, flattens volume, and can
                clog follicle openings.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}