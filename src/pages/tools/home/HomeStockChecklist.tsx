import { useMemo, useState } from 'react'
import { Package, CheckCircle2, Circle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Stock = { id: string; name: string; target: number; status: 'well' | 'low' | 'out'; checked: boolean }
type Status = Stock['status']

const SEED: Stock[] = [
  { id: uid(), name: 'AA & AAA batteries', target: 8, status: 'well', checked: false },
  { id: uid(), name: 'First-aid kit supplies', target: 1, status: 'well', checked: false },
  { id: uid(), name: 'Medication backups', target: 1, status: 'low', checked: false },
  { id: uid(), name: 'Candles', target: 6, status: 'well', checked: false },
  { id: uid(), name: 'Matches / lighters', target: 3, status: 'low', checked: false },
  { id: uid(), name: 'Bottled water', target: 24, status: 'out', checked: false },
  { id: uid(), name: 'Flashlights', target: 3, status: 'well', checked: false },
  { id: uid(), name: 'Emergency blankets', target: 2, status: 'out', checked: false },
  { id: uid(), name: 'Canned food staples', target: 12, status: 'low', checked: false },
  { id: uid(), name: 'Duct tape & tools', target: 2, status: 'well', checked: false },
]

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  well: { label: 'Stocked', cls: 'bg-emerald-100 text-emerald-700' },
  low: { label: 'Running low', cls: 'bg-amber-100 text-amber-700' },
  out: { label: 'Out', cls: 'bg-rose-100 text-rose-700' },
}

export default function HomeStockChecklist() {
  const [stocks, setStocks] = useState<Stock[]>(SEED)

  const setStatus = (id: string, status: Status) =>
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  const toggle = (id: string) => setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)))

  const low = useMemo(() => stocks.filter((s) => s.status !== 'well'), [stocks])
  const done = useMemo(() => stocks.filter((s) => s.checked).length, [stocks])

  return (
    <>
      <Seo
        title="Home Stock Checklist - vimz Tools"
        description="Keep essential household supplies stocked and ready."
      />
      <ToolShell
        title="Home Stock Checklist"
        description="Keep essential household supplies stocked and ready."
        icon={<Package className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Keep essentials stocked by tracking what's running low."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Essentials ({done}/{stocks.length})</h3>
              <Button
                variant="ghost"
                className="px-2 py-1 text-xs"
                onClick={() => setStocks((prev) => prev.map((s) => ({ ...s, checked: false })))}
              >
                Reset
              </Button>
            </div>
            <ul className="space-y-2">
              {stocks.map((s) => {
                const needsReorder = s.status === 'out' || s.status === 'low'
                return (
                  <li key={s.id} className={`rounded-xl border px-3 py-2.5 ${needsReorder ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <button onClick={() => toggle(s.id)} aria-label="Toggle">
                        {s.checked ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                      </button>
                      <p className={`min-w-0 flex-1 text-sm ${s.checked ? 'text-slate-400 line-through' : 'font-semibold text-slate-800'}`}>{s.name}</p>
                      <Select value={s.status} onChange={(e) => setStatus(s.id, e.target.value as Status)} className="w-32 py-1.5 text-xs">
                        <option value="well">Stocked</option>
                        <option value="low">Running low</option>
                        <option value="out">Out</option>
                      </Select>
                      {needsReorder && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          Reorder ~{s.target}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-rose-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-rose-700">Needs restocking</h3>
              {low.length === 0 ? (
                <p className="text-xs text-slate-400">Everything is stocked.</p>
              ) : (
                <ul className="space-y-2">
                  {low.map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2">
                      <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                      <span className="text-xs font-bold text-rose-600">rebuy {s.target}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                {low.map((s) => (
                  <span key={s.id} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_META[s.status].cls}`}>
                    {STATUS_META[s.status].label}
                  </span>
                ))}
                {low.length === 0 && <p className="text-xs text-slate-400">No status badges.</p>}
              </div>
              <p className="text-xs text-slate-500">Tick items once the reorder is done to keep the checklist current.</p>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}