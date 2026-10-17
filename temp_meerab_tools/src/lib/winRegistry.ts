export interface WinSubcategoryMeta {
  id: string
  name: string
  toolCount: number
  path: string
}

export interface WinCategoryMeta {
  id: string
  name: string
  description: string
  toolCount: number
  subcategories: WinSubcategoryMeta[]
  path: string
}

export interface RawWinTool {
  'No.': number
  'Target User': string
  'Life Stage / Need': string
  Category: string
  'Tool Name': string
  Purpose: string
  Priority: string
}

export interface WinTool extends RawWinTool {
  id: string
  slug: string
  name: string
  purpose: string
  categoryId: string
  subcategoryId: string
  categoryName: string
  subcategoryName: string
  path: string
  keywords: string[]
  templateType: string
  targetUser: string
}

export interface WinSubcategoryData {
  meta?: WinSubcategoryMeta
  tools: WinTool[]
  loading: boolean
  error: boolean
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'money-budget':
    'Track spending, plan savings and calculate mortgages, EMIs, loans and everyday money tasks.',
  'home-household':
    'Run your home like a pro with cleaning schedules, shopping lists, appliance and repair calculators.',
  'cooking-kitchen':
    'Portions, unit conversions, nutrition, recipe scaling and kitchen math made effortless.',
  'study-education':
    'Grade calculators, study planners, note helpers and academic conversion tools for every learner.',
  'career-work':
    'Salary, interview, resume and workplace productivity utilities for getting ahead at work.',
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/['’]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function cleanTitle(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/'/g, '’')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

function inspectName(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase()
  return needles.some((n) => h.includes(n))
}

const VARIANT_PREFIXES = new Set([
  'budget',
  'calculator',
  'checklist',
  'daily',
  'log',
  'monthly',
  'planner',
  'quick',
  'reminder',
  'tracker',
  'weekly',
])

export function classifyTemplate(name: string, purpose: string): string {
  const trimmed = name.trim()
  const first = trimmed.split(/\s+/)[0]?.toLowerCase() ?? ''
  const base = VARIANT_PREFIXES.has(first) ? trimmed.replace(/^\S+\s+/, '') : trimmed
  const n = `${base} ${purpose}`.toLowerCase()

  // Health & fitness — real body inputs
  if (inspectName(n, ['body fat', 'bmi', 'bmr', 'tdee', 'calorie', 'heart rate', 'water intake', 'sleep', 'ideal weight', 'waist', 'neck', 'fitness', 'body mass'])) {
    return 'health_fitness'
  }

  // Timer / stopwatch / countdown
  if (inspectName(n, ['timer', 'stopwatch', 'countdown', 'pomodoro'])) {
    return 'timer_tracker'
  }

  // Text manipulation tools
  if (inspectName(n, ['essay', 'word count', 'word counter', 'character count', 'uppercase', 'lowercase', 'case', 'text tool', 'reverse', 'strip', 'remover of text', 'text reversal'])) {
    return 'text_manipulator'
  }

  // QR / barcode
  if (inspectName(n, ['qr code', 'barcode', 'qr generator'])) {
    return 'qr_barcode'
  }

  // Unit converter — includes volume cooking (cup / tbsp / tsp) and currency
  if (inspectName(n, ['convert', 'converter', 'celsius', 'fahrenheit', 'measurement', 'ounce', 'cup', 'tbsp', 'tsp', 'currency', 'unit'])) {
    // Ingredient / ratio converters belong to the smart-form ratio family instead.
    if (inspectName(n, ['ingredient', 'substitut', 'ratio'])) {
      return 'smart_form'
    }
    return 'unit_converter'
  }

  // Document generator — resume / CV / cover letter / invoice / proposals / bio etc.
  if (inspectName(n, ['resume', 'cv ', 'cover letter', 'invoice', 'proposal', 'letter of', 'bio', 'agenda', 'presentation', 'speech'])) {
    return 'document_generator'
  }

  // Smart-form finance cues — checked BEFORE checklist
  if (
    inspectName(n, [
      'savings',
      'emergency fund',
      'debt payoff',
      'payoff',
      'cost estimator',
      'splitter',
      'bill tracker',
      'expense tracker',
      'bill',
      'expense',
      'emi',
      'loan',
      'mortgage',
      'tax',
      'salary',
      'hourly',
      'freelance',
      'overtime',
      'leave balance',
      'work hours',
      'hourly pay',
      'grade',
      'gpa',
      'cgpa',
      'grade point',
      'percentage',
      'percent',
      'discount',
      'markup',
      'profit',
      'sale price',
      'margin',
      'interest',
      'budget',
      'gold',
      'zakat',
      'portion',
      'serving',
      'scaler',
      'recipe scaler',
      'cost',
    ])
  ) {
    return 'smart_form'
  }

  // Checklist / planner / tracker / inventory / quiz etc.
  if (
    inspectName(n, [
      'checklist',
      'to-do',
      'todo',
      'list',
      'inventory',
      'stock',
      'pantry',
      'schedule',
      'planner',
      'planner list',
      'timetable',
      'tracker',
      'habit',
      'progress',
      'checker',
      'quiz',
      'flashcard',
      'interview question',
      'meal plan',
      'menu',
      'clean',
      'cleaning',
      'watering',
      'chore',
      'plant care',
      'laundry',
      'study',
      'course',
      'assignment',
      'school',
      'class',
      'homework',
      'note',
      'flash card',
      'organizer',
      'organiser',
    ])
  ) {
    return 'checklist_tracker'
  }

  // Generator utility — password / random / uuid / username / lorem only
  if (inspectName(n, ['password', 'random', 'uuid', 'username', 'lorem'])) {
    return 'generator_utility'
  }

  // Default: structured smart form with parameter-driven UI
  return 'smart_form'
}

interface RegistryEntry {
  category: string
  subcategory: string
  toolCount: number
  dataFile: string
}

function parseCsv(csv: string): RegistryEntry[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const header = lines[0].split(',')
  const out: RegistryEntry[] = []
  for (const line of lines.slice(1)) {
    const cells = line.split(',')
    const idx = (name: string) => header.indexOf(name)
    const get = (name: string) => (cells[idx(name)] ?? '').replace(/^"|"$/g, '').trim()
    out.push({
      category: get('Category'),
      subcategory: get('Subcategory'),
      toolCount: Number(get('Tool Count')) || 0,
      dataFile: get('JSON File'),
    })
  }
  return out
}

let indexPromise: Promise<WinCategoryMeta[]> | null = null

export function loadWinIndex(): Promise<WinCategoryMeta[]> {
  if (indexPromise) return indexPromise
  indexPromise = (async () => {
    try {
      const res = await fetch('/registry/category-registry.json')
      if (!res.ok) throw new Error('registry missing')
      const entries = (await res.json()) as RegistryEntry[]
      return buildWinCategories(entries)
    } catch {
      try {
        const res = await fetch('/registry/CATEGORY_INDEX.csv')
        if (!res.ok) throw new Error('csv missing')
        const entries = parseCsv(await res.text())
        return buildWinCategories(entries)
      } catch {
        return []
      }
    }
  })()
  return indexPromise
}

function buildWinCategories(entries: RegistryEntry[]): WinCategoryMeta[] {
  const map = new Map<string, WinCategoryMeta>()
  for (const e of entries) {
    const categoryId = slugify(e.category)
    const subId = slugify(e.subcategory)
    let cat = map.get(categoryId)
    if (!cat) {
      cat = {
        id: categoryId,
        name: e.category,
        description: CATEGORY_DESCRIPTIONS[categoryId] ?? `Free browser-based tools for ${e.category.toLowerCase()}.`,
        toolCount: 0,
        subcategories: [],
        path: `/category/${categoryId}`,
      }
      map.set(categoryId, cat)
    }
    const path = `/category/${categoryId}/${subId}`
    if (!cat.subcategories.some((s) => s.id === subId)) {
      cat.subcategories.push({
        id: subId,
        name: e.subcategory,
        toolCount: e.toolCount,
        path,
      })
    }
  }
  return Array.from(map.values()).map((cat) => ({
    ...cat,
    toolCount: cat.subcategories.reduce((sum, s) => sum + s.toolCount, 0),
  }))
}

const toolsCache = new Map<string, Promise<WinTool[]>>()

export function loadWinTools(categoryId: string, subcategoryId: string): Promise<WinTool[]> {
  const key = `${categoryId}/${subcategoryId}`
  const cached = toolsCache.get(key)
  if (cached) return cached
  const url = `/registry/data/${categoryId}-${subcategoryId}.json`
  const promise = (async () => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('no data')
      const raw = (await res.json()) as RawWinTool[]
      return mapRawTools(raw, categoryId, subcategoryId)
    } catch {
      return []
    }
  })()
  toolsCache.set(key, promise)
  return promise
}

function mapRawTools(raw: RawWinTool[], categoryId: string, subcategoryId: string): WinTool[] {
  const seen = new Set<string>()
  const categoryName = cleanTitle(categoryId)
  const subcategoryName = cleanTitle(subcategoryId)
  const out: WinTool[] = []
  for (const r of raw) {
    const name = (r['Tool Name'] ?? '').trim()
    if (!name) continue
    const base = slugify(name)
    let slug = base
    let n = 2
    while (seen.has(slug)) slug = `${base}-${n++}`
    seen.add(slug)
    const targetUser = cleanTitle(r['Target User'] ?? '')
    const purpose = (r['Purpose'] ?? '').trim()
    const keywords = [name, purpose, categoryName, subcategoryName, targetUser]
      .filter(Boolean)
      .flatMap((s) => s.toLowerCase().split(/\s+/))
    out.push({
      ...r,
      id: slug,
      slug,
      name,
      purpose,
      categoryId,
      subcategoryId,
      categoryName: r.Category || categoryName,
      subcategoryName,
      path: `/category/${categoryId}/${subcategoryId}/${slug}`,
      keywords: Array.from(new Set(keywords)),
      templateType: classifyTemplate(name, purpose),
      targetUser,
    })
  }
  const priorityOrder: Record<string, number> = { essential: 0, useful: 1, extra: 2 }
  return out.sort((a, b) => {
    const pa = priorityOrder[(a.Priority ?? '').toLowerCase()] ?? 1
    const pb = priorityOrder[(b.Priority ?? '').toLowerCase()] ?? 1
    if (pa !== pb) return pa - pb
    return a.name.localeCompare(b.name)
  })
}