import { useMemo, useState } from 'react'
import { FileBadge, Landmark, Percent, ReceiptText } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, percent, toNumber } from '../../../lib/numbers'

const BRACKETS: Array<[number, number, number]> = [
  [0, 11600, 0.1],
  [11600, 47150, 0.12],
  [47150, 100525, 0.22],
  [100525, 191950, 0.24],
  [191950, 243725, 0.32],
  [243725, 609350, 0.35],
  [609350, Infinity, 0.37],
]

export default function TaxEstimator() {
  const [income, setIncome] = useState('85000')
  const [deductions, setDeductions] = useState('14600')

  const result = useMemo(() => {
    const gross = toNumber(income)
    const de = toNumber(deductions)
    const g = Number.isFinite(gross) && gross > 0 ? gross : 0
    const taxable = Math.max(0, g - (Number.isFinite(de) ? de : 0))
    let tax = 0
    let rem = taxable
    const bands: Array<{ lo: number; rate: number; taxed: number }> = []
    BRACKETS.forEach(([lo, hi, rate]) => {
      if (rem <= 0) return
      const amt = Math.min(rem, hi - lo)
      bands.push({ lo, rate, taxed: amt })
      tax += amt * rate
      rem -= amt
    })
    const takeHome = g - tax
    const effectiveRate = g > 0 ? (tax / g) * 100 : 0
    return { g, taxable, tax, takeHome, effectiveRate, bands }
  }, [income, deductions])

  return (
    <>
      <Seo title="Tax Estimator - vimz Tools" description="Estimate income tax, take-home pay and effective rate." />
      <ToolShell
        title="Tax Estimator"
        description="Estimate income tax, take-home pay and effective rate."
        icon={<FileBadge className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter your income and deductions for an instant tax estimate."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Income</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Annual gross income ($)">
                <TextInput type="number" min={0} value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Deductions ($)">
                <TextInput type="number" min={0} value={deductions} onChange={(e) => setDeductions(e.target.value)} placeholder="0.00" />
              </Field>
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
              Uses the U.S. single-filer marginal brackets (10% → 37%). Deductions are subtracted before taxing.
            </p>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Gross income</p>
                <p className="mt-1 text-lg font-extrabold text-slate-800">${money(result.g)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase text-slate-400"><Landmark className="h-3 w-3" /> Taxable</p>
                <p className="mt-1 text-lg font-extrabold text-slate-800">${money(result.taxable)}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-rose-400">Est. tax</p>
                <p className="mt-1 text-lg font-extrabold text-rose-600">${money(result.tax)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase text-emerald-500"><Percent className="h-3 w-3" /> Effective</p>
                <p className="mt-1 text-lg font-extrabold text-emerald-700">{percent(result.effectiveRate, 1)}</p>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <ReceiptText className="h-4 w-4 text-slate-400" /> Marginal bracket breakdown
              </h3>
              {result.taxable <= 0 ? (
                <p className="text-xs text-slate-400">No taxable income after deductions — no tax due.</p>
              ) : (
                <div className="space-y-2.5">
                  {result.bands.map((b) => (
                    <div key={b.lo}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">${money(b.lo)} · {percent(b.rate * 100, 0)}</span>
                        <span className="font-bold text-slate-600">${money(b.taxed * b.rate)} on ${money(b.taxed)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${(b.taxed / result.taxable) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm">
                <span className="text-emerald-600">Take-home pay: </span>
                <span className="font-extrabold text-emerald-700">${money(result.takeHome)}</span>
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}