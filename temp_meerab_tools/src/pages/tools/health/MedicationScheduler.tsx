import { useMemo, useState } from 'react'
import { Pill } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const HOURS = Array.from({ length: 24 }, (_, i) => `0${i}`.slice(-2))

function fmtTime(hour: number): string {
  const h = ((Math.round(hour) % 24) + 24) % 24
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr12 = h % 12 === 0 ? 12 : h % 12
  return `${hr12}:${Math.round((hour % 1) * 60) === 0 ? '00' : '30'} ${ampm}`
}

export default function MedicationScheduler() {
  const [start, setStart] = useState('08')
  const [doses, setDoses] = useState('3')

  const result = useMemo(() => {
    const s = Number(start)
    const d = Number(doses)
    if (!Number.isFinite(s) || !Number.isFinite(d) || d < 1 || d > 4) return null
    const gap = 24 / d
    return Array.from({ length: d }, (_, i) => fmtTime(s + gap * i))
  }, [start, doses])

  return (
    <>
      <Seo
        title="Medication Schedule Planner - vimz Tools"
        description="Generate evenly spaced daily medication times for 1-4 doses a day."
      />
      <ToolShell
        title="Medication Schedule Planner"
        description="Splits 1-4 daily doses into evenly spaced times across 24 hours, starting from a time you choose."
        icon={<Pill className="h-6 w-6" />}
        breadcrumb="Health / Medication"
        instruction="Pick the number of daily doses and your first dose time."
        guideSteps={[
          { title: 'Choose doses per day', text: 'Usually 1, 2, 3 or 4 - follow your prescription.' },
          { title: 'Pick your first dose time', text: 'The start time your pharmacist or doctor recommended.' },
          { title: 'Use the schedule', text: 'Evenly spaced times appear - set alarms accordingly.' },
        ]}
        guideTips={[
          'Even spacing keeps a steady level of medicine in your system for most medications.',
          'Always follow your prescription - never space doses yourself if it differs.',
          'Use phone alarms or a pillbox to avoid missed doses and double dosing.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your medication</h3>
            <div className="space-y-3">
              <Field label="Doses per day">
                <Select value={doses} onChange={(e) => setDoses(e.target.value)}>
                  <option value="1">1 dose</option>
                  <option value="2">2 doses</option>
                  <option value="3">3 doses</option>
                  <option value="4">4 doses</option>
                </Select>
              </Field>
              <Field label="Start time of first dose">
                <Select value={start} onChange={(e) => setStart(e.target.value)}>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {fmtTime(Number(h))}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <div className="lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Suggested dose times</h3>
              <div className="space-y-3">
                {(result ?? []).map((t, i) => (
                  <div key={t} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-800">Dose {i + 1}</p>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-extrabold text-brand">{t}</span>
                    </div>
                  </div>
                ))}
                {!result && <p className="text-xs text-slate-400">Choose your doses and start time.</p>}
              </div>
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                Reminder: this planner only arranges times evenly. Dose amounts and intervals must always follow your prescribed directions.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}