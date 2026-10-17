import { useMemo, useState } from 'react'
import { Landmark, Percent, CalendarDays, Banknote } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { money } from '../../../lib/numbers'

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState('500000')
  const [rate, setRate] = useState('8')
  const [months, setMonths] = useState('60')

  const result = useMemo(() => {
    const p = Number(principal) || 0
    const r = (Number(rate) || 0) / 100 / 12
    const n = Math.max(1, Math.round(Number(months) || 1))
    const pow = Math.pow(1 + r, n)
    const emi = r > 0 ? (p * r * pow) / (pow - 1) : p / n
    const totalPayment = emi * n
    const totalInterest = totalPayment - p
    const principalPct = totalPayment > 0 ? (p / totalPayment) * 100 : 0
    return { p, r: r * 1200, n, emi, totalPayment, totalInterest, principalPct }
  }, [principal, rate, months])

  return (
    <>
      <Seo title="EMI Calculator - vimz Tools" description="Estimate monthly loan installments, interest and total cost." />
      <ToolShell
        title="EMI Calculator"
        description="Estimate monthly loan installments, interest and total cost."
        icon={<Landmark className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Set loan amount, rate and tenure to see your monthly EMI."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-5 text-sm font-bold text-slate-800">Loan inputs</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Loan amount</span>
                  <span className="text-sm font-bold text-primary-700">${money(result.p)}</span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={5000000}
                  step={10000}
                  value={result.p}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full accent-primary-600"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><Percent className="h-4 w-4 text-slate-400" /> Interest rate</span>
                  <span className="text-sm font-bold text-primary-700">{result.r.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={18}
                  step={0.5}
                  value={Math.round(result.r * 10) / 10}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full accent-primary-600"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><CalendarDays className="h-4 w-4 text-slate-400" /> Tenure</span>
                  <span className="text-sm font-bold text-primary-700">{result.n} mo</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={360}
                  step={6}
                  value={result.n}
                  onChange={(e) => setMonths(e.target.value)}
                  className="w-full accent-primary-600"
                />
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Monthly EMI</p>
              <p className="mt-1 text-5xl font-extrabold text-primary-800">${money(result.emi)}</p>
              <p className="mt-2 text-xs text-slate-400">{result.n} months at {result.r.toFixed(1)}% annual rate</p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">What you really pay</h3>
              <div className="mb-2 flex h-4 w-full overflow-hidden rounded-full">
                <div className="h-full bg-emerald-500" style={{ width: `${result.principalPct}%` }} />
                <div className="h-full bg-primary-500" style={{ width: `${100 - result.principalPct}%` }} />
              </div>
              <div className="mb-4 flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Principal ({result.principalPct.toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-primary-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-500" /> Interest ({(100 - result.principalPct).toFixed(0)}%)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Total interest</p>
                  <p className="mt-1 text-lg font-extrabold text-primary-700">${money(result.totalInterest)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase text-slate-400"><Banknote className="h-3 w-3" /> Total payment</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800">${money(result.totalPayment)}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}