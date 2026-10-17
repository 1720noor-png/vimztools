import { useMemo, useState } from 'react'
import { CalendarRange, Layers, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['7–9', '9–11', '11–13', '14–16', '16–18', '19–21']
const CHIPS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
]

type Subject = { id: string; name: string }

export default function StudyPlanner() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'math', name: 'Math' },
    { id: 'lang', name: 'Language' },
    { id: 'sci', name: 'Science' },
  ])
  const [subjectName, setSubjectName] = useState('')
  const [assign, setAssign] = useState<Record<string, string>>({})

  const key = (day: string, slot: number) => `${day}:${slot}`

  const addSubject = () => {
    if (!subjectName.trim()) return
    setSubjects((p) => [...p, { id: uid(), name: subjectName.trim() }])
    setSubjectName('')
  }

  const removeSubject = (id: string) => {
    setSubjects((p) => p.filter((s) => s.id !== id))
    setAssign((p) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== id)))
  }

  const totals = useMemo(() => {
    const map: Record<string, number> = {}
    let count = 0
    DAYS.forEach((d) =>
      SLOTS.forEach((_, i) => {
        const sid = assign[key(d, i)]
        if (sid) {
          map[sid] = (map[sid] || 0) + 1
          count += 1
        }
      }),
    )
    return { map, count }
  }, [assign])

  const maxCount = Math.max(1, ...Object.values(totals.map))
  const idxOf = (sid: string) => {
    const i = subjects.findIndex((s) => s.id === sid)
    return i >= 0 ? i % CHIPS.length : 0
  }

  return (
    <>
      <Seo title="Study Planner - vimz Tools" description="Build a balanced weekly study schedule by subject." />
      <ToolShell
        title="Study Planner"
        description="Build a balanced weekly study schedule by subject."
        icon={<CalendarRange className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Block out study time by subject across the week."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a subject</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Subject name">
                  <TextInput value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Biology" />
                </Field>
                <Button onClick={addSubject}>
                  <Plus className="h-4 w-4" /> Add subject
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Layers className="h-4 w-4 text-primary-600" /> Hours per subject
              </h3>
              <p className="mb-3 text-[11px] text-slate-400">{totals.count} of {DAYS.length * SLOTS.length} slots filled · each slot = 2 h</p>
              {subjects.length === 0 ? (
                <p className="text-xs text-slate-400">No subjects yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {subjects.map((s) => {
                    const n = totals.map[s.id] || 0
                    return (
                      <div key={s.id}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-bold ${CHIPS[idxOf(s.id)]}`}>
                            {s.name}
                            <span className="opacity-70">{n * 2}h</span>
                          </span>
                          <button onClick={() => removeSubject(s.id)} className="rounded-md p-0.5 text-slate-300 transition hover:text-rose-500" aria-label="Remove subject">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100">
                          <div className={`h-1.5 rounded-full ${CHIPS[idxOf(s.id)].split(' ')[1]}`} style={{ width: `${(n / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[72px_repeat(7,1fr)] gap-1">
                  <div />
                  {DAYS.map((d) => (
                    <div key={d} className="py-2 text-center text-xs font-bold text-slate-600">{d}</div>
                  ))}
                  {SLOTS.map((s, i) => (
                    <div key={s} className="contents">
                      <div className="flex items-center justify-center text-[11px] font-semibold text-slate-400">{s}</div>
                      {DAYS.map((d) => {
                        const k = key(d, i)
                        const sid = assign[k]
                        return (
                          <div key={k} className="p-0.5">
                            <Select
                              value={sid ?? ''}
                              onChange={(e) => setAssign((p) => ({ ...p, [k]: e.target.value }))}
                              className={`px-1 py-1.5 text-center text-xs ${sid ? `${CHIPS[idxOf(sid)]} border-transparent font-bold` : 'text-slate-400'}`}
                            >
                              <option value="">·</option>
                              {subjects.map((s2) => (
                                <option key={s2.id} value={s2.id}>{s2.name}</option>
                              ))}
                            </Select>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {subjects.map((s) => {
                    const n = totals.map[s.id] || 0
                    return (
                      <div key={s.id} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${CHIPS[idxOf(s.id)]}`}>
                        <span className="truncate text-sm font-bold">{s.name}</span>
                        <span className="text-xs font-bold opacity-80">{n * 2} h ({n} slots)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}