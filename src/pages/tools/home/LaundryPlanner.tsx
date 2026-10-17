import { useMemo, useState } from 'react'
import { Shirt, Droplets } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Load = { id: string; name: string; color: string; cycle: string; day: string }
const DAYS = ['Skip', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CYCLES = ['Normal', 'Delicates', 'Quick', 'Hot', 'Cold', 'Heavy duty']

const COLORS: Record<string, string> = {
  sky: 'border-sky-200 bg-sky-50',
  slate: 'border-slate-200 bg-slate-50',
  violet: 'border-violet-200 bg-violet-50',
  amber: 'border-amber-200 bg-amber-50',
  teal: 'border-teal-200 bg-teal-50',
  rose: 'border-rose-200 bg-rose-50',
}

export default function LaundryPlanner() {
  const [loads, setLoads] = useState<Load[]>([
    { id: uid(), name: 'Whites', color: 'sky', cycle: 'Hot', day: 'Mon' },
    { id: uid(), name: 'Darks', color: 'slate', cycle: 'Cold', day: 'Wed' },
    { id: uid(), name: 'Delicates', color: 'violet', cycle: 'Delicates', day: 'Fri' },
    { id: uid(), name: 'Towels', color: 'amber', cycle: 'Normal', day: 'Sat' },
    { id: uid(), name: 'Bedding', color: 'teal', cycle: 'Heavy duty', day: 'Sun' },
    { id: uid(), name: 'Colors', color: 'rose', cycle: 'Normal', day: 'Thu' },
  ])

  const setField = (id: string, field: 'cycle' | 'day', value: string) =>
    setLoads((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)))

  const weekLoads = useMemo(() => loads.filter((l) => l.day !== 'Skip').length, [loads])
  const byDay = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of DAYS.slice(1)) map[d] = loads.filter((l) => l.day === d).length
    return map
  }, [loads])

  return (
    <>
      <Seo
        title="Laundry Planner - vimz Tools"
        description="Plan laundry loads, wash cycles and folding routine."
      />
      <ToolShell
        title="Laundry Planner"
        description="Plan laundry loads, wash cycles and folding routine."
        icon={<Shirt className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Plan loads by color and cycle to keep laundry manageable."
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800">Weekly loads</h3>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
            {DAYS.slice(1).map((d) => (
              <span key={d} className="flex flex-col items-center rounded-xl bg-slate-50 px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase text-slate-400">{d}</span>
                <span className={`text-sm font-extrabold ${byDay[d] ? 'text-primary-700' : 'text-slate-300'}`}>{byDay[d]}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loads.map((l) => (
            <section key={l.id} className={`rounded-2xl border p-5 ${COLORS[l.color] ?? COLORS.slate}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Shirt className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">{l.name}</h4>
                  <p className="text-[11px] text-slate-500">{l.day === 'Skip' ? 'Paused this week' : `Scheduled ${l.day}`}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Cycle</p>
                  <Select value={l.cycle} onChange={(e) => setField(l.id, 'cycle', e.target.value)} className="py-2 text-xs">
                    {CYCLES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Day</p>
                  <Select value={l.day} onChange={(e) => setField(l.id, 'day', e.target.value)} className="py-2 text-xs">
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </section>
          ))}
        </div>

        {weekLoads > 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4">
            <Droplets className="h-5 w-5 shrink-0 text-sky-600" />
            <p className="text-sm font-medium text-sky-800">
              {weekLoads} loads planned this week — {weekLoads > 5 ? 'keep the machine humming.' : 'you have room for an extra load if needed.'}
            </p>
          </div>
        )}
      </ToolShell>
    </>
  )
}