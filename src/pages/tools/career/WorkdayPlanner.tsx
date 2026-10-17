import { useMemo, useState } from 'react'
import { CalendarClock, Coffee, Sun, Briefcase, Users, Utensils, CircleDot } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fmtHours } from '../../../lib/numbers'

type Block = 'Free' | 'Focus' | 'Meeting' | 'Admin' | 'Break' | 'Lunch'

const TYPES: Block[] = ['Free', 'Focus', 'Meeting', 'Admin', 'Break', 'Lunch']
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8)

const STYLE: Record<Block, string> = {
  Free: 'border-slate-200 bg-slate-50 text-slate-400',
  Focus: 'border-primary-300 bg-primary-100 text-primary-800',
  Meeting: 'border-amber-300 bg-amber-100 text-amber-800',
  Admin: 'border-sky-300 bg-sky-100 text-sky-800',
  Break: 'border-emerald-300 bg-emerald-100 text-emerald-800',
  Lunch: 'border-rose-300 bg-rose-100 text-rose-800',
}

const ICON: Record<Block, typeof Sun> = {
  Free: CircleDot,
  Focus: Sun,
  Meeting: Users,
  Admin: Briefcase,
  Break: Coffee,
  Lunch: Utensils,
}

export default function WorkdayPlanner() {
  const [slots, setSlots] = useState<Block[]>(Array(HOURS.length).fill('Free'))
  const [day, setDay] = useState('Today')

  const setSlot = (i: number, b: Block) => setSlots((p) => p.map((x, idx) => (idx === i ? b : x)))

  const result = useMemo(() => {
    const counts = TYPES.map((t) => ({ type: t, count: slots.filter((s) => s === t).length }))
    const focus = counts.find((c) => c.type === 'Focus')?.count ?? 0
    const filled = slots.filter((s) => s !== 'Free').length
    return { counts, focus, total: slots.length, filled }
  }, [slots])

  return (
    <>
      <Seo title="Workday Planner - vimz Tools" description="Plan your day hour by hour with focus blocks." />
      <ToolShell
        title="Workday Planner"
        description="Plan your day hour by hour with focus blocks."
        icon={<CalendarClock className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Schedule your day hour-by-hour with focus blocks."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Hour grid</h3>
              <div className="flex items-center gap-2 text-sm">
                <Select value={day} onChange={(e) => setDay(e.target.value)} className="w-40">
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Custom">Custom week</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              {HOURS.map((h, i) => (
                <div key={h} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-right text-xs font-bold tabular-nums text-slate-400">
                    {h.toString().padStart(2, '0')}:00
                  </span>
                  <Select
                    value={slots[i]}
                    onChange={(e) => setSlot(i, e.target.value as Block)}
                    className={`border-0 py-2 ${STYLE[slots[i]]}`}
                  >
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    {(() => {
                      const SlotIcon = ICON[slots[i]]
                      return <SlotIcon className="h-3.5 w-3.5" />
                    })()}{' '}
                    {slots[i]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <Sun className="mx-auto mb-2 h-7 w-7 text-primary-600" />
              <p className="text-[11px] font-semibold uppercase text-primary-500">Total focus time</p>
              <p className="mt-1 text-5xl font-extrabold text-primary-800">{fmtHours(result.focus * 60)}</p>
              <p className="mt-2 text-xs text-primary-500">{result.focus} of {result.total} hour slots</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-4 text-sm font-bold text-slate-800">Day breakdown</h4>
              <div className="mb-4 flex h-6 w-full overflow-hidden rounded-xl bg-slate-100">
                {result.counts.map((c) =>
                  c.count > 0 ? (
                    <div
                      key={c.type}
                      className="h-6 border-r border-white first:rounded-l-xl last:rounded-r-xl"
                      style={{
                        width: `${(c.count / result.total) * 100}%`,
                        backgroundColor: STYLE[c.type].includes('primary') ? '#dbeafe' : c.type === 'Meeting' ? '#fde68a' : c.type === 'Admin' ? '#bae6fd' : c.type === 'Break' ? '#a7f3d0' : c.type === 'Lunch' ? '#fecaca' : '#f1f5f9',
                      }}
                      title={c.type}
                    />
                  ) : null,
                )}
              </div>
              <div className="space-y-2">
                {result.counts.map((c) => {
                  const Icon = ICON[c.type]
                  return (
                    <div key={c.type} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Icon className="h-4 w-4" /> {c.type}
                      </span>
                      <span className="font-bold text-slate-800">{fmtHours(c.count * 60)}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-2 text-sm font-bold text-slate-800">Balance check</h4>
              <p className="text-sm leading-relaxed text-slate-600">
                {result.focus >= 4
                  ? 'Strong focus plan — remember to protect the blocks from interruptions.'
                  : result.focus === 0
                    ? 'No focus time yet. Aim for at least two deep-work blocks.'
                    : 'Add a couple more focus blocks to hit a productive baseline.'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}