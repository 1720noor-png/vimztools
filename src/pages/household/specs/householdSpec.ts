import type {
  Field as OfficeField,
  TextField,
  Tone as OfficeTone,
} from '../../office/archetypes/spec'

export type Tone = OfficeTone | 'info'

export interface CheckboxField {
  kind: 'checkbox'
  key: string
  label: string
  def?: boolean
}

export type Field = OfficeField | CheckboxField

export type CellValue = number | string | boolean | boolean[] | number[][]

export interface Values {
  [k: string]: CellValue | undefined
}

export interface ToolResult {
  label: string
  value: string
  tone?: Tone
  hint?: string
  raw?: string
}

export interface HouseholdSpec {
  id: string
  name: string
  sub: string
  subId: string
  blurb: string
  tip: string
  usage: string[]
  method: string[]
  fields: Field[]
  compute: (v: Values) => ToolResult[]
}

export {
  T,
  n,
  sel,
  dt,
  mx,
  mxd,
  money,
  moneyC,
  pct,
  num,
  numD,
  ratio,
  days,
  hours,
  stars,
  lvl,
  clamp,
} from '../../office/archetypes/spec'

export function txt(key: string, label: string, linesOrDef?: number | string, def?: string): TextField {
  if (typeof linesOrDef === 'string') {
    return { kind: 'text', key, label, def: linesOrDef }
  }
  return { kind: 'text', key, label, lines: linesOrDef, def }
}

export function ck(key: string, label: string, itemsOrDef?: string[] | boolean): Field {
  if (Array.isArray(itemsOrDef)) {
    return { kind: 'checklist', key, label, items: itemsOrDef }
  }
  return { kind: 'checkbox', key, label, def: typeof itemsOrDef === 'boolean' ? itemsOrDef : false }
}

export function res(label: string, value: string, tone?: Tone, hint?: string): ToolResult {
  return { label, value, tone, hint }
}

export function doc(label: string, raw: string): ToolResult {
  return { label, value: '', raw }
}

export function asNum(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const parsed = parseFloat(v)
    if (!isNaN(parsed) && Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export function asStr(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v
  return fallback
}

export function asSel(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v
  return fallback
}

export function asBoolList(v: unknown): boolean[] {
  return Array.isArray(v) ? (v as unknown as boolean[]) : []
}

export function asMatrix(v: unknown): number[][] {
  return Array.isArray(v) ? (v as unknown as number[][]) : []
}

export function initHouseholdValue(f: Field): CellValue {
  if (f.kind === 'checkbox') {
    return f.def ?? false
  }
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
        f.columns.slice(1).map((_, ci) => (typeof f.defaults?.[ri]?.[ci] === 'number' ? f.defaults[ri][ci] : 0)),
      )
  }
}

export function initHouseholdValues(fields: Field[]): Values {
  const v: Values = {}
  for (const f of fields) v[f.key] = initHouseholdValue(f)
  return v
}
