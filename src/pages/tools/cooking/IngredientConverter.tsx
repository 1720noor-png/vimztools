import { useMemo, useState } from 'react'
import { Scale, ArrowRight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const INGREDIENTS = [
  { name: 'All-purpose flour', g: 125 },
  { name: 'White sugar', g: 200 },
  { name: 'Butter', g: 227 },
  { name: 'Rolled oats', g: 90 },
  { name: 'Rice', g: 200 },
  { name: 'Honey', g: 340 },
  { name: 'Cocoa powder', g: 120 },
]

type Mode = 'cupsToGrams' | 'gramsToCups'

export default function IngredientConverter() {
  const [ingredient, setIngredient] = useState(INGREDIENTS[0])
  const [amount, setAmount] = useState('1')
  const [mode, setMode] = useState<Mode>('cupsToGrams')

  const result = useMemo(() => {
    const v = toNumber(amount)
    if (!Number.isFinite(v) || v < 0) return '—'
    if (mode === 'cupsToGrams') return { value: round(v * ingredient.g, 1), unit: 'g' }
    return { value: round(v / ingredient.g, 2), unit: 'cups' }
  }, [amount, ingredient, mode])

  const maxG = useMemo(() => Math.max(...INGREDIENTS.map((i) => i.g)), [])

  return (
    <>
      <Seo
        title="Ingredient Converter - vimz Tools"
        description="Convert ingredient amounts using density-based ratios. Free cups to grams converter."
      />
      <ToolShell
        title="Ingredient Converter"
        description="Convert ingredient amounts using density-based ratios."
        icon={<Scale className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Convert ingredient amounts using weight per cup."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Convert</h3>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Ingredient
            </label>
            <Select value={ingredient.name} onChange={(e) => setIngredient(INGREDIENTS.find((i) => i.name === e.target.value) ?? INGREDIENTS[0])}>
              {INGREDIENTS.map((i) => (
                <option key={i.name} value={i.name}>
                  {i.name} ({i.g} g/cup)
                </option>
              ))}
            </Select>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
                <TextInput inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Direction</label>
                <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                  <option value="cupsToGrams">Cups → grams</option>
                  <option value="gramsToCups">Grams → cups</option>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="w-full rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2.5 text-center">
                  <p className="text-lg font-extrabold text-primary-800">
                    {result === '—' ? '—' : `${result.value} ${result.unit}`}
                  </p>
                  <p className="text-[11px] font-semibold uppercase text-primary-500">per recipe</p>
                </div>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              Uses a standard 240 ml measuring cup. Spoon flour into the cup, don't pack it.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Weight per cup</h3>
            <div className="space-y-3">
              {INGREDIENTS.map((i) => (
                <div key={i.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{i.name}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                      {i.g} g <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div
                      className={`h-2.5 rounded-full transition-all ${i.name === ingredient.name ? 'bg-primary-500' : 'bg-amber-400'}`}
                      style={{ width: `${(i.g / maxG) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}