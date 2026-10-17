import { useMemo, useState } from 'react'
import { Repeat, Sparkles, ChefHat } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { toNumber } from '../../../lib/numbers'

const SWAPS: Record<
  string,
  { advice: string; best: string; options: { name: string; how: string }[] }
> = {
  Buttermilk: {
    advice: 'For pancakes, muffins and tender cakes.',
    best: 'Milk + lemon juice',
    options: [
      { name: 'Milk + lemon juice', how: '1 cup milk + 1 tbsp lemon juice, rest 5 min' },
      { name: 'Yogurt thinned', how: '¾ cup plain yogurt + ¼ cup milk' },
      { name: 'Sour cream thinned', how: '¾ cup sour cream + ¼ cup milk' },
    ],
  },
  Egg: {
    advice: 'Best in cakes, cookies and pancakes.',
    best: 'Flax + water',
    options: [
      { name: 'Flax + water', how: '1 tbsp flax meal + 3 tbsp water per egg' },
      { name: 'Applesauce', how: '¼ cup applesauce per egg' },
      { name: 'Mashed banana', how: '¼ cup ripe banana per egg' },
    ],
  },
  Cornstarch: {
    advice: 'For thickening soups, sauces and fillings.',
    best: 'All-purpose flour',
    options: [
      { name: 'All-purpose flour', how: '2 tbsp flour per 1 tbsp cornstarch' },
      { name: 'Arrowroot', how: '2 tsp arrowroot powder per 1 tbsp' },
      { name: 'Tapioca starch', how: '2 tsp tapioca starch per 1 tbsp' },
    ],
  },
  'Brown sugar': {
    advice: 'For cookies, glazes and rubs.',
    best: 'White sugar + molasses',
    options: [
      { name: 'White sugar + molasses', how: '1 cup white sugar + 1 tbsp molasses' },
      { name: 'Coconut sugar', how: '1:1 swap, slightly less sweet' },
      { name: 'White sugar', how: '1:1 swap, add a little moisture' },
    ],
  },
  'Tomato paste': {
    advice: 'For sauces, stews and braises.',
    best: 'Tomato sauce reduced',
    options: [
      { name: 'Tomato sauce reduced', how: '¾ cup sauce simmered to a paste' },
      { name: 'Fresh tomato + sugar', how: '1 tomato finely chopped + pinch of sugar' },
      { name: 'Ketchup (sweet spot)', how: '¼ cup ketchup + pinch of salt' },
    ],
  },
  'Baking powder': {
    advice: 'For fluffy pancakes and quick breads.',
    best: 'Cream of tartar + baking soda',
    options: [
      { name: 'Cream of tartar + soda', how: '½ tsp cream of tartar + ¼ tsp baking soda' },
      { name: 'Yogurt + baking soda', how: 'add ½ cup yogurt, remove ½ cup liquid' },
      { name: 'Buttermilk + soda', how: 'swap milk for buttermilk, add ¼ tsp soda' },
    ],
  },
}

export default function IngredientSubstituteFinder() {
  const [active, setActive] = useState('Buttermilk')
  const [amount, setAmount] = useState('1')

  const pick = useMemo(() => SWAPS[active], [active])

  const needsCoffee = useMemo(() => {
    const v = toNumber(amount)
    return Number.isFinite(v) && v >= 2
  }, [amount])

  return (
    <>
      <Seo
        title="Ingredient Substitute Finder - vimz Tools"
        description="Find the best substitute for a missing ingredient. Free baking and cooking swaps."
      />
      <ToolShell
        title="Ingredient Substitute Finder"
        description="Find the best substitute for a missing ingredient."
        icon={<Repeat className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Pick an ingredient to find the best kitchen swap."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">What are you out of?</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(SWAPS).map((k) => (
                <button
                  key={k}
                  onClick={() => setActive(k)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    active === k
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                How much do you need?
              </label>
              <TextInput value={amount} onChange={(e) => setAmount(e.target.value)} />
              <p className="mt-2 text-xs text-slate-400">in the original unit of the ingredient</p>
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="flex items-start gap-2 text-sm font-medium text-emerald-800">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>Best swap:</strong> {pick.best}. {pick.advice}
                </span>
              </p>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {pick.options.map((o, i) => (
                <article
                  key={o.name}
                  className={`rounded-2xl border p-4 ${
                    i === 0 ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ChefHat className={`h-5 w-5 ${i === 0 ? 'text-primary-600' : 'text-slate-400'}`} />
                    {i === 0 && (
                      <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Best
                      </span>
                    )}
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-slate-800">{o.name}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{o.how}</p>
                </article>
              ))}
            </div>
            {needsCoffee && (
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                Large batch? Scale the swap ratio evenly and taste as you go.
              </p>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}