import { useMemo, useState } from 'react'
import { Users, Utensils, Soup, GlassWater, Scale } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const RULES = [
  { name: 'Main protein', per: 200, unit: 'g', icon: 'utensils' },
  { name: 'Sides & veg', per: 150, unit: 'g', icon: 'soup' },
  { name: 'Bread', per: 100, unit: 'g', icon: 'bread' },
  { name: 'Drinks', per: 400, unit: 'ml', icon: 'glass' },
]

const ICONS = {
  utensils: <Utensils className="h-5 w-5" />,
  soup: <Soup className="h-5 w-5" />,
  bread: <Scale className="h-5 w-5" />,
  glass: <GlassWater className="h-5 w-5" />,
}

export default function ServingCalculator() {
  const [guests, setGuests] = useState('6')

  const n = useMemo(() => {
    const g = toNumber(guests)
    return Number.isFinite(g) && g > 0 ? Math.round(g) : 0
  }, [guests])

  const totals = useMemo(() => RULES.map((r) => ({ ...r, total: n * r.per })), [n])

  const grand = useMemo(() => totals.reduce((s, t) => s + t.total, 0), [totals])

  return (
    <>
      <Seo
        title="Serving Calculator - vimz Tools"
        description="Calculate how much food to prepare per guest. Free party serving size calculator."
      />
      <ToolShell
        title="Serving Calculator"
        description="Calculate how much food to prepare per guest."
        icon={<Users className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Work out how much to cook for the number of guests."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">How many guests?</h3>
            <Field label="People">
              <TextInput inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value)} />
            </Field>
            <div className="mt-3 flex gap-2">
              {[2, 4, 6, 8, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => setGuests(String(g))}
                  className={`flex-1 rounded-xl border py-2 text-sm font-bold transition ${
                    n === g
                      ? 'border-primary-500 bg-primary-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              These are generous per-person rules of thumb — trim 10–15% for grazing plates.
            </p>
          </section>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                For {n} guest{n === 1 ? '' : 's'}
              </p>
              <p className="mt-1 text-4xl font-extrabold text-emerald-700">
                {round(grand / 1000, 2)} kg food
              </p>
              <p className="text-xs text-emerald-600">(including drinks)</p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {totals.map((t) => {
                const share = grand > 0 ? (t.total / grand) * 100 : 0
                return (
                  <article key={t.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        {ICONS[t.icon as keyof typeof ICONS]}
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">{t.name}</h4>
                        <p className="text-[11px] text-slate-400">
                          {t.per} {t.unit} per guest
                        </p>
                      </div>
                      <p className="ml-auto text-xl font-extrabold text-slate-800">
                        {t.total} <span className="text-sm font-bold text-slate-400">{t.unit}</span>
                      </p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-primary-300 to-primary-600" style={{ width: `${share}%` }} />
                    </div>
                    <p className="mt-1.5 text-right text-[11px] font-semibold text-slate-400">{Math.round(share)}% of spread</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}