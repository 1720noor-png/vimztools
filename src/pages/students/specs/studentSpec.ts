import type {
  OfficeToolSpec,
  ToolResult,
  Tone,
  Values,
} from '../../office/archetypes/spec'

export type StudentResult = ToolResult & {
  pct?: number
  qr?: { data: string; ec: 'L' | 'M' | 'Q' | 'H' }
  bars?: { modules: boolean[]; caption: string }
}

export function sres(
  label: string,
  value: string,
  tone?: Tone,
  hint?: string,
  pct?: number,
): StudentResult {
  const r: StudentResult = { label, value }
  if (tone) r.tone = tone
  if (hint) r.hint = hint
  if (pct !== undefined) r.pct = pct
  return r
}

export function docr(label: string, raw: string): StudentResult {
  return { label, value: '', raw }
}

export function qrres(
  label: string,
  value: string,
  data: string,
  ec: 'L' | 'M' | 'Q' | 'H',
  tone?: Tone,
  hint?: string,
): StudentResult {
  return { label, value, qr: { data, ec }, tone, hint }
}

export function barres(
  label: string,
  value: string,
  modules: boolean[],
  caption: string,
  tone?: Tone,
  hint?: string,
): StudentResult {
  return { label, value, bars: { modules, caption }, tone, hint }
}

export interface StudentSpec extends OfficeToolSpec {
  name: string
  subject: string
  tip: string
  usage: [string, string, string]
  method: string[]
  compute: (v: Values) => StudentResult[]
}

export type StudentCompute = (v: Values) => ToolResult[]