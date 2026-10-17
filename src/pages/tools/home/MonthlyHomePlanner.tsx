import { useMemo, useState } from 'react'
import { CalendarDays, ReceiptText, ListChecks, PartyPopper } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'

type DayFlags = { bill: boolean; chore: boolean; event: boolean }
type Kind = keyof DayFlags

const KIND_META: Record<Kind, { label: string; chip: string; active: string }> = {
  bill: { label: 'Bill', chip: 'text-rose-600', active: 'bg-rose-100 text-rose-700' },
  chore: { label: 'Chore', chip: 'text-sky-600', active: 'bg-sky-100 text-sky-700' },
  event: { label: 'Event', chip: 'text-amber-600', active: 'bg-amber-100 text-amber-700' },
}

export default function MonthlyHomePlanner() {
  const [days, setDays] = useState<Record<number, DayFlags>>({})

  const toggle = (day: number, kind: Kind) =>
    setDays((prev) => {
      const cur = prev[day] ?? { bill: false, chore: false, event: false }
      return { ...prev, [day]: { ...cur, [kind]: !cur[kind] } }
    })

  const summary = useMemo(() => {
    let counts: Record<Kind, number> = { bill: 0, chore: 0, event: 0 }
    let busy: number[] = []
    for (const [d, flags] of Object.entries(days)) {
      if (flags.bill) counts.bill += 1
      if (flags.chore) counts.chore += 1
      if (flags.event) counts.event += 1
      if (flags.bill || flags.chore || flags.event) busy.push(Number(d))
    }
    return { counts, busy }
  }, [days])

  const clearDay = (day: number) =>
    setDays((prev) => {
      const next = { ...prev }
      delete next[day]
      return next
    })

  return (
    <>
      <Seo
        title="Monthly Home Planner - vimz Tools"
        description="Line up bills, chores and events for the month."
      />
      <ToolShell
        title="Monthly Home Planner"
        description="Line up bills, chores and events for the month."
        icon={<CalendarDays className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Map bills, chores and events onto a month calendar."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">31-day strip</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              {(['bill', 'chore', 'event'] as Kind[]).map((k) => (
                <span key={k} className={`flex items-center gap-1.5 ${KIND_META[k].chip}`}>
                  <span className={`rounded px-1.5 py-0.5 ${KIND_META[k].active}`}>{KIND_META[k].label}</span>
                  → {summary.counts[k]}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8 xl:grid-cols-11">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const flags = days[day] ?? { bill: false, chore: false, event: false }
              const active = flags.bill || flags.chore || flags.event
              return (
                <button
                  key={day}
                  onClick={() => toggle(day, 'bill')}
                  onDoubleClick={() => clearDay(day)}
                  className={`rounded-xl border p-2 text-left transition ${active ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  title="Click for bill, Shift+click for chore, and double-click to clear"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{day}</span>
                    {active && <CalendarDays className="h-3 w-3 text-primary-500" />}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(['bill', 'chore', 'event'] as Kind[]).map((k) => (
                      <span
                        key={k}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggle(day, k)
                        }}
                        className={`h-2.5 w-2.5 rounded-full ${flags[k] ? KIND_META[k].active.replace('text-', 'bg-').split(' ')[0] : 'bg-slate-100'}`}
                        title={KIND_META[k].label}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Click a day to toggle its Bill flag; use the colour dots for chore and event. Double-click a day to clear it.
          </p>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {(['bill', 'chore', 'event'] as Kind[]).map((k) => (
            <div key={k} className={`rounded-2xl border p-5 ${k === 'bill' ? 'border-rose-200 bg-rose-50' : k === 'chore' ? 'border-sky-200 bg-sky-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="mb-2 flex items-center gap-2">
                {k === 'bill' ? <ReceiptText className="h-4 w-4 text-rose-600" /> : k === 'chore' ? <ListChecks className="h-4 w-4 text-sky-600" /> : <PartyPopper className="h-4 w-4 text-amber-600" />}
                <h4 className="text-sm font-bold text-slate-800">{summary.counts[k]} {KIND_META[k].label}(s) marked</h4>
              </div>
              <p className="text-xs text-slate-600">
                {summary.busy
                  .map((d) => d)
                  .join(', ') || `No ${KIND_META[k].label.toLowerCase()} days yet.`}
              </p>
            </div>
          ))}
        </div>
      </ToolShell>
    </>
  )
}