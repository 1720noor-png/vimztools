import { useMemo, useState } from 'react'
import { Brain } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round } from '../../../lib/numbers'

const DIMS = [
  { key: 'sleep', label: 'Sleep quality', hint: 'How well did you sleep?' },
  { key: 'energy', label: 'Energy', hint: 'Physical energy through the day?' },
  { key: 'mood', label: 'Mood', hint: 'In general, how was your mood?' },
  { key: 'stress', label: 'Stress', hint: '1 = very stressed, 10 = calm' },
  { key: 'focus', label: 'Focus', hint: 'How easy was concentrating?' },
]

const clamp10 = (v: number) => clamp(round(v, 0), 1, 10)

export default function WellnessDailyCheckIn() {
  const init: Record<string, number> = { sleep: 6, energy: 6, mood: 6, stress: 6, focus: 6 }
  const [values, setValues] = useState<Record<string, number>>(init)

  const result = useMemo(() => {
    const total = DIMS.reduce((s, d) => s + values[d.key], 0)
    const avg = total / DIMS.length
    const band =
      avg >= 8
        ? { label: 'Flourishing', color: 'text-emerald-600' }
        : avg >= 6
          ? { label: 'Steady', color: 'text-teal-600' }
          : avg >= 4
            ? { label: 'Rough patch', color: 'text-amber-600' }
            : { label: 'Reach out', color: 'text-rose-600' }
    return { avg, band }
  }, [values])

  const set = (key: string, raw: string) => {
    const v = Number(raw)
    setValues((prev) => ({ ...prev, [key]: Number.isFinite(v) ? clamp10(v) : prev[key] }))
  }

  return (
    <>
      <Seo
        title="Wellness Daily Check-In - vimz Tools"
        description="Rate sleep, energy, mood, stress and focus to spot patterns in your day."
      />
      <ToolShell
        title="Wellness Daily Check-In"
        description="Rate five quick dimensions out of 10 to get a simple wellbeing snapshot and spot patterns over time."
        icon={<Brain className="h-6 w-6" />}
        breadcrumb="Health / Mental Wellness"
        instruction="Rate each area from 1 (poor) to 10 (great)."
        guideSteps={[
          { title: 'Rate each dimension', text: 'Pick a number from 1 to 10 for sleep, energy, mood, stress and focus.' },
          { title: 'Read your snapshot', text: 'An overall average with a colour-coded band appears automatically.' },
          { title: 'Repeat over time', text: 'Check in daily to notice trends - the numbers are yours to revisit.' },
        ]}
        guideTips={[
          'Rate the day as a whole, not a single moment of it.',
          'A 6 on one day is information, not a verdict - trends matter more.',
          'If several days in a row score low, it may be time to adjust your routine or talk to someone.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Today at a glance</h3>
            <div className="space-y-3">
              {DIMS.map((d) => (
                <Field key={d.key} label={`${d.label} (${d.hint})`}>
                  <TextInput type="number" min={1} max={10} value={values[d.key]} onChange={(e) => set(d.key, e.target.value)} />
                </Field>
              ))}
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Today&apos;s wellbeing score</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{round(result.avg, 1)}/10</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result.avg >= 8 ? 'bg-emerald-500' : result.avg >= 6 ? 'bg-teal-500' : result.avg >= 4 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <span className={result.band.color}>{result.band.label}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Dimension bars</h3>
              <div className="space-y-3">
                {DIMS.map((d) => (
                  <div key={d.key} className="flex items-center gap-3">
                    <p className="w-28 shrink-0 text-sm font-semibold text-slate-700">{d.label}</p>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${values[d.key] >= 8 ? 'bg-emerald-400' : values[d.key] >= 5 ? 'bg-amber-400' : 'bg-rose-400'}`}
                        style={{ width: `${values[d.key] * 10}%` }}
                      />
                    </div>
                    <p className="w-8 shrink-0 text-right text-sm font-bold text-slate-600">{values[d.key]}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}