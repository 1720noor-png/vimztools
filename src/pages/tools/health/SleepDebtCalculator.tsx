import { useMemo, useState } from 'react'
import { Moon } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

export default function SleepDebtCalculator() {
  const [age, setAge] = useState('30')
  const [avg, setAvg] = useState('6.5')

  const result = useMemo(() => {
    const a = toNumber(age)
    const s = toNumber(avg)
    if (!Number.isFinite(a) || !Number.isFinite(s) || a <= 0 || s <= 0) return null
    const rec = a < 18 ? 9 : a < 65 ? 8 : 7.5
    const debt = rec - s
    return { rec, debt, weekly: debt * 7 }
  }, [age, avg])

  return (
    <>
      <Seo
        title="Sleep Debt Calculator - vimz Tools"
        description="Compare your average nightly sleep to your age-based target and see your sleep debt."
      />
      <ToolShell
        title="Sleep Debt Calculator"
        description="Compares your average nightly sleep to a healthy age-based target and shows how much sleep you are building up (or paying back)."
        icon={<Moon className="h-6 w-6" />}
        breadcrumb="Health / Sleep"
        instruction="Enter your age and average sleep to see your sleep debt."
        guideSteps={[
          { title: 'Enter your age', text: 'Used to pick a healthy sleep target for your age group.' },
          { title: 'Add your average sleep', text: 'How many hours you typically sleep each night, e.g. 6.5.' },
          { title: 'See your debt & plan', text: 'Your daily and weekly sleep debt appears with recovery tips.' },
        ]}
        guideTips={[
          'Sleep debt builds up over days - a single long lie-in rarely fixes a whole week.',
          'Aim for a consistent bedtime and wake time, even on weekends.',
          'If you regularly feel exhausted despite 8 hours, speak to a health professional.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your sleep</h3>
            <div className="space-y-3">
              <Field label="Age (years)">
                <TextInput type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} />
              </Field>
              <Field label="Average sleep per night (hours)">
                <TextInput type="number" min={0} step={0.5} value={avg} onChange={(e) => setAvg(e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Healthy target', value: result ? `${round(result.rec, 1)} h` : '—' },
                { label: 'Daily debt', value: result ? `${round(result.debt, 1)} h` : '—' },
                { label: 'Weekly debt', value: result ? `${round(result.weekly, 1)} h` : '—' },
              ].map((t) => (
                <section key={t.label} className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t.label}</p>
                  <p className={`mt-1 text-2xl font-extrabold ${result && result.debt > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{t.value}</p>
                </section>
              ))}
            </div>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">What this means</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {!result
                  ? 'Enter your age and average sleep to see your debt.'
                  : result.debt <= 0
                    ? `Good news - you are averaging ${Math.abs(round(result.debt, 1))} hours more than the ${round(result.rec, 1)}-hour target for your age. Keep your routine consistent.`
                    : `You are sleeping about ${round(result.debt, 1)} hours less than the ${round(result.rec, 1)}-hour target - a weekly shortfall of about ${round(result.weekly, 1)} hours. Gradually go to bed 15-30 minutes earlier each night rather than trying to catch up in one go.`}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}