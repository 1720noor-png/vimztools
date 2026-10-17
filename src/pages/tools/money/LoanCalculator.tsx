import { useMemo, useState } from 'react'
import { Banknote, CalendarDays, Percent } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber } from '../../../lib/numbers'

type AmortRow = { period: number; payment: number; interest: number; principal: number; balance: number }

export default function LoanCalculator() {
  const [amount, setAmount] = useState('20000')
  const [rate, setRate] = useState('6')
  const [months, setMonths] = useState('60')

  const result = useMemo(() => {
    const p = toNumber(amount)
    const r = toNumber(rate)
    const n = Math.max(1, Math.round(toNumber(months) || 1))
    const valid = Number.isFinite(p) && Number.isFinite(r) && p > 0 && r >= 0
    const mr = r / 100 / 12
    const pow = Math.pow(1 + mr, n)
    const emi = valid ? (mr > 0 ? (p * mr * pow) / (pow - 1) : p / n) : 0
    const totalPayment = emi * n
    const totalInterest = totalPayment - (valid ? p : 0)
    const rows: AmortRow[] = []
    let bal = valid ? p : 0
    const shown = Math.min(n, 12)
    for (let i = 1; i <= shown; i += 1) {
      const interest = bal * mr
      const principal = emi - interest
      bal = Math.max(0, bal - principal)
      rows.push({ period: i, payment: emi, interest, principal, balance: bal })
    }
    return { p, r, n, emi, totalPayment, totalInterest, rows, shown }
  }, [amount, rate, months])

  return (
    <>
      <Seo title="Loan Calculator - vimz Tools" description="Calculate monthly payments, interest and payoff timeline." />
      <ToolShell
        title="Loan Calculator"
        description="Calculate monthly payments, interest and payoff timeline."
        icon={<Banknote className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter amount, rate and tenure to see your full repayment plan."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Loan terms</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Loan amount ($)">
                <TextInput type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Annual interest rate (%)">
                <TextInput type="number" min={0} step={0.1} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.0" />
              </Field>
              <Field label="Term (months)">
                <TextInput type="number" min={1} value={months} onChange={(e) => setMonths(e.target.value)} placeholder="0" />
              </Field>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3">
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-center">
                <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase text-primary-500"><CalendarDays className="h-3 w-3" /> Monthly payment</p>
                <p className="mt-1 text-2xl font-extrabold text-primary-800">${money(result.emi)}</p>
              </div>
              <div className="grid grid-cols-2 items-center justify-between gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs">
                  <p className="text-slate-400">Total interest</p>
                  <p className="mt-0.5 text-sm font-bold text-rose-500">${money(result.totalInterest)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs">
                  <p className="text-slate-400">Total repaid</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">${money(result.totalPayment)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-1 text-sm font-bold text-slate-800">Amortization schedule</h3>
            <p className="mb-4 text-xs text-slate-400">
              First {result.shown} of {result.n} payments at {result.r.toFixed(1)}% APR.
            </p>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 font-semibold">#</th>
                    <th className="py-2 font-semibold">Payment</th>
                    <th className="py-2 font-semibold">Interest</th>
                    <th className="py-2 font-semibold">Principal</th>
                    <th className="py-2 text-right font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.period} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 font-semibold text-slate-400">{row.period}</td>
                      <td className="py-2.5 text-slate-700">${money(row.payment)}</td>
                      <td className="py-2.5 text-rose-500">${money(row.interest)}</td>
                      <td className="py-2.5 text-emerald-600">${money(row.principal)}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-800">${money(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.n > 12 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <Percent className="h-3.5 w-3.5" /> {result.n - 12} more rows — the loan clears at month {result.n} with ${money(result.emi)}/mo.
              </p>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}