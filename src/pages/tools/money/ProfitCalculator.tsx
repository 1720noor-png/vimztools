import { useMemo, useState } from 'react'
import { BadgePercent, LineChart, TrendingUp } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, percent, toNumber } from '../../../lib/numbers'

export default function ProfitCalculator() {
  const [revenue, setRevenue] = useState('1000')
  const [cost, setCost] = useState('600')

  const result = useMemo(() => {
    const r = toNumber(revenue)
    const c = toNumber(cost)
    const valid = Number.isFinite(r) && Number.isFinite(c) && r >= 0 && c >= 0
    const rev = valid ? r : 0
    const costAmt = valid ? c : 0
    const profit = rev - costAmt
    const margin = rev > 0 ? (profit / rev) * 100 : 0
    const markup = costAmt > 0 ? (profit / costAmt) * 100 : 0
    return { rev, cost: costAmt, profit, margin, markup, valid }
  }, [revenue, cost])

  return (
    <>
      <Seo title="Profit Calculator - vimz Tools" description="Calculate profit, margin and markup from revenue and cost." />
      <ToolShell
        title="Profit Calculator"
        description="Calculate profit, margin and markup from revenue and cost."
        icon={<LineChart className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter revenue and cost to see profit, margin and markup."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Numbers</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Revenue ($)">
                <TextInput type="number" min={0} step={0.01} value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Cost of goods ($)">
                <TextInput type="number" min={0} step={0.01} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
              </Field>
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
              Margin = profit ÷ revenue. Markup = profit ÷ cost. They look identical but measure different bases.
            </div>
          </section>

          <div className="space-y-5">
            <section className={`rounded-2xl border p-6 text-center ${result.profit >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <TrendingUp className="h-4 w-4" /> {result.profit >= 0 ? 'Profit' : 'Loss'}
              </p>
              <p className={`mt-1 text-5xl font-extrabold ${result.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.profit < 0 ? '-' : ''}${money(Math.abs(result.profit))}
              </p>
              <p className="mt-2 text-xs text-slate-400">${money(result.rev)} revenue − ${money(result.cost)} cost</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Ratios</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <BadgePercent className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Margin</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">{percent(result.margin, 1)}</p>
                </div>
                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center">
                  <BadgePercent className="mx-auto mb-1.5 h-5 w-5 text-primary-500" />
                  <p className="text-[11px] font-semibold uppercase text-primary-500">Markup</p>
                  <p className="mt-1 text-2xl font-extrabold text-primary-700">{percent(result.markup, 1)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <TrendingUp className="mx-auto mb-1.5 h-5 w-5 text-emerald-500" />
                  <p className="text-[11px] font-semibold uppercase text-emerald-500">Profit</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-700">${money(result.profit)}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}