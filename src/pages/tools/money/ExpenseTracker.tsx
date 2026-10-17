import { useMemo, useState } from 'react'
import { ListChecks, Plus, Trash2, TrendingDown, Wallet } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, percent, toNumber, uid } from '../../../lib/numbers'

type Spend = { id: string; label: string; amount: number; category: string }

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other']

export default function ExpenseTracker() {
  const [spends, setSpends] = useState<Spend[]>([])
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])

  const addSpend = () => {
    const amt = toNumber(amount)
    if (!label.trim() || !Number.isFinite(amt) || amt <= 0) return
    setSpends((p) => [...p, { id: uid(), label: label.trim(), amount: amt, category }])
    setLabel('')
    setAmount('')
  }

  const remove = (id: string) => setSpends((p) => p.filter((s) => s.id !== id))

  const summary = useMemo(() => {
    const total = spends.reduce((s, x) => s + x.amount, 0)
    const byCategory: Record<string, number> = {}
    spends.forEach((s) => {
      byCategory[s.category] = (byCategory[s.category] || 0) + s.amount
    })
    return { total, byCategory }
  }, [spends])

  const sortedCategories = useMemo(
    () => Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]),
    [summary],
  )

  return (
    <>
      <Seo title="Expense Tracker - vimz Tools" description="Log daily expenses by category and see where money goes." />
      <ToolShell
        title="Expense Tracker"
        description="Log daily expenses by category and see where money goes."
        icon={<ListChecks className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Log expenses by category and watch your totals update live."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add expense</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Name">
                  <TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Groceries" />
                </Field>
                <Field label="Amount ($)">
                  <TextInput type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Category">
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Button onClick={addSpend}>
                  <Plus className="h-4 w-4" /> Add expense
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Today's entries ({spends.length})</h3>
              {spends.length === 0 ? (
                <p className="text-xs text-slate-400">No expenses yet.</p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {spends.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <span className="inline-flex shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">{s.category}</span>
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{s.label}</p>
                      <p className="text-sm font-bold text-slate-800">${money(s.amount)}</p>
                      <button onClick={() => remove(s.id)} aria-label="Remove" className="rounded-md p-1 text-slate-300 transition hover:text-rose-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
              <Wallet className="mx-auto mb-2 h-5 w-5 text-rose-500" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-400">Spent today</p>
              <p className="mt-1 text-4xl font-extrabold text-rose-600">${money(summary.total)}</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <TrendingDown className="h-4 w-4 text-rose-500" /> By category
              </h3>
              {sortedCategories.length === 0 ? (
                <p className="text-xs text-slate-400">Add an expense to see category totals.</p>
              ) : (
                <div className="space-y-3">
                  {sortedCategories.map(([cat, amt]) => {
                    const pct = summary.total > 0 ? (amt / summary.total) * 100 : 0
                    return (
                      <div key={cat}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-semibold text-slate-700">{cat}</span>
                          <span className="font-bold text-slate-600">${money(amt)} · {percent(pct, 0)}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-rose-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}