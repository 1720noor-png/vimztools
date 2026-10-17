export type Tone = 'good' | 'warn' | 'bad' | 'neutral'

export interface ToolResult {
  title: string
  value: string
  tone?: Tone
  badge?: string
  note?: string
  pct?: number
  isCode?: boolean
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

export interface DevCloudSpec {
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

export function n(
  key: string,
  label: string,
  def: number,
  min?: number,
  max?: number,
  step?: number,
  suffix?: string,
  hint?: string,
): NumberField {
  return { kind: 'number', key, label, def, min, max, step, suffix, hint }
}

export function sel(
  key: string,
  label: string,
  options: string[],
  def?: string,
): SelectField {
  return { kind: 'select', key, label, options, def: def ?? options[0] }
}

export function txt(
  key: string,
  label: string,
  def?: string,
  lines?: number,
): TextField {
  return { kind: 'text', key, label, def: def ?? '', lines: lines ?? 3 }
}

export function ck(key: string, label: string, items: string[]): ChecklistField {
  return { kind: 'checklist', key, label, items }
}

export function res(
  title: string,
  value: string,
  tone?: Tone,
  note?: string,
  badge?: string,
): ToolResult {
  return { title, value, tone: tone ?? 'neutral', note, badge }
}

export function docres(
  title: string,
  code: string,
  note?: string,
  badge?: string,
): ToolResult {
  return { title, value: code, tone: 'neutral', note, badge, isCode: true }
}

export function pctres(
  title: string,
  value: string,
  pct: number,
  tone?: Tone,
  note?: string,
): ToolResult {
  return { title, value, tone: tone ?? 'good', pct: Math.min(100, Math.max(0, pct)), note }
}

export function asNum(v: Values, key: string, fallback = 0): number {
  const val = v[key]
  if (typeof val === 'number') return isNaN(val) ? fallback : val
  if (typeof val === 'string') {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? fallback : parsed
  }
  return fallback
}

export function asStr(v: Values, key: string, fallback = ''): string {
  const val = v[key]
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return fallback
}

export function asSel(v: Values, key: string, fallback = ''): string {
  const val = v[key]
  return typeof val === 'string' && val.length > 0 ? val : fallback
}

export function asBoolList(v: Values, key: string, length: number): boolean[] {
  const val = v[key]
  if (Array.isArray(val)) {
    return Array.from({ length }, (_, i) => Boolean(val[i]))
  }
  return new Array(length).fill(false)
}

export function fmtMoney(num: number): string {
  if (isNaN(num)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function fmtNum(num: number): string {
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function initDevValues(fields: Field[]): Values {
  const out: Values = {}
  for (const f of fields) {
    if (f.kind === 'number') out[f.key] = f.def ?? 0
    else if (f.kind === 'select') out[f.key] = f.def ?? f.options[0]
    else if (f.kind === 'text') out[f.key] = f.def ?? ''
    else if (f.kind === 'checklist') out[f.key] = new Array(f.items.length).fill(false)
  }
  return out
}
