import { useMemo, useState } from 'react'
import { CalendarDays, Plus, Trash, Plane } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { percent, sum, toNumber, uid } from '../../../lib/numbers'

type Used = { id: string; type: string; days: string }

export default function LeaveBalanceCalculator() {
  const [annual, setAnnual] = useState('25')
  const [used, setUsed] = useState<Used[]>([])
  const [draft, setDraft] = useState({ type: 'Vacation', days: '' })

  const add = () => {
    const d = toNumber(draft.days)
    if (!Number.isFinite(d) || d <= 0 || !draft.type.trim()) return
    setUsed((p) => [...p, { id: uid(), type: draft.type.trim(), days: draft.days }])
    setDraft({ type: 'Vacation', days: '' })
  }
  const remove = (id: string) => setUsed((p) => p.filter((x) => x.id !== id))

  const result = useMemo(() => {
    const entitlement = toNumber(annual)
    const rows = used
      .filter((u) => Number.isFinite(toNumber(u.days)))
      .map((u) => ({ ...u, value: toNumber(u.days) }))
    const usedDays = sum(rows.map((r) => r.value))
    const remaining = Number.isFinite(entitlement) ? entitlement - usedDays : 0
    const pct = Number.isFinite(entitlement) && entitlement > 0 ? (usedDays / entitlement) * 100 : 0
    const byType: Record<string, number> = {}
    rows.forEach((r) => { byType[r.type] = (byType[r.type] ?? 0) + r.value })
    return { entitlement, rows, usedDays, remaining, pct, byType }
  }, [annual, used])

  const daysLeft = Math.max(0, result.remaining)

  return (
    <>
      <Seo title="Leave Balance Calculator - vimz Tools" description="Calculate remaining annual leave after time off." />
      <ToolShell
        title="Leave Balance Calculator"
        description="Calculate remaining annual leave after time off."
        icon={<CalendarDays className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Enter your annual days and used days for your balance."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Entitlement</h3>
              <Field label="Annual leave days">
                <TextInput type="number" min={0} value={annual} onChange={(e) => setAnnual(e.target.value)} />
              </Field>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Days used</h3>
              <div className="mb-3 grid grid-cols-[1fr_90px_auto] gap-2">
                <TextInput value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} placeholder="Type" />
                <TextInput type="number" min={0} value={draft.days} onChange={(e) => setDraft({ ...draft, days: e.target.value })} placeholder="Days" />
                <Button onClick={add}><Plus className="h-4 w-4" /></Button>
              </div>
              {used.length === 0 ? (
                <p className="text-xs text-slate-400">No time off logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {used.map((u) => (
                    <div key={u.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
                      <span className="flex-1 text-sm font-semibold text-slate-700">{u.type}</span>
                      <span className="text-sm font-bold text-slate-800">{toNumber(u.days)}d</span>
                      <button onClick={() => remove(u.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <CalendarDays className="mx-auto mb-2 h-5 w-5 text-sky-500" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Annual</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{Number.isFinite(result.entitlement) ? result.entitlement : '—'} days</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
                <Plane className="mx-auto mb-2 h-5 w-5 text-rose-500" />
                <p className="text-[11px] font-semibold uppercase text-rose-400">Used</p>
                <p className="mt-1 text-2xl font-extrabold text-rose-600">{result.usedDays} days</p>
              </div>
              <div className={`rounded-2xl border p-5 text-center ${daysLeft <= 3 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <p className="text-[11px] font-semibold uppercase text-slate-400">Remaining</p>
                <p className={`mt-1 text-2xl font-extrabold ${daysLeft <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>{daysLeft} days</p>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Usage breakdown</h3>
                <span className="text-xs font-bold text-slate-500">{percent(result.pct, 0)} of year used</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full transition-all ${result.pct >= 90 ? 'bg-rose-500' : result.pct >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, result.pct)}%` }}
                />
              </div>
              {Object.keys(result.byType).length > 0 && (
                <div className="mt-5 space-y-3">
                  {Object.entries(result.byType).map(([type, d]) => {
                    const share = result.usedDays > 0 ? (d / result.usedDays) * 100 : 0
                    return (
                      <div key={type}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-semibold text-slate-700">{type}</span>
                          <span className="text-xs font-bold text-slate-500">{d}d · {percent(share, 0)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-primary-500" style={{ width: `${share}%` }} />
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