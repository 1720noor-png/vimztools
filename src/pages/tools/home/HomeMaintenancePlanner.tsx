import { useState } from 'react'
import { Wrench, CheckCircle2, Circle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Task = { id: string; season: string; name: string; dueMonth: string; done: boolean }
type Season = { name: string; accent: string; chip: string; tasks: string[] }

const SEASONS: Season[] = [
  { name: 'Winter', accent: 'border-sky-200 bg-sky-50', chip: 'text-sky-600', tasks: ['Check furnace filter', 'Insulate exposed pipes', 'Seal window drafts', 'Service heating system', 'Prevent ice dams'] },
  { name: 'Spring', accent: 'border-emerald-200 bg-emerald-50', chip: 'text-emerald-600', tasks: ['Clear gutters and downspouts', 'Service air conditioning', 'Inspect roof for damage', 'Pressure-wash siding', 'Aerate the lawn'] },
  { name: 'Summer', accent: 'border-amber-200 bg-amber-50', chip: 'text-amber-600', tasks: ['Trim trees near the house', 'Check sprinkler system', 'Clean dryer vent', 'Touch up exterior paint', 'Service lawn mower'] },
  { name: 'Fall', accent: 'border-orange-200 bg-orange-50', chip: 'text-orange-600', tasks: ['Rake and compost leaves', 'Winterize outdoor hoses', 'Check attic insulation', 'Test smoke alarms', 'Schedule chimney sweep'] },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const seedTasks = (): Task[] =>
  SEASONS.flatMap((s) => s.tasks.map((name) => ({ id: uid(), season: s.name, name, dueMonth: MONTHS[new Date().getMonth()], done: false })))

export default function HomeMaintenancePlanner() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks)

  const toggle = (id: string) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const setMonth = (id: string, month: string) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueMonth: month } : t)))

  const seasonStats = (season: string) => {
    const list = tasks.filter((t) => t.season === season)
    const done = list.filter((t) => t.done).length
    return { total: list.length, done }
  }

  return (
    <>
      <Seo
        title="Home Maintenance Planner - vimz Tools"
        description="Schedule seasonal home upkeep tasks so nothing gets forgotten."
      />
      <ToolShell
        title="Home Maintenance Planner"
        description="Schedule seasonal home upkeep tasks so nothing gets forgotten."
        icon={<Wrench className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Schedule seasonal upkeep tasks around the year."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SEASONS.map((s) => {
            const stats = seasonStats(s.name)
            return (
              <section key={s.name} className={`rounded-2xl border p-5 ${s.accent}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={`text-base font-extrabold ${s.chip}`}>{s.name}</h3>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
                    {stats.done}/{stats.total} done
                  </span>
                </div>
                <ul className="space-y-2">
                  {tasks
                    .filter((t) => t.season === s.name)
                    .map((t) => (
                      <li key={t.id} className={`rounded-xl border px-3 py-2.5 ${t.done ? 'border-slate-100 bg-white/70' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggle(t.id)} aria-label="Toggle">
                            {t.done ? <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" /> : <Circle className="h-4.5 w-4.5 shrink-0 text-slate-300" />}
                          </button>
                          <p className={`flex-1 text-sm ${t.done ? 'text-slate-400 line-through' : 'font-semibold text-slate-800'}`}>{t.name}</p>
                          <Select value={t.dueMonth} onChange={(e) => setMonth(t.id, e.target.value)} className="w-24 py-1.5 text-xs">
                            {MONTHS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </Select>
                        </div>
                      </li>
                    ))}
                </ul>
              </section>
            )
          })}
        </div>
      </ToolShell>
    </>
  )
}