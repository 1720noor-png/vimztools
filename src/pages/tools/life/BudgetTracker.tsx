import { useMemo, useState } from 'react'
import { Wallet, Plus, Trash2, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/utils'

type Entry = { id: string; label: string; amount: number; type: 'income' | 'expense'; category: string }
type Freq = 'monthly' | 'yearly' | 'weekly'

export default function BudgetTracker() {
  const [currency] = useState('$')
  const [entries, setEntries] = useState<Entry[]>([])
  const [freq, setFreq] = useState<Freq>('monthly')
  const [newEntry, setNewEntry] = useState({ label: '', amount: '', type: 'expense' as 'income' | 'expense', category: '' })
  const { toast } = useToast()

  const addEntry = () => {
    const amt = parseFloat(newEntry.amount)
    if (!newEntry.label.trim() || Number.isNaN(amt) || amt <= 0) {
      toast('Fill in a label and valid positive amount.', 'error')
      return
    }
    setEntries((p) => [...p, { id: uid(), label: newEntry.label.trim(), amount: amt, type: newEntry.type, category: newEntry.category }])
    setNewEntry({ label: '', amount: '', type: 'expense', category: '' })
  }

  const remove = (id: string) => setEntries((p) => p.filter((e) => e.id !== id))

  const result = useMemo(() => {
    const toYear = (amt: number) =>
      freq === 'monthly' ? amt * 12 : freq === 'weekly' ? amt * 52 : amt
    const income = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expenses = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    const savings = income - expenses
    const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : '0.0'
    const yIncome = toYear(income)
    const yExpenses = toYear(expenses)
    const ySavings = toYear(savings)

    const byCategory: Record<string, number> = {}
    entries
      .filter((e) => e.type === 'expense' && e.category)
      .forEach((e) => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
      })

    return { income, expenses, savings, savingsRate, yIncome, yExpenses, ySavings, byCategory }
  }, [entries, freq])

  return (
    <>
      <Seo
        title="Bill & Budget Tracker - vimz Tools"
        description="Plan your monthly budget and track income vs expenses. Free calculator with categories and savings rate."
      />
      <ToolShell
        title="Bill & Budget Tracker"
        description="Track income and expenses by category with frequency scaling (weekly, monthly, yearly) to stay in control of your budget."
        icon={<Wallet className="h-6 w-6" />}
        breadcrumb="Health & Life"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Input */}
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a line item</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Label">
                  <TextInput
                    value={newEntry.label}
                    onChange={(e) => setNewEntry({ ...newEntry, label: e.target.value })}
                    placeholder="e.g. Rent, Salary"
                  />
                </Field>
                <Field label={`Amount (${currency})`}>
                  <TextInput
                    type="number"
                    min={0}
                    step={0.01}
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type">
                    <select
                      value={newEntry.type}
                      onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as 'income' | 'expense' })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </Field>
                  <Field label="Category">
                    <TextInput
                      value={newEntry.category}
                      onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                      placeholder="e.g. Housing"
                    />
                  </Field>
                </div>
                <Button onClick={addEntry} variant={newEntry.type === 'income' ? 'success' : 'primary'}>
                  <Plus className="h-4 w-4" /> Add item
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Items ({entries.length})</h3>
              {entries.length === 0 ? (
                <p className="text-xs text-slate-400">No items yet — add one above.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {entries.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${e.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {e.type === 'income' ? '↑' : '↓'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{e.label}</p>
                        <p className="text-[11px] text-slate-400">{e.category || 'Uncategorized'}</p>
                      </div>
                      <p className={`text-sm font-bold ${e.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {e.type === 'income' ? '+' : '-'}{currency}{e.amount.toFixed(2)}
                      </p>
                      <button onClick={() => remove(e.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Summary */}
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800">Summary</h3>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
                  {(['weekly', 'monthly', 'yearly'] as Freq[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFreq(f)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${freq === f ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <TrendingUp className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
                  <p className="text-[11px] font-semibold uppercase text-emerald-500">Income</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-700">{currency}{result.income.toFixed(2)}</p>
                  <p className="text-[11px] text-emerald-400">{freq}</p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                  <TrendingDown className="mx-auto mb-2 h-5 w-5 text-rose-600" />
                  <p className="text-[11px] font-semibold uppercase text-rose-500">Expenses</p>
                  <p className="mt-1 text-2xl font-extrabold text-rose-700">{currency}{result.expenses.toFixed(2)}</p>
                  <p className="text-[11px] text-rose-400">{freq}</p>
                </div>
                <div className={`rounded-2xl border p-4 text-center ${result.savings >= 0 ? 'border-primary-200 bg-primary-50' : 'border-rose-200 bg-rose-50'}`}>
                  <PiggyBank className={`mx-auto mb-2 h-5 w-5 ${result.savings >= 0 ? 'text-primary-600' : 'text-rose-600'}`} />
                  <p className="text-[11px] font-semibold uppercase text-primary-500">Net savings</p>
                  <p className={`mt-1 text-2xl font-extrabold ${result.savings >= 0 ? 'text-primary-800' : 'text-rose-700'}`}>
                    {currency}{Math.abs(result.savings).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-400">Savings rate: {result.savingsRate}%</p>
                </div>
              </div>
            </div>

            {Object.keys(result.byCategory).length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-bold text-slate-800">Expenses by category</h3>
                <div className="space-y-2.5">
                  {Object.entries(result.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amt]) => {
                      const pct = result.expenses > 0 ? (amt / result.expenses) * 100 : 0
                      return (
                        <div key={cat}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">{cat}</span>
                            <span className="text-xs font-bold text-slate-500">{currency}{amt.toFixed(2)} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {result.income > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-bold text-slate-800">Projections</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm">
                    <p className="text-xs text-slate-400">Weekly</p>
                    <p className="font-bold text-slate-800">{currency}{(result.yIncome / 52).toFixed(0)}/wk income</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm">
                    <p className="text-xs text-slate-400">Monthly</p>
                    <p className="font-bold text-slate-800">{currency}{(result.yIncome / 12).toFixed(0)}/mo income</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm">
                    <p className="text-xs text-slate-400">Yearly</p>
                    <p className="font-bold text-slate-800">{currency}{result.yIncome.toFixed(0)}/yr income</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}