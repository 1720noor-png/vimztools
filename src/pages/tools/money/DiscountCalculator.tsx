import { useMemo, useState } from 'react'
import { BadgePercent, Percent, Tag } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, money, percent, toNumber } from '../../../lib/numbers'

export default function DiscountCalculator() {
  const [price, setPrice] = useState('100')
  const [discount, setDiscount] = useState('20')

  const result = useMemo(() => {
    const p = toNumber(price)
    const d = clamp(toNumber(discount) || 0, 0, 100)
    const original = Number.isFinite(p) ? p : 0
    const final = original * (1 - d / 100)
    const savings = original - final
    return { original, d, final, savings }
  }, [price, discount])

  return (
    <>
      <Seo title="Discount Calculator - vimz Tools" description="See the final price and savings after a percentage discount." />
      <ToolShell
        title="Discount Calculator"
        description="See the final price and savings after a percentage discount."
        icon={<Percent className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter the original price and discount percent to see your savings."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your sale</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Original price ($)">
                <TextInput type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label={`Discount (${percent(result.d)})`}>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={5}
                  value={result.d}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>0%</span>
                  <span>90%</span>
                </div>
              </Field>
              <Field label="Or type it exactly (%)">
                <TextInput type="number" min={0} max={100} step={0.5} value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">Final price</p>
            <p className="mt-1 text-5xl font-extrabold text-slate-900">${money(result.final)}</p>
            <p className="mt-2 text-sm text-slate-400">
              <span className="line-through">${money(result.original)}</span> original
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <BadgePercent className="mx-auto mb-1.5 h-5 w-5 text-emerald-600" />
                <p className="text-[11px] font-semibold uppercase text-emerald-500">You save</p>
                <p className="mt-1 text-xl font-extrabold text-emerald-700">${money(result.savings)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <Tag className="mx-auto mb-1.5 h-5 w-5 text-slate-500" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Saving</p>
                <p className="mt-1 text-xl font-extrabold text-slate-700">{percent(result.d, 1)} off</p>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
              Price after discount: every {percent(result.d, 1)} off removes ${money(result.original / 100 * result.d)} from the original.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}