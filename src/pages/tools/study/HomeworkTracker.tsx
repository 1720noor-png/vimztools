import { useMemo, useState } from 'react'
import { AlarmClockOff, CheckCircle2, Circle, ListTodo, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Task = { id: string; title: string; subject: string; due: string; done: boolean }

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function HomeworkTracker() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [due, setDue] = useState('')

  const today = dateKey(new Date())

  const progress = useMemo(() => {
    const done = tasks.filter((t) => t.done).length
    return { done, total: tasks.length, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 }
  }, [tasks])

  const overdue = tasks.filter((t) => !t.done && t.due && t.due < today)

  const add = () => {
    if (!title.trim()) return
    setTasks((p) => [...p, { id: uid(), title: title.trim(), subject: subject.trim(), due, done: false }])
    setTitle('')
    setSubject('')
    setDue('')
  }

  const toggle = (id: string) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id: string) => setTasks((p) => p.filter((t) => t.id !== id))

  return (
    <>
      <Seo title="Homework Tracker - vimz Tools" description="Log homework, due dates and completion status in one list." />
      <ToolShell
        title="Homework Tracker"
        description="Log homework, due dates and completion status."
        icon={<ListTodo className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Log homework, due dates and mark each one done."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Log homework</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Task">
                  <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 4 exercises" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Subject">
                    <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Math" />
                  </Field>
                  <Field label="Due date">
                    <TextInput type="date" value={due} onChange={(e) => setDue(e.target.value)} />
                  </Field>
                </div>
                <Button onClick={add}>
                  <Plus className="h-4 w-4" /> Add task
                </Button>
              </div>
            </section>

            {overdue.length > 0 && (
              <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-rose-600">
                  <AlarmClockOff className="h-4 w-4" /> {overdue.length} overdue task(s)
                </p>
                <ul className="space-y-1 text-sm text-rose-700">
                  {overdue.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{t.title}</span>
                      <span className="shrink-0 text-[10px] font-bold text-rose-400">due {t.due}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Completion</h3>
                <span className="text-xs font-bold text-primary-600">{progress.pct}%</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress.pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{progress.done} of {progress.total} done</p>
            </section>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {tasks.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
                No homework logged yet.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => !t.done)
                    .map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <button onClick={() => toggle(t.id)} className="shrink-0" aria-label="Mark done">
                          <Circle className="h-5 w-5 text-slate-300 transition hover:text-primary-500" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{t.title}</p>
                          <p className="text-[11px] text-slate-400">
                            <span className="mr-1 rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">{t.subject || 'General'}</span>
                            {t.due ? `due ${t.due}` : 'no due date'}
                          </p>
                        </div>
                        <button onClick={() => remove(t.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                </div>

                {tasks.some((t) => t.done) && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase text-slate-400">Completed</p>
                    <div className="space-y-2">
                      {tasks
                        .filter((t) => t.done)
                        .map((t) => (
                          <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <button onClick={() => toggle(t.id)} className="shrink-0" aria-label="Reopen">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </button>
                            <p className="min-w-0 flex-1 truncate text-sm text-slate-400 line-through">{t.title}</p>
                            <button onClick={() => remove(t.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}