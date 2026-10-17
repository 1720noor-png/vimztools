import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FlaskRound, Leaf, ListOrdered, Sparkles, Timer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import HybridLoader from '../../../components/ui/HybridLoader'
import { Field, Select } from '../../../components/ui/Fields'
import { getMaskRecipes, type DiyMaskRecipe } from '../../../lib/beautyApi'

const TARGETS = [
  { value: 'all', label: 'All targets' },
  { value: 'face', label: 'Face' },
  { value: 'hair', label: 'Hair' },
  { value: 'scalp', label: 'Scalp' },
]

const CONCERNS = [
  { value: 'all', label: 'All concerns' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'oiliness', label: 'Oiliness' },
  { value: 'brightening', label: 'Brightening' },
  { value: 'soothing', label: 'Soothing' },
  { value: 'firming', label: 'Firming' },
  { value: 'dandruff', label: 'Dandruff' },
  { value: 'damage', label: 'Damage' },
  { value: 'growth', label: 'Growth' },
]

const TARGET_BADGE: Record<string, string> = {
  face: 'bg-rose-100 text-rose-700',
  hair: 'bg-violet-100 text-violet-700',
  scalp: 'bg-emerald-100 text-emerald-700',
}

export default function DiyMaskFormulator() {
  const [recipes, setRecipes] = useState<DiyMaskRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState('all')
  const [concern, setConcern] = useState('all')
  const [ingredient, setIngredient] = useState('all')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getMaskRecipes({
          ...(target !== 'all' ? { target } : {}),
          ...(concern !== 'all' ? { concern } : {}),
          ...(ingredient !== 'all' ? { ingredient } : {}),
        })
        if (!cancelled) setRecipes(rows)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [target, concern, ingredient])

  const ingredientOptions = useMemo(
    () => Array.from(new Set(recipes.flatMap((recipe) => recipe.base_ingredients))).sort(),
    [recipes],
  )

  return (
    <>
      <Seo
        title="DIY Mask Formulator - vimz Tools"
        description="Filter pantry-ingredient face, hair, and scalp mask recipes by concern."
      />
      <ToolShell
        title="DIY Mask Formulator"
        description="Browse DIY face, hair, and scalp masks built from pantry ingredients, then filter by target, concern, or a single ingredient."
        icon={<FlaskRound className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Pick a target, concern, or ingredient to see matching recipes."
      >
        {loading ? (
          <HybridLoader label="Loading mask recipes..." />
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                <Field label="Target">
                  <Select
                    value={target}
                    onChange={(e) => {
                      setLoading(true)
                      setTarget(e.target.value)
                    }}
                  >
                    {TARGETS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Concern">
                  <Select
                    value={concern}
                    onChange={(e) => {
                      setLoading(true)
                      setConcern(e.target.value)
                    }}
                  >
                    {CONCERNS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Pantry ingredient">
                  <Select
                    value={ingredient}
                    onChange={(e) => {
                      setLoading(true)
                      setIngredient(e.target.value)
                    }}
                  >
                    <option value="all">All ingredients</option>
                    {ingredientOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-primary-100 bg-primary-50 px-4 py-2.5">
                <p className="text-xs font-medium text-primary-700">Matching DIY masks</p>
                <span className="rounded-full bg-primary-600 px-2.5 py-1 text-xs font-bold text-white">
                  {recipes.length} recipe{recipes.length === 1 ? '' : 's'}
                </span>
              </div>
            </section>

            {recipes.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
                <p className="text-sm font-medium text-slate-500">No recipe matches - widen your filters.</p>
              </section>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {recipes.map((recipe) => (
                  <article
                    key={`${recipe.id}-${recipe.slug}`}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold leading-snug text-slate-800">{recipe.name}</h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                          TARGET_BADGE[recipe.target] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {recipe.target}
                      </span>
                    </div>

                    {recipe.benefits && (
                      <p className="mt-2 flex items-start gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-xs leading-relaxed text-emerald-800">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {recipe.benefits}
                      </p>
                    )}

                    <div className="mt-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <Leaf className="h-3 w-3" /> Base ingredients
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {recipe.base_ingredients.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {recipe.optional_ingredients && recipe.optional_ingredients.length > 0 && (
                      <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Optional extras</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {recipe.optional_ingredients.map((item) => (
                            <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex-1">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <ListOrdered className="h-3 w-3" /> Steps
                      </p>
                      <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                        {recipe.steps.map((step, index) => (
                          <li key={index} className="text-xs leading-relaxed text-slate-600">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Timer className="h-3.5 w-3.5 text-slate-400" /> {recipe.prep_minutes} min prep
                      </span>
                      {recipe.tips && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Sparkles className="h-3 w-3 text-amber-400" /> Tip inside
                        </span>
                      )}
                    </div>

                    {recipe.tips && (
                      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">
                        {recipe.tips}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </ToolShell>
    </>
  )
}