import { useMemo, useState } from 'react'
import { SprayCan, CheckCircle2, Circle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { percent } from '../../../lib/numbers'

type Task = { name: string }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TASKS: Task[] = [
  { name: 'Vacuum floors' },
  { name: 'Wipe counters' },
  { name: 'Clean bathroom' },
  { name: 'Take out trash' },
  { name: 'Dust shelves' },
  { name: 'Mop kitchen' },
  { name: 'Wash bedding' },
]

export default function CleaningSchedule() {
  const [checks, setChecks] = useState<Record<string, boolean>>({})

  const toggle = (task: string, day: string) =>
    setChecks((prev) => ({ ...prev, [`${task}::${day}`]: !prev[`${task}::${day}`] }))

  const stats = useMemo(() => {
    const total = DAYS.length * TASKS.length
    const done = Object.values(checks).filter(Boolean).length
    const perDay = DAYS.map((d) => ({
      day: d,
      done: TASKS.filter((t) => checks[`${t.name}::${d}`]).length,
      total: TASKS.length,
      pct: percent((TASKS.filter((t) => checks[`${t.name}::${d}`]).length / TASKS.length) * 100),
    }))
    const perTask = TASKS.map((t) => ({
      task: t.name,
      done: DAYS.filter((d) => checks[`${t.name}::${d}`]).length,
    }))
    return { total, done, pct: percent(total ? (done / total) * 100 : 0), perDay, perTask }
  }, [checks])

  return (
    <>
      <Seo
        title="Cleaning Schedule - vimz Tools"
        description="Build a rotating cleaning schedule for each room in the home."
      />
      <ToolShell
        title="Cleaning Schedule"
        description="Build a rotating cleaning schedule for each room in the home."
        icon={<SprayCan className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Assign cleaning tasks to weekdays and check them off."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Week progress</h3>
            <span className="text-xs font-bold text-primary-600">{stats.pct}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className="h-2.5 rounded-full bg-primary-500" style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.perDay.map((d) => (
              <span key={d.day} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${d.done === d.total ? 'bg-emerald-100 text-emerald-700' : d.done > 0 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'}`}>
                {d.day}: {d.done}/{d.total}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Weekly grid</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-3 text-[11px] uppercase tracking-wide text-slate-400">Task</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-2 py-2 text-center text-[11px] uppercase tracking-wide text-slate-400">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.perTask.map((r) => (
                <tr key={r.task} className="border-b border-slate-100">
                  <td className="py-2.5 pr-3 font-semibold text-slate-800">{r.task}</td>
                  {DAYS.map((day) => {
                    const on = !!checks[`${r.task}::${day}`]
                    return (
                      <td key={day} className="px-2 py-2.5 text-center">
                        <button onClick={() => toggle(r.task, day)} aria-label={`${r.task} ${day}`}>
                          {on ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" /> : <Circle className="mx-auto h-5 w-5 text-slate-300 hover:text-slate-400" />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </ToolShell>
    </>
  )
}