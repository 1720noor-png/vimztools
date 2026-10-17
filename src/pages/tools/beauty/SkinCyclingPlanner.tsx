import { useMemo, useState } from 'react'
import { CalendarCheck, Flower2, Leaf, Repeat, Sparkles, Sun } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, TextInput } from '../../../components/ui/Fields'

type PhaseKey = 'exfoliate' | 'retinoid' | 'recovery'

const PHASE: Record<PhaseKey, { label: string; desc: string; chip: string }> = {
  exfoliate: { label: 'Exfoliate', desc: 'AHA / BHA application', chip: 'bg-rose-100 text-rose-700' },
  retinoid: { label: 'Retinoid', desc: 'Retinol application', chip: 'bg-indigo-100 text-indigo-700' },
  recovery: { label: 'Recovery', desc: 'Wash plus moisturizer', chip: 'bg-emerald-100 text-emerald-700' },
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function fmtDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateInput(s: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
  return new Date(y, m - 1, d)
}

type DayCell = {
  date: Date
  index: number
  phase: PhaseKey
  sunday: boolean
  dateInput: string
}

export default function SkinCyclingPlanner() {
  const [startDate, setStartDate] = useState(() => fmtDateInput(new Date()))

  const cells = useMemo<DayCell[]>(() => {
    const base = parseDateInput(startDate) ?? new Date()
    return Array.from({ length: 28 }).map((_, i) => {
      const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
      const sunday = date.getDay() === 0
      const raw = i % 4
      const phase: PhaseKey = sunday ? 'recovery' : raw === 0 ? 'exfoliate' : raw === 1 ? 'retinoid' : 'recovery'
      return { date, index: i + 1, phase, sunday, dateInput: fmtDateInput(date) }
    })
  }, [startDate])

  const todayStr = useMemo(() => fmtDateInput(new Date()), [])

  return (
    <>
      <Seo
        title="Skin Cycling Planner - vimz Tools"
        description="Generate a 28-day skin cycling plan with exfoliate, retinoid and recovery phases."
      />
      <ToolShell
        title="Skin Cycling Planner"
        description="Generate a 28-day skin cycling plan that rotates exfoliate, retinoid and recovery nights."
        icon={<CalendarCheck className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Pick a start date to see your 28-day skin cycling calendar"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
            <div className="max-w-xs">
              <Field label="Cycle start date">
                <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Field>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                <Repeat className="h-4 w-4" /> The 4-night cycle
              </p>
              <p className="mt-1 text-xs leading-relaxed text-indigo-700">
                Night 1 exfoliate, night 2 retinoid, then two recovery nights - repeated across 28 days.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Sun className="h-4 w-4" /> AM routine, every day
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                Gentle cleanser to vitamin C to moisturizer to SPF.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-bold text-slate-800">28-day calendar</h3>
          <p className="mb-4 text-xs text-slate-500">
            Sundays are off for everyone: retinoid is swapped for a recovery night.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {cells.map((c) => {
              const isToday = c.dateInput === todayStr
              return (
                <div
                  key={c.dateInput}
                  className={`rounded-xl border p-2.5 transition ${
                    isToday
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : c.sunday
                        ? 'border-amber-200 bg-amber-50/60'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                      {WEEKDAYS[c.date.getDay()]} {c.index}
                    </span>
                    {c.sunday && <span className="text-[9px] font-bold uppercase text-amber-600">Rest</span>}
                  </div>
                  <p className="text-xs font-bold text-slate-600">
                    {c.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold ${PHASE[c.phase].chip}`}>
                    {PHASE[c.phase].label}
                  </span>
                  {isToday && <p className="mt-1 text-[9px] font-bold uppercase text-primary-600">today</p>}
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Legend</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(Object.keys(PHASE) as PhaseKey[]).map((key) => {
              const Icon = key === 'exfoliate' ? Flower2 : key === 'retinoid' ? Sparkles : Leaf
              return (
                <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${PHASE[key].chip}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{PHASE[key].label}</p>
                    <p className="text-[11px] text-slate-500">{PHASE[key].desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </ToolShell>
    </>
  )
}