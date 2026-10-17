import { useMemo, useState } from 'react'
import { UserRound, Plus, Trash2, ArrowRightLeft } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, round, toNumber, uid } from '../../../lib/numbers'

type Expense = { id: string; label: string; amount: number; paidBy: number }

export default function HomeExpenseSplitter() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [people, setPeople] = useState(3)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState<number>(0)

  const addExpense = () => {
    const amt = toNumber(amount)
    if (!label.trim() || Number.isNaN(amt) || amt <= 0) return
    setExpenses((prev) => [...prev, { id: uid(), label: label.trim(), amount: amt, paidBy }])
    setLabel('')
    setAmount('')
  }

  const remove = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id))

  const peopleOptions = useMemo(() => Array.from({ length: people }, (_, i) => i), [people])

  const result = useMemo(() => {
    const total = expenses.reduce((a, e) => a + e.amount, 0)
    const share = people > 0 ? total / people : 0
    const persons = peopleOptions.map((p) => {
      const paid = expenses.filter((e) => e.paidBy === p).reduce((a, e) => a + e.amount, 0)
      const net = round(paid - share, 2)
      return { name: `Person ${p + 1}`, paid, net }
    })
    return { total, share, persons }
  }, [expenses, people, peopleOptions])

  return (
    <>
      <Seo
        title="Home Expense Splitter - vimz Tools"
        description="Divide shared household expenses between roommates fairly."
      />
      <ToolShell
        title="Home Expense Splitter"
        description="Divide shared household expenses between roommates fairly."
        icon={<UserRound className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Enter shared expenses and split them fairly with housemates."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <Field label="Label">
                <TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Groceries" />
              </Field>
            </div>
            <div className="md:col-span-1">
              <Field label="Amount ($)">
                <TextInput type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </Field>
            </div>
            <div className="md:col-span-1">
              <Field label="Paid by">
                <Select value={paidBy} onChange={(e) => setPaidBy(Number(e.target.value))}>
                  {peopleOptions.map((p) => (
                    <option key={p} value={p}>Person {p + 1}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="md:col-span-1">
              <Field label="People">
                <Select value={people} onChange={(e) => setPeople(Number(e.target.value))}>
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex items-end md:col-span-1">
              <Button onClick={addExpense} className="w-full">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Expenses ({expenses.length})</h3>
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400">No expenses yet — add the first shared bill.</p>
            ) : (
              <ul className="space-y-2">
                {expenses.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{e.label}</p>
                      <p className="text-[11px] text-slate-400">Paid by Person {e.paidBy + 1}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">${money(e.amount)}</span>
                    <button onClick={() => remove(e.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Settlement</h3>
              <span className="text-xs font-bold text-slate-500">Total {money(result.total)}</span>
            </div>
            <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase text-primary-500">Fair share per person</p>
              <p className="text-xl font-extrabold text-primary-800">{money(result.share)}</p>
            </div>
            <div className="space-y-2">
              {result.persons.map((p) => (
                <div key={p.name} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${p.net > 0 ? 'border-emerald-200 bg-emerald-50' : p.net < 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm">{p.name.slice(-1)}</div>
                  <p className="flex-1 text-sm font-semibold text-slate-800">{p.name}</p>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">Paid {money(p.paid)}</p>
                    <p className={`text-sm font-bold ${p.net > 0 ? 'text-emerald-600' : p.net < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                      {p.net > 0 ? `gets ${money(p.net)}` : p.net < 0 ? `owes ${money(Math.abs(p.net))}` : 'settled'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {result.total > 0 && (
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <ArrowRightLeft className="h-3.5 w-3.5" /> Higher numbers below zero owe their positive-share housemates.
              </p>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}