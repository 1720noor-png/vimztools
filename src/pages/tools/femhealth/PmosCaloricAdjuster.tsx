import { useMemo, useState } from 'react'
import { Activity, CalendarRange, Flame, Info } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import { round } from '../../../lib/numbers'

type PhaseKey = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal'

const PHASES: { key: PhaseKey; name: string; days: string; coeff: number; note: string }[] = [
  { key: 'menstrual', name: 'Menstrual', days: 'Days 1-5', coeff: 0.97, note: 'Low hormones around baseline.' },
  { key: 'follicular', name: 'Follicular', days: 'Days 6-13', coeff: 1.0, note: 'Rising estrogen, baseline burn.' },
  { key: 'ovulatory', name: 'Ovulatory', days: 'Days 14-15', coeff: 1.02, note: 'Peak estrogen, mild lift.' },
  { key: 'luteal', name: 'Luteal', days: 'Days 16-28', coeff: 1.09, note: 'Progesterone raises resting burn.' },
]

const ACTIVITIES: { label: string; factor: number }[] = [
  { label: 'Sedentary (little exercise)', factor: 1.2 },
  { label: 'Lightly active (1-3 days)', factor: 1.375 },
  { label: 'Moderately active (3-5 days)', factor: 1.55 },
  { label: 'Very active (6-7 days)', factor: 1.725 },
  { label: 'Extra active (physical job)', factor: 1.9 },
]

export default function PmosCaloricAdjuster() {
  const [age, setAge] = useState('28')
  const [sex, setSex] = useState('female')
  const [height, setHeight] = useState('165')
  const [weight, setWeight] = useState('62')
  const [activity, setActivity] = useState(2)
  const [phase, setPhase] = useState<PhaseKey>('luteal')

  const calc = useMemo(() => {
    const a = parseInt(age, 10)
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!Number.isFinite(a) || !Number.isFinite(h) || !Number.isFinite(w) || a <= 0 || h <= 0 || w <= 0) return null

    const base = sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
    const bmr = Math.max(base, 800)
    const tdee = bmr * ACTIVITIES[activity].factor
    const adjusted = tdee * PHASES.find((p) => p.key === phase)!.coeff

    const perPhase = PHASES.map((p) => ({
      ...p,
      kcals: round(tdee * p.coeff, 0),
    }))

    return { bmr, tdee, adjusted, perPhase }
  }, [age, sex, height, weight, activity, phase])

  const selectedMeta = PHASES.find((p) => p.key === phase)!

  return (
    <>
      <Seo
        title="PMOS Caloric & BMR Adjuster - vimz Tools"
        description="Adjust BMR and daily calories across menstrual cycle phases to support PMS and PMOS symptom management."
      />
      <ToolShell
        title="PMOS Caloric & BMR Adjuster"
        description="Work out how your resting burn shifts across the menstrual cycle and set phase-aware calorie targets."
        icon={<Flame className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Enter your stats and pick a cycle phase to see adjusted calorie targets"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Activity className="h-4 w-4 text-fuchsia-600" /> Your profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age">
                <TextInput type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
              </Field>
              <Field label="Sex">
                <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </Select>
              </Field>
              <Field label="Height (cm)">
                <TextInput type="number" min={100} max={250} value={height} onChange={(e) => setHeight(e.target.value)} />
              </Field>
              <Field label="Weight (kg)">
                <TextInput type="number" min={30} max={250} value={weight} onChange={(e) => setWeight(e.target.value)} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Activity level">
                <Select value={activity} onChange={(e) => setActivity(Number(e.target.value))}>
                  {ACTIVITIES.map((a, i) => (
                    <option key={a.label} value={i}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Current cycle phase">
                <Select value={phase} onChange={(e) => setPhase(e.target.value as PhaseKey)}>
                  {PHASES.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name} ({p.days})
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              The luteal phase is estimated to raise resting energy expenditure by roughly 5-9% due to progesterone.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
            {!calc ? (
              <div className="flex h-full min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">Fill in your profile to see phase-aware targets.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">BMR</p>
                    <p className="text-3xl font-black tabular-nums text-slate-800">{round(calc.bmr, 0)}</p>
                    <p className="text-[11px] text-slate-400">kcal/day at rest</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">TDEE</p>
                    <p className="text-3xl font-black tabular-nums text-slate-800">{round(calc.tdee, 0)}</p>
                    <p className="text-[11px] text-slate-400">kcal/day baseline</p>
                  </div>
                  <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4 text-center">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-fuchsia-500">
                      {selectedMeta.name}
                    </p>
                    <p className="text-3xl font-black tabular-nums text-fuchsia-700">{round(calc.adjusted, 0)}</p>
                    <p className="text-[11px] font-semibold text-fuchsia-500">kcal target</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <CalendarRange className="h-4 w-4" /> Calorie targets by phase
                  </p>
                  <div className="space-y-2">
                    {calc.perPhase.map((p) => {
                      const active = p.key === phase
                      return (
                        <div
                          key={p.key}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                            active ? 'border-fuchsia-400 bg-fuchsia-50' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            <p className={`text-sm font-bold ${active ? 'text-fuchsia-800' : 'text-slate-700'}`}>
                              {p.name}
                              <span className="ml-2 text-[11px] font-medium text-slate-400">{p.days}</span>
                            </p>
                            <p className="text-[11px] text-slate-400">{p.note}</p>
                          </div>
                          <p className={`text-lg font-extrabold tabular-nums ${active ? 'text-fuchsia-700' : 'text-slate-600'}`}>
                            {p.kcals}
                            <span className="ml-1 text-[11px] font-medium text-slate-400">kcal</span>
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-600" />
                  <p className="text-xs leading-relaxed text-slate-600">
                    Some people report stronger appetite and cravings in the luteal phase. Adjusting your target by 5-9%
                    may support steadier energy and fewer over-hunger crashes.
                  </p>
                </div>
              </>
            )}

            <p className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
              General guidance, not a prescription. Individual variation is large - change your targets slowly and track
              hunger, energy and weight with a clinician where useful.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}