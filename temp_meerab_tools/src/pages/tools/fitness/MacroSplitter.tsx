import { useMemo, useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { percent, round, toNumber } from '../../../lib/numbers'

const PLANS = [
  { name: 'Balanced', p: 30, c: 40, f: 30, bar: 'bg-emerald-500', chip: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  { name: 'High Protein', p: 40, c: 30, f: 30, bar: 'bg-sky-500', chip: 'border-sky-300 bg-sky-50 text-sky-700' },
  { name: 'Keto', p: 25, c: 5, f: 70, bar: 'bg-amber-500', chip: 'border-amber-300 bg-amber-50 text-amber-700' },
]

export default function MacroSplitter() {
  const [kcal, setKcal] = useState('')
  const [plan, setPlan] = useState(0)

  const calc = useMemo(() => {
    const k = toNumber(kcal)
    if (!Number.isFinite(k) || k <= 0) return null
    const p = PLANS[plan]
    const protein = (k * p.p) / 100 / 4
    const carbs = (k * p.c) / 100 / 4
    const fat = (k * p.f) / 100 / 9
    return { protein, carbs, fat }
  }, [kcal, plan])

  const macros = calc
    ? [
        { name: 'Protein', value: calc.protein, cls: 'border-emerald-200 bg-emerald-50', bar: 'bg-emerald-500', pct: PLANS[plan].p, kcal: `${round((toNumber(kcal) * PLANS[plan].p) / 100)} kcal` },
        { name: 'Carbs', value: calc.carbs, cls: 'border-sky-200 bg-sky-50', bar: 'bg-sky-500', pct: PLANS[plan].c, kcal: `${round((toNumber(kcal) * PLANS[plan].c) / 100)} kcal` },
        { name: 'Fat', value: calc.fat, cls: 'border-amber-200 bg-amber-50', bar: 'bg-amber-500', pct: PLANS[plan].f, kcal: `${round((toNumber(kcal) * PLANS[plan].f) / 100)} kcal` },
      ]
    : []

  return (
    <>
      <Seo
        title="Macro Splitter (Keto, High Protein, Balanced) - vimz Tools"
        description="Divides daily target calorie allowance into exact protein, carb, and fat grams."
      />
      <ToolShell
        title="Macro Splitter (Keto, High Protein, Balanced)"
        description="Divides a daily target calorie allowance into exact protein, carb, and fat gram targets across three plans."
        icon={<UtensilsCrossed className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter your daily calories and pick a plan for gram targets."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Daily calories (kcal)">
              <TextInput type="number" min={0} value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="e.g. 2000" />
            </Field>
            {PLANS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setPlan(i)}
                className={`rounded-xl border p-3 text-left text-sm transition ${plan === i ? `${p.chip} ring-1 ring-current` : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
              >
                <p className="font-bold">{p.name}</p>
                <p className="text-xs">Protein {p.p}% / Carbs {p.c}% / Fat {p.f}%</p>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {macros.map((m) => (
            <div key={m.name} className={`rounded-2xl border p-5 ${m.cls}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{m.name}</p>
                <p className="text-xs font-semibold">{percent(m.pct, 0)}</p>
              </div>
              <p className="mt-2 text-4xl font-extrabold">{round(m.value, 0)} g</p>
              <p className="mt-1 text-xs">{m.kcal}</p>
              <div className="mt-3 h-2 rounded-full bg-white/60">
                <div className={`h-2 rounded-full ${m.bar}`} style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {calc && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Across 4 meals that is roughly{' '}
            <span className="font-bold text-slate-900">{round(calc.protein / 4, 0)} g protein</span>,{' '}
            <span className="font-bold text-slate-900">{round(calc.carbs / 4, 0)} g carbs</span>, and{' '}
            <span className="font-bold text-slate-900">{round(calc.fat / 4, 0)} g fat</span> per meal.
          </div>
        )}
      </ToolShell>
    </>
  )
}