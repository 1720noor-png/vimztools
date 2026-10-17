import { useMemo, useState } from 'react'
import { Flame } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const LEVELS = [
  { name: 'Sedentary (little exercise)', factor: 1.2 },
  { name: 'Light activity (1-3 days)', factor: 1.375 },
  { name: 'Moderate (3-5 days)', factor: 1.55 },
  { name: 'Very active (6-7 days)', factor: 1.725 },
  { name: 'Athlete (2x daily)', factor: 1.9 },
]

export default function BmrTdeeCalculator() {
  const [sex, setSex] = useState('male')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [level, setLevel] = useState(2)

  const calc = useMemo(() => {
    const a = toNumber(age)
    const h = toNumber(height)
    const w = toNumber(weight)
    if (![a, h, w].every(Number.isFinite) || a <= 0 || h <= 0 || w <= 0) return null
    const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
    const tdee = bmr * LEVELS[level].factor
    return { bmr, tdee }
  }, [sex, age, height, weight, level])

  return (
    <>
      <Seo
        title="BMR & TDEE Calculator - vimz Tools"
        description="Calculates Basal Metabolic Rate and Total Daily Energy Expenditure using the Mifflin-St Jeor equation."
      />
      <ToolShell
        title="BMR & TDEE Calculator"
        description="Calculates Basal Metabolic Rate and Total Daily Energy Expenditure using the Mifflin-St Jeor equation."
        icon={<Flame className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter your details and activity level to get BMR and TDEE."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age">
                  <TextInput type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 30" />
                </Field>
                <Field label="Sex">
                  <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>
                </Field>
              </div>
              <Field label="Height (cm)">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 175" />
              </Field>
              <Field label="Weight (kg)">
                <TextInput type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 80" />
              </Field>
              <Field label="Activity level">
                <Select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
                  {LEVELS.map((l, i) => (
                    <option key={l.name} value={i}>{l.name} x {l.factor}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total daily energy expenditure</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{calc ? round(calc.tdee) : '—'}</p>
              <p className="mt-1 text-sm text-slate-400">kcal per day to maintain weight</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                BMR {calc ? round(calc.bmr) : '—'} kcal
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Calorie targets</h3>
              <div className="grid grid-cols-3 gap-3">
                {calc ? (
                  [
                    { label: 'Maintenance', kcal: calc.tdee, cls: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
                    { label: 'Cut (-500)', kcal: calc.tdee - 500, cls: 'text-rose-600 border-rose-200 bg-rose-50' },
                    { label: 'Bulk (+250)', kcal: calc.tdee + 250, cls: 'text-sky-600 border-sky-200 bg-sky-50' },
                  ].map((t) => (
                    <div key={t.label} className={`rounded-xl border p-3 text-center ${t.cls}`}>
                      <p className="text-[11px] font-semibold uppercase">{t.label}</p>
                      <p className="mt-1 text-xl font-extrabold">{round(t.kcal)}</p>
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 text-xs text-slate-400">Fill in your details to see calorie targets.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}