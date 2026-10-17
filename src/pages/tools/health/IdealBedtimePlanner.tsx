import { useMemo, useState } from 'react'
import { Moon } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const HOURS = Array.from({ length: 24 }, (_, i) => `0${i}`.slice(-2))

function fmtTime(hour: number): string {
  const h = ((hour % 24) + 24) % 24
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr12 = h % 12 === 0 ? 12 : h % 12
  return `${hr12}:00 ${ampm}`
}

export default function IdealBedtimePlanner() {
  const [wake, setWake] = useState('06')
  const [cycles, setCycles] = useState('5')

  const result = useMemo(() => {
    const w = Number(wake)
    const c = Number(cycles)
    if (!Number.isFinite(w) || !Number.isFinite(c) || c < 4 || c > 6) return null
    const fallAsleep = 15
    return [4, 5, 6].map((n) => ({
      cycles: n,
      time: fmtTime(w - (n * 90 + fallAsleep) / 60),
    }))
  }, [wake, cycles])

  return (
    <>
      <Seo
        title="Ideal Bedtime Planner - vimz Tools"
        description="Plan bedtimes aligned to 90-minute sleep cycles for your chosen wake-up time."
      />
      <ToolShell
        title="Ideal Bedtime Planner"
        description="Finds bedtimes aligned to 90-minute sleep cycles so you wake up at the end of a cycle, feeling more rested."
        icon={<Moon className="h-6 w-6" />}
        breadcrumb="Health / Sleep"
        instruction="Pick your wake time to see cycle-aligned bedtimes."
        guideSteps={[
          { title: 'Pick your wake-up time', text: 'Choose the hour you need (or want) to be awake.' },
          { title: 'Choose a cycle target', text: '4-6 sleep cycles (each about 90 minutes) is the healthy range.' },
          { title: 'Pick a bedtime', text: 'Try to be in bed a few minutes before the suggested time.' },
        ]}
        guideTips={[
          'Most adults feel best on 5 sleep cycles - about 7.5 hours in bed.',
          'The 15-minute buffer accounts for falling asleep, so aim to get into bed 10-15 minutes earlier.',
          'Stick to roughly the same bedtime and wake time on weekends too.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your plan</h3>
            <div className="space-y-3">
              <Field label="Wake-up time">
                <Select value={wake} onChange={(e) => setWake(e.target.value)}>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {fmtTime(Number(h))}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Preferred cycles">
                <Select value={cycles} onChange={(e) => setCycles(e.target.value)}>
                  <option value="4">4 cycles (6h 15m in bed)</option>
                  <option value="5">5 cycles (7h 45m in bed)</option>
                  <option value="6">6 cycles (9h 15m in bed)</option>
                </Select>
              </Field>
            </div>
          </section>

          <div className="lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Suggested bedtimes</h3>
              <div className="space-y-3">
                {(result ?? [])
                  .slice()
                  .sort((a, b) => (a.time === b.time ? 0 : b.cycles - a.cycles))
                  .map((r) => (
                    <div
                      key={r.cycles}
                      className={`flex items-center justify-between rounded-xl border p-4 transition ${
                        r.cycles === Number(cycles) ? 'border-brand bg-brand/5' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">{r.cycles} sleep cycles</p>
                        <p className="text-xs text-slate-500">≈ {r.cycles * 1.5} hours of sleep</p>
                      </div>
                      <p className="text-lg font-extrabold text-brand">{r.time}</p>
                    </div>
                  ))}
                {!result && <p className="text-xs text-slate-400">Choose a wake time to see bedtimes.</p>}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}