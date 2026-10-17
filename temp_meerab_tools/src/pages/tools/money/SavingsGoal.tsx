import { useMemo, useState } from 'react'
import { CalendarDays, PiggyBank, Target } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, money, toNumber } from '../../../lib/numbers'

export default function SavingsGoal() {
  const [target, setTarget] = useState('10000')
  const [start, setStart] = useState('1000')
  const [save, setSave] = useState('300')

  const result = useMemo(() => {
    const goal = toNumber(target)
    const have = toNumber(start)
    const perMonth = toNumber(save)
    const valid = Number.isFinite(goal) && Number.isFinite(have)
    const g = valid && goal > 0 ? goal : 0
    const s = valid && Number.isFinite(have) ? Math.max(0, have) : 0
    const remaining = Math.max(0, g - s)
    const months = remaining > 0 && Number.isFinite(perMonth) && perMonth > 0 ? Math.ceil(remaining / perMonth) : 0
    const date = new Date(Date.now() + months * 30.44 * 24 * 60 * 60 * 1000)
    const progress = g > 0 ? clamp((s / g) * 100, 0, 100) : 0
    return {
      g,
      s,
      perMonth: Number.isFinite(perMonth) ? perMonth : 0,
      remaining,
      months,
      dateLabel: date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      progress,
      mustSave: months > 0 ? Math.ceil(remaining / months) : 0,
    }
  }, [target, start, save])

  return (
    <>
      <Seo title="Savings Goal - vimz Tools" description="Set a savings target and see monthly contributions needed." />
      <ToolShell
        title="Savings Goal"
        description="Set a savings target and see monthly contributions needed."
        icon={<PiggyBank className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter your target and monthly save to see when you'll reach it."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your goal</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Target ($)">
                  <TextInput type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Starting balance ($)">
                  <TextInput type="number" min={0} value={start} onChange={(e) => setStart(e.target.value)} placeholder="0.00" />
                </Field>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Save per month</span>
                  <span className="text-sm font-bold text-primary-700">${money(result.perMonth)}</span>
                </div>
                <input type="range" min={0} max={2000} step={25} value={result.perMonth} onChange={(e) => setSave(e.target.value)} className="w-full accent-primary-600" />
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>$0</span>
                  <span>$2,000</span>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" /> Est. completion
              </p>
              <p className="mt-1 text-5xl font-extrabold text-slate-900">
                {result.months > 0 ? `${result.months} months` : 'Now'}
              </p>
              <p className="mt-1 text-sm text-slate-400">{result.months > 0 ? `around ${result.dateLabel}` : 'Goal already reached'}</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Target className="h-4 w-4 text-amber-500" /> Progress
              </h3>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${result.progress}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                <span>${money(result.s)} saved</span>
                <span>{result.progress.toFixed(0)}%</span>
                <span>${money(result.g)} goal</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm">
                  <p className="text-xs text-slate-400">Still needed</p>
                  <p className="font-extrabold text-slate-800">${money(result.remaining)}</p>
                </div>
                <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-center text-sm">
                  <p className="text-xs text-primary-500">Min /mo to keep pace</p>
                  <p className="font-extrabold text-primary-700">${money(result.mustSave)}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}