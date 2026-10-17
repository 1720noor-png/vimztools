import { useMemo, useState } from 'react'
import { Banknote, Clock, DollarSign, TrendingUp } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber } from '../../../lib/numbers'

export default function HourlyPayCalculator() {
  const [rate, setRate] = useState('20')
  const [hours, setHours] = useState('40')

  const result = useMemo(() => {
    const r = toNumber(rate)
    const h = Math.round(toNumber(hours) || 0)
    const day = Number.isFinite(r) ? r * 8 : 0
    const week = Number.isFinite(r) ? r * h : 0
    const month = week * (52 / 12)
    const year = week * 52
    return { r: Number.isFinite(r) ? r : 0, h, day, week, month, year }
  }, [rate, hours])

  return (
    <>
      <Seo title="Hourly Pay Calculator - vimz Tools" description="Convert hourly pay to weekly, monthly and annual earnings." />
      <ToolShell
        title="Hourly Pay Calculator"
        description="Convert hourly pay to weekly, monthly and annual earnings."
        icon={<Clock className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter your hourly rate and hours per week to see earnings."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your rate</h3>
            <div className="grid grid-cols-1 gap-5">
              <Field label="Hourly rate ($)">
                <TextInput type="number" min={0} step={0.5} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.00" />
              </Field>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Hours per week</span>
                  <span className="text-sm font-bold text-primary-700">{result.h} hrs</span>
                </div>
                <input type="range" min={5} max={60} step={1} value={result.h} onChange={(e) => setHours(e.target.value)} className="w-full accent-primary-600" />
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-primary-50 px-3 py-2.5 text-xs text-primary-700">
              Assuming a standard 8-hour day. Year uses 52 weeks — tune the slider to match your schedule.
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Earnings breakdown</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <DollarSign className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Per day</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.day)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <Clock className="mx-auto mb-1.5 h-5 w-5 text-primary-500" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Per week</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.week)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <Banknote className="mx-auto mb-1.5 h-5 w-5 text-emerald-500" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Per month</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.month)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <TrendingUp className="mx-auto mb-1.5 h-5 w-5 text-emerald-600" />
                <p className="text-[11px] font-semibold uppercase text-emerald-500">Per year</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">${money(result.year)}</p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">${money(result.r)}/hr × {result.h} hrs/wk</p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}