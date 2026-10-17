import { useMemo, useState } from 'react'
import { SquareCheck, Plus, Trash, Check } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, TextInput, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { percent, uid } from '../../../lib/numbers'

type Priority = 'High' | 'Medium' | 'Low'
type Task = { id: string; title: string; priority: Priority; due: string; done: boolean }

const ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 }

export default function WorkTaskPlanner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [draft, setDraft] = useState({ title: '', priority: 'Medium' as Priority, due: '' })

  const add = () => {
    if (!draft.title.trim()) return
    setTasks((p) => [...p, { id: uid(), title: draft.title.trim(), priority: draft.priority, due: draft.due, done: false }])
    setDraft({ title: '', priority: 'Medium', due: '' })
  }
  const toggle = (id: string) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id: string) => setTasks((p) => p.filter((t) => t.id !== id))

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      return ORDER[a.priority] - ORDER[b.priority]
    })
  }, [tasks])

  const progress = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.done).length
    return { total, done, pct: total ? (done / total) * 100 : 0 }
  }, [tasks])

  const badge: Record<Priority, string> = {
    High: 'bg-rose-100 text-rose-600',
    Medium: 'bg-amber-100 text-amber-600',
    Low: 'bg-sky-100 text-sky-600',
  }

  return (
    <>
      <Seo title="Work Task Planner - vimz Tools" description="Prioritize and schedule daily work tasks." />
      <ToolShell
        title="Work Task Planner"
        description="Prioritize and schedule daily work tasks."
        icon={<SquareCheck className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Prioritize today's tasks and set deadlines."
      >
        <section className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_150px_160px_auto]">
          <TextInput
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') add() }}
            placeholder="Add today's task…"
          />
          <Select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}>
            <option value="High">High priority</option>
            <option value="Medium">Medium priority</option>
            <option value="Low">Low priority</option>
          </Select>
          <TextInput type="time" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
          <Button onClick={add}><Plus className="h-4 w-4" /> Add task</Button>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Today's tasks ({progress.done}/{progress.total} done)</h3>
            {sorted.length === 0 ? (
              <p className="text-xs text-slate-400">No tasks yet — add your first one above.</p>
            ) : (
              <div className="space-y-2">
                {sorted.map((t) => (
                  <div key={t.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${t.done ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
                    <button
                      onClick={() => toggle(t.id)}
                      aria-label="Toggle done"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-primary-400'}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <span className={`flex-1 text-sm font-semibold ${t.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.title}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge[t.priority]}`}>{t.priority}</span>
                    <span className="hidden w-14 text-right text-xs text-slate-400 sm:block">{t.due || '—'}</span>
                    <button onClick={() => remove(t.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <SquareCheck className="mx-auto mb-2 h-7 w-7 text-primary-600" />
              <p className="text-[11px] font-semibold uppercase text-primary-500">Completion</p>
              <p className="mt-1 text-5xl font-extrabold text-primary-800">{percent(progress.pct, 0)}</p>
              <div className="mt-4 h-3 rounded-full bg-white">
                <div className="h-3 rounded-full bg-primary-500 transition-all" style={{ width: `${progress.pct}%` }} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-3 text-sm font-bold text-slate-800">By priority</h4>
              <div className="space-y-3">
                {(['High', 'Medium', 'Low'] as Priority[]).map((p) => {
                  const all = tasks.filter((t) => t.priority === p)
                  const done = all.filter((t) => t.done).length
                  const pct = all.length ? (done / all.length) * 100 : 0
                  return (
                    <div key={p}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className={`font-semibold ${badge[p]}`}>{p}</span>
                        <span className="text-slate-400">{done}/{all.length}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-primary-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-2 text-sm font-bold text-slate-800">Tip</h4>
              <p className="text-sm leading-relaxed text-slate-600">
                Knock out the {tasks.filter((t) => t.priority === 'High' && !t.done).length || 0} open high-priority
                task{tasks.filter((t) => t.priority === 'High' && !t.done).length === 1 ? '' : 's'} first thing in the morning.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}