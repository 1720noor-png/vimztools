import { useMemo, useState } from 'react'
import { Snowflake, Plus, Trash2, AlertTriangle, CalendarClock } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, toNumber, uid } from '../../../lib/numbers'

type FreezerItem = { id: string; name: string; qty: number; category: string; frozenDate: string }
const CATEGORIES = ['Meat', 'Seafood', 'Vegetables', 'Fruit', 'Prepped meals', 'Bread', 'Other']

const ageInMonths = (frozenDate: string, now: number) =>
  clamp(Math.round((now - new Date(frozenDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)), 0, 999)

export default function FreezerInventory() {
  const [items, setItems] = useState<FreezerItem[]>([])
  const [name, setName] = useState('')
  const [qty, setQty] = useState('1')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [threshold, setThreshold] = useState<number>(6)
  const [nowMs] = useState(() => Date.now())

  const addItem = () => {
    const n = toNumber(qty)
    if (!name.trim() || Number.isNaN(n) || n <= 0) return
    setItems((prev) => [
      ...prev,
      { id: uid(), name: name.trim(), qty: Math.round(n), category, frozenDate: new Date().toISOString().slice(0, 10) },
    ])
    setName('')
    setQty('1')
  }

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const stats = useMemo(() => {
    const totalQty = items.reduce((acc, i) => acc + i.qty, 0)
    let oldest: FreezerItem | null = null
    for (const item of items) {
      if (!oldest || item.frozenDate < oldest.frozenDate) oldest = item
    }
    const flagged = items.filter((i) => ageInMonths(i.frozenDate, nowMs) >= threshold)
    return { totalQty, oldest, flagged }
  }, [items, threshold, nowMs])

  return (
    <>
      <Seo
        title="Freezer Inventory - vimz Tools"
        description="Track frozen food stock, dates and quantities in one list."
      />
      <ToolShell
        title="Freezer Inventory"
        description="Track frozen food stock, dates and quantities in one list."
        icon={<Snowflake className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Log frozen items with dates so nothing gets forgotten in the deep freeze."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
            <Snowflake className="mx-auto mb-2 h-5 w-5 text-sky-600" />
            <p className="text-[11px] font-semibold uppercase text-sky-500">Total units</p>
            <p className="mt-1 text-2xl font-extrabold text-sky-800">{stats.totalQty}</p>
            <p className="text-[11px] text-sky-400">{items.length} entries</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-center">
            <CalendarClock className="mx-auto mb-2 h-5 w-5 text-indigo-600" />
            <p className="text-[11px] font-semibold uppercase text-indigo-500">Oldest item</p>
            <p className="mt-1 truncate text-lg font-extrabold text-indigo-800">{stats.oldest ? stats.oldest.name : '—'}</p>
            <p className="text-[11px] text-indigo-400">{stats.oldest ? `${ageInMonths(stats.oldest.frozenDate, nowMs)} mo in freezer` : 'Nothing logged'}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-amber-600" />
            <p className="text-[11px] font-semibold uppercase text-amber-500">Needs attention</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-800">{stats.flagged.length}</p>
            <p className="text-[11px] text-amber-400">over {threshold} months old</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add an item</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Item name">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ground beef" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity">
                  <TextInput type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1" />
                </Field>
                <Field label="Category">
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Warn after (months)">
                <Select value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}>
                  {[3, 6, 9, 12].map((m) => (
                    <option key={m} value={m}>{m} months</option>
                  ))}
                </Select>
              </Field>
              <Button onClick={addItem}>
                <Plus className="h-4 w-4" /> Add to freezer
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Inventory ({items.length})</h3>
            {items.length === 0 ? (
              <p className="text-xs text-slate-400">Nothing frozen yet — add your first item.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-3">Item</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Qty</th>
                      <th className="py-2 pr-3">Frozen</th>
                      <th className="py-2 pr-3">Age</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => {
                      const age = ageInMonths(i.frozenDate, nowMs)
                      const old = age >= threshold
                      return (
                        <tr key={i.id} className="border-b border-slate-100">
                          <td className="py-2.5 pr-3 font-semibold text-slate-800">{i.name}</td>
                          <td className="py-2.5 pr-3 text-xs text-slate-500">{i.category}</td>
                          <td className="py-2.5 pr-3 text-slate-600">{i.qty}</td>
                          <td className="py-2.5 pr-3 text-xs text-slate-500">{i.frozenDate}</td>
                          <td className="py-2.5 pr-3">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${old ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {old ? `${age} mo · flag` : `${age} mo`}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button onClick={() => remove(i.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}