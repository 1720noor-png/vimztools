export const HOUSEHOLD_API = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

export interface StainRemedy {
  id: number
  stain_type: string
  fabric_type: string
  remedy_steps: string[]
  ingredients: string[] | null
  tips: string | null
  warning: string | null
}

export interface CleaningSurface {
  id: number
  slug: string
  name: string
  category: string | null
  care_notes: string | null
}

export interface SurfaceCleaner {
  agent: {
    id: number
    slug: string
    name: string
    usage_kind: string
    description: string | null
  }
  is_safe: boolean
  notes: string | null
}

export interface MaintenanceAsset {
  id: number
  name: string
  category: string
  interval_months: number
  last_serviced_at: string | null
  next_due_at: string | null
  notes: string | null
  updated_at: string | null
}

async function fetchJson<T>(path: string, init?: RequestInit, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${HOUSEHOLD_API}${path}`, {
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

export async function getStainRemedies(opts?: {
  stain_type?: string
  fabric_type?: string
}): Promise<StainRemedy[]> {
  const params = new URLSearchParams()
  if (opts?.stain_type) params.set('stain_type', opts.stain_type)
  if (opts?.fabric_type) params.set('fabric_type', opts.fabric_type)
  const qs = params.toString() ? `?${params.toString()}` : ''
  const res = await fetchJson<{ data: StainRemedy[] }>(`/household/stains${qs}`)
  return res.data
}

export async function getCleaningSurfaces(): Promise<CleaningSurface[]> {
  const res = await fetchJson<{ data: CleaningSurface[] }>('/household/cleaners/surfaces')
  return res.data
}

export async function getSurfaceCleaners(surfaceSlug: string): Promise<SurfaceCleaner[]> {
  const res = await fetchJson<{ data: SurfaceCleaner[] }>(
    `/household/cleaners?surface=${encodeURIComponent(surfaceSlug)}`,
  )
  return res.data
}

export async function listMaintenanceAssets(): Promise<MaintenanceAsset[]> {
  const res = await fetchJson<{ data: MaintenanceAsset[] }>('/household/maintenance-assets')
  return res.data
}

export async function createMaintenanceAsset(input: {
  name: string
  category: string
  interval_months: number
  last_serviced_at: string | null
  notes: string | null
}): Promise<MaintenanceAsset> {
  const res = await fetchJson<{ data: MaintenanceAsset }>('/household/maintenance-assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.data
}

export async function updateMaintenanceAsset(
  id: number,
  input: {
    name: string
    category: string
    interval_months: number
    last_serviced_at: string | null
    notes: string | null
  },
): Promise<MaintenanceAsset> {
  const res = await fetchJson<{ data: MaintenanceAsset }>(`/household/maintenance-assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.data
}

export async function deleteMaintenanceAsset(id: number): Promise<void> {
  await fetchJson<{ message: string }>(`/household/maintenance-assets/${id}`, { method: 'DELETE' })
}

/**
 * Offline fallback sets so hybrid tools degrade gracefully when the API is down.
 */
export const FALLBACK_STAIN_REMEDIES: StainRemedy[] = [
  {
    id: -1,
    stain_type: 'coffee',
    fabric_type: 'Cotton',
    remedy_steps: [
      'Blot the spill with a clean cloth - never rub.',
      'Rinse the mark with cold water from the back.',
      'Work in a few drops of mild dish soap and let it sit 5 minutes.',
      'Apply an enzyme stain remover before washing.',
      'Wash and air-dry to confirm removal before heat.',
    ],
    ingredients: ['cold water', 'mild dish soap', 'enzyme stain remover'],
    tips: 'Treat quickly; heat permanently sets coffee stains.',
    warning: null,
  },
  {
    id: -2,
    stain_type: 'red-wine',
    fabric_type: 'Cotton',
    remedy_steps: [
      'Blot the spill and cover it with table salt to draw out the wine.',
      'Let the salt sit 10 minutes, then brush it off.',
      'Flush with cold water, then sponge white vinegar over the mark.',
      'Work in a little dish soap and rinse well.',
      'For cotton, test hydrogen peroxide on an inner hem before applying.',
    ],
    ingredients: ['table salt', 'cold water', 'white vinegar', 'mild dish soap', 'hydrogen peroxide 3% (cotton only)'],
    tips: 'Club soda also lifts fresh red wine.',
    warning: 'Never use hydrogen peroxide on silk or wool.',
  },
  {
    id: -3,
    stain_type: 'blood',
    fabric_type: 'Cotton',
    remedy_steps: [
      'Flush with cold water immediately - hot water sets protein stains.',
      'Soak in cold water with a pinch of salt for 20-30 minutes.',
      'Apply an enzyme-based stain remover.',
      'Gently rub, let sit 10 minutes, then rinse.',
      'Launder in cold water and air-dry.',
    ],
    ingredients: ['cold water', 'enzyme stain remover', 'table salt'],
    tips: 'Set-in blood on cotton: blot with cold hydrogen peroxide, then rinse at once.',
    warning: 'Never use hot water or a hot dryer on blood stains.',
  },
  {
    id: -4,
    stain_type: 'oil-grease',
    fabric_type: 'Cotton',
    remedy_steps: [
      'Scrape off excess grease and lay the item flat.',
      'Sprinkle baking soda on the spot; leave 15 minutes and brush off.',
      'Apply a few drops of dish soap and rub gently.',
      'Wash with a degreasing detergent at the highest safe temperature.',
      'Inspect after the cycle - dryer heat sets grease stains.',
    ],
    ingredients: ['baking soda', 'mild dish soap', 'warm water', 'degreasing detergent'],
    tips: 'Rub detergent directly into the fibres and wait 30 minutes for stubborn grease.',
    warning: null,
  },
  {
    id: -5,
    stain_type: 'ink',
    fabric_type: 'Polyester',
    remedy_steps: [
      'Place a paper towel under the stain.',
      'Dampen a cloth with rubbing alcohol and blot the ink.',
      'Keep moving to a clean area of the towel as dye transfers.',
      'Flush with warm water and work dish soap through the area.',
      'Rinse, wash and air-dry.',
    ],
    ingredients: ['rubbing alcohol 70%', 'clean white cloth', 'mild dish soap', 'warm water'],
    tips: 'Gel and ballpoint inks lift well; marker may need a dedicated remover.',
    warning: null,
  },
  {
    id: -6,
    stain_type: 'sweat',
    fabric_type: 'Cotton',
    remedy_steps: [
      'Rinse the armpit area with warm water.',
      'Soak in a colour-safe oxygen bleach solution for 30 minutes.',
      'Sponge white vinegar over the yellow ring to cut body-oil residue.',
      'Work an enzyme remover into the seam and let it sit 10 minutes.',
      'Wash without hot water to avoid baking oils in.',
    ],
    ingredients: ['oxygen bleach', 'white vinegar', 'warm water', 'enzyme stain remover'],
    tips: 'A vinegar rinse cycle deodorises and prevents yellow build-up.',
    warning: null,
  },
  {
    id: -7,
    stain_type: 'grass',
    fabric_type: 'Cotton',
    remedy_steps: [
      'Scrape off dried clumps - grass is organic and needs enzymes.',
      'Soak the area in cold-to-warm water with enzyme remover for 15 minutes.',
      'Massage dish soap into the stain and rinse.',
      'Sponge a 1:1 vinegar and water mix if a green tint remains.',
      'Wash at the warmest safe temperature before heat sets it.',
    ],
    ingredients: ['enzyme stain remover', 'mild dish soap', 'white vinegar', 'warm water'],
    tips: 'A baking soda paste lifts fresh grass on tougher fabrics.',
    warning: null,
  },
  {
    id: -8,
    stain_type: 'tomato-sauce',
    fabric_type: 'Cotton',
    remedy_steps: [
      'Scrape off excess paste with a spoon edge.',
      'Flush the spot with cold water from the reverse side.',
      'Work dish soap in, then sponge vinegar diluted 1:3 with water.',
      'Rinse and finish with an enzyme remover.',
      'Launder promptly - dried red sauces are far harder to lift.',
    ],
    ingredients: ['cold water', 'mild dish soap', 'white vinegar', 'enzyme stain remover'],
    tips: 'Lay the garment flat while treating so the stain does not spread.',
    warning: null,
  },
]

export const FALLBACK_SURFACES: CleaningSurface[] = [
  { id: -1, slug: 'marble', name: 'Marble countertop', category: 'stone', care_notes: 'Acids etch marble; use pH-neutral products.' },
  { id: -2, slug: 'granite', name: 'Granite countertop', category: 'stone', care_notes: 'Avoid acids that dull the sealant.' },
  { id: -3, slug: 'hardwood', name: 'Hardwood floor', category: 'wood', care_notes: 'Never flood or steam; use a barely-damp mop.' },
  { id: -4, slug: 'ceramic-tile', name: 'Ceramic tile / porcelain', category: 'tile', care_notes: 'Nearly any cleaner is fine; grout needs gentler handling.' },
  { id: -5, slug: 'stainless-steel', name: 'Stainless steel', category: 'metal', care_notes: 'Wipe along the grain; avoid harsh abrasives.' },
  { id: -6, slug: 'glass', name: 'Glass & mirrors', category: 'glass', care_notes: 'Ammonia and alcohol work well.' },
  { id: -7, slug: 'leather-sofa', name: 'Leather sofa', category: 'furniture', care_notes: 'PH-neutral, soap-based cleaners only; condition regularly.' },
  { id: -8, slug: 'wool-rug', name: 'Wool rug / carpet', category: 'textile', care_notes: 'Blot, never scrub; avoid over-wetting.' },
]

export const FALLBACK_CLEANERS: Record<string, SurfaceCleaner[]> = {
  marble: [
    safeCleaner('stone-safe-cleaner', 'pH-neutral stone cleaner', 'Formulated for marble and granite.'),
    safeCleaner('mild-dish-soap', 'Mild dish soap solution', 'A few drops of dish soap in warm water.'),
    safeCleaner('microfiber-water', 'Microfiber + plain water', 'Mechanical cleaning with zero residue.'),
    unsafeCleaner('white-vinegar', 'White vinegar (diluted 1:3)', 'Acid etches marble permanently; use stone-safe cleaner instead.'),
    unsafeCleaner('lemon-juice', 'Lemon juice', 'Citric acid dulls and etches the polished face.'),
    unsafeCleaner('chlorine-bleach', 'Chlorine bleach (diluted)', 'Bleach etches and discolours natural stone.'),
  ],
  granite: [
    safeCleaner('stone-safe-cleaner', 'pH-neutral stone cleaner', 'Formulated for granite and marble.'),
    safeCleaner('mild-dish-soap', 'Mild dish soap solution', 'A few drops of dish soap in warm water.'),
    safeCleaner('microfiber-water', 'Microfiber + plain water', 'Mechanical cleaning with zero residue.'),
    unsafeCleaner('white-vinegar', 'White vinegar (diluted 1:3)', 'Acid attacks the sealer and dulls the finish.'),
    unsafeCleaner('chlorine-bleach', 'Chlorine bleach (diluted)', 'Strong bleach degrades the sealant.'),
  ],
  hardwood: [
    safeCleaner('mild-dish-soap', 'Mild dish soap solution', 'A few drops of dish soap in warm water.'),
    safeCleaner('microfiber-water', 'Microfiber + plain water', 'Mechanical cleaning with zero residue.'),
    unsafeCleaner('white-vinegar', 'White vinegar (diluted 1:3)', 'Acid strips the topcoat on real wood.'),
    unsafeCleaner('ammonia', 'Ammonia solution', 'Ammonia can soften and discolour the finish.'),
    unsafeCleaner('chlorine-bleach', 'Chlorine bleach (diluted)', 'Never bleach wood - it destroys the colour.'),
  ],
  'ceramic-tile': [
    safeCleaner('mild-dish-soap', 'Mild dish soap solution', 'A few drops of dish soap in warm water.'),
    safeCleaner('white-vinegar', 'White vinegar (diluted 1:3)', 'Fine on the glaze; rinse grout lines after.'),
    safeCleaner('chlorine-bleach', 'Chlorine bleach (diluted)', 'Only on grout-rated use; keep off coloured grout.'),
    safeCleaner('ammonia', 'Ammonia solution', 'Strong streak-free cleaner - ventilate well.'),
  ],
  'stainless-steel': [
    safeCleaner('mild-dish-soap', 'Mild dish soap solution', 'A few drops of dish soap in warm water.'),
    safeCleaner('white-vinegar', 'White vinegar (diluted 1:3)', 'Cuts grease and water spots.'),
    safeCleaner('rubbing-alcohol', 'Rubbing alcohol (70%)', 'Lifts fingerprints and sticky residue.'),
    safeCleaner('microfiber-water', 'Microfiber + plain water', 'Mechanical cleaning with zero residue.'),
    unsafeCleaner('chlorine-bleach', 'Chlorine bleach (diluted)', 'Chlorides cause pitting corrosion on steel.'),
  ],
  glass: [
    safeCleaner('ammonia', 'Ammonia solution', 'Strength streak-free glass cleaner - ventilate.'),
    safeCleaner('white-vinegar', 'White vinegar (diluted 1:3)', 'Cuts hard-water film; air-dries streak-free.'),
    safeCleaner('rubbing-alcohol', 'Rubbing alcohol (70%)', 'Fast-drying polish for mirrors.'),
    unsafeCleaner('baking-soda', 'Baking soda paste', 'Too gritty; scratches plain glass.'),
  ],
  'leather-sofa': [
    safeCleaner('leather-conditioner', 'Leather cleaner-conditioner', 'Soap-based cleaner that replaces oils.'),
    safeCleaner('microfiber-water', 'Microfiber + plain water', 'Mechanical cleaning with zero residue.'),
    unsafeCleaner('white-vinegar', 'White vinegar (diluted 1:3)', 'Acid dries out and cracks leather.'),
    unsafeCleaner('ammonia', 'Ammonia solution', 'Dries and yellows the hide.'),
    unsafeCleaner('chlorine-bleach', 'Chlorine bleach (diluted)', 'Destroys leather completely.'),
  ],
  'wool-rug': [
    safeCleaner('mild-dish-soap', 'Mild dish soap solution', 'A few drops of dish soap in warm water.'),
    safeCleaner('microfiber-water', 'Microfiber + plain water', 'Mechanical cleaning with zero residue.'),
    unsafeCleaner('chlorine-bleach', 'Chlorine bleach (diluted)', 'Bleach disintegrates wool instantly.'),
    unsafeCleaner('hydrogen-peroxide', 'Hydrogen peroxide (3%)', 'Bleaches wool fibres.'),
  ],
}

function safeCleaner(slug: string, name: string, description: string): SurfaceCleaner {
  return { agent: { id: -1, slug, name, usage_kind: 'daily', description }, is_safe: true, notes: null }
}

function unsafeCleaner(slug: string, name: string, description: string): SurfaceCleaner {
  return {
    agent: { id: -1, slug, name, usage_kind: 'caution', description },
    is_safe: false,
    notes: description,
  }
}