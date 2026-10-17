import { useMemo, useState } from 'react'
import { UtensilsCrossed, Clock, Star, Trash2, X } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fmtHours, toNumber, uid } from '../../../lib/numbers'

const DINNERS = [
  { name: 'Spaghetti', mins: 25 },
  { name: 'Stir-fry', mins: 20 },
  { name: 'Curry', mins: 40 },
  { name: 'Tacos', mins: 30 },
  { name: 'Grilled chicken', mins: 35 },
  { name: 'Soup', mins: 30 },
  { name: 'Pizza night', mins: 15 },
]

const DAYS = [
  { day: 'Mon', slot: 'weeknight' },
  { day: 'Tue', slot: 'weeknight' },
  { day: 'Wed', slot: 'weeknight' },
  { day: 'Thu', slot: 'weeknight' },
  { day: 'Fri', slot: 'weeknight' },
  { day: 'Sat', slot: 'weekend' },
  { day: 'Sun', slot: 'weekend' },
]

type Slot = { name: string; mins: number }
type Dinner = (typeof DINNERS)[number]
type Fav = { id: string; name: string; mins: number }

const inputCls = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'

export default function DinnerPlanner() {
  const [schedule, setSchedule] = useState<Record<string, Slot>>({})
  const [favorites, setFavorites] = useState<Fav[]>([])
  const [activeDay, setActiveDay] = useState('Mon')
  const [featured, setFeatured] = useState<Dinner | null>(null)

  const totalMins = useMemo(() => Object.values(schedule).reduce((s, d) => s + d.mins, 0), [schedule])
  const weeknightMins = useMemo(() => DAYS.filter((d) => d.slot === 'weeknight').reduce((s, d) => s + (schedule[d.day]?.mins ?? 0), 0), [schedule])
  const curName = schedule[activeDay]?.name ?? ''
  const curMins = schedule[activeDay]?.mins ?? 0

  const assign = (d: Dinner) => {
    setSchedule((s) => ({ ...s, [activeDay]: { name: d.name, mins: d.mins } }))
    setFeatured(d)
  }
  const setCustom = (name: string, mins?: string) => {
    const m = mins !== undefined ? toNumber(mins) : schedule[activeDay]?.mins
    setSchedule((s) => ({ ...s, [activeDay]: { name, mins: Number.isFinite(m) ? (m ?? 0) : 0 } }))
    setFeatured(null)
  }
  const clearDay = () => {
    setSchedule((s) => {
      const n = { ...s }
      delete n[activeDay]
      return n
    })
    setFeatured(null)
  }
  const saveFavorite = () => {
    const cur = schedule[activeDay]
    if (!cur || !cur.name || cur.name === 'Custom') return
    setFavorites((f) => (f.some((x) => x.name === cur.name) ? f : [...f, { id: uid(), ...cur }]))
  }
  const removeFavorite = (id: string) => setFavorites((f) => f.filter((x) => x.id !== id))

  return (
    <>
      <Seo title="Dinner Planner - vimz Tools" description="Pick and schedule weeknight dinner ideas. Free weekly dinner meal planner." />
      <ToolShell title="Dinner Planner" description="Pick and schedule weeknight dinner ideas." icon={<UtensilsCrossed className="h-6 w-6" />} breadcrumb="Cooking & Kitchen" instruction="Schedule weeknight dinners so the evening is easy.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Pick a dinner</h3>
            <Field label="Planned for">
              <Select value={activeDay} onChange={(e) => setActiveDay(e.target.value)}>
                {DAYS.map((d) => (
                  <option key={d.day} value={d.day}>
                    {d.day} ({d.slot})
                  </option>
                ))}
              </Select>
            </Field>
            <div className="mt-4 space-y-2">
              {DINNERS.map((d) => (
                <button key={d.name} onClick={() => assign(d)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 transition ${featured?.name === d.name ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
                  <span className="text-sm font-semibold text-slate-800">{d.name}</span>
                  <span className="text-xs text-slate-400">{d.mins} min</span>
                </button>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-bold uppercase text-slate-400">Custom dinner</p>
              <input value={curName} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Salmon + broccoli" className={inputCls} />
              <div className="mt-2 flex gap-2">
                <input type="number" min={0} value={curMins} onChange={(e) => setCustom(curName || 'Custom', e.target.value)} placeholder="mins" className={inputCls} />
                <button onClick={clearDay} className="flex items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-500 transition hover:border-rose-300 hover:text-rose-500" aria-label="Clear day">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <button onClick={saveFavorite} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-100">
                <Star className="h-4 w-4" /> Save as favorite
              </button>
            </div>
            {favorites.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="mb-2 text-xs font-bold uppercase text-slate-400">Favorites to reuse</p>
                <div className="flex flex-wrap gap-2">
                  {favorites.map((f) => (
                    <span key={f.id} className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 pl-3 pr-1 py-1 text-xs font-bold text-amber-700">
                      <button onClick={() => setSchedule((s) => ({ ...s, [activeDay]: { name: f.name, mins: f.mins } }))}>{f.name}</button>
                      <button onClick={() => removeFavorite(f.id)} className="rounded-full p-0.5 text-amber-400 transition hover:text-rose-500" aria-label="Remove favorite">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Week at a glance</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {DAYS.map((d) => {
                  const s = schedule[d.day]
                  return (
                    <button key={d.day} onClick={() => setActiveDay(d.day)} className={`rounded-xl border p-3 text-left transition ${activeDay === d.day ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{d.day}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${d.slot === 'weekend' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{d.slot}</span>
                      </div>
                      {s ? (
                        <>
                          <p className="mt-2 truncate text-sm font-bold text-slate-800">{s.name}</p>
                          <p className="text-[11px] text-slate-400">{s.mins ? `${s.mins} min` : 'No time set'}</p>
                        </>
                      ) : (
                        <p className="mt-2 text-xs text-slate-300">Not planned</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-center">
                <Clock className="mx-auto mb-2 h-5 w-5 text-indigo-600" />
                <p className="text-xs font-semibold uppercase text-indigo-500">Total cook time</p>
                <p className="mt-1 text-2xl font-extrabold text-indigo-700">{fmtHours(totalMins)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <UtensilsCrossed className="mx-auto mb-2 h-5 w-5 text-slate-500" />
                <p className="text-xs font-semibold uppercase text-slate-400">Weeknights</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{fmtHours(weeknightMins)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <Star className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
                <p className="text-xs font-semibold uppercase text-emerald-500">Favorites</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">{favorites.length}</p>
              </div>
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}