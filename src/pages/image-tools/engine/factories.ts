import type { ImageToolSpec, InfoSection, MimeGroup, Op, OutputKind, ParamDef, ParamValues, SubId } from './types.ts'

export type Builder = (v: ParamValues) => Op[]

export interface ToolSeed {
  id: string
  name: string
  sub: SubId
  blurb: string
  tip: string
  icon: string
  build?: Builder
  params?: ParamDef[]
  kind?: OutputKind
  outGroup?: MimeGroup
  multiple?: number
  compare?: boolean
  worker?: boolean
  alsoIn?: SubId[]
  target?: { w: number; h: number; label: string }
  accept?: string
  custom?: ImageToolSpec['custom']
  info?: InfoSection[]
  notes?: string[]
  needsUpload?: boolean
}

/** Turn a compact seed into a full spec the renderer can drive. */
export function tool(seed: ToolSeed): ImageToolSpec {
  const params = seed.params ?? []
  return {
    id: seed.id,
    name: seed.name,
    sub: seed.sub,
    blurb: seed.blurb,
    tip: seed.tip,
    icon: seed.icon,
    kind: seed.kind ?? 'image',
    params,
    ops: [],
    ...(seed.build ? { pipeline: seed.build } : {}),
    ...(seed.outGroup ? { outGroup: seed.outGroup } : {}),
    ...(seed.multiple ? { multiple: seed.multiple } : {}),
    ...(seed.compare === undefined ? {} : { compare: seed.compare }),
    ...(seed.worker === undefined ? {} : { worker: seed.worker }),
    ...(seed.alsoIn ? { alsoIn: seed.alsoIn } : {}),
    ...(seed.target ? { target: seed.target } : {}),
    ...(seed.accept ? { accept: seed.accept } : {}),
    ...(seed.custom ? { custom: seed.custom } : {}),
    ...(seed.info ? { info: seed.info } : {}),
    ...(seed.notes ? { notes: seed.notes } : {}),
    ...(seed.needsUpload === undefined ? {} : { needsUpload: seed.needsUpload }),
  }
}

/* ------------------------------------------------------------------ params */

export function n(key: string, label: string, def: number, min: number, max: number, step = 1, unit?: string): ParamDef {
  return { key, label, kind: 'number', def, min, max, step, ...(unit ? { unit } : {}) }
}

export function sl(key: string, label: string, def: number, min: number, max: number, step = 1, unit?: string, hint?: string): ParamDef {
  return { key, label, kind: 'slider', def, min, max, step, ...(unit ? { unit } : {}), ...(hint ? { hint } : {}) }
}

export function sel(key: string, label: string, options: string[], def?: string, hint?: string): ParamDef {
  return { key, label, kind: 'select', options, def: def ?? options[0], ...(hint ? { hint } : {}) }
}

export function txt(key: string, label: string, def = '', hint?: string): ParamDef {
  return { key, label, kind: 'text', def, ...(hint ? { hint } : {}) }
}

export function clr(key: string, label: string, def = '#0EA5E9'): ParamDef {
  return { key, label, kind: 'color', def }
}

export function tg(key: string, label: string, def = false, hint?: string): ParamDef {
  return { key, label, kind: 'toggle', def, ...(hint ? { hint } : {}) }
}

export function co(key: string, label: string, def = '50,50', hint?: string): ParamDef {
  return { key, label, kind: 'coords', def, ...(hint ? { hint } : {}) }
}

export function pr(key: string, label: string, def = '1920,1080', hint?: string): ParamDef {
  return { key, label, kind: 'pair', def, ...(hint ? { hint } : {}) }
}

const FORMAT_OPTIONS = ['image/png', 'image/jpeg', 'image/webp']

export function fmtParam(): ParamDef {
  return sel('format', 'Output format', FORMAT_OPTIONS, 'image/png', 'PNG is lossless, JPG is smallest, WebP is best for the web')
}

export function qualityParam(def = 0.9): ParamDef {
  return sl('quality', 'Quality', def, 0.1, 1, 0.05, '', 'Lower quality means a smaller file')
}

export function gapParam(def = 12): ParamDef {
  return n('gap', 'Gap between photos (px)', def, 0, 200, 1, 'px')
}

export function bgParam(def = '#ffffff'): ParamDef {
  return clr('bg', 'Background colour', def)
}

export function resizeParams(defW = 1920, defH = 1080): ParamDef[] {
  return [
    pr('size', 'Target size (px)', `${defW},${defH}`),
    sel('mode', 'Resize mode', ['cover', 'contain', 'exact'], 'cover', 'cover fills and crops, contain adds bars, exact stretches'),
  ]
}

export function watermarkTextParams(): ParamDef[] {
  return [
    txt('text', 'Watermark text', '© Your Name', 'Appears on the image'),
    sl('opacity', 'Opacity', 0.5, 0.05, 1, 0.05),
    clr('color', 'Text colour', '#FFFFFF'),
    sl('size', 'Font size', 48, 8, 400, 1, 'px'),
    sel('font', 'Font', ['sans-serif', 'serif', 'monospace', 'cursive'], 'sans-serif'),
    co('pos', 'Position (%,%)', '50,80'),
    sl('rotate', 'Rotation', 0, -90, 90, 1, '°'),
    tg('tile', 'Repeat across the whole image'),
  ]
}

export function toleranceParam(def = 30): ParamDef {
  return sl('tolerance', 'Tolerance', def, 0, 100, 1, '', 'How closely a colour must match to be removed')
}

/* ------------------------------------------------------------------- ops */

export const NEUTRAL_ADJUST = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
}

export function adjust(o: Partial<typeof NEUTRAL_ADJUST>): Op {
  return { op: 'adjust', ...NEUTRAL_ADJUST, ...o } as Op
}

export function background(o: Partial<Extract<Op, { op: 'background' }>>): Op {
  return {
    op: 'background',
    mode: 'transparent',
    color: '#00FF00',
    color2: '#0EA5E9',
    blur: 18,
    tolerance: 30,
    feather: 20,
    keepColor: 'auto',
    ...o,
  } as Op
}

export function cropOp(xPct: number, yPct: number, wPct: number, hPct: number): Builder {
  return (v) => {
    void v
    return [{ op: 'crop', x: xPct, y: yPct, w: wPct, h: hPct, unit: 'ratio' }]
  }
}
