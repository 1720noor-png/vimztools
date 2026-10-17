import { useMemo, useState } from 'react'
import { CircleDollarSign, Plus, Trash2, Wallet } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, money, percent, toNumber, uid } from '../../../lib/numbers'

type Spend = { id: string; label: string; amount: number }

export default function DailyBudget() {
  const [limit, setLimit] = useState('60')
  const [spends, setSpends] = useState<Spend[]>([])
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')

  const addSpend = () => {
    const amt = toNumber(amount)
    if (!label.trim() || !Number.isFinite(amt) || amt <= 0) return
    setSpends((p) => [...p, { id: uid(), label: label.trim(), amount: amt }])
    setLabel('')
    setAmount('')
  }

  const remove = (id: string) => setSpends((p) => p.filter((s) => s.id !== id))

  const summary = useMemo(() => {
    const limitAmt = toNumber(limit)
    const spent = spends.reduce((s, x) => s + x.amount, 0)
    const remaining = Number.isFinite(limitAmt) ? limitAmt - spent : 0
    const progress = Number.isFinite(limitAmt) && limitAmt > 0 ? clamp((spent / limitAmt) * 100, 0, 100) : 0
    return { limitAmt, spent, remaining, progress, over: Number.isFinite(limitAmt) && spent > limitAmt }
  }, [limit, spends])

  return (
    <>
      <Seo title="Daily Budget - vimz Tools" description="Set a daily spending limit and track how much is left." />
      <ToolShell
        title="Daily Budget"
        description="Set a daily spending limit and track how much is left."
        icon={<Wallet className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Set today's spending limit and log each purchase to see what's left."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Log a purchase</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="What did you buy?">
                  <TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Coffee" />
                </Field>
                <Field label="Amount ($)">
                  <TextInput type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </Field>
                <Button onClick={addSpend}>
                  <Plus className="h-4 w-4" /> Add purchase
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Spend log ({spends.length})</h3>
              {spends.length === 0 ? (
                <p className="text-xs text-slate-400">Nothing logged yet.</p>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {spends.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <CircleDollarSign className="h-3.5 w-3.5" />
                      </span>
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{s.label}</p>
                      <p className="text-sm font-bold text-rose-500">${money(s.amount)}</p>
                      <button onClick={() => remove(s.id)} aria-label="Remove" className="rounded-md p-1 text-slate-300 transition hover:text-rose-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-800">Today's status</h3>
              <Field label="">
                <div className="flex items-center gap-2">
                  <TextInput type="number" min={0} value={limit} onChange={(e) => setLimit(e.target.value)} className="w-24" />
                  <span className="text-xs font-semibold uppercase text-slate-400">limit</span>
                </div>
              </Field>
            </div>
            <div className={`mt-5 rounded-2xl border p-6 text-center ${summary.over ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{summary.over ? 'Over budget by' : "Left to spend"}</p>
              <p className={`mt-1 text-5xl font-extrabold ${summary.over ? 'text-rose-600' : 'text-emerald-700'}`}>${money(Math.abs(summary.remaining))}</p>
              <p className="mt-1 text-xs text-slate-400">Spent ${money(summary.spent)} of ${money(summary.limitAmt)}</p>
            </div>
            <div className="mt-4">
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full transition-all ${summary.over ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${summary.progress}%` }} />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>$0</span>
                <span>{percent(summary.progress)} spent</span>
                <span>${money(summary.limitAmt)}</span>
              </div>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}