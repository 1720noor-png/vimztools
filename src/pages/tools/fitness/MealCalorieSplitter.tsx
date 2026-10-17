import { useMemo, useState } from 'react'
import { Utensils } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const PRESETS = [
  { name: 'Balanced', pcts: [25, 35, 30, 10] },
  { name: 'Light dinner', pcts: [30, 40, 20, 10] },
  { name: 'Snack-heavy', pcts: [20, 30, 30, 20] },
  { name: 'No snacks', pcts: [30, 40, 30, 0] },
]
const MEALS = [
  { name: 'Breakfast', cls: 'bg-amber-400', tile: 'border-amber-200 bg-amber-50 text-amber-800' },
  { name: 'Lunch', cls: 'bg-sky-400', tile: 'border-sky-200 bg-sky-50 text-sky-800' },
  { name: 'Dinner', cls: 'bg-violet-400', tile: 'border-violet-200 bg-violet-50 text-violet-800' },
  { name: 'Snack', cls: 'bg-rose-300', tile: 'border-rose-200 bg-rose-50 text-rose-800' },
]

export default function MealCalorieSplitter() {
  const [target, setTarget] = useState('')
  const [preset, setPreset] = useState(0)

  const calc = useMemo(() => {
    const t = toNumber(target)
    if (!Number.isFinite(t) || t <= 0) return null
    return PRESETS[preset].pcts.map((p) => (t * p) / 100)
  }, [target, preset])

  return (
    <>
      <Seo
        title="Meal Calorie Splitter - vimz Tools"
        description="Distributes total daily calorie target into breakfast, lunch, dinner, and snack meal portions."
      />
      <ToolShell
        title="Meal Calorie Splitter"
        description="Distributes a total daily calorie target into breakfast, lunch, dinner, and snack portions using four meal-preset schemes."
        icon={<Utensils className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter your daily target to split calories across meals."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Daily target (kcal)">
              <TextInput type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 2000" />
            </Field>
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setPreset(i)}
                className={`rounded-xl border p-3 text-left text-sm transition ${preset === i ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
              >
                <p className="font-bold">{p.name}</p>
                <p className="text-xs">{p.pcts.join(' / ')} (B/L/D/Snack)</p>
              </button>
            ))}
          </div>
        </section>

        {calc ? (
          <>
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Split across the day</h3>
              <div className="flex h-4 overflow-hidden rounded-full">
                {MEALS.map((m, i) => (
                  <div key={m.name} className={m.cls} style={{ width: `${PRESETS[preset].pcts[i]}%` }} />
                ))}
              </div>
              <div className="mt-2 flex">
                {MEALS.map((m, i) => (
                  <p key={m.name} className="text-[10px] font-semibold text-slate-500" style={{ width: `${PRESETS[preset].pcts[i]}%` }}>
                    {m.name} {PRESETS[preset].pcts[i]}%
                  </p>
                ))}
              </div>
            </section>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {MEALS.map((m, i) => (
                <div key={m.name} className={`rounded-2xl border p-4 ${m.tile}`}>
                  <p className="text-[11px] font-semibold uppercase">{m.name}</p>
                  <p className="mt-1 text-3xl font-extrabold">{round(calc[i])}</p>
                  <p className="text-[11px]">kcal</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            Enter a daily calorie target to split it across your meals.
          </p>
        )}
      </ToolShell>
    </>
  )
}