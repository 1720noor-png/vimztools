import { useMemo, useState } from 'react'
import { Refrigerator, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type FridgeItem = { id: string; name: string; zone: string; useBy: string }
const ZONES = ['Top shelf', 'Middle shelf', 'Drawers', 'Door'] as const

export default function FridgeInventory() {
  const [items, setItems] = useState<FridgeItem[]>([])
  const [name, setName] = useState('')
  const [zone, setZone] = useState<string>(ZONES[0])
  const [useBy, setUseBy] = useState('')
  const [nowMs] = useState(() => Date.now())

  const addItem = () => {
    if (!name.trim() || !useBy) return
    setItems((prev) => [...prev, { id: uid(), name: name.trim(), zone, useBy }])
    setName('')
    setUseBy('')
  }

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const byZone = useMemo(() => {
    const map: Record<string, FridgeItem[]> = {}
    for (const z of ZONES) map[z] = []
    items.forEach((i) => {
      if (map[i.zone]) map[i.zone].push(i)
    })
    return map
  }, [items])

  const daysLeft = (useBy: string): number => {
    const diff = new Date(useBy).getTime() - nowMs
    return Math.round(diff / (1000 * 60 * 60 * 24))
  }

  const badge = (useBy: string) => {
    const days = daysLeft(useBy)
    if (days < 0) return { label: 'Expired', cls: 'bg-rose-100 text-rose-700' }
    if (days <= 2) return { label: 'Use soon', cls: 'bg-amber-100 text-amber-700' }
    return { label: 'Fresh', cls: 'bg-emerald-100 text-emerald-700' }
  }

  const total = items.length
  const expiring = items.filter((i) => daysLeft(i.useBy) <= 2).length

  return (
    <>
      <Seo
        title="Fridge Inventory - vimz Tools"
        description="Log fridge contents, use-by dates and keep track of what is inside."
      />
      <ToolShell
        title="Fridge Inventory"
        description="Log fridge contents, use-by dates and keep track of what is inside."
        icon={<Refrigerator className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Keep a live list of fridge contents and their use-by dates."
      >
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Items logged</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-800">{total}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-amber-500">Expiring soon</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-700">{expiring}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add to fridge</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Item">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Greek yogurt" />
              </Field>
              <Field label="Shelf zone">
                <Select value={zone} onChange={(e) => setZone(e.target.value)}>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Use-by date">
                <TextInput type="date" value={useBy} onChange={(e) => setUseBy(e.target.value)} />
              </Field>
              <Button onClick={addItem} variant="primary">
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            {ZONES.map((z) => (
              <section key={z} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
                  {z}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{byZone[z].length}</span>
                </h4>
                {byZone[z].length === 0 ? (
                  <p className="text-xs text-slate-400">Empty zone.</p>
                ) : (
                  <ul className="space-y-2">
                    {byZone[z].map((i) => {
                      const b = badge(i.useBy)
                      return (
                        <li key={i.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                          <span className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{i.name}</p>
                            <p className="text-[11px] text-slate-400">Use by {i.useBy}</p>
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.cls}`}>{b.label}</span>
                          <button onClick={() => remove(i.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </ToolShell>
    </>
  )
}