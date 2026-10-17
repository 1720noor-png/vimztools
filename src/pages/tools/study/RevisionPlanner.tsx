import { useMemo, useState } from 'react'
import { CalendarCheck, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, uid } from '../../../lib/numbers'

type Diff = 'high' | 'med' | 'low'
type Topic = { id: string; name: string; diff: Diff }

const DAYS = [7, 6, 5, 4, 3, 2, 1, 0]
const INTERVAL: Record<Diff, number> = { high: 1, med: 2, low: 3 }
const DIFF_STYLE: Record<Diff, string> = { high: 'bg-rose-100 text-rose-600', med: 'bg-amber-100 text-amber-700', low: 'bg-emerald-100 text-emerald-700' }

export default function RevisionPlanner() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [name, setName] = useState('')
  const [diff, setDiff] = useState<Diff>('med')
  const [done, setDone] = useState<Record<string, number[]>>({})

  const stats = useMemo(() => {
    let totalSlots = 0
    let doneSlots = 0
    topics.forEach((t) => {
      DAYS.filter((d) => d % INTERVAL[t.diff] === 0).forEach((d) => {
        totalSlots += 1
        if (done[t.id]?.includes(d)) doneSlots += 1
      })
    })
    return { totalSlots, doneSlots, pct: totalSlots ? Math.round((doneSlots / totalSlots) * 100) : 0 }
  }, [topics, done])

  const add = () => {
    if (!name.trim()) return
    setTopics((p) => [...p, { id: uid(), name: name.trim(), diff }])
    setName('')
  }

  const toggle = (tid: string, day: number) =>
    setDone((p) => {
      const cur = p[tid] ?? []
      return { ...p, [tid]: cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day] }
    })

  const remove = (tid: string) => {
    setTopics((p) => p.filter((t) => t.id !== tid))
    setDone((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== tid)))
  }

  const covPct = Math.round(clamp(stats.pct, 0, 100))
  const topCount = DAYS.length - 1

  return (
    <>
      <Seo title="Revision Planner - vimz Tools" description="Plan revision sessions across topics before your exams." />
      <ToolShell
        title="Revision Planner"
        description="Plan revision sessions across topics before exams."
        icon={<CalendarCheck className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Spread revision across topics and days before the exam."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a topic</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Topic">
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Calculus" />
                </Field>
                <Field label="Difficulty">
                  <Select value={diff} onChange={(e) => setDiff(e.target.value as Diff)}>
                    <option value="high">High — every day</option>
                    <option value="med">Medium — every 2 days</option>
                    <option value="low">Low — every 3 days</option>
                  </Select>
                </Field>
                <Button onClick={add}>
                  <Plus className="h-4 w-4" /> Add topic
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Coverage</h3>
                <span className="text-xs font-bold text-primary-600">{covPct}%</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-primary-500 transition-all" style={{ width: `${covPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{stats.doneSlots} of {stats.totalSlots} planned sessions done</p>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-4">
            {topics.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">
                Add topics to build your revision grid.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <div className="grid grid-cols-[160px_repeat(8,1fr)_44px] items-center gap-1">
                    <span className="px-2 py-2 text-xs font-bold text-slate-500">Topic</span>
                    {DAYS.map((d) => (
                      <span key={d} className="py-2 text-center text-[11px] font-bold text-slate-500">
                        {d === 0 ? 'Exam' : `D-${d}`}
                      </span>
                    ))}
                    <span />
                  </div>

                  <div className="mt-3 space-y-2">
                    {topics.map((t) => (
                      <div key={t.id} className="grid grid-cols-[160px_repeat(8,1fr)_44px] items-center gap-1 rounded-xl border border-slate-100 px-2 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-slate-700">{t.name}</span>
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${DIFF_STYLE[t.diff]}`}>{t.diff}</span>
                        </div>
                        {DAYS.map((d) => {
                          const scheduled = d % INTERVAL[t.diff] === 0
                          const isDone = done[t.id]?.includes(d)
                          return (
                            <div key={d} className="flex items-center justify-center">
                              {scheduled ? (
                                <button
                                  onClick={() => toggle(t.id, d)}
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${isDone ? 'bg-primary-500 text-white' : 'border border-slate-200 text-slate-300 hover:border-primary-400 hover:text-primary-400'}`}
                                  aria-label={`Toggle D-${d}`}
                                >
                                  {isDone && <CheckCircle2 className="h-4 w-4" />}
                                </button>
                              ) : (
                                <span className="h-8 w-8 rounded-lg border border-dashed border-slate-100" />
                              )}
                            </div>
                          )
                        })}
                        <div className="pr-1 text-right">
                          <button onClick={() => remove(t.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove topic">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-center text-[11px] text-slate-400">
                    {'Guide: '}high-difficulty topics get a session every day, medium every 2 days, low every 3 days ({topCount} teaching days before the exam day).
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}