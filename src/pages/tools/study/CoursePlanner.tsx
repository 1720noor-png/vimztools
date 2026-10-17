import { useMemo, useState } from 'react'
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, toNumber, uid } from '../../../lib/numbers'

type Status = 'planned' | 'active' | 'done'
type Course = { id: string; name: string; credits: string; goal: string; status: Status }

const GOALS = ['A', 'B', 'C', 'Pass']
const STATUSES: Status[] = ['planned', 'active', 'done']
const STATUS_STYLE: Record<Status, string> = {
  planned: 'bg-slate-100 text-slate-500',
  active: 'bg-blue-100 text-blue-700',
  done: 'bg-emerald-100 text-emerald-700',
}

export default function CoursePlanner() {
  const [courses, setCourses] = useState<Course[]>([])
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')
  const [goal, setGoal] = useState('A')
  const [target, setTarget] = useState('30')

  const result = useMemo(() => {
    const creditsOf = (s: Status) =>
      courses.filter((c) => c.status === s).reduce((n, c) => {
        const v = toNumber(c.credits)
        return n + (Number.isFinite(v) && v > 0 ? v : 0)
      }, 0)
    const doneCredits = creditsOf('done')
    const plannedCredits = creditsOf('planned')
    const activeCredits = creditsOf('active')
    const total = doneCredits + plannedCredits + activeCredits
    const t = toNumber(target)
    const pct = t > 0 ? clamp((doneCredits / t) * 100, 0, 100) : 0
    return { doneCredits, plannedCredits, activeCredits, total, t, pct }
  }, [courses, target])

  const add = () => {
    if (!name.trim()) return
    setCourses((p) => [...p, { id: uid(), name: name.trim(), credits, goal, status: 'planned' }])
    setName('')
    setCredits('')
  }

  const update = (id: string, patch: Partial<Course>) => setCourses((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const remove = (id: string) => setCourses((p) => p.filter((c) => c.id !== id))

  return (
    <>
      <Seo title="Course Planner - vimz Tools" description="Map out courses, credits and goals for the term." />
      <ToolShell
        title="Course Planner"
        description="Map out courses, credits and goals for the term."
        icon={<BookOpen className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="List your courses and track credits toward your goal."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a course</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Course name">
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Organic Chemistry" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Credits">
                    <TextInput type="number" min={0} step={1} value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="e.g. 4" />
                  </Field>
                  <Field label="Goal grade">
                    <Select value={goal} onChange={(e) => setGoal(e.target.value)}>
                      {GOALS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Button onClick={add}>
                  <Plus className="h-4 w-4" /> Add course
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800">Target credits</h3>
                <div className="w-24">
                  <TextInput type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} className="py-1.5 text-center" />
                </div>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${result.pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {result.doneCredits} completed of {result.t} credits ({Math.round(result.pct)}%)
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 p-2">
                  <p className="text-lg font-extrabold text-emerald-600">{result.doneCredits}</p>
                  <p className="text-[10px] font-semibold text-emerald-500">Done</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2">
                  <p className="text-lg font-extrabold text-blue-600">{result.activeCredits}</p>
                  <p className="text-[10px] font-semibold text-blue-500">In progress</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="text-lg font-extrabold text-slate-600">{result.plannedCredits}</p>
                  <p className="text-[10px] font-semibold text-slate-400">Planned</p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-3 lg:col-span-3">
            {courses.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
                No courses yet — add one on the left.
              </p>
            ) : (
              courses.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${STATUS_STYLE[c.status]} text-sm font-extrabold`}>
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{c.name}</p>
                    <p className="text-[11px] text-slate-400">Goal {c.goal} · {c.credits || 0} credits</p>
                  </div>
                  <div className="w-24">
                    <Select value={c.goal} onChange={(e) => update(c.id, { goal: e.target.value })} className="py-1.5">
                      {GOALS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex rounded-lg bg-slate-100 p-0.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => update(c.id, { status: s })}
                        className={`rounded-md px-2 py-1 text-[10px] font-bold ${c.status === s ? STATUS_STYLE[s] : 'text-slate-400'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => remove(c.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}