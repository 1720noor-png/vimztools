import { useMemo, useState } from 'react'
import { Droplet, Plus, Trash2, CalendarDays } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, uid } from '../../../lib/numbers'

type Plant = { id: string; name: string; interval: number; lastWatered: string }
const INTERVALS = [1, 2, 3, 7, 14]
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const todayISO = () => new Date().toISOString().slice(0, 10)

const nextDue = (last: string, interval: number) => {
  const d = new Date(last)
  d.setDate(d.getDate() + interval)
  return d
}

export default function WateringSchedule() {
  const [plants, setPlants] = useState<Plant[]>([
    { id: uid(), name: 'Spider plant', interval: 7, lastWatered: todayISO() },
    { id: uid(), name: 'Aloe', interval: 14, lastWatered: todayISO() },
    { id: uid(), name: 'Basil', interval: 2, lastWatered: todayISO() },
  ])
  const [name, setName] = useState('')
  const [interval, setInterval] = useState<number>(7)

  const addPlant = () => {
    if (!name.trim()) return
    setPlants((prev) => [...prev, { id: uid(), name: name.trim(), interval, lastWatered: todayISO() }])
    setName('')
  }

  const remove = (id: string) => setPlants((prev) => prev.filter((p) => p.id !== id))
  const water = (id: string) => setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, lastWatered: todayISO() } : p)))

  const week = useMemo(() => {
    const days: { date: Date; due: Plant[] }[] = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      days.push({ date: d, due: plants.filter((p) => nextDue(p.lastWatered, p.interval).toDateString() === d.toDateString()) })
    }
    const dueThisWeek = days.reduce((a, day) => a + day.due.length, 0)
    return { days, dueThisWeek }
  }, [plants])

  const overdue = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return plants.filter((p) => nextDue(p.lastWatered, p.interval) < now).length
  }, [plants])

  return (
    <>
      <Seo
        title="Watering Schedule - vimz Tools"
        description="Build a watering routine matched to each plant type."
      />
      <ToolShell
        title="Watering Schedule"
        description="Build a watering routine matched to each plant type."
        icon={<Droplet className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Plan watering days for plants by their needs."
      >
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-sky-500">Plants tracked</p>
            <p className="mt-1 text-2xl font-extrabold text-sky-800">{plants.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-emerald-500">Due this week</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-800">{week.dueThisWeek}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-amber-500">Overdue</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-700">{overdue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add a plant</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Name">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pothos" />
              </Field>
              <Field label="Interval">
                <Select value={interval} onChange={(e) => setInterval(Number(e.target.value))}>
                  {INTERVALS.map((i) => (
                    <option key={i} value={i}>{i === 1 ? 'daily' : `every ${i} days`}</option>
                  ))}
                </Select>
              </Field>
              <Button onClick={addPlant}>
                <Plus className="h-4 w-4" /> Add plant
              </Button>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Upcoming week</p>
              <div className="space-y-1.5">
                {week.days.map((d) => (
                  <div key={d.date.toDateString()} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <span className={`w-8 text-[11px] font-bold ${d.due.length ? 'text-sky-600' : 'text-slate-300'}`}>
                      {DAY_LABELS[d.date.getDay()]}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${d.due.length ? 'bg-sky-500' : 'bg-slate-200'}`} style={{ width: `${clamp(d.due.length * 25, 0, 100)}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{d.due.length}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Watering schedule</h3>
            <ul className="space-y-2">
              {plants.map((p) => {
                const due = nextDue(p.lastWatered, p.interval)
                const isOverdue = due < new Date()
                const isToday = due.toDateString() === new Date().toDateString()
                return (
                  <li key={p.id} className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${isOverdue ? 'border-rose-200 bg-rose-50' : isToday ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white'}`}>
                    <Droplet className={`h-4 w-4 shrink-0 ${isOverdue ? 'text-rose-500' : isToday ? 'text-sky-500' : 'text-slate-300'}`} />
                    <div className="min-w-32 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      <p className="text-[11px] text-slate-400">Interval {p.interval}d · last {p.lastWatered}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isOverdue ? 'bg-rose-100 text-rose-700' : isToday ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'}`}>
                      {isOverdue ? 'Overdue' : isToday ? 'Today' : due.toDateString().slice(4, 10)}
                    </span>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => water(p.id)}>
                      <Droplet className="h-3 w-3" /> Watered
                    </Button>
                    <button onClick={() => remove(p.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                )
              })}
              {plants.length === 0 && (
                <li className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                  No plants — add your first one to start the routine.
                </li>
              )}
            </ul>
            {plants.length > 0 && (
              <p className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" /> Next dates are calculated from each plant's last watering day.
              </p>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}