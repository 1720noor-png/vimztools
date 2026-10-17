import { useMemo, useState } from 'react'
import { Boxes, Plus, Trash2, CookingPot, Utensils } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid, toNumber } from '../../../lib/numbers'

type Session = { id: string; dish: string; batch: string; served: string }

export default function MealPrepPlanner() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [dish, setDish] = useState('')
  const [batch, setBatch] = useState('4')
  const [served, setServed] = useState('2')

  const add = () => {
    if (!dish.trim()) return
    setSessions((s) => [...s, { id: uid(), dish: dish.trim(), batch, served }])
    setDish('')
  }

  const remove = (id: string) => setSessions((s) => s.filter((x) => x.id !== id))

  const totals = useMemo(() => {
    const portions = sessions.reduce((acc, s) => {
      const b = toNumber(s.batch)
      return acc + (Number.isFinite(b) ? b : 0)
    }, 0)
    const meals = sessions.reduce((acc, s) => {
      const b = toNumber(s.batch)
      const v = toNumber(s.served)
      const servings = Number.isFinite(b) && Number.isFinite(v) && v > 0 ? b / v : 0
      return acc + servings
    }, 0)
    const max = sessions.reduce((acc, s) => Math.max(acc, toNumber(s.batch) || 0), 0)
    return { portions, meals, max }
  }, [sessions])

  return (
    <>
      <Seo
        title="Meal Prep Planner - vimz Tools"
        description="Plan batch cooking sessions and portions for the week. Free meal prep calculator."
      />
      <ToolShell
        title="Meal Prep Planner"
        description="Plan batch cooking sessions and portions for the week."
        icon={<Boxes className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Plan batch-cook sessions and portion them for the week."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add a session</h3>
            <div className="space-y-3">
              <Field label="Dish">
                <TextInput value={dish} onChange={(e) => setDish(e.target.value)} placeholder="e.g. Chili con carne" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Batch size (servings)">
                  <TextInput inputMode="numeric" value={batch} onChange={(e) => setBatch(e.target.value)} />
                </Field>
                <Field label="Served per meal">
                  <TextInput inputMode="numeric" value={served} onChange={(e) => setServed(e.target.value)} />
                </Field>
              </div>
              <Button onClick={add} className="w-full">
                <Plus className="h-4 w-4" /> Add session
              </Button>
            </div>
          </section>

          <div className="lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Sessions ({sessions.length})</h3>
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400">No batch sessions yet — plan a cook to see portions.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => {
                    const b = toNumber(s.batch)
                    const v = toNumber(s.served)
                    const meals = Number.isFinite(b) && Number.isFinite(v) && v > 0 ? b / v : 0
                    const share = totals.max > 0 ? ((Number.isFinite(b) ? b : 0) / totals.max) * 100 : 0
                    return (
                      <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="flex items-center gap-2 truncate text-sm font-bold text-slate-800">
                                <CookingPot className="h-4 w-4 shrink-0 text-primary-600" /> {s.dish}
                              </p>
                              <button onClick={() => remove(s.id)} className="rounded p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Batch {s.batch} servings · {Number.isFinite(meals) ? meals.toFixed(1) : '—'} meals
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-extrabold text-primary-700">
                            {Number.isFinite(meals) ? meals.toFixed(1) : '—'}
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-primary-500" style={{ width: `${share}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <Utensils className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-xs font-semibold uppercase text-emerald-500">Total portions</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-700">{totals.portions}</p>
          </div>
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
            <Boxes className="mx-auto mb-2 h-5 w-5 text-primary-600" />
            <p className="text-xs font-semibold uppercase text-primary-500">Meals covered</p>
            <p className="mt-1 text-3xl font-extrabold text-primary-700">{Number.isFinite(totals.meals) ? totals.meals.toFixed(1) : '0'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <CookingPot className="mx-auto mb-2 h-5 w-5 text-slate-500" />
            <p className="text-xs font-semibold uppercase text-slate-400">Sessions</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-800">{sessions.length}</p>
          </div>
        </div>

        {sessions.length > 0 && (
          <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Weekly snapshot of {totals.portions} servings across {sessions.length} dish
            {sessions.length === 1 ? '' : 'es'} — sort into {Math.max(1, Math.round(totals.meals))} weekday meals.
          </p>
        )}
      </ToolShell>
    </>
  )
}