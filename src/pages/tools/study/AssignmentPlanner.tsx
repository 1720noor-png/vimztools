import { useState, useMemo } from 'react'
import { ClipboardList, CalendarDays, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Step = { id: string; text: string; done: boolean }
type Assignment = { id: string; title: string; course: string; due: string; steps: Step[] }

function dayDiff(due: string, today: Date): number {
  const d = new Date(due + 'T23:59:59')
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

function StepAdder({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('')
  const submit = () => {
    if (!text.trim()) return
    onAdd(text.trim())
    setText('')
  }
  return (
    <div className="mt-2 flex gap-2">
      <TextInput
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a step…"
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
      />
      <Button variant="secondary" onClick={submit} aria-label="Add step">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function AssignmentPlanner() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('')
  const [due, setDue] = useState('')
  const [firstStep, setFirstStep] = useState('')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = useMemo(() => {
    const done = assignments.reduce((n, a) => n + a.steps.filter((s) => s.done).length, 0)
    const total = assignments.reduce((n, a) => n + a.steps.length, 0)
    return { done, total }
  }, [assignments])

  const addAssignment = () => {
    if (!title.trim() || !due) return
    setAssignments((p) => [
      ...p,
      { id: uid(), title: title.trim(), course: course.trim(), due, steps: [{ id: uid(), text: firstStep.trim() || 'Get started', done: false }] },
    ])
    setTitle('')
    setCourse('')
    setDue('')
    setFirstStep('')
  }

  const toggleStep = (aid: string, sid: string) =>
    setAssignments((p) =>
      p.map((a) => (a.id === aid ? { ...a, steps: a.steps.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)) } : a)),
    )

  const addStep = (aid: string, text: string) =>
    setAssignments((p) => p.map((a) => (a.id === aid ? { ...a, steps: [...a.steps, { id: uid(), text, done: false }] } : a)))

  const removeAssignment = (id: string) => setAssignments((p) => p.filter((a) => a.id !== id))

  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <>
      <Seo title="Assignment Planner - vimz Tools" description="Break assignments into steps with deadlines and reminders." />
      <ToolShell
        title="Assignment Planner"
        description="Break assignments into steps with deadlines and reminders."
        icon={<ClipboardList className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Break each assignment into steps with a deadline per step."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">New assignment</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Title">
                  <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. History essay" />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Course">
                    <TextInput value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. HIS101" />
                  </Field>
                  <Field label="Due date">
                    <TextInput type="date" value={due} onChange={(e) => setDue(e.target.value)} />
                  </Field>
                </div>
                <Field label="First step">
                  <TextInput value={firstStep} onChange={(e) => setFirstStep(e.target.value)} placeholder="e.g. Outline thesis" />
                </Field>
                <Button onClick={addAssignment}>
                  <Plus className="h-4 w-4" /> Add assignment
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Step progress</h3>
                <span className="text-xs font-bold text-primary-600">{pct}%</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{stats.done} of {stats.total} steps complete</p>
            </section>
          </div>

          <div className="space-y-4 lg:col-span-3">
            {assignments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
                No assignments yet — add one on the left.
              </p>
            ) : (
              assignments.map((a) => {
                const diff = dayDiff(a.due, today)
                const done = a.steps.filter((s) => s.done).length
                const status = diff < 0 ? 'overdue' : diff <= 3 ? 'soon' : 'ok'
                return (
                  <div
                    key={a.id}
                    className={`rounded-2xl border bg-white p-5 ${status === 'overdue' ? 'border-rose-200' : status === 'soon' ? 'border-amber-300' : 'border-slate-200'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-slate-800">{a.title}</h4>
                        <p className="text-xs text-slate-400">{a.course || 'General'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${status === 'overdue' ? 'bg-rose-100 text-rose-600' : status === 'soon' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                          <CalendarDays className="h-3 w-3" />
                          {status === 'overdue' ? `${Math.abs(diff)}d overdue` : diff === 0 ? 'Due today' : `${diff}d left`}
                        </span>
                        <button onClick={() => removeAssignment(a.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Steps</span>
                        <span className="font-bold text-slate-600">{done}/{a.steps.length}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {a.steps.map((s) => (
                          <li key={s.id}>
                            <button onClick={() => toggleStep(a.id, s.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50">
                              {s.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
                              <span className={`text-sm ${s.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{s.text}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <StepAdder onAdd={(text) => addStep(a.id, text)} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}