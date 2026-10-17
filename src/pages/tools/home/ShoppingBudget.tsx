import { useMemo, useState } from 'react'
import { ShoppingBag, Plus, Trash2, TrendingUp, AlertTriangle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, moneyWithSymbol, percent, toNumber, uid } from '../../../lib/numbers'

type Purchase = { id: string; name: string; amount: number }

export default function ShoppingBudget() {
  const [budget, setBudget] = useState('')
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const budgetNum = toNumber(budget)

  const addPurchase = () => {
    const amt = toNumber(amount)
    if (!name.trim() || Number.isNaN(amt) || amt <= 0) return
    setPurchases((prev) => [...prev, { id: uid(), name: name.trim(), amount: amt }])
    setName('')
    setAmount('')
  }

  const remove = (id: string) => setPurchases((prev) => prev.filter((p) => p.id !== id))

  const stats = useMemo(() => {
    const spent = purchases.reduce((a, p) => a + p.amount, 0)
    const over = budgetNum > 0 && spent > budgetNum
    const remaining = budgetNum > 0 ? budgetNum - spent : 0
    const pct = budgetNum > 0 ? clamp((spent / budgetNum) * 100, 0, 100) : 0
    const overshoot = over ? spent - budgetNum : 0
    return { spent, over, remaining, pct, overshoot }
  }, [purchases, budgetNum])

  const count = purchases.length

  return (
    <>
      <Seo
        title="Shopping Budget - vimz Tools"
        description="Set a spending cap and track shopping against it."
      />
      <ToolShell
        title="Shopping Budget"
        description="Set a spending cap and track shopping against it."
        icon={<ShoppingBag className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Set a limit and track purchases before you overspend."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <Field label="Weekly shopping budget ($)">
              <TextInput type="number" min={0} step={10} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 150" />
            </Field>
            <div className="mt-5 grid grid-cols-1 gap-3">
              <Field label="Purchase">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" />
              </Field>
              <Field label="Amount ($)">
                <TextInput type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </Field>
              <Button onClick={addPurchase} disabled={!budget.trim()}>
                <Plus className="h-4 w-4" /> Log purchase
              </Button>
              {!budget.trim() && <p className="text-[11px] text-slate-400">Set a budget first to track your cap.</p>}
            </div>
          </section>

          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">Spending vs cap</h3>
                <span className={`text-xs font-bold ${stats.over ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {stats.over ? `${moneyWithSymbol(stats.overshoot)} over` : moneyWithSymbol(stats.remaining, '$')} left
                </span>
              </div>
              <div className="h-3.5 rounded-full bg-slate-100">
                <div
                  className={`h-3.5 rounded-full ${stats.over ? 'bg-rose-500' : stats.pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <TrendingUp className="h-3.5 w-3.5" /> Spent {moneyWithSymbol(stats.spent)}
                </span>
                <span className="text-slate-400">{budgetNum ? percent(stats.pct, 0) : 'no cap set'}</span>
              </div>
              {stats.over && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  <AlertTriangle className="h-4 w-4" /> You've blown {moneyWithSymbol(stats.overshoot)} past the cap.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Purchases ({count})</h3>
              {purchases.length === 0 ? (
                <p className="text-xs text-slate-400">Nothing logged yet.</p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {purchases.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                      <ShoppingBag className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{p.name}</span>
                      <span className="text-sm font-bold text-slate-700">{moneyWithSymbol(p.amount)}</span>
                      <button onClick={() => remove(p.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}