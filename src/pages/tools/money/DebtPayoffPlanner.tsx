import { useMemo, useState } from 'react'
import { Flame, Plus, Snowflake, Trash2, TrendingDown } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, percent, toNumber, uid } from '../../../lib/numbers'

type Debt = { id: string; name: string; balance: number; apr: number; payment: number }
type Strategy = 'avalanche' | 'snowball'

const estimate = (d: Debt) => {
  if (d.payment <= 0 || d.balance <= 0) return { months: Infinity, interest: Infinity, capped: true }
  const r = d.apr / 100 / 12
  if (r <= 0) return { months: Math.ceil(d.balance / d.payment), interest: 0, capped: false }
  const cap = r * d.balance
  if (d.payment <= cap) return { months: Infinity, interest: Infinity, capped: true }
  const months = Math.ceil(Math.log(d.payment / (d.payment - cap)) / Math.log(1 + r))
  return { months, interest: d.payment * months - d.balance, capped: false }
}

export default function DebtPayoffPlanner() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [strategy, setStrategy] = useState<Strategy>('avalanche')
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [apr, setApr] = useState('')
  const [payment, setPayment] = useState('')

  const addDebt = () => {
    const b = toNumber(balance)
    const a = toNumber(apr)
    const p = toNumber(payment)
    if (!name.trim() || !Number.isFinite(b) || !Number.isFinite(a) || !Number.isFinite(p) || b <= 0 || a < 0 || p <= 0) return
    setDebts((prev) => [...prev, { id: uid(), name: name.trim(), balance: b, apr: a, payment: p }])
    setName('')
    setBalance('')
    setApr('')
    setPayment('')
  }

  const remove = (id: string) => setDebts((p) => p.filter((d) => d.id !== id))

  const plan = useMemo(() => {
    const sorted = [...debts].sort((a, b) => (strategy === 'avalanche' ? b.apr - a.apr : a.balance - b.balance))
    const rows = sorted.map((d) => {
      const e = estimate(d)
      return { ...d, ...e }
    })
    const totalBalance = debts.reduce((s, d) => s + d.balance, 0)
    const totalInterest = rows.reduce((s, r) => s + (Number.isFinite(r.interest) ? r.interest : 0), 0)
    const totalCost = totalBalance + totalInterest
    const finite = rows.filter((r) => Number.isFinite(r.months)).map((r) => r.months)
    return { rows, totalBalance, totalInterest, totalCost, maxMonths: finite.length ? Math.max(...finite) : 0 }
  }, [debts, strategy])

  return (
    <>
      <Seo title="Debt Payoff Planner - vimz Tools" description="Create a plan to clear debts faster and save on interest." />
      <ToolShell
        title="Debt Payoff Planner"
        description="Create a plan to clear debts faster and save on interest."
        icon={<TrendingDown className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Add your debts and pick a strategy to see the fastest payoff."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a debt</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Debt name">
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Credit card" />
                </Field>
                <Field label="Balance ($)">
                  <TextInput type="number" min={0} value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="APR %">
                    <TextInput type="number" min={0} step={0.1} value={apr} onChange={(e) => setApr(e.target.value)} placeholder="0.0" />
                  </Field>
                  <Field label="Payment/mo ($)">
                    <TextInput type="number" min={0} value={payment} onChange={(e) => setPayment(e.target.value)} placeholder="0.00" />
                  </Field>
                </div>
                <Button onClick={addDebt}>
                  <Plus className="h-4 w-4" /> Add debt
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Strategy</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStrategy('avalanche')}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${strategy === 'avalanche' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  <Flame className="h-5 w-5" />
                  <span className="text-sm font-bold">Avalanche</span>
                  <span className="text-[11px]">highest APR first</span>
                </button>
                <button
                  onClick={() => setStrategy('snowball')}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${strategy === 'snowball' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  <Snowflake className="h-5 w-5" />
                  <span className="text-sm font-bold">Snowball</span>
                  <span className="text-[11px]">smallest first</span>
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {strategy === 'avalanche' ? 'Pay the highest-interest debt first to minimize total interest.' : 'Pay the smallest balance first for quick wins and momentum.'}
              </p>
            </section>
          </div>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-1 text-sm font-bold text-slate-800">Payoff order</h3>
              <p className="mb-4 text-xs text-slate-400">Ordered by your {strategy} strategy with each debt paid off using its own minimum payment.</p>
              {plan.rows.length === 0 ? (
                <p className="text-xs text-slate-400">Add at least one debt to see your plan.</p>
              ) : (
                <div className="space-y-3">
                  {plan.rows.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-extrabold text-white">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{r.name}</p>
                        <p className="text-[11px] text-slate-400">Balance ${money(r.balance)} · {percent(r.apr, 1)} APR</p>
                      </div>
                      {r.capped ? (
                        <p className="text-xs font-semibold text-rose-500">Payment too low</p>
                      ) : (
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">{r.months} mo</p>
                          <p className="text-[11px] text-slate-400">${money(r.interest)} interest</p>
                        </div>
                      )}
                      <button onClick={() => remove(r.id)} aria-label="Remove" className="rounded-md p-1 text-slate-300 transition hover:text-rose-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {plan.rows.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-bold text-slate-800">Plan summary</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-[11px] font-semibold uppercase text-slate-400">Total balance</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(plan.totalBalance)}</p>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                    <p className="text-[11px] font-semibold uppercase text-rose-400">Interest to pay</p>
                    <p className="mt-1 text-2xl font-extrabold text-rose-600">${money(plan.totalInterest)}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <p className="text-[11px] font-semibold uppercase text-emerald-500">Est. payoff</p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-700">{plan.maxMonths > 0 ? `${plan.maxMonths} mo` : '—'}</p>
                    <p className="text-[11px] text-emerald-400">${money(plan.totalCost)} total</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}