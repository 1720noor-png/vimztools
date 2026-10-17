import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Brush, CalendarClock, CheckCircle2, Clock, PenLine } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import HybridLoader from '../../../components/ui/HybridLoader'
import {
  createHygieneTool,
  deleteHygieneTool,
  FALLBACK_BRUSH_TYPES,
  getBrushTypes,
  listHygieneTools,
  updateHygieneTool,
  type BrushType,
  type HygieneTool,
} from '../../../lib/beautyApi'

type ToolStatus = { label: string; Icon: typeof AlertTriangle; badgeCls: string }

const DAY_MS = 86400000

const dayStart = (): Date => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const addDaysIso = (iso: string, days: number): string | null => {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

const fmtDate = (iso: string | null): string => (iso ? iso.slice(0, 10) : '—')

const prettyType = (t: string): string => t.replace(/-/g, ' ')

const statusOf = (t: HygieneTool): ToolStatus => {
  if (!t.next_due_at) return { label: 'Due soon', Icon: Clock, badgeCls: 'bg-amber-100 text-amber-700' }
  const next = new Date(t.next_due_at)
  if (Number.isNaN(next.getTime())) return { label: 'Due soon', Icon: Clock, badgeCls: 'bg-amber-100 text-amber-700' }
  const diff = Math.floor((next.getTime() - dayStart().getTime()) / DAY_MS)
  if (diff < 0) return { label: 'Overdue', Icon: AlertTriangle, badgeCls: 'bg-rose-100 text-rose-700' }
  if (diff <= 3) return { label: 'Due soon', Icon: Clock, badgeCls: 'bg-amber-100 text-amber-700' }
  return { label: 'OK', Icon: CheckCircle2, badgeCls: 'bg-emerald-100 text-emerald-700' }
}

export default function BrushSanitationTracker() {
  const [types, setTypes] = useState<BrushType[]>([])
  const [tools, setTools] = useState<HygieneTool[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [offline, setOffline] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [toolType, setToolType] = useState('')
  const [lastCleaned, setLastCleaned] = useState('')
  const [notes, setNotes] = useState('')
  const nextLocalId = useRef(-1)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getBrushTypes()
        if (!cancelled) setTypes(rows)
      } catch {
        if (!cancelled) setTypes(FALLBACK_BRUSH_TYPES)
      }
      try {
        const rows = await listHygieneTools()
        if (!cancelled) setTools(rows)
      } catch {
        if (!cancelled) {
          setOffline(true)
          setTools([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const daysFor = (t: string): number => types.find((x) => x.tool_type === t)?.recommended_days ?? 7

  const overdue = useMemo(() => tools.filter((t) => statusOf(t).label === 'Overdue').length, [tools])
  const dueSoon = useMemo(() => tools.filter((t) => statusOf(t).label === 'Due soon').length, [tools])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setToolType('')
    setLastCleaned('')
    setNotes('')
  }

  const startEdit = (t: HygieneTool) => {
    setEditingId(t.id)
    setName(t.name)
    setToolType(t.tool_type)
    setLastCleaned(t.last_cleaned_at ? t.last_cleaned_at.slice(0, 10) : '')
    setNotes(t.notes ?? '')
  }

  const save = async () => {
    if (!name.trim() || !toolType) return
    setBusy(true)
    const payload = {
      name: name.trim(),
      tool_type: toolType,
      last_cleaned_at: lastCleaned || null,
      notes: notes.trim() || null,
    }
    let savedOnline = false
    if (!offline) {
      try {
        if (editingId !== null) {
          const saved = await updateHygieneTool(editingId, payload)
          setTools((prev) => prev.map((t) => (t.id === editingId ? saved : t)))
        } else {
          const created = await createHygieneTool(payload)
          setTools((prev) => [...prev, created])
        }
        savedOnline = true
      } catch {
        setOffline(true)
      }
    }
    if (!savedOnline) {
      const nextDue = payload.last_cleaned_at ? addDaysIso(payload.last_cleaned_at, daysFor(payload.tool_type)) : null
      if (editingId !== null) {
        setTools((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...payload, next_due_at: nextDue } : t)),
        )
      } else {
        setTools((prev) => [...prev, { id: nextLocalId.current--, ...payload, next_due_at: nextDue }])
      }
    }
    setBusy(false)
    resetForm()
  }

  const remove = async (id: number) => {
    if (!window.confirm('Remove this tool from the schedule?')) return
    setBusy(true)
    if (!offline) {
      try {
        await deleteHygieneTool(id)
      } catch {
        setOffline(true)
      }
    }
    setTools((prev) => prev.filter((t) => t.id !== id))
    setBusy(false)
  }

  return (
    <>
      <Seo
        title="Brush Sanitation Tracker - vimz Tools"
        description="Track how often your makeup brushes and tools were last cleaned."
      />
      <ToolShell
        title="Brush Sanitation Tracker"
        description="Track how often your makeup brushes and tools were last cleaned."
        icon={<Brush className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Log when each brush was cleaned so nothing goes past its due date."
      >
        {offline && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Offline mode: the live brush database is unreachable, so the schedule is empty and only built-in tool
              types are shown.
            </p>
          </div>
        )}

        {loading ? (
          <HybridLoader />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <Brush className="mx-auto mb-1 h-5 w-5 text-slate-400" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Tracked tools</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{tools.length}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-rose-600" />
                <p className="text-[11px] font-semibold uppercase text-rose-500">Overdue</p>
                <p className="mt-1 text-2xl font-extrabold text-rose-700">{overdue}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                <Clock className="mx-auto mb-1 h-5 w-5 text-amber-600" />
                <p className="text-[11px] font-semibold uppercase text-amber-500">Due in 3 days</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-700">{dueSoon}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Brush className="h-4 w-4 text-primary-600" /> {editingId !== null ? 'Edit tool' : 'Add a tool'}
                  </h3>
                  {editingId !== null && (
                    <Button variant="ghost" className="px-2 py-1 text-xs" onClick={resetForm} disabled={busy}>
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <Field label="Name">
                    <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beauty sponge" />
                  </Field>
                  <Field label="Tool type">
                    <Select value={toolType} onChange={(e) => setToolType(e.target.value)}>
                      <option value="">Pick a type</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.tool_type}>
                          {prettyType(t.tool_type)} · clean every {t.recommended_days} days
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Last cleaned">
                    <TextInput type="date" value={lastCleaned} onChange={(e) => setLastCleaned(e.target.value)} />
                  </Field>
                  <Field label="Notes">
                    <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional reminder" />
                  </Field>
                  <Button className="w-full" onClick={save} disabled={busy}>
                    {busy ? 'Saving…' : editingId !== null ? 'Save changes' : 'Add tool'}
                  </Button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <CalendarClock className="h-4 w-4 text-primary-600" /> Cleaning schedule
                </h3>
                {tools.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                    No tools tracked yet. Add one with the form.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {tools.map((t) => {
                      const status = statusOf(t)
                      return (
                        <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-40">
                              <p className="text-sm font-bold text-slate-800">{t.name}</p>
                              <p className="text-[11px] text-slate-400">{prettyType(t.tool_type)}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.badgeCls}`}>
                              <status.Icon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                            <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                              <span className="text-slate-400">Last cleaned · </span>
                              <span className="font-semibold text-slate-600">{fmtDate(t.last_cleaned_at)}</span>
                            </div>
                            <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                              <span className="text-slate-400">Next due · </span>
                              <span className="font-semibold text-slate-600">{fmtDate(t.next_due_at)}</span>
                            </div>
                          </div>
                          {t.notes && <p className="mt-2 text-xs text-slate-500">{t.notes}</p>}
                          <div className="mt-3 flex gap-2">
                            <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => startEdit(t)} disabled={busy}>
                              <PenLine className="h-3.5 w-3.5" /> Edit
                            </Button>
                            <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => remove(t.id)} disabled={busy}>
                              Delete
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </ToolShell>
    </>
  )
}