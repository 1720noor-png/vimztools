import type { Mime, MimeGroup, ParamDef, ParamValues } from './types.ts'

export const DPI_BY_GROUP: Record<MimeGroup, number> = {
  jpeg: 96,
  png: 96,
  webp: 96,
  avif: 96,
  gif: 72,
  bmp: 96,
  tiff: 300,
  heic: 72,
  svg: 96,
  ico: 96,
  pdf: 300,
  text: 96,
  doc: 96,
}

export const MIME_BY_GROUP: Record<MimeGroup, Mime> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  heic: 'image/heic',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  pdf: 'application/pdf',
  text: 'text/plain',
  doc: 'application/msword',
}

export const EXT_BY_GROUP: Record<MimeGroup, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
  gif: 'gif',
  bmp: 'bmp',
  tiff: 'tiff',
  heic: 'heic',
  svg: 'svg',
  ico: 'ico',
  pdf: 'pdf',
  text: 'txt',
  doc: 'doc',
}

const GROUP_BY_MIME: Array<[string, MimeGroup]> = [
  ['image/jpeg', 'jpeg'],
  ['image/jpg', 'jpeg'],
  ['image/pjpeg', 'jpeg'],
  ['image/png', 'png'],
  ['image/x-png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
  ['image/bmp', 'bmp'],
  ['image/x-ms-bmp', 'bmp'],
  ['image/tiff', 'tiff'],
  ['image/x-icon', 'ico'],
  ['image/vnd.microsoft.icon', 'ico'],
  ['image/heic', 'heic'],
  ['image/heif', 'heic'],
  ['image/svg+xml', 'svg'],
  ['application/pdf', 'pdf'],
  ['text/plain', 'text'],
]

export function groupOfMime(mime: string | undefined | null): MimeGroup | null {
  if (!mime) return null
  const key = mime.toLowerCase().split(';')[0].trim()
  for (const [m, g] of GROUP_BY_MIME) if (m === key) return g
  if (key === 'image/heic-sequence' || key === 'image/heif-sequence') return 'heic'
  return null
}

export function groupOfName(name: string): MimeGroup | null {
  const ext = extOf(name)
  const map: Record<string, MimeGroup> = {
    jpg: 'jpeg',
    jpeg: 'jpeg',
    jpe: 'jpeg',
    png: 'png',
    webp: 'webp',
    avif: 'avif',
    gif: 'gif',
    bmp: 'bmp',
    tif: 'tiff',
    tiff: 'tiff',
    heic: 'heic',
    heif: 'heic',
    svg: 'svg',
    ico: 'ico',
    pdf: 'pdf',
    txt: 'text',
  }
  return map[ext] ?? null
}

export function extOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i < 0 ? '' : name.slice(i + 1).toLowerCase()
}

export function baseOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i <= 0 ? name : name.slice(0, i)
}

export function groupOfFile(file: { name: string; type?: string }): MimeGroup | null {
  return groupOfMime(file.type) ?? groupOfName(file.name)
}

/** Formats this browser can decode into a bitmap without a third-party decoder. */
export function nativelyDecodable(group: MimeGroup | null): boolean {
  if (!group) return false
  if (group === 'bmp') return true
  if (group === 'svg') return typeof document !== 'undefined' || typeof OffscreenCanvas === 'function'
  if (group === 'heic') return typeof createImageBitmap === 'function' && supportsHeic()
  return true
}

let heicSupport: boolean | null = null
export function supportsHeic(): boolean {
  if (heicSupport !== null) return heicSupport
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  heicSupport = /Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua)
  return heicSupport
}

export function canExport(group: MimeGroup, probe?: (g: MimeGroup) => boolean): boolean {
  if (group === 'jpeg' || group === 'png') return true
  if (group === 'webp') return typeof document !== 'undefined'
  if (group === 'avif') return false
  if (group === 'gif' || group === 'bmp' || group === 'tiff' || group === 'heic' || group === 'ico' || group === 'svg') return false
  return probe ? probe(group) : true
}

export function acceptString(groups: MimeGroup[]): string {
  const exts = groups.map((g) => EXT_BY_GROUP[g])
  return [...new Set([...groups.map((g) => MIME_BY_GROUP[g]), ...exts.map((e) => '.' + e)])].join(',')
}

export function describeFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function defaultParams(params: ParamDef[]): ParamValues {
  const out: ParamValues = {}
  for (const p of params) {
    if (p.def !== undefined) out[p.key] = p.def
    else if (p.kind === 'toggle') out[p.key] = false
    else if (p.kind === 'select') out[p.key] = p.options?.[0] ?? ''
    else if (p.kind === 'color') out[p.key] = p.def ?? '#0EA5E9'
    else if (p.kind === 'slider' || p.kind === 'number') out[p.key] = p.def ?? p.min ?? 0
    else if (p.kind === 'pair' || p.kind === 'coords') out[p.key] = p.def ?? '0,0'
    else out[p.key] = p.def ?? ''
  }
  return out
}

export function numOf(v: ParamValues, key: string, fallback: number, min?: number, max?: number): number {
  const raw = v[key]
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(/[^0-9eE+\-.]/g, ''))
  if (!Number.isFinite(n)) return clampNum(fallback, min, max)
  return clampNum(n, min, max)
}

export function boolOf(v: ParamValues, key: string): boolean {
  const raw = v[key]
  if (typeof raw === 'boolean') return raw
  const s = String(raw ?? '').toLowerCase()
  return s === 'true' || s === '1' || s === 'on' || s === 'yes'
}

export function strOf(v: ParamValues, key: string, fallback = ''): string {
  const raw = v[key]
  if (typeof raw === 'string') return raw
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw)
  return fallback
}

export function selectOf(v: ParamValues, key: string, fallback: string): string {
  const s = strOf(v, key, '')
  return s || fallback
}

export function clampNum(n: number, min?: number, max?: number): number {
  let x = typeof n === 'number' ? n : Number(n)
  if (Number.isNaN(x)) x = 0
  if (x === Infinity) return max ?? x
  if (x === -Infinity) return min ?? x
  if (min !== undefined && x < min) x = min
  if (max !== undefined && x > max) x = max
  return x
}

/** Zero-division safe ratio. */
export function safeDiv(a: number, b: number, fallback = 0): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return fallback
  const r = a / b
  return Number.isFinite(r) ? r : fallback
}

/** Zero-division safe percentage. */
export function safePct(part: number, whole: number, fallback = 0): number {
  return clampNum(safeDiv(part, whole, fallback) * 100, -1000, 1000)
}

export function roundPx(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.round(n))
}

export function parsePair(raw: string, fallback: [number, number] = [0, 0]): [number, number] {
  const parts = String(raw ?? '')
    .split(/[,;x×\s]+/)
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n))
  if (parts.length < 2) return fallback
  return [parts[0], parts[1]]
}

export function parseList(raw: string): number[] {
  return String(raw ?? '')
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n))
}

/** Values that appear more than once — used to prove spec ids are unique. */
export function multiset(list: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of list) counts.set(item, (counts.get(item) ?? 0) + 1)
  const dupes = new Map<string, number>()
  for (const [key, n] of counts) if (n > 1) dupes.set(key, n)
  return dupes
}
