import { useMemo, useState } from 'react'
import { Boxes, CheckCircle2, Circle, RotateCcw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { percent } from '../../../lib/numbers'

type Room = { id: string; name: string; items: string[] }
const ROOMS: Room[] = [
  { id: 'living', name: 'Living Room', items: ['Clear coffee table', 'Tidy bookshelves', 'Sort throws & pillows', 'File magazines', 'Dust electronics'] },
  { id: 'bedroom', name: 'Bedroom', items: ['Clear nightstands', 'Sort closet floor', 'Pare down hangers', 'Tidy dresser tops', 'Sort under-bed storage'] },
  { id: 'kitchen', name: 'Kitchen', items: ['Clear counters', 'Sort one pantry shelf', 'Tidy utensil drawer', 'Remove near-expired items', 'Wipe cabinet fronts'] },
  { id: 'bathroom', name: 'Bathroom', items: ['Clear vanity', 'Sort medicine cabinet', 'Toss expired products', 'Organize under sink', 'Fold fresh towels'] },
  { id: 'garage', name: 'Garage', items: ['Clear workbench', 'Sort hand tools', 'Recycle cardboard', 'Organize shelves', 'Plan trash haul'] },
]

export default function DeclutterChecklist() {
  const [checks, setChecks] = useState<Record<string, boolean>>({})

  const toggle = (room: string, item: string) =>
    setChecks((prev) => ({ ...prev, [`${room}::${item}`]: !prev[`${room}::${item}`] }))

  const stats = useMemo(() => {
    const total = ROOMS.reduce((acc, r) => acc + r.items.length, 0)
    const done = Object.values(checks).filter(Boolean).length
    const perRoom = ROOMS.map((r) => {
      const rTotal = r.items.length
      const rDone = r.items.filter((i) => checks[`${r.id}::${i}`]).length
      return { ...r, done: rDone, total: rTotal, pct: percent((rDone / rTotal) * 100) }
    })
    return { total, done, pct: percent(total ? (done / total) * 100 : 0), perRoom }
  }, [checks])

  const reset = () => setChecks({})

  return (
    <>
      <Seo
        title="Declutter Checklist - vimz Tools"
        description="Work through a room-by-room decluttering checklist."
      />
      <ToolShell
        title="Declutter Checklist"
        description="Work through a room-by-room decluttering checklist."
        icon={<Boxes className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Work through one room at a time and clear the clutter."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Overall progress</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary-600">{stats.done}/{stats.total}</span>
              <Button variant="ghost" onClick={reset} className="px-2 py-1 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className="h-2.5 rounded-full bg-primary-500" style={{ width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` }} />
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {stats.perRoom.map((r) => (
            <section key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">{r.name}</h4>
                <span className="text-xs font-bold text-slate-500">{r.pct}</span>
              </div>
              <div className="mb-4 h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${r.done === r.total ? 'bg-emerald-500' : 'bg-primary-500'}`} style={{ width: `${(r.done / r.total) * 100}%` }} />
              </div>
              <ul className="space-y-2">
                {r.items.map((item) => {
                  const on = !!checks[`${r.id}::${item}`]
                  return (
                    <li key={item}>
                      <button onClick={() => toggle(r.id, item)} className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${on ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                        {on ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
                        <span className={`text-sm ${on ? 'text-emerald-500 line-through' : 'text-slate-700'}`}>{item}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </ToolShell>
    </>
  )
}