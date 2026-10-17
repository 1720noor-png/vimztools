import { useMemo, useState } from 'react'
import { AlertTriangle, Check, Circle, Plus, ReceiptText, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, money, toNumber, uid } from '../../../lib/numbers'

type Bill = { id: string; name: string; amount: number; dueDay: number; category: string; paid: boolean }

const CATEGORIES = ['Utilities', 'Housing', 'Subscriptions', 'Insurance', 'Loans', 'Other']
const today = new Date().getDate()

export default function BillTracker() {
  const [bills, setBills] = useState<Bill[]>([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [category, setCategory] = useState(CATEGORIES[0])

  const addBill = () => {
    const amt = toNumber(amount)
    if (!name.trim() || !Number.isFinite(amt) || amt <= 0) return
    const day = clamp(toNumber(dueDay) || 1, 1, 31)
    setBills((p) => [...p, { id: uid(), name: name.trim(), amount: amt, dueDay: day, category, paid: false }])
    setName('')
    setAmount('')
    setDueDay('1')
  }

  const togglePaid = (id: string) => setBills((p) => p.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)))
  const remove = (id: string) => setBills((p) => p.filter((b) => b.id !== id))

  const summary = useMemo(() => {
    const total = bills.reduce((s, b) => s + b.amount, 0)
    const paidTotal = bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0)
    const due = bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0)
    const overdue = bills.filter((b) => !b.paid && b.dueDay < today).length
    return { total, paidTotal, due, overdue }
  }, [bills])

  return (
    <>
      <Seo title="Bill Tracker - vimz Tools" description="Track monthly bills, due dates and paid status in one list." />
      <ToolShell
        title="Bill Tracker"
        description="Track monthly bills, due dates and paid status in one list."
        icon={<ReceiptText className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Add each bill, set its due day, and mark payments as paid."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a bill</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Bill name">
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricity" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount ($)">
                    <TextInput type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                  </Field>
                  <Field label="Due day">
                    <TextInput type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
                  </Field>
                </div>
                <Field label="Category">
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Button onClick={addBill}>
                  <Plus className="h-4 w-4" /> Add bill
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="text-slate-500">Total bills this month</span>
                  <span className="font-bold text-slate-800">${money(summary.total)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="text-slate-500">Paid so far</span>
                  <span className="font-bold text-emerald-600">${money(summary.paidTotal)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="text-slate-500">Still due</span>
                  <span className="font-bold text-rose-500">${money(summary.due)}</span>
                </div>
                {summary.overdue > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {summary.overdue} overdue {summary.overdue === 1 ? 'bill' : 'bills'}
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your bills ({bills.length})</h3>
            {bills.length === 0 ? (
              <p className="text-xs text-slate-400">No bills yet — add your first one.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="pb-2 font-semibold">Paid</th>
                      <th className="pb-2 font-semibold">Bill</th>
                      <th className="pb-2 font-semibold">Category</th>
                      <th className="pb-2 font-semibold">Due</th>
                      <th className="pb-2 text-right font-semibold">Amount</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => {
                      const isOverdue = !b.paid && b.dueDay < today
                      return (
                        <tr key={b.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3">
                            <button onClick={() => togglePaid(b.id)} aria-label="Toggle paid" className="text-slate-400 transition hover:text-emerald-600">
                              {b.paid ? <Check className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
                            </button>
                          </td>
                          <td className={`py-3 font-semibold ${b.paid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{b.name}</td>
                          <td className="py-3 text-xs text-slate-400">{b.category}</td>
                          <td className="py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                              {b.dueDay}
                            </span>
                          </td>
                          <td className={`py-3 text-right font-bold ${b.paid ? 'text-slate-300 line-through' : 'text-slate-800'}`}>${money(b.amount)}</td>
                          <td className="py-3 text-right">
                            <button onClick={() => remove(b.id)} aria-label="Remove" className="rounded-md p-1 text-slate-300 transition hover:text-rose-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="pt-3 font-extrabold text-slate-800" colSpan={4}>Total due</td>
                      <td className="pt-3 text-right font-extrabold text-rose-500">${money(summary.due)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}