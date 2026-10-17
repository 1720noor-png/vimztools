import { useMemo, useState } from 'react'
import { CalendarRange, PiggyBank, Plus, TrendingDown, TrendingUp, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, percent, toNumber, uid } from '../../../lib/numbers'

type Entry = { id: string; label: string; amount: number; category: string }
type Side = 'income' | 'expense'

const emptyEntry = { label: '', amount: '', category: '' }

export default function MonthlyBudget() {
  const [incomes, setIncomes] = useState<Entry[]>([])
  const [expenses, setExpenses] = useState<Entry[]>([])
  const [form, setForm] = useState(emptyEntry)

  const add = (side: Side) => {
    const amt = toNumber(form.amount)
    if (!form.label.trim() || !Number.isFinite(amt) || amt <= 0) return
    const entry: Entry = { id: uid(), label: form.label.trim(), amount: amt, category: form.category }
    if (side === 'income') setIncomes((p) => [...p, entry])
    else setExpenses((p) => [...p, entry])
    setForm(emptyEntry)
  }

  const removeEntry = (side: Side, id: string) =>
    side === 'income' ? setIncomes((p) => p.filter((e) => e.id !== id)) : setExpenses((p) => p.filter((e) => e.id !== id))

  const result = useMemo(() => {
    const income = incomes.reduce((s, e) => s + e.amount, 0)
    const expense = expenses.reduce((s, e) => s + e.amount, 0)
    const net = income - expense
    const byCategory: Record<string, number> = {}
    expenses.forEach((e) => {
      if (e.category) byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    })
    return { income, expense, net, byCategory, count: incomes.length + expenses.length }
  }, [incomes, expenses])

  const sortedCats = useMemo(() => Object.entries(result.byCategory).sort((a, b) => b[1] - a[1]), [result])

  return (
    <>
      <Seo title="Monthly Budget - vimz Tools" description="Plan income and expenses for a month and see what remains." />
      <ToolShell
        title="Monthly Budget"
        description="Plan income and expenses for a month and see what remains."
        icon={<CalendarRange className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="List your income and expenses for the month and see the net result."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Add an entry</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Field label="Label">
              <TextInput value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Rent" />
            </Field>
            <Field label="Amount ($)">
              <TextInput type="number" min={0} step={0.01} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </Field>
            <Field label="Category">
              <TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Housing" />
            </Field>
            <div className="grid grid-cols-2 items-end gap-2">
              <Button variant="success" onClick={() => add('income')}>
                <Plus className="h-4 w-4" /> Income
              </Button>
              <Button variant="danger" onClick={() => add('expense')}>
                <Plus className="h-4 w-4" /> Expense
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Income ({incomes.length})
            </h3>
            {incomes.length === 0 ? (
              <p className="text-xs text-slate-400">No income yet.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {incomes.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{e.label}</p>
                      <p className="text-[11px] text-emerald-600">{e.category}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-700">+${money(e.amount)}</p>
                    <button onClick={() => removeEntry('income', e.id)} aria-label="Remove" className="rounded-md p-1 text-emerald-400 transition hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-right text-sm font-extrabold text-emerald-700">Total ${money(result.income)}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <TrendingDown className="h-4 w-4 text-rose-500" /> Expenses ({expenses.length})
            </h3>
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400">No expenses yet.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {expenses.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{e.label}</p>
                      <p className="text-[11px] text-rose-400">{e.category}</p>
                    </div>
                    <p className="text-sm font-bold text-rose-500">−${money(e.amount)}</p>
                    <button onClick={() => removeEntry('expense', e.id)} aria-label="Remove" className="rounded-md p-1 text-rose-300 transition hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-right text-sm font-extrabold text-rose-500">Total ${money(result.expense)}</p>
          </section>
        </div>

        <section className={`mt-6 rounded-2xl border p-5 text-center ${result.net >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <PiggyBank className="h-4 w-4" /> Net this month
          </p>
          <p className={`mt-1 text-4xl font-extrabold ${result.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {result.net >= 0 ? '+' : '−'}${money(Math.abs(result.net))}
          </p>
        </section>

        {sortedCats.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Where expenses go</h3>
            <div className="space-y-3">
              {sortedCats.map(([cat, amt]) => {
                const pct = result.expense > 0 ? (amt / result.expense) * 100 : 0
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
          </section>
        )}
      </ToolShell>
    </>
  )
}