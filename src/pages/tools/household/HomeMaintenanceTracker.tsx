import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, ClipboardCheck, Pencil, Plus, Trash2, WifiOff, Wrench } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import HybridLoader from '../../../components/ui/HybridLoader'
import { toNumber } from '../../../lib/numbers'
import {
  createMaintenanceAsset,
  deleteMaintenanceAsset,
  listMaintenanceAssets,
  updateMaintenanceAsset,
  type MaintenanceAsset,
} from '../../../lib/householdApi'

const CATEGORY_ENTRIES: [string, string][] = [
  ['ac_filter', 'AC filter'],
  ['air_purifier', 'Air purifier filter'],
  ['water_purifier', 'Water purifier filter'],
  ['fridge_water_line', 'Fridge water line'],
  ['smoke_detector', 'Smoke detector battery'],
  ['co_detector', 'CO detector'],
  ['water_heater', 'Water heater'],
  ['dryer_vent', 'Dryer vent'],
  ['exhaust_fan', 'Exhaust fan'],
  ['washing_machine', 'Washing machine'],
  ['dishwasher', 'Dishwasher'],
  ['carpet', 'Carpet'],
  ['mattress', 'Mattress'],
  ['septic', 'Septic'],
  ['gutters', 'Gutters'],
  ['other', 'Other'],
]

const todayISO = () => new Date().toISOString().slice(0, 10)

const addMonths = (iso: string, months: number): string | null => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  d.setMonth(d.getMonth() + months)
  return d.toISOString()
}

const seedDemo = (): MaintenanceAsset[] => {
  const seed = todayISO()
  return [
    { id: -1, name: 'AC filter', category: 'ac_filter', interval_months: 3, last_serviced_at: seed, next_due_at: addMonths(seed, 3), notes: null, updated_at: null },
    { id: -2, name: 'RO sediment filter', category: 'water_purifier', interval_months: 6, last_serviced_at: seed, next_due_at: addMonths(seed, 6), notes: null, updated_at: null },
    { id: -3, name: 'Smoke detector battery', category: 'smoke_detector', interval_months: 12, last_serviced_at: seed, next_due_at: addMonths(seed, 12), notes: null, updated_at: null },
  ]
}

const labelOf = (cat: string) => CATEGORY_ENTRIES.find(([k]) => k === cat)?.[1] ?? cat

const fmtIso = (iso: string | null) => (iso ? iso.slice(0, 10) : '—')

export default function HomeMaintenanceTracker() {
  const [items, setItems] = useState<MaintenanceAsset[]>([])
  const [editing, setEditing] = useState<MaintenanceAsset | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [offline, setOffline] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('ac_filter')
  const [intervalMonths, setIntervalMonths] = useState('')
  const [lastServiced, setLastServiced] = useState('')
  const [notes, setNotes] = useState('')
  const nextLocalId = useRef(-1000)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await listMaintenanceAssets()
        if (!cancelled) setItems(rows)
      } catch {
        if (!cancelled) {
          setOffline(true)
          setItems(seedDemo())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const buildLocal = (
    itemName: string,
    itemCategory: string,
    itemInterval: number,
    itemLast: string | null,
    itemNotes: string | null,
  ): MaintenanceAsset => ({
    id: nextLocalId.current--,
    name: itemName,
    category: itemCategory,
    interval_months: itemInterval,
    last_serviced_at: itemLast,
    next_due_at: itemLast ? addMonths(itemLast, itemInterval) : null,
    notes: itemNotes,
    updated_at: null,
  })

  const statusOf = (item: MaintenanceAsset): { label: string; badgeCls: string } => {
    if (!item.next_due_at) return { label: 'Due soon', badgeCls: 'bg-amber-100 text-amber-700' }
    const next = new Date(item.next_due_at)
    if (Number.isNaN(next.getTime())) return { label: 'Due soon', badgeCls: 'bg-amber-100 text-amber-700' }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffDays = (next.getTime() - today.getTime()) / 86400000
    if (diffDays < 0) return { label: 'Overdue', badgeCls: 'bg-rose-100 text-rose-700' }
    if (diffDays <= 14) return { label: 'Due soon', badgeCls: 'bg-amber-100 text-amber-700' }
    return { label: 'OK', badgeCls: 'bg-emerald-100 text-emerald-700' }
  }

  const overdue = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return items.filter((i) => i.next_due_at && new Date(i.next_due_at) < today).length
  }, [items])

  const upcoming = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const future = items
      .filter((i) => i.next_due_at && !Number.isNaN(new Date(i.next_due_at).getTime()))
      .filter((i) => new Date(i.next_due_at as string).getTime() >= today.getTime())
      .sort((a, b) => new Date(a.next_due_at as string).getTime() - new Date(b.next_due_at as string).getTime())
    return future[0] ?? null
  }, [items])

  const resetForm = () => {
    setEditing(null)
    setName('')
    setCategory('ac_filter')
    setIntervalMonths('')
    setLastServiced('')
    setNotes('')
  }

  const startEdit = (item: MaintenanceAsset) => {
    setEditing(item)
    setName(item.name)
    setCategory(item.category)
    setIntervalMonths(String(item.interval_months))
    setLastServiced(item.last_serviced_at ? item.last_serviced_at.slice(0, 10) : '')
    setNotes(item.notes ?? '')
  }

  const save = async () => {
    if (!name.trim()) return
    setBusy(true)
    const parsed = toNumber(intervalMonths)
    const payload = {
      name: name.trim(),
      category,
      interval_months: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
      last_serviced_at: lastServiced || null,
      notes: notes.trim() || null,
    }
    let savedOnline = false
    if (!offline) {
      try {
        if (editing) {
          const saved = await updateMaintenanceAsset(editing.id, payload)
          setItems((prev) => prev.map((i) => (i.id === editing.id ? saved : i)))
        } else {
          const created = await createMaintenanceAsset(payload)
          setItems((prev) => [...prev, created])
        }
        savedOnline = true
      } catch {
        setOffline(true)
      }
    }
    if (!savedOnline) {
      if (editing) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editing.id
              ? {
                  ...i,
                  ...payload,
                  next_due_at: payload.last_serviced_at
                    ? addMonths(payload.last_serviced_at, payload.interval_months)
                    : null,
                }
              : i,
          ),
        )
      } else {
        setItems((prev) => [
          ...prev,
          buildLocal(payload.name, payload.category, payload.interval_months, payload.last_serviced_at, payload.notes),
        ])
      }
    }
    setBusy(false)
    resetForm()
  }

  const remove = async (id: number) => {
    if (!window.confirm('Remove this maintenance item?')) return
    setBusy(true)
    if (!offline) {
      try {
        await deleteMaintenanceAsset(id)
      } catch {
        setOffline(true)
      }
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
    setBusy(false)
  }

  const addSuggestions = () => {
    const recs = [
      { name: 'AC filter', category: 'ac_filter', interval_months: 3 },
      { name: 'Water purifier sediment filter', category: 'water_purifier', interval_months: 6 },
      { name: 'Smoke detector battery', category: 'smoke_detector', interval_months: 12 },
      { name: 'Water heater', category: 'water_heater', interval_months: 24 },
    ]
    const missing = recs.filter((r) => !items.some((i) => i.category === r.category))
    if (missing.length === 0) return
    setItems((prev) => [
      ...prev,
      ...missing.map((r) => buildLocal(r.name, r.category, r.interval_months, null, null)),
    ])
  }

  return (
    <>
      <Seo
        title="Home Maintenance Tracker - vimz Tools"
        description="Track recurring home maintenance chores and know what is due next."
      />
      <ToolShell
        title="Home Maintenance Tracker"
        description="Track recurring home maintenance chores and know what is due next."
        icon={<ClipboardCheck className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Log filters, batteries and appliances so nothing slips past the due date."
      >
        {offline && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <WifiOff className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Offline mode: the live tracker is unreachable, so changes are saved locally in this session only.
            </p>
          </div>
        )}

        {loading ? (
          <HybridLoader />
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Total items</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{items.length}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-rose-500">Overdue</p>
                <p className="mt-1 text-2xl font-extrabold text-rose-700">{overdue}</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-sky-500">Next upcoming</p>
                {upcoming ? (
                  <>
                    <p className="mt-1 flex items-center justify-center gap-1.5 text-lg font-extrabold text-sky-800">
                      <CalendarClock className="h-4 w-4" /> {upcoming.name}
                    </p>
                    <p className="text-[11px] text-sky-600">due {fmtIso(upcoming.next_due_at)}</p>
                  </>
                ) : (
                  <p className="mt-1 text-2xl font-extrabold text-sky-800">—</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Wrench className="h-4 w-4 text-slate-400" /> Your maintenance list
                  </h3>
                  <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={addSuggestions} disabled={busy}>
                    <Plus className="h-3.5 w-3.5" /> Add suggestions
                  </Button>
                </div>
                <ul className="space-y-2.5">
                  {items.map((i) => {
                    const status = statusOf(i)
                    return (
                      <li key={i.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{i.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {labelOf(i.category)} · every {i.interval_months} month{i.interval_months === 1 ? '' : 's'}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status.badgeCls}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <span className="text-slate-400">Last serviced · </span>
                            <span className="font-semibold text-slate-600">{fmtIso(i.last_serviced_at)}</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <span className="text-slate-400">Next due · </span>
                            <span className="font-semibold text-slate-600">{fmtIso(i.next_due_at)}</span>
                          </div>
                        </div>
                        {i.notes && <p className="mt-2 text-xs text-slate-500">{i.notes}</p>}
                        <div className="mt-3 flex gap-2">
                          <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => startEdit(i)} disabled={busy}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => remove(i.id)} disabled={busy}>
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                  {items.length === 0 && (
                    <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                      No items yet - add one on the right, or load the suggested list.
                    </li>
                  )}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">{editing ? 'Edit item' : 'Add item'}</h3>
                  {editing && (
                    <Button variant="ghost" className="px-2 py-1 text-xs" onClick={resetForm} disabled={busy}>
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <Field label="Name">
                    <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AC filter" />
                  </Field>
                  <Field label="Category">
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {CATEGORY_ENTRIES.map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Interval (months)">
                    <TextInput type="number" min={1} value={intervalMonths} onChange={(e) => setIntervalMonths(e.target.value)} placeholder="e.g. 6" />
                  </Field>
                  <Field label="Last serviced">
                    <TextInput type="date" value={lastServiced} onChange={(e) => setLastServiced(e.target.value)} />
                  </Field>
                  <Field label="Notes">
                    <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional reminder" />
                  </Field>
                  <Button className="w-full" onClick={save} disabled={busy}>
                    <Plus className="h-4 w-4" /> {busy ? 'Saving…' : editing ? 'Save changes' : 'Add item'}
                  </Button>
                </div>
              </section>
            </div>
          </>
        )}
      </ToolShell>
    </>
  )
}