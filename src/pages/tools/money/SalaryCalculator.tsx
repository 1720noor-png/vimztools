import { useMemo, useState } from 'react'
import { BadgeDollarSign, Banknote, CalendarDays, Clock, Wallet } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber } from '../../../lib/numbers'

export default function SalaryCalculator() {
  const [salary, setSalary] = useState('60000')
  const [hours, setHours] = useState('40')

  const result = useMemo(() => {
    const y = toNumber(salary)
    const h = toNumber(hours)
    const valid = Number.isFinite(y) && Number.isFinite(h) && h > 0
    const annual = Number.isFinite(y) && y > 0 ? y : 0
    const monthly = annual / 12
    const semiMonthly = annual / 24
    const weekly = annual / 52
    const hourly = valid ? annual / 52 / h : 0
    const perDay = weekly / 5
    return { annual, monthly, semiMonthly, weekly, hourly, perDay, h: valid ? h : 0 }
  }, [salary, hours])

  return (
    <>
      <Seo title="Salary Calculator - vimz Tools" description="Break an annual salary into monthly, weekly and hourly pay." />
      <ToolShell
        title="Salary Calculator"
        description="Break an annual salary into monthly, weekly and hourly pay."
        icon={<BadgeDollarSign className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter an annual salary to break it into monthly, weekly and hourly."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Annual salary</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Annual salary ($)">
                <TextInput type="number" min={0} value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Hours per week (for hourly rate)">
                <TextInput type="number" min={1} value={hours} onChange={(e) => setHours(e.target.value)} />
              </Field>
              <div className="rounded-xl bg-primary-50 px-3 py-2.5 text-xs text-primary-700">
                Hourly rate assumes {money(result.h, 0)} hrs/week × 52 weeks. Per day assumes a 5-day week.
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Pay breakdown</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center">
                <Wallet className="mx-auto mb-1.5 h-5 w-5 text-primary-600" />
                <p className="text-[11px] font-semibold uppercase text-primary-500">Monthly</p>
                <p className="mt-1 text-2xl font-extrabold text-primary-700">${money(result.monthly, 0)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <CalendarDays className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Semi-monthly</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.semiMonthly, 0)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <Banknote className="mx-auto mb-1.5 h-5 w-5 text-emerald-500" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Weekly</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.weekly, 0)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <Clock className="mx-auto mb-1.5 h-5 w-5 text-emerald-600" />
                <p className="text-[11px] font-semibold uppercase text-emerald-500">Hourly</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">${money(result.hourly, 2)}</p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              ${money(result.annual, 0)}/yr · ${money(result.perDay, 0)} per working day
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}