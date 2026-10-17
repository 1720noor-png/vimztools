import { useMemo, useState } from 'react'
import { Target, Plus, Trash, Check } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { percent, uid } from '../../../lib/numbers'

type Milestone = { id: string; title: string; due: string; done: boolean }

export default function CareerGoalPlanner() {
  const [goal, setGoal] = useState('')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [draft, setDraft] = useState({ title: '', due: '' })
  const [targetDate, setTargetDate] = useState('')

  const add = () => {
    if (!draft.title.trim()) return
    setMilestones((p) => [...p, { id: uid(), title: draft.title.trim(), due: draft.due, done: false }])
    setDraft({ title: '', due: '' })
  }
  const toggle = (id: string) => setMilestones((p) => p.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))
  const remove = (id: string) => setMilestones((p) => p.filter((x) => x.id !== id))

  const result = useMemo(() => {
    const total = milestones.length
    const done = milestones.filter((m) => m.done).length
    const upcoming = milestones.filter((m) => !m.done).length
    return { total, done, upcoming, pct: total ? (done / total) * 100 : 0 }
  }, [milestones])

  return (
    <>
      <Seo title="Career Goal Planner - vimz Tools" description="Turn career ambitions into a step-by-step action plan." />
      <ToolShell
        title="Career Goal Planner"
        description="Turn career ambitions into a step-by-step action plan."
        icon={<Target className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Set one goal and break it into milestones with dates."
      >
        <section className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <Field label="Your career goal">
            <TextInput value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Land a senior frontend role this year" />
          </Field>
          <Field label="Target date">
            <TextInput type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </Field>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Milestones ({goal ? `toward “${goal}”` : 'add a goal above'})</h3>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
              <TextInput value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Milestone title" />
              <TextInput type="date" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
              <Button onClick={add}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            {milestones.length === 0 ? (
              <p className="text-xs text-slate-400">No milestones yet — plan the first step above.</p>
            ) : (
              <ol className="relative ml-3 space-y-3 border-l-2 border-slate-100 pl-5">
                {milestones.map((m) => (
                  <li key={m.id} className="relative">
                    <span className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 ${m.done ? 'border-emerald-500 bg-emerald-500' : 'border-primary-400 bg-white'}`} />
                    <div className={`rounded-xl border p-3 ${m.done ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggle(m.id)}
                          aria-label="Toggle done"
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${m.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-primary-400'}`}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <p className={`flex-1 text-sm font-semibold ${m.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{m.title}</p>
                        <span className="hidden text-xs text-slate-400 sm:block">{m.due || 'no date'}</span>
                        <button onClick={() => remove(m.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
              <Target className="mx-auto mb-2 h-6 w-6 text-primary-600" />
              <p className="text-[11px] font-semibold uppercase text-primary-500">Overall progress</p>
              <p className="mt-1 text-4xl font-extrabold text-primary-800">{percent(result.pct, 0)}</p>
              <p className="mt-1 text-xs text-primary-500">{result.done} of {result.total} milestones done</p>
              <div className="mt-4 h-3 rounded-full bg-white">
                <div className="h-3 rounded-full bg-primary-500 transition-all" style={{ width: `${result.pct}%` }} />
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="text-sm font-bold text-slate-800">Snapshot</h4>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Milestones</dt><dd className="font-bold text-slate-800">{result.total}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Done</dt><dd className="font-bold text-emerald-600">{result.done}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Upcoming</dt><dd className="font-bold text-slate-800">{result.upcoming}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Target date</dt><dd className="font-bold text-slate-800">{targetDate || '—'}</dd></div>
              </dl>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}