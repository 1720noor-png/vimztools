import { useMemo, useState } from 'react'
import { LifeBuoy, Save, Target } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, money, toNumber } from '../../../lib/numbers'

const GOAL_MONTHS = [3, 6, 12] as const

export default function EmergencyFundPlanner() {
  const [expenses, setExpenses] = useState('2000')
  const [saved, setSaved] = useState('2000')
  const [save, setSave] = useState('300')
  const [goalMonths, setGoalMonths] = useState<number>(6)

  const result = useMemo(() => {
    const monthly = toNumber(expenses)
    const have = toNumber(saved)
    const perMonth = toNumber(save)
    const target = Number.isFinite(monthly) && monthly > 0 ? monthly * goalMonths : 0
    const remaining = Number.isFinite(have) ? Math.max(0, target - have) : 0
    const monthsLeft = remaining > 0 && Number.isFinite(perMonth) && perMonth > 0 ? Math.ceil(remaining / perMonth) : 0
    const progress = target > 0 ? clamp((have / target) * 100, 0, 100) : 0
    const date = new Date(Date.now() + monthsLeft * 30.44 * 24 * 60 * 60 * 1000)
    const options = GOAL_MONTHS.map((m) => ({
      target: monthly * m,
      months: m,
      monthsLeft: monthly * m > have && perMonth > 0 ? Math.ceil(Math.max(0, monthly * m - have) / perMonth) : 0,
    }))
    return { monthly, have, perMonth, target, remaining, monthsLeft, progress, dateLabel: date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }), options }
  }, [expenses, saved, save, goalMonths])

  return (
    <>
      <Seo title="Emergency Fund Planner - vimz Tools" description="Work out how much to save monthly to build an emergency fund." />
      <ToolShell
        title="Emergency Fund Planner"
        description="Work out how much to save monthly to build an emergency fund."
        icon={<LifeBuoy className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter your monthly goal and save amount to see months to target."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Fund details</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Monthly expenses ($)">
                <TextInput type="number" min={0} value={expenses} onChange={(e) => setExpenses(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Goal size">
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_MONTHS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setGoalMonths(m)}
                      className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${goalMonths === m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                      {m} mo
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Already saved ($)">
                <TextInput type="number" min={0} value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label={`Save per month (${money(result.perMonth)})`}>
                <input type="range" min={0} max={1000} step={25} value={result.perMonth} onChange={(e) => setSave(e.target.value)} className="w-full accent-primary-600" />
              </Field>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-500">Target ({money(goalMonths)} months)</p>
                  <p className="mt-1 text-3xl font-extrabold text-primary-800">${money(result.target)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-500">Months to go</p>
                  <p className="mt-1 text-3xl font-extrabold text-primary-800">{result.monthsLeft > 0 ? result.monthsLeft : 'Done'}</p>
                </div>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-primary-500" style={{ width: `${result.progress}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-primary-400">
                <span>${money(result.have)} saved</span>
                <span>{result.monthsLeft > 0 ? `Est. ${result.dateLabel}` : 'Goal reached'}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Compare goal sizes</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {result.options.map((o) => (
                  <div key={o.months} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase text-slate-400">
                      <Save className="h-3 w-3" /> {o.months}-month
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-slate-800">${money(o.target)}</p>
                    <p className="text-[11px] text-slate-400">{o.monthsLeft > 0 ? `${o.monthsLeft} mo at ${money(result.perMonth)}/mo` : 'reached'}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <Target className="h-3.5 w-3.5" /> A 3–6 month buffer covers most income disruptions.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}