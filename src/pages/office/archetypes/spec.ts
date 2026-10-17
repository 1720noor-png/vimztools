export type Tone = 'good' | 'warn' | 'bad' | 'neutral'

export interface ToolResult {
  label: string
  value: string
  tone?: Tone
  hint?: string
  raw?: string
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

export interface DateField {
  kind: 'date'
  key: string
  label: string
  def?: string
}

export interface ChecklistField {
  kind: 'checklist'
  key: string
  label: string
  items: string[]
}

export interface MatrixField {
  kind: 'matrix'
  key: string
  label: string
  columns: string[]
  rows: string[]
  defaults?: number[][]
}

export type Field =
  | NumberField
  | SelectField
  | TextField
  | DateField
  | ChecklistField
  | MatrixField

export type Archetype =
  | 'est'
  | 'index'
  | 'matrix'
  | 'checklist'
  | 'scorecard'
  | 'tier'
  | 'fmt'
  | 'timeline'
  | 'log'
  | 'conv'
  | 'bdown'
  | 'tracker'

export type CellValue = number | string | boolean[] | number[][]

export interface Values {
  [k: string]: CellValue
}

export interface OfficeToolSpec {
  id: string
  archetype: Archetype
  blurb: string
  fields: Field[]
  compute: (v: Values) => ToolResult[]
}

export const T: Record<Tone, Tone> = {
  good: 'good',
  warn: 'warn',
  bad: 'bad',
  neutral: 'neutral',
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function toNum(n: number | null | undefined): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

export function money(n: number): string {
  const sign = n < 0 ? '-' : ''
  return sign + '$' + Math.round(Math.abs(n)).toLocaleString('en-US')
}

export function moneyC(n: number): string {
  return (
    (n < 0 ? '-' : '') +
    ('$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  )
}

export function pct(n: number, d = 1, signed = false): string {
  const s = signed && n > 0 ? '+' : ''
  return s + n.toFixed(d) + '%'
}

export function num(n: number, d = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: d })
}

export function numD(n: number, d = 1): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export function ratio(n: number, d = 2): string {
  return n.toFixed(d)
}

export function stars(n: number, max = 5): string {
  const c = Math.round(clamp(n, 0, max))
  return '★'.repeat(c) + '☆'.repeat(max - c)
}

export function days(n: number): string {
  return `${Math.round(n)} days`
}

export function hours(n: number): string {
  return `${numD(n, 1)} hours`
}

export function lvl(n: number): string {
  const s = Math.round(clamp(n, 0, 10))
  const m = ['0','1','2','3','4','5','6','7','8','9','10']
  return `${m[s]}/10`
}

export function n(key: string, label: string, o?: Partial<Omit<NumberField, 'kind' | 'key' | 'label'>>): NumberField {
  return { kind: 'number', key, label, ...o }
}

export function sel(key: string, label: string, options: string[], def?: string): SelectField {
  return { kind: 'select', key, label, options, def }
}

export function txt(key: string, label: string, lines?: number, def?: string): TextField {
  return { kind: 'text', key, label, lines, def }
}

export function dt(key: string, label: string, def?: string): DateField {
  return { kind: 'date', key, label, def }
}

export function ck(key: string, label: string, items: string[]): ChecklistField {
  return { kind: 'checklist', key, label, items }
}

export function mx(key: string, label: string, columns: string[], rows: string[]): MatrixField {
  return { kind: 'matrix', key, label, columns, rows }
}

export function mxd(
  key: string,
  label: string,
  columns: string[],
  rows: string[],
  defaults: (number | null)[][],
): MatrixField {
  return { kind: 'matrix', key, label, columns, rows, defaults: defaults as number[][] }
}

export function res(label: string, value: string, tone?: Tone, hint?: string): ToolResult {
  return { label, value, tone, hint }
}

export function doc(label: string, raw: string): ToolResult {
  return { label, value: '', raw }
}

export function asNum(v: CellValue | undefined): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

export function asStr(v: CellValue | undefined): string {
  return typeof v === 'string' ? v : ''
}

export function asSel(v: CellValue | undefined): string {
  return typeof v === 'string' ? v : ''
}

export function asBoolList(v: CellValue | undefined): boolean[] {
  return Array.isArray(v) ? (v as unknown as boolean[]) : []
}

export function asMatrix(v: CellValue | undefined): number[][] {
  return Array.isArray(v) ? (v as unknown as number[][]) : []
}

export function initValue(f: Field): CellValue {
  switch (f.kind) {
    case 'number':
      return f.def ?? 0
    case 'select':
      return f.def ?? f.options[0] ?? ''
    case 'text':
      return f.def ?? ''
    case 'date':
      return f.def ?? ''
    case 'checklist':
      return f.items.map(() => false)
    case 'matrix':
      return f.rows.map((_, ri) =>
        f.columns.slice(1).map((_, ci) => toNum(f.defaults?.[ri]?.[ci])),
      )
  }
}

export function initValues(fields: Field[]): Values {
  const v: Values = {}
  for (const f of fields) v[f.key] = initValue(f)
  return v
}