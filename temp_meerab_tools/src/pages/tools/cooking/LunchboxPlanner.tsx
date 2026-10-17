import { useMemo, useState } from 'react'
import { Sandwich, Apple, Cookie, Salad, Sparkles } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const MAINS = ['Sandwich', 'Wrap', 'Pasta salad', 'Rice bowl', 'Cold chicken', 'Leftover stir-fry', 'Quiche']
const SIDES = ['Carrot sticks', 'Cucumber slices', 'Grapes', 'Yogurt', 'Popcorn', 'Hummus + pita']
const SNACKS = ['Apple', 'Banana', 'Granola bar', 'Cheese stick', 'Trail mix', 'Cookies']

type Lunch = { main: string; side: string; snack: string }

export default function LunchboxPlanner() {
  const [lunches, setLunches] = useState<Record<string, Lunch>>({})

  const setSlot = (day: string, key: keyof Lunch, val: string) => {
    setLunches((l) => ({ ...l, [day]: { ...(l[day] ?? { main: '', side: '', snack: '' }), [key]: val } }))
  }

  const counts = useMemo(() => {
    const tally = (key: keyof Lunch) => {
      const m = new Map<string, number>()
      DAYS.forEach((d) => {
        const v = lunches[d]?.[key]
        if (v) m.set(v, (m.get(v) || 0) + 1)
      })
      return m
    }
    const mains = tally('main')
    const sides = tally('side')
    const snacks = tally('snack')
    return { mains, sides, snacks }
  }, [lunches])

  const tips = useMemo(() => {
    const t: string[] = []
    const uniq = (key: keyof Lunch) => new Set(DAYS.map((d) => lunches[d]?.[key]).filter(Boolean)).size
    if (uniq('main') < 3) t.push('Mix up the mains — swap a sandwich for a rice bowl or wrap.')
    if (uniq('side') < 3) t.push('Vary the sides so lunch is crunchy, fresh and fun.')
    if (uniq('snack') < 3) t.push('Add fruit to at least three days for a sweet, healthy finish.')
    if (DAYS.every((d) => lunches[d]?.main)) t.push('Full week planned — brilliant job.')
    return t
  }, [lunches])

  return (
    <>
      <Seo
        title="Lunchbox Planner - vimz Tools"
        description="Plan healthy packed lunches for work or school. Free weekly lunchbox meal planner."
      />
      <ToolShell
        title="Lunchbox Planner"
        description="Plan healthy packed lunches for work or school."
        icon={<Sandwich className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Plan five easy packed lunches for work or school."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {DAYS.map((d) => {
                const l = lunches[d]
                return (
                  <section key={d} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-slate-400">{d}</p>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Sandwich className="h-3.5 w-3.5" /> Main
                        </label>
                        <Select value={l?.main ?? ''} onChange={(e) => setSlot(d, 'main', e.target.value)}>
                          <option value="">— pick —</option>
                          {MAINS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Salad className="h-3.5 w-3.5" /> Side
                        </label>
                        <Select value={l?.side ?? ''} onChange={(e) => setSlot(d, 'side', e.target.value)}>
                          <option value="">— pick —</option>
                          {SIDES.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Cookie className="h-3.5 w-3.5" /> Snack
                        </label>
                        <Select value={l?.snack ?? ''} onChange={(e) => setSlot(d, 'snack', e.target.value)}>
                          <option value="">— pick —</option>
                          {SNACKS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </section>
                )
              })}
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Balance check</h3>
              <div className="space-y-4">
                {[
                  { label: 'Mains', icon: <Sandwich className="h-4 w-4" />, map: counts.mains },
                  { label: 'Sides', icon: <Salad className="h-4 w-4" />, map: counts.sides },
                  { label: 'Snacks', icon: <Apple className="h-4 w-4" />, map: counts.snacks },
                ].map((row) => {
                  const top = [...row.map.entries()].sort((a, b) => b[1] - a[1])[0]
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        {row.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase text-slate-400">{row.label}</p>
                        <p className="truncate text-sm font-bold text-slate-800">
                          {top ? `${top[0]} ×${top[1]}` : '—'}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-slate-500">{row.map.size} types</span>
                    </div>
                  )
                })}
              </div>
            </section>
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-800">
                <Sparkles className="h-4 w-4" /> Lunchbox tips
              </h3>
              <ul className="space-y-2">
                {tips.length === 0 ? (
                  <li className="text-sm text-amber-700">Add a few picks to see tips.</li>
                ) : (
                  tips.map((t) => (
                    <li key={t} className="text-sm font-medium text-amber-700">
                      • {t}
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}