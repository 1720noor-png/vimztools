export const BEAUTY_API = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

export interface ActiveIngredient {
  id: number
  slug: string
  name: string
  category: string
  layer_type: string | null
  tip: string | null
}

export interface ActiveConflict {
  id: number
  ingredient_a: string
  ingredient_b: string
  a_name: string
  b_name: string
  severity: string
  reason: string | null
  suggestion: string | null
}

export interface ComedogenicIngredient {
  id: number
  name: string
  rating: number
  risk_level: string
  explanation: string | null
  aliases: string[] | null
}

export interface PaoRule {
  id: number
  product_type: string
  pao_months: number
  shelf_life_months: number | null
  notes: string | null
}

export interface BrushType {
  id: number
  tool_type: string
  category: string
  recommended_days: number
  method: string | null
  notes: string | null
}

export interface HygieneTool {
  id: number
  name: string
  tool_type: string
  last_cleaned_at: string | null
  next_due_at: string | null
  notes: string | null
}

export interface DiyMaskRecipe {
  id: number
  slug: string
  name: string
  target: string
  concern: string
  base_ingredients: string[]
  optional_ingredients: string[] | null
  steps: string[]
  tips: string | null
  prep_minutes: number
  benefits: string | null
}

async function fetchJson<T>(path: string, init?: RequestInit, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BEAUTY_API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...init?.headers },
    })
    if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export async function getActiveIngredients(): Promise<ActiveIngredient[]> {
  const res = await fetchJson<{ data: ActiveIngredient[] }>('/beauty/actives')
  return res.data
}

export async function checkActiveConflicts(actives: string[]): Promise<ActiveConflict[]> {
  try {
    const res = await fetchJson<{ data: ActiveConflict[] }>('/beauty/actives/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actives }),
    })
    return res.data
  } catch {
    return FALLBACK_CONFLICTS.filter(
      (c) => actives.includes(c.ingredient_a) && actives.includes(c.ingredient_b),
    )
  }
}

export async function getComedogenicIngredients(): Promise<ComedogenicIngredient[]> {
  const res = await fetchJson<{ data: ComedogenicIngredient[] }>('/beauty/comedogenic')
  return res.data
}

export async function scanComedogenic(ingredients: string[]): Promise<ComedogenicIngredient[]> {
  try {
    const res = await fetchJson<{ data: ComedogenicIngredient[] }>('/beauty/comedogenic/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    })
    return res.data
  } catch {
    return FALLBACK_COMEDOGENIC.filter((item) => {
      const haystack = [item.name, ...(item.aliases ?? [])].map((n) => n.toLowerCase())
      return ingredients.some((raw) => {
        const needle = raw.trim().toLowerCase()
        return haystack.some((v) => needle.includes(v) || v.includes(needle))
      })
    })
  }
}

export async function getPaoRules(): Promise<PaoRule[]> {
  const res = await fetchJson<{ data: PaoRule[] }>('/beauty/pao')
  return res.data
}

export async function getBrushTypes(): Promise<BrushType[]> {
  const res = await fetchJson<{ data: BrushType[] }>('/beauty/brushes/types')
  return res.data
}

export async function listHygieneTools(): Promise<HygieneTool[]> {
  const res = await fetchJson<{ data: HygieneTool[] }>('/beauty/brushes')
  return res.data
}

export async function createHygieneTool(input: {
  name: string
  tool_type: string
  last_cleaned_at: string | null
  notes: string | null
}): Promise<HygieneTool> {
  const res = await fetchJson<{ data: HygieneTool }>('/beauty/brushes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.data
}

export async function updateHygieneTool(
  id: number,
  input: {
    name: string
    tool_type: string
    last_cleaned_at: string | null
    notes: string | null
  },
): Promise<HygieneTool> {
  const res = await fetchJson<{ data: HygieneTool }>(`/beauty/brushes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.data
}

export async function deleteHygieneTool(id: number): Promise<void> {
  await fetchJson<{ message: string }>(`/beauty/brushes/${id}`, { method: 'DELETE' })
}

export async function getMaskRecipes(opts?: {
  target?: string
  concern?: string
  ingredient?: string
}): Promise<DiyMaskRecipe[]> {
  try {
    const params = new URLSearchParams()
    if (opts?.target) params.set('target', opts.target)
    if (opts?.concern) params.set('concern', opts.concern)
    if (opts?.ingredient) params.set('ingredient', opts.ingredient)
    const qs = params.toString() ? `?${params.toString()}` : ''
    const res = await fetchJson<{ data: DiyMaskRecipe[] }>(`/beauty/masks${qs}`)
    return res.data
  } catch {
    return FALLBACK_MASKS.filter((recipe) => {
      if (opts?.target && recipe.target !== opts.target) return false
      if (opts?.concern && recipe.concern !== opts.concern) return false
      if (opts?.ingredient && !recipe.base_ingredients.some((i) => i.toLowerCase().includes(opts.ingredient!.toLowerCase()))) {
        return false
      }
      return true
    })
  }
}

/**
 * Offline fallback sets so hybrid tools degrade gracefully when the API is down.
 */
export const FALLBACK_ACTIVES: ActiveIngredient[] = [
  { id: -1, slug: 'retinol', name: 'Retinol', category: 'retinoid', layer_type: 'serum', tip: 'Start 2-3 nights a week and buffer.' },
  { id: -2, slug: 'glycolic-acid', name: 'Glycolic Acid (AHA)', category: 'aha', layer_type: 'toner', tip: 'Strong exfoliant - use sparingly.' },
  { id: -3, slug: 'lactic-acid', name: 'Lactic Acid (AHA)', category: 'aha', layer_type: 'serum', tip: 'Gentler AHA that also hydrates.' },
  { id: -4, slug: 'salicylic-acid', name: 'Salicylic Acid (BHA)', category: 'bha', layer_type: 'toner', tip: 'Cleans pores, mostly at night.' },
  { id: -5, slug: 'benzoyl-peroxide', name: 'Benzoyl Peroxide', category: 'bha', layer_type: 'spot', tip: 'Bleaches fabric - keep off towels.' },
  { id: -6, slug: 'vit-c', name: 'Vitamin C (L-ascorbic acid)', category: 'vitamin_c', layer_type: 'serum', tip: 'Best in the morning under SPF.' },
  { id: -7, slug: 'niacinamide', name: 'Niacinamide', category: 'niacinamide', layer_type: 'serum', tip: 'Versatile - morning or night.' },
  { id: -8, slug: 'azelaic-acid', name: 'Azelaic Acid', category: 'azelaic_acid', layer_type: 'serum', tip: 'Calms redness and refines texture.' },
  { id: -9, slug: 'hyaluronic-acid', name: 'Hyaluronic Acid', category: 'hyaluronic_acid', layer_type: 'water', tip: 'Apply to damp skin, seal with moisturizer.' },
  { id: -10, slug: 'tretinoin', name: 'Tretinoin (prescription)', category: 'retinoid', layer_type: 'cream', tip: 'Pea-sized amount on dry skin at night.' },
]

export const FALLBACK_CONFLICTS: ActiveConflict[] = [
  {
    id: -1, ingredient_a: 'retinol', ingredient_b: 'glycolic-acid',
    a_name: 'Retinol', b_name: 'Glycolic Acid (AHA)', severity: 'warning',
    reason: 'Retinol plus AHAs on the same night can strip and irritate skin.',
    suggestion: 'Use AHA on alternate nights, or buffer retinol over moisturizer.',
  },
  {
    id: -2, ingredient_a: 'retinol', ingredient_b: 'salicylic-acid',
    a_name: 'Retinol', b_name: 'Salicylic Acid (BHA)', severity: 'warning',
    reason: 'Retinol and BHA both speed cell turnover.',
    suggestion: 'Use BHA morning or alternate evenings, never stacked.',
  },
  {
    id: -3, ingredient_a: 'retinol', ingredient_b: 'benzoyl-peroxide',
    a_name: 'Retinol', b_name: 'Benzoyl Peroxide', severity: 'avoid',
    reason: 'The combo oxidizes and severely dries skin.',
    suggestion: 'BP in the AM and retinol on separate nights.',
  },
  {
    id: -4, ingredient_a: 'retinol', ingredient_b: 'vit-c',
    a_name: 'Retinol', b_name: 'Vitamin C (L-ascorbic acid)', severity: 'warning',
    reason: 'Same-night use can destabilize vitamin C and cause stinging.',
    suggestion: 'Vitamin C in the morning, retinol at night.',
  },
  {
    id: -5, ingredient_a: 'benzoyl-peroxide', ingredient_b: 'vit-c',
    a_name: 'Benzoyl Peroxide', b_name: 'Vitamin C (L-ascorbic acid)', severity: 'avoid',
    reason: 'Benzoyl peroxide oxidizes and deactivates vitamin C.',
    suggestion: 'Split them between AM and PM routines.',
  },
  {
    id: -6, ingredient_a: 'vit-c', ingredient_b: 'niacinamide',
    a_name: 'Vitamin C (L-ascorbic acid)', b_name: 'Niacinamide', severity: 'caution',
    reason: 'Raw L-ascorbic acid next to niacinamide can cause a warm flush.',
    suggestion: 'Layer with a moisturizer between, or use at different times.',
  },
  {
    id: -7, ingredient_a: 'glycolic-acid', ingredient_b: 'salicylic-acid',
    a_name: 'Glycolic Acid (AHA)', b_name: 'Salicylic Acid (BHA)', severity: 'warning',
    reason: 'Stacking AHA and BHA in one routine strips the barrier.',
    suggestion: 'Choose one acid per evening depending on your goal.',
  },
  {
    id: -8, ingredient_a: 'tretinoin', ingredient_b: 'benzoyl-peroxide',
    a_name: 'Tretinoin (prescription)', b_name: 'Benzoyl Peroxide', severity: 'avoid',
    reason: 'Both are potent - combined use risks severe irritation.',
    suggestion: 'Choose one at a time, or use a formulated combo gel.',
  },
]

export const FALLBACK_COMEDOGENIC: ComedogenicIngredient[] = [
  { id: -1, name: 'Coconut oil', rating: 4, risk_level: 'high', explanation: 'Lauric acid is strongly pore-clogging for most skin.', aliases: ['cocos nucifera oil'] },
  { id: -2, name: 'Isopropyl myristate', rating: 5, risk_level: 'high', explanation: 'One of the most comedogenic common cosmetic esters.', aliases: ['ipm'] },
  { id: -3, name: 'Isopropyl palmitate', rating: 4, risk_level: 'high', explanation: 'Fast-absorbing but rated high for clogging.', aliases: ['ipp'] },
  { id: -4, name: 'Lanolin', rating: 3, risk_level: 'moderate', explanation: 'Wool wax - clogs in many, tolerated by some.', aliases: ['wool wax'] },
  { id: -5, name: 'Lauric acid', rating: 4, risk_level: 'high', explanation: 'Saturated fatty acid found in coconut and palm oil.', aliases: [] },
  { id: -6, name: 'Octyl palmitate', rating: 4, risk_level: 'high', explanation: 'Ester with a high pore-clogging score.', aliases: ['ethylhexyl palmitate'] },
  { id: -7, name: 'Cocoa butter', rating: 4, risk_level: 'high', explanation: 'Heavy solid oil that packages pores shut.', aliases: ['theobroma cacao'] },
  { id: -8, name: 'Beeswax', rating: 2, risk_level: 'low', explanation: 'Low risk, can trap other ingredients on the surface.', aliases: ['cera alba'] },
  { id: -9, name: 'Sweet almond oil', rating: 2, risk_level: 'low', explanation: 'Low rating; still heavy for very acne-prone skin.', aliases: ['prunus amygdalus dulcis oil'] },
  { id: -10, name: 'Olive oil', rating: 2, risk_level: 'low', explanation: 'Mildly comedogenic via its oleic acid content.', aliases: ['olea europaea oil'] },
  { id: -11, name: 'Castor oil', rating: 1, risk_level: 'low', explanation: 'Very low rating, often used in lip products.', aliases: ['ricinus communis oil'] },
  { id: -12, name: 'Argan oil', rating: 1, risk_level: 'low', explanation: 'Low risk, richer linoleic content.', aliases: ['argania spinosa oil'] },
  { id: -13, name: 'Squalane', rating: 1, risk_level: 'low', explanation: 'Non-comedogenic plant-derived emollient.', aliases: [] },
  { id: -14, name: 'Dimethicone', rating: 1, risk_level: 'low', explanation: 'Silicone rarely clogs by itself, sits on skin.', aliases: [] },
  { id: -15, name: 'Shea butter', rating: 0, risk_level: 'non', explanation: 'Rated non-comedogenic in studies.', aliases: ['butyrospermum parkii'] },
  { id: -16, name: 'Petrolatum', rating: 0, risk_level: 'non', explanation: 'Non-comedogenic barrier sealant.', aliases: ['vaseline', 'petroleum jelly'] },
  { id: -17, name: 'Hyaluronic acid', rating: 0, risk_level: 'non', explanation: 'Water-loving humectant, never clogs pores.', aliases: ['sodium hyaluronate'] },
  { id: -18, name: 'Stearic acid', rating: 2, risk_level: 'low', explanation: 'Mildly clogging; low when diluted in formulas.', aliases: [] },
]

export const FALLBACK_PAO: PaoRule[] = [
  { id: -1, product_type: 'Mascara & liquid eyeliner', pao_months: 3, shelf_life_months: 24, notes: 'Liquid products near eyes breed bacteria fastest.' },
  { id: -2, product_type: 'Pencil eyeliner & brow', pao_months: 12, shelf_life_months: 36, notes: 'Sharpen each use to expose fresh product.' },
  { id: -3, product_type: 'Liquid foundation', pao_months: 12, shelf_life_months: 24, notes: 'Pump bottles last longer than open jars.' },
  { id: -4, product_type: 'Cream foundation & concealer', pao_months: 12, shelf_life_months: 24, notes: 'Smell or texture change means toss it.' },
  { id: -5, product_type: 'Powder foundation', pao_months: 24, shelf_life_months: 36, notes: 'Dry powder lasts well - keep brushes clean.' },
  { id: -6, product_type: 'Powder blush & bronzer', pao_months: 24, shelf_life_months: 36, notes: 'Hard pan can be revived with tape, not water.' },
  { id: -7, product_type: 'Eyeshadow (powder)', pao_months: 24, shelf_life_months: 36, notes: 'Shadows age slowly unless they smell waxy.' },
  { id: -8, product_type: 'Lipstick', pao_months: 18, shelf_life_months: 36, notes: 'Waxy tubes resist bacteria but dry over time.' },
  { id: -9, product_type: 'Lip gloss / liquid lip', pao_months: 18, shelf_life_months: 24, notes: 'Wand in, wand out pulls bacteria - watch the smell.' },
  { id: -10, product_type: 'Setting spray & primer', pao_months: 12, shelf_life_months: 24, notes: 'Spray tubes stay cleaner; smell change means replace.' },
  { id: -11, product_type: 'Nail polish', pao_months: 24, shelf_life_months: 48, notes: 'Thickening or separating nails the expiry.' },
]

export const FALLBACK_BRUSH_TYPES: BrushType[] = [
  { id: -1, tool_type: 'makeup-sponge', category: 'face', recommended_days: 7, method: 'Wet, massage with solid cleanser, rinse, squeeze-dry.', notes: 'Replace the sponge every 3 months.' },
  { id: -2, tool_type: 'foundation-brush', category: 'face', recommended_days: 7, method: 'Swirl in micellar water, then liquid brush cleanser.', notes: 'Wash weekly even with liquid foundation.' },
  { id: -3, tool_type: 'blush-brush', category: 'face', recommended_days: 7, method: 'Shampoo bristles with warm water, reshape, dry flat.', notes: 'Powder does not mean low-maintenance.' },
  { id: -4, tool_type: 'powder-brush', category: 'face', recommended_days: 14, method: 'Daily dust-off plus weekly-deep clean.', notes: 'The biggest brush stays cleaner with less oil.' },
  { id: -5, tool_type: 'eyeshadow-brush', category: 'eye', recommended_days: 7, method: 'Spot-clean daily, deep clean weekly.', notes: 'Transfer between shadow colours contaminates.' },
  { id: -6, tool_type: 'eyeliner-brush', category: 'eye', recommended_days: 7, method: 'Rinse gel liners out immediately.', notes: 'Eyeliners touch the most sensitive skin.' },
  { id: -7, tool_type: 'lip-brush', category: 'lip', recommended_days: 7, method: 'Warm water, lather with brush cleanser, rinse.', notes: 'Wipe dry before re-use.' },
  { id: -8, tool_type: 'lash-curler', category: 'tool', recommended_days: 7, method: 'Wipe pads with rubbing alcohol weekly.', notes: 'Replace pads quarterly.' },
]

export const FALLBACK_MASKS: DiyMaskRecipe[] = [
  {
    id: -1, slug: 'oat-milk-honey-hydration', name: 'Oat, Milk & Honey Hydration Mask', target: 'face', concern: 'hydration',
    base_ingredients: ['rolled oats', 'milk or plain water', 'raw honey'],
    optional_ingredients: ['few drops of vitamin E oil', 'splash of aloe vera gel'],
    steps: ['Grind 3 tablespoons of oats into a fine powder.', 'Stir in 2 tablespoons of milk until smooth.', 'Add 1 teaspoon of honey and mix to a paste.', 'Apply to damp skin for 10 minutes.', 'Rinse lukewarm and pat dry.'],
    tips: 'Honey is humectant - this mask pulls moisture in.', prep_minutes: 5,
    benefits: 'Soothes dry patches and strengthens the moisture barrier.',
  },
  {
    id: -2, slug: 'clay-lemon-balancing', name: 'Clay & Citrus Balance Mask', target: 'face', concern: 'oiliness',
    base_ingredients: ['kaolin or bentonite clay', 'apple cider vinegar or water', 'few drops of jojoba oil'],
    optional_ingredients: ['dash of ground turmeric'],
    steps: ['Mix 2 tablespoons of clay with just enough liquid.', 'Add jojoba oil so the clay does not crack skin.', 'Apply thinly, avoid eyes, leave 8-10 minutes.', 'Remove before fully dry with a damp cloth.'],
    tips: 'Never let clay harden completely - it strips moisture.', prep_minutes: 5,
    benefits: 'Balances shine and tightens pores without harsh detergent.',
  },
  {
    id: -3, slug: 'yogurt-turmeric-brightening', name: 'Yogurt & Turmeric Glow Mask', target: 'face', concern: 'brightening',
    base_ingredients: ['plain yogurt', 'ground turmeric', 'raw honey'],
    optional_ingredients: ['squeeze of lemon (oily skin only)'],
    steps: ['Whisk 2 tablespoons yogurt with 1/4 teaspoon turmeric.', 'Stir in 1 teaspoon honey until golden.', 'Apply for 12 minutes, rinse warm.', 'Follow with moisturizer.'],
    tips: 'Turmeric stains nails - wear gloves or rinse fast.', prep_minutes: 3,
    benefits: 'Lactic acid plus curcumin brightens dull skin.',
  },
  {
    id: -4, slug: 'coconut-banana-deep-condition', name: 'Coconut & Banana Deep Conditioner', target: 'hair', concern: 'damage',
    base_ingredients: ['ripe banana', 'coconut oil', 'raw honey'],
    optional_ingredients: ['egg yolk', 'yogurt splash'],
    steps: ['Mash 1 banana with 2 tablespoons melted coconut oil.', 'Whisk in 1 tablespoon honey.', 'Massage into damp lengths, avoiding roots.', 'Wrap in a shower cap for 20 minutes.', 'Shampoo twice to fully rinse.'],
    tips: 'Strain the mix - banana chunks stick to strands.', prep_minutes: 6,
    benefits: 'Replenishes brittle, heat-damaged or colour-treated hair.',
  },
  {
    id: -5, slug: 'tea-tree-clay-detox', name: 'Tea Tree Clay Scalp Detox', target: 'scalp', concern: 'dandruff',
    base_ingredients: ['bentonite clay', 'brewed green tea', '2 drops of tea tree oil'],
    optional_ingredients: ['drop of peppermint oil'],
    steps: ['Mix 2 tablespoons clay with cooled tea to paste.', 'Stir in tea tree oil at the end.', 'Part hair and brush paste onto the scalp.', 'Rinse after 8 minutes - do not let clay harden.'],
    tips: 'Tea tree calms flaking; clay lifts oil.', prep_minutes: 6,
    benefits: 'Reduces dandruff flakes and excess scalp oil.',
  },
  {
    id: -6, slug: 'acv-clarifying-rinse', name: 'ACV Clarifying Rinse', target: 'hair', concern: 'oiliness',
    base_ingredients: ['apple cider vinegar', 'cool water'],
    optional_ingredients: ['splash of rosemary water'],
    steps: ['Dilute 2 tablespoons ACV in 1 cup cool water.', 'Pour over washed hair after shampoo.', 'Let sit 30 seconds, rinse cool.', 'Use weekly - never apply ACV undiluted.'],
    tips: 'Undiluted ACV burns the scalp.', prep_minutes: 2,
    benefits: 'Lowers pH, cuts build-up and boosts shine.',
  },
  {
    id: -7, slug: 'green-tea-rosemary-rinse', name: 'Green Tea & Rosemary Growth Rinse', target: 'hair', concern: 'growth',
    base_ingredients: ['fresh rosemary sprigs', 'green tea', 'cool water'],
    optional_ingredients: ['few drops of peppermint oil'],
    steps: ['Simmer 3 sprigs in 2 cups green tea for 5 minutes.', 'Cool completely and strain.', 'Pour over clean damp hair after washing.', 'Massage into roots; do not rinse out.'],
    tips: 'Best used 2-3 times a week over months.', prep_minutes: 7,
    benefits: 'Rosemary extracts support thicker-feeling roots.',
  },
  {
    id: -8, slug: 'avocado-aloe-scalp', name: 'Avocado & Aloe Scalp Quencher', target: 'scalp', concern: 'hydration',
    base_ingredients: ['ripe avocado', 'aloe vera gel'],
    optional_ingredients: ['few drops of tea tree oil', 'plain yogurt'],
    steps: ['Blend half an avocado with 3 tablespoons aloe gel.', 'Massage into the scalp in small circles.', 'Leave 15 minutes under a warm towel.', 'Rinse lukewarm and shampoo lightly.'],
    tips: 'Focus on the crown where barrier wear shows first.', prep_minutes: 5,
    benefits: 'Rehydrates itching, tight, low-moisture scalps.',
  },
]