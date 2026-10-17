import { useMemo, useState } from 'react'
import { Utensils, Plus, Trash2, PackageOpen } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { percent, toNumber, uid } from '../../../lib/numbers'

type StockItem = { id: string; name: string; category: string; qty: number; low: number }
const CATEGORIES = ['Grains', 'Oils & condiments', 'Spices', 'Dry goods']

export default function KitchenInventory() {
  const [items, setItems] = useState<StockItem[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [qty, setQty] = useState('1')
  const [low, setLow] = useState('2')

  const addItem = () => {
    const q = toNumber(qty)
    const l = toNumber(low)
    if (!name.trim() || Number.isNaN(q) || q < 0 || Number.isNaN(l) || l < 0) return
    setItems((prev) => [...prev, { id: uid(), name: name.trim(), category, qty: q, low: l }])
    setName('')
    setQty('1')
  }

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const rows = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const list = items.filter((i) => i.category === cat)
      const stocked = list.filter((i) => i.qty > i.low).length
      const total = list.reduce((a, i) => a + i.qty, 0)
      return { cat, list, stocked, total, pct: list.length ? percent((stocked / list.length) * 100) : '—' }
    })
  }, [items])

  const lowItems = useMemo(() => items.filter((i) => i.qty <= i.low), [items])
  const totalQty = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items])

  return (
    <>
      <Seo
        title="Kitchen Inventory - vimz Tools"
        description="Take stock of pantry, cabinets and cooking supplies."
      />
      <ToolShell
        title="Kitchen Inventory"
        description="Take stock of pantry, cabinets and cooking supplies."
        icon={<Utensils className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Track pantry and cabinet stock so you always know what you have."
      >
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <PackageOpen className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-[11px] font-semibold uppercase text-emerald-500">Total units</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-800">{totalQty}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-amber-500">Items logged</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-800">{items.length}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-rose-500">Running low</p>
            <p className="mt-1 text-2xl font-extrabold text-rose-700">{lowItems.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add stock</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Item">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Basmati rice" />
              </Field>
              <Field label="Category">
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity">
                  <TextInput type="number" step={0.5} min={0} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1" />
                </Field>
                <Field label="Low at">
                  <TextInput type="number" step={0.5} min={0} value={low} onChange={(e) => setLow(e.target.value)} placeholder="2" />
                </Field>
              </div>
              <Button onClick={addItem}>
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>
          </section>

          <section className="space-y-4 lg:col-span-2">
            {rows.map((r) => (
              <div key={r.cat} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">{r.cat}</h4>
                  <span className="text-xs font-semibold text-slate-500">
                    {r.list.length ? `${r.stocked}/${r.list.length} stocked` : 'No items'}
                  </span>
                </div>
                <div className="mb-4 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${r.list.length && r.stocked === r.list.length ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: r.list.length ? `${(r.stocked / r.list.length) * 100}%` : '0%' }}
                  />
                </div>
                {r.list.length === 0 ? (
                  <p className="text-xs text-slate-400">Nothing logged in this category yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {r.list.map((i) => (
                      <li key={i.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${i.qty <= i.low ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{i.name}</p>
                          <p className="text-[11px] text-slate-400">Low threshold: {i.low}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${i.qty <= i.low ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {i.qty <= i.low ? 'Low' : 'OK'} · {i.qty}
                        </span>
                        <button onClick={() => remove(i.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        </div>
      </ToolShell>
    </>
  )
}