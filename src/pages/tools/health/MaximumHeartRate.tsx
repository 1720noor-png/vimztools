import { useMemo, useState } from 'react'
import { HeartPulse } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const ZONES = [
  { name: 'Zone 1 - Recovery', lo: 50, hi: 60, fill: 'bg-sky-400', use: 'Warm-ups, cool-downs, recovery days' },
  { name: 'Zone 2 - Endurance', lo: 60, hi: 70, fill: 'bg-emerald-400', use: 'Fat-burning base aerobic training' },
  { name: 'Zone 3 - Aerobic', lo: 70, hi: 80, fill: 'bg-amber-400', use: 'Improves aerobic fitness and efficiency' },
  { name: 'Zone 4 - Threshold', lo: 80, hi: 90, fill: 'bg-orange-500', use: 'Builds speed and lactate tolerance' },
  { name: 'Zone 5 - Max', lo: 90, hi: 100, fill: 'bg-rose-500', use: 'Short, high-intensity efforts only' },
]

export default function MaximumHeartRate() {
  const [age, setAge] = useState('')

  const result = useMemo(() => {
    const a = toNumber(age)
    if (!Number.isFinite(a) || a <= 0 || a > 120) return null
    const max = 208 - 0.7 * a
    return { max }
  }, [age])

  return (
    <>
      <Seo
        title="Maximum Heart Rate & Zone Finder - vimz Tools"
        description="Estimate your age-based maximum heart rate and target training zones for cardio."
      />
      <ToolShell
        title="Maximum Heart Rate & Zone Finder"
        description="Estimates your age-based maximum heart rate (Tanaka formula) and shows five training zones as beats-per-minute ranges."
        icon={<HeartPulse className="h-6 w-6" />}
        breadcrumb="Health / Heart"
        instruction="Enter your age to see your estimated max heart rate and training zones."
        guideSteps={[
          { title: 'Enter your age', text: 'Type your age in years - nothing else is needed.' },
          { title: 'Read your zones', text: 'Five training zones appear as bpm ranges with their typical use.' },
          { title: 'Train in the right zone', text: 'Pick a zone that matches your session goal and stay inside its range.' },
        ]}
        guideTips={[
          'This is an estimate for general fitness - your true max can only be measured during a maximal exercise test.',
          'Beginners should spend most time in Zones 1-2 and slowly build volume.',
          'If you feel dizzy, unusually breathless or unwell during exercise, stop and seek advice.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your details</h3>
            <Field label="Age (years)">
              <TextInput type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 32" />
            </Field>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Estimated max heart rate</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">
                {result ? `${round(result.max, 0)}` : '—'}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">beats per minute</p>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Training zones</h3>
              <div className="space-y-3">
                {ZONES.map((z) => {
                  const lo = result ? Math.round((result.max * z.lo) / 100) : null
                  const hi = result ? Math.round((result.max * z.hi) / 100) : null
                  return (
                    <div key={z.name} className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${z.fill}`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{z.name}</p>
                        <p className="text-xs text-slate-500">{z.use}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-slate-700">
                        {lo !== null && hi !== null ? `${lo} - ${hi} bpm` : '—'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}