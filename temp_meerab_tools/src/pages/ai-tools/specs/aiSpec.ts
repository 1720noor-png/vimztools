export type Tone = 'good' | 'warn' | 'bad' | 'neutral'

export interface ToolResult {
  label: string
  value: string
  tone?: Tone
  hint?: string
  raw?: string
  pct?: number
}

export interface NumberField {
  kind: 'number'
  key: string
  label: string
  min?: number
  max?: number
  step?: number
  def?: number
  suffix?: string
  hint?: string
}

export interface SelectField {
  kind: 'select'
  key: string
  label: string
  options: string[]
  def?: string
}

export interface TextField {
  kind: 'text'
  key: string
  label: string
  lines?: number
  def?: string
}

export interface ChecklistField {
  kind: 'checklist'
  key: string
  label: string
  items: string[]
}

export type Field = NumberField | SelectField | TextField | ChecklistField

export type Values = Record<string, string | number | boolean[] | undefined>

export interface AiToolSpec {
  id: string
  name: string
  subject: string
  blurb: string
  tip: string
  usage: [string, string, string]
  method: string[]
  fields: Field[]
  compute: (v: Values) => ToolResult[]
}

// Field creation helpers
export const n = (
  key: string,
  label: string,
  def = 0,
  min?: number,
  max?: number,
  step?: number,
  suffix?: string,
  hint?: string,
): NumberField => ({
  kind: 'number',
  key,
  label,
  def,
  min,
  max,
  step,
  suffix,
  hint,
})

export const sel = (key: string, label: string, options: string[], def?: string): SelectField => ({
  kind: 'select',
  key,
  label,
  options,
  def: def ?? options[0],
})

export const txt = (key: string, label: string, def = '', lines = 3): TextField => ({
  kind: 'text',
  key,
  label,
  def,
  lines,
})

export const ck = (key: string, label: string, items: string[]): ChecklistField => ({
  kind: 'checklist',
  key,
  label,
  items,
})

// Result creation helpers
export const res = (label: string, value: string, tone?: Tone, hint?: string): ToolResult => ({
  label,
  value,
  tone,
  hint,
})

export const docres = (label: string, raw: string, hint?: string): ToolResult => ({
  label,
  value: '',
  raw,
  hint,
})

export const pctres = (
  label: string,
  value: string,
  pct: number,
  tone?: Tone,
  hint?: string,
): ToolResult => ({
  label,
  value,
  pct: Math.max(0, Math.min(100, pct)),
  tone,
  hint,
})

// Value extraction helpers
export const asNum = (v: Values, key: string, fallback = 0): number => {
  const raw = v[key]
  if (typeof raw === 'number') return isNaN(raw) ? fallback : raw
  if (typeof raw === 'string') {
    const parsed = parseFloat(raw)
    return isNaN(parsed) ? fallback : parsed
  }
  return fallback
}

export const asStr = (v: Values, key: string, fallback = ''): string => {
  const raw = v[key]
  if (typeof raw === 'string') return raw
  if (typeof raw === 'number') return String(raw)
  return fallback
}

export const asSel = (v: Values, key: string, fallback = ''): string => {
  const raw = v[key]
  return typeof raw === 'string' && raw.length > 0 ? raw : fallback
}

export const asBoolList = (v: Values, key: string, count: number): boolean[] => {
  const raw = v[key]
  if (Array.isArray(raw)) return raw.map(Boolean)
  return Array(count).fill(false)
}

// Formatting helpers
export const fmtNum = (n: number, decimals = 0): string =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '0'

export const fmtMoney = (n: number, decimals = 2): string =>
  `$${Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '0.00'}`

export const fmtBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const val = bytes / Math.pow(1024, i)
  return `${val.toFixed(i === 0 ? 0 : 2)} ${units[i]}`
}

export const initAiValues = (fields: Field[]): Values => {
  const out: Values = {}
  for (const f of fields) {
    if (f.kind === 'number') out[f.key] = f.def ?? 0
    else if (f.kind === 'select') out[f.key] = f.def ?? f.options[0]
    else if (f.kind === 'text') out[f.key] = f.def ?? ''
    else if (f.kind === 'checklist') out[f.key] = f.items.map(() => false)
  }
  return out
}
