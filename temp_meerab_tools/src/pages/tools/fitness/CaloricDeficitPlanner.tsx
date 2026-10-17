import { useMemo, useState } from 'react'
import { Calendar } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round, toNumber } from '../../../lib/numbers'

const LEVELS = [
  { name: 'Sedentary', factor: 1.2 },
  { name: 'Light', factor: 1.375 },
  { name: 'Moderate', factor: 1.55 },
  { name: 'Active', factor: 1.725 },
  { name: 'Athlete', factor: 1.9 },
]
const DEFICITS = [250, 500, 750, 1000]

export default function CaloricDeficitPlanner() {
  const [sex, setSex] = useState('male')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState(2)
  const [deficit, setDeficit] = useState(1)
  const [target, setTarget] = useState('')

  const calc = useMemo(() => {
    const a = toNumber(age)
    const ht = toNumber(height)
    const w = toNumber(weight)
    const t = toNumber(target)
    if (![a, ht, w, t].every(Number.isFinite) || a <= 0 || ht <= 0 || w <= 0 || t <= 0) return null
    if (t >= w) return { err: 'Target weight must be below your current weight.', intake: NaN, perWeek: NaN, days: NaN, date: null, kg: NaN }
    const bmr = sex === 'male' ? 10 * w + 6.25 * ht - 5 * a + 5 : 10 * w + 6.25 * ht - 5 * a - 161
    const tdee = bmr * LEVELS[activity].factor
    const intake = tdee - DEFICITS[deficit]
    const kg = w - t
    const days = (kg * 7700) / DEFICITS[deficit]
    const date = new Date(Date.now() + days * 86400000)
    return { err: '', intake, perWeek: (DEFICITS[deficit] * 7) / 7700, days, date, kg }
  }, [sex, age, height, weight, activity, deficit, target])

  const fill = calc && !calc.err ? clamp(calc.days / 180, 0, 1) * 100 : 0

  return (
    <>
      <Seo
        title="Caloric Deficit & Weight Loss Timeline Planner - vimz Tools"
        description="Calculates daily target calorie intake and predicts target completion date for weight loss."
      />
      <ToolShell
        title="Caloric Deficit & Weight Loss Timeline Planner"
        description="Calculates daily target calorie intake and predicts the target completion date for your weight loss plan."
        icon={<Calendar className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Set your target weight and deficit to see your finish date."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your stats</h3>
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
              <Field label="Height (cm)">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 175" />
              </Field>
              <Field label="Weight (kg)">
                <TextInput type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 90" />
              </Field>
              <Field label="Activity">
                <Select value={activity} onChange={(e) => setActivity(Number(e.target.value))}>
                  {LEVELS.map((l, i) => (
                    <option key={l.name} value={i}>{l.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Daily deficit (kcal)">
                <Select value={deficit} onChange={(e) => setDeficit(Number(e.target.value))}>
                  {DEFICITS.map((d) => (
                    <option key={d} value={DEFICITS.indexOf(d)}>{d} kcal/day</option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your goal</h3>
            <Field label="Target weight (kg)">
              <TextInput type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 78" />
            </Field>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              1 kg of fat holds about 7,700 kcal, so a steady deficit burns fat at a predictable pace.
            </div>
          </section>
        </div>

        {calc?.err ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {calc.err}
          </div>
        ) : (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-primary-500">Daily intake target</p>
                <p className="mt-1 text-2xl font-extrabold text-primary-800">{calc ? round(calc.intake) : '—'}</p>
                <p className="text-[11px] text-primary-400">kcal</p>
              </div>
              {[
                { label: 'Weight to lose', value: calc ? `${round(calc.kg, 1)} kg` : '—' },
                { label: 'Planned loss / week', value: calc ? `${round(calc.perWeek, 2)} kg` : '—' },
                { label: 'Finish date', value: calc && calc.date ? calc.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
              ].map((t) => (
                <div key={t.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">{t.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-800">{t.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Today</span>
                <span>{calc ? `${round(calc.days / 7, 1)} weeks (${round(calc.days)} days)` : '0 weeks'}</span>
              </div>
              <div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-sky-500" style={{ width: `${fill}%` }} />
              <p className="mt-1 text-[10px] text-slate-400">Timeline bar scaled to a 6-month reference window.</p>
            </div>
          </section>
        )}
      </ToolShell>
    </>
  )
}