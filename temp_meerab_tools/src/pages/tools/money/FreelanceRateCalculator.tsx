import { useMemo, useState } from 'react'
import { CalendarDays, Clock, Laptop, Package } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber } from '../../../lib/numbers'

const PROJECT_DAYS: Record<string, number> = { small: 2, medium: 5, large: 10 }

export default function FreelanceRateCalculator() {
  const [income, setIncome] = useState('60000')
  const [days, setDays] = useState('220')
  const [hours, setHours] = useState('8')
  const [project, setProject] = useState('medium')

  const result = useMemo(() => {
    const target = toNumber(income)
    const billable = toNumber(days)
    const perDay = toNumber(hours)
    const valid = Number.isFinite(target) && Number.isFinite(billable) && billable > 0
    const daily = valid ? target / billable : 0
    const hourly = valid && Number.isFinite(perDay) && perDay > 0 ? daily / perDay : 0
    const projectRate = daily * (PROJECT_DAYS[project] ?? 5)
    return { target: valid ? target : 0, billable: valid ? billable : 0, perDay: valid && Number.isFinite(perDay) ? perDay : 0, daily, hourly, projectRate, projectDays: PROJECT_DAYS[project] ?? 5 }
  }, [income, days, hours, project])

  return (
    <>
      <Seo title="Freelance Rate Calculator - vimz Tools" description="Convert a target income into day, hour and project rates." />
      <ToolShell
        title="Freelance Rate Calculator"
        description="Convert a target income into day, hour and project rates."
        icon={<Laptop className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter target income and working days to find fair rates."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your targets</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Target income/yr ($)">
                  <TextInput type="number" min={0} value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Billable days/yr">
                  <TextInput type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} />
                </Field>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Hours per day</span>
                  <span className="text-sm font-bold text-primary-700">{result.perDay} hrs</span>
                </div>
                <input type="range" min={2} max={12} step={1} value={Math.max(2, Math.round(result.perDay))} onChange={(e) => setHours(e.target.value)} className="w-full accent-primary-600" />
              </div>
              <Field label="Typical project size">
                <Select value={project} onChange={(e) => setProject(e.target.value)}>
                  <option value="small">Small — ~2 days</option>
                  <option value="medium">Medium — ~5 days</option>
                  <option value="large">Large — ~10 days</option>
                </Select>
              </Field>
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
              Rates are before taxes. Reserve ~30% of each invoice for tax season.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Fair rates for ${money(result.target)}/yr</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <Clock className="mx-auto mb-1.5 h-5 w-5 text-primary-500" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Per hour</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.hourly, 0)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <CalendarDays className="mx-auto mb-1.5 h-5 w-5 text-emerald-500" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Per day</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.daily, 0)}</p>
              </div>
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center">
                <Package className="mx-auto mb-1.5 h-5 w-5 text-primary-600" />
                <p className="text-[11px] font-semibold uppercase text-primary-500">{result.projectDays}-day project</p>
                <p className="mt-1 text-2xl font-extrabold text-primary-700">${money(result.projectRate, 0)}</p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              At ${money(result.hourly, 0)}/hr × {result.perDay} hrs/day across ${money(result.billable, 0)} billable days.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}