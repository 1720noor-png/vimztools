import { useMemo, useState } from 'react'
import { Zap } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const ACTIVITIES = [
  { name: 'Walking', met: 3.5 },
  { name: 'Running', met: 9.8 },
  { name: 'Cycling', met: 7.5 },
  { name: 'Swimming', met: 8 },
  { name: 'HIIT', met: 10 },
  { name: 'Weightlifting', met: 6 },
  { name: 'Yoga', met: 2.5 },
  { name: 'Dancing', met: 5 },
  { name: 'Stair climbing', met: 5 },
  { name: 'Jump rope', met: 11 },
  { name: 'Housework', met: 3.3 },
]

export default function CalorieBurnEstimator() {
  const [activity, setActivity] = useState(0)
  const [weight, setWeight] = useState('')
  const [duration, setDuration] = useState('')

  const calc = useMemo(() => {
    const w = toNumber(weight)
    const d = toNumber(duration)
    if (!Number.isFinite(w) || !Number.isFinite(d) || w <= 0 || d <= 0) return null
    const hours = d / 60
    const met = ACTIVITIES[activity].met
    return { kcal: met * w * hours, per30: met * w * 0.5 }
  }, [activity, weight, duration])

  return (
    <>
      <Seo
        title="Physical Activity Calorie Burn Estimator - vimz Tools"
        description="Computes calories burned during specific workouts and daily activities using MET values."
      />
      <ToolShell
        title="Physical Activity Calorie Burn Estimator"
        description="Computes calories burned during specific workouts and daily activities using standard MET values."
        icon={<Zap className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Pick an activity, enter duration, and get calories burned."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Workout</h3>
            <div className="space-y-3">
              <Field label="Activity">
                <Select value={activity} onChange={(e) => setActivity(Number(e.target.value))}>
                  {ACTIVITIES.map((a, i) => (
                    <option key={a.name} value={i}>{a.name} (MET {a.met})</option>
                  ))}
                </Select>
              </Field>
              <Field label="Body weight (kg)">
                <TextInput type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70" />
              </Field>
              <Field label="Duration (minutes)">
                <TextInput type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 45" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-500">Calories burned</p>
                <p className="mt-2 text-5xl font-extrabold text-amber-700">{calc ? round(calc.kcal) : '—'}</p>
                <p className="mt-1 text-sm text-amber-500">kcal total</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Per 30 minutes</p>
                <p className="mt-2 text-5xl font-extrabold text-slate-800">{calc ? round(calc.per30) : '—'}</p>
                <p className="mt-1 text-sm text-slate-400">kcal, great for comparing workouts</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">MET ranking at your weight</h3>
          <div className="divide-y divide-slate-100">
            {[...ACTIVITIES]
              .sort((a, b) => b.met - a.met)
              .map((a) => (
                <div key={a.name} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-semibold text-slate-700">{a.name}</span>
                  <span className="text-xs text-slate-400">MET {a.met}</span>
                  <span className="font-bold text-slate-800">{Number.isFinite(toNumber(weight)) && toNumber(weight) > 0 ? round(a.met * toNumber(weight)) : '—'} kcal/hr</span>
                </div>
              ))}
          </div>
        </section>
      </ToolShell>
    </>
  )
}