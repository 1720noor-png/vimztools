import { useMemo, useState } from 'react'
import { Award, CalendarDays, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

const STEPS = ['Essay drafted', 'Transcript requested', 'References lined up', 'Application form filled', 'Submit & confirm']

type Step = { id: string; label: string; done: boolean }
type Schol = { id: string; name: string; deadline: string; steps: Step[] }

export default function ScholarshipChecklist() {
  const [scholars, setScholars] = useState<Schol[]>([])
  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')

  const stats = useMemo(() => {
    let total = 0
    let doneCount = 0
    scholars.forEach((s) =>
      s.steps.forEach((st) => {
        total += 1
        if (st.done) doneCount += 1
      }),
    )
    return { total, doneCount, pct: total ? Math.round((doneCount / total) * 100) : 0 }
  }, [scholars])

  const add = () => {
    if (!name.trim()) return
    setScholars((p) => [...p, { id: uid(), name: name.trim(), deadline, steps: STEPS.map((label) => ({ id: uid(), label, done: false })) }])
    setName('')
    setDeadline('')
  }

  const toggle = (sid: string, stepId: string) =>
    setScholars((p) => p.map((s) => (s.id === sid ? { ...s, steps: s.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st)) } : s)))

  const remove = (id: string) => setScholars((p) => p.filter((s) => s.id !== id))

  return (
    <>
      <Seo title="Scholarship Checklist - vimz Tools" description="Track documents and deadlines for scholarship applications." />
      <ToolShell
        title="Scholarship Checklist"
        description="Track application steps for scholarships and grants."
        icon={<Award className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Track every document and deadline for your applications."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">New application</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Scholarship name">
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Merit Award 2026" />
                </Field>
                <Field label="Deadline">
                  <TextInput type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </Field>
                <Button onClick={add}>
                  <Plus className="h-4 w-4" /> Add application
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Overall progress</h3>
                <span className="text-xs font-bold text-primary-600">{stats.pct}%</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-amber-500 transition-all" style={{ width: `${stats.pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{stats.doneCount} of {stats.total} steps complete</p>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
            {scholars.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400 sm:col-span-2">
                Add a scholarship to build its checklist.
              </p>
            ) : (
              scholars.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-bold text-slate-800">{s.name}</h4>
                      {s.deadline && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <CalendarDays className="h-3 w-3" /> due {s.deadline}
                        </p>
                      )}
                    </div>
                    <button onClick={() => remove(s.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <ul className="space-y-1.5">
                      {s.steps.map((st) => (
                        <li key={st.id}>
                          <button onClick={() => toggle(s.id, st.id)} className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-slate-50">
                            {st.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
                            <span className={`text-sm ${st.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{st.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-right text-[11px] font-bold text-slate-400">
                      {s.steps.filter((st) => st.done).length}/{s.steps.length} done
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}