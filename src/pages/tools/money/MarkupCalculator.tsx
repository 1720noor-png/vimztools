import { useMemo, useState } from 'react'
import { BadgePercent, Package, TrendingUp } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, percent, toNumber } from '../../../lib/numbers'

export default function MarkupCalculator() {
  const [cost, setCost] = useState('50')
  const [markup, setMarkup] = useState('30')

  const result = useMemo(() => {
    const c = toNumber(cost)
    const m = toNumber(markup)
    const valid = Number.isFinite(c) && Number.isFinite(m) && c > 0
    const selling = valid ? c * (1 + m / 100) : 0
    const markupAmt = selling - (valid ? c : 0)
    const margin = selling > 0 ? (markupAmt / selling) * 100 : 0
    const profitIf = valid ? selling : 0
    return { c: valid ? c : 0, m: valid ? m : 0, selling, markupAmt, margin, profitIf }
  }, [cost, markup])

  return (
    <>
      <Seo title="Markup Calculator - vimz Tools" description="Find selling price and margin from cost and markup percent." />
      <ToolShell
        title="Markup Calculator"
        description="Find selling price and margin from cost and markup percent."
        icon={<TrendingUp className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter cost and markup percent to get selling price and margin."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Cost and markup</h3>
            <div className="grid grid-cols-1 gap-5">
              <Field label="Cost price ($)">
                <TextInput type="number" min={0} step={0.01} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
              </Field>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Markup</span>
                  <span className="text-sm font-bold text-primary-700">{percent(result.m, 1)}</span>
                </div>
                <input type="range" min={0} max={300} step={5} value={result.m} onChange={(e) => setMarkup(e.target.value)} className="w-full accent-primary-600" />
              </div>
              <Field label="Or type markup (%)">
                <TextInput type="number" min={0} value={markup} onChange={(e) => setMarkup(e.target.value)} />
              </Field>
            </div>
            <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
              <BadgePercent className="h-3.5 w-3.5 text-primary-500" />
              Markup is added to cost; margin is the share of profit in the selling price.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Result</h3>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
                <Package className="h-3.5 w-3.5" /> Selling price
              </p>
              <p className="mt-1 text-5xl font-extrabold text-emerald-700">${money(result.selling)}</p>
              <p className="mt-2 text-xs text-emerald-500">Cost ${money(result.c)} + ${money(result.markupAmt)} markup</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Markup amount</p>
                <p className="mt-1 text-xl font-extrabold text-slate-800">${money(result.markupAmt)}</p>
              </div>
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-primary-500">Margin</p>
                <p className="mt-1 text-xl font-extrabold text-primary-700">{percent(result.margin, 1)}</p>
              </div>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}