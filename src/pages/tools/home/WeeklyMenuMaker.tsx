import { useMemo, useState } from 'react'
import { NotebookText, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Meal = { id: string; name: string }
type Picked = Record<string, string>
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['Breakfast', 'Lunch', 'Dinner']

const SUGGESTIONS = ['Pasta', 'Curry', 'Soup', 'Tacos', 'Stir-fry', 'Salad', 'Oatmeal', 'Smoothie', 'Sandwich', 'Rice bowl', 'Pizza', 'Grilled chicken']

export default function WeeklyMenuMaker() {
  const [meals, setMeals] = useState<Meal[]>(SUGGESTIONS.map((n) => ({ id: uid(), name: n })))
  const [newMeal, setNewMeal] = useState('')
  const [picked, setPicked] = useState<Picked>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const addMeal = () => {
    const n = newMeal.trim()
    if (!n) return
    setMeals((prev) => (prev.some((m) => m.name.toLowerCase() === n.toLowerCase()) ? prev : [...prev, { id: uid(), name: n }]))
    setNewMeal('')
  }

  const removeMeal = (id: string) => {
    const m = meals.find((x) => x.id === id)
    if (m) setChecked((prev) => {
      const next = { ...prev }
      delete next[m.name]
      return next
    })
    setMeals((prev) => prev.filter((x) => x.id !== id))
  }

  const setSlot = (day: string, slot: string, value: string) =>
    setPicked((prev) => ({ ...prev, [`${day}::${slot}`]: value }))

  const grocery = useMemo(() => {
    const names = new Set(Object.values(picked).map((v) => v.trim().toLowerCase()).filter(Boolean))
    return Array.from(names)
  }, [picked])

  const filledSlots = useMemo(() => Object.values(picked).filter((v) => v).length, [picked])
  const distinct = grocery.length

  const shoppingTotal = grocery.length
  const shoppingDone = grocery.filter((g) => checked[g]).length

  return (
    <>
      <Seo
        title="Weekly Menu Maker - vimz Tools"
        description="Create a weekly menu and matching grocery list."
      />
      <ToolShell
        title="Weekly Menu Maker"
        description="Create a weekly menu and matching grocery list."
        icon={<NotebookText className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Plan seven days of meals and build the shopping list."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-56 flex-1">
              <Field label="Add a meal to your recipe pool">
                <TextInput value={newMeal} onChange={(e) => setNewMeal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addMeal() }} placeholder="e.g. Chicken teriyaki" />
              </Field>
            </div>
            <Button onClick={addMeal}>
              <Plus className="h-4 w-4" /> Add meal
            </Button>
          </div>
          {meals.length > 12 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {meals.slice(12).map((m) => (
                <span key={m.id} className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                  {m.name}
                  <button onClick={() => removeMeal(m.id)} aria-label="Remove" className="text-violet-400 hover:text-rose-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">7-day menu</h3>
              <span className="text-xs font-bold text-primary-600">{filledSlots}/21 filled</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3">Day</th>
                    {SLOTS.map((s) => (
                      <th key={s} className="px-2 py-2">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-bold text-slate-700">{day}</td>
                      {SLOTS.map((slot) => (
                        <td key={slot} className="px-2 py-2">
                          <Select value={picked[`${day}::${slot}`] ?? ''} onChange={(e) => setSlot(day, slot, e.target.value)} className="py-1.5 text-xs">
                            <option value="">—</option>
                            {meals.map((m) => (
                              <option key={m.id} value={m.name}>{m.name}</option>
                            ))}
                          </Select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Auto shopping list</h3>
              <p className="mb-3 text-[11px] text-slate-400">
                {distinct} unique meal{distinct !== 1 ? 's' : ''} · {shoppingDone}/{shoppingTotal} ticked
              </p>
              {grocery.length === 0 ? (
                <p className="text-xs text-slate-400">Pick meals above and their names appear here.</p>
              ) : (
                <ul className="space-y-1.5">
                  {grocery.map((g) => {
                    const key = g.toLowerCase()
                    const on = !!checked[key]
                    return (
                      <li key={g}>
                        <button
                          onClick={() => setChecked((prev) => ({ ...prev, [key]: !on }))}
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${on ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                        >
                          {on ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
                          <span className="capitalize">{g}</span>
                          <span className="ml-auto text-[10px] font-bold uppercase text-slate-300">buy</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-2 text-sm font-bold text-slate-800">Menu snapshot</h3>
              <p className="text-xs text-slate-500">
                {filledSlots} meals planned across {meals.length} recipes in your pool. Reuse favourites to keep grocery runs short.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}