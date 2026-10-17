import { roundPx, safeDiv } from './values.ts'

export interface Fit {
  w: number
  h: number
  sx: number
  sy: number
  mode: 'exact' | 'fit' | 'fill' | 'cover'
}

/**
 * Resolve a resize request against a source size.
 * `cover` fills the box and overflows; `fill` stretches; `fit` letterboxes; `exact` uses the box.
 * Guarded against zero/NaN inputs so a 0×0 decode can never produce NaN geometry.
 */
export function resolveFit(
  sw: number,
  sh: number,
  tw: number,
  th: number,
  mode: 'exact' | 'fit' | 'fill' | 'cover' = 'fit',
): Fit {
  const sW = Math.max(1, roundPx(sw))
  const sH = Math.max(1, roundPx(sh))
  if (mode === 'exact') {
    const w = Math.max(1, roundPx(tw))
    const h = Math.max(1, roundPx(th))
    return { w, h, sx: w / sW, sy: h / sH, mode }
  }
  if (mode === 'fill') {
    const w = Math.max(1, roundPx(tw))
    const h = Math.max(1, roundPx(th))
    return { w, h, sx: w / sW, sy: h / sH, mode }
  }
  const w = Math.max(1, roundPx(tw))
  const h = Math.max(1, roundPx(th))
  if (mode === 'cover') {
    const r = Math.max(safeDiv(w, sW, 0), safeDiv(h, sH, 0))
    return { w, h, sx: r, sy: r, mode }
  }
  const r = Math.min(safeDiv(w, sW, 1), safeDiv(h, sH, 1))
  return { w, h, sx: r, sy: r, mode }
}

/** Crop window for a target aspect ratio, centred, never larger than the source. */
export function centerCropForRatio(
  sw: number,
  sh: number,
  ratio: number,
): { x: number; y: number; w: number; h: number } {
  const sW = Math.max(1, sw)
  const sH = Math.max(1, sh)
  const r = Number.isFinite(ratio) && ratio > 0 ? ratio : safeDiv(sW, sH, 1)
  let cw = sW
  let ch = Math.round(safeDiv(sW, r, sH))
  if (ch > sH) {
    ch = sH
    cw = Math.round(safeDiv(sH, r, sW))
  }
  cw = Math.max(1, Math.min(cw, sW))
  ch = Math.max(1, Math.min(ch, sH))
  return { x: Math.round((sW - cw) / 2), y: Math.round((sH - ch) / 2), w: cw, h: ch }
}

/** Convert millimetres to pixels at a DPI. Zero/negative DPI falls back to 96. */
export function mmToPx(mm: number, dpi: number): number {
  const d = Number.isFinite(dpi) && dpi > 0 ? dpi : 96
  const v = Number.isFinite(mm) ? mm : 0
  return Math.max(1, Math.round(safeDiv(v * d, 25.4, 0)))
}

export function pxToMm(px: number, dpi: number): number {
  const d = Number.isFinite(dpi) && dpi > 0 ? dpi : 96
  return Math.round(safeDiv(px * 25.4, d, 0) * 1000) / 1000
}

export function inchesToMm(inch: number): number {
  return Number.isFinite(inch) ? inch * 25.4 : 0
}

export function aspectRatio(w: number, h: number): number {
  return safeDiv(w, h, 1)
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(Number.isFinite(a) ? a : 0))
  let y = Math.abs(Math.round(Number.isFinite(b) ? b : 0))
  if (x === 0 && y === 0) return 1
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

export function simplifyRatio(w: number, h: number): { n: number; d: number; text: string } {
  const W = Math.max(1, roundPx(w))
  const H = Math.max(1, roundPx(h))
  const g = gcd(W, H)
  const n = W / g
  const d = H / g
  return { n, d, text: `${n}:${d}` }
}

export const NAMED_RATIOS: Array<{ label: string; ratio: number }> = [
  { label: '1:1 square', ratio: 1 },
  { label: '4:5 portrait (Instagram post)', ratio: 4 / 5 },
  { label: '9:16 story', ratio: 9 / 16 },
  { label: '16:9 widescreen', ratio: 16 / 9 },
  { label: '3:2 photo', ratio: 3 / 2 },
  { label: '2:3 photo', ratio: 2 / 3 },
  { label: '4:3 photo', ratio: 4 / 3 },
  { label: '5:4 photo', ratio: 5 / 4 },
  { label: '3:4 photo', ratio: 3 / 4 },
  { label: '21:9 ultrawide', ratio: 21 / 9 },
]

export function nearestRatioName(ratio: number): string {
  let best = NAMED_RATIOS[0]
  let bestErr = Infinity
  for (const r of NAMED_RATIOS) {
    const err = Math.abs(r.ratio - ratio)
    if (err < bestErr) {
      bestErr = err
      best = r
    }
  }
  return bestErr < 0.02 ? best.label : 'Custom'
}

export interface SheetLayout {
  pageW: number
  pageH: number
  cellW: number
  cellH: number
  cols: number
  rows: number
  originX: number
  originY: number
  perPage: number
  pages: number
}

export const PAGE_SIZES: Record<string, { wMm: number; hMm: number; label: string }> = {
  a4: { wMm: 210, hMm: 297, label: 'A4 (210×297mm)' },
  a3: { wMm: 297, hMm: 420, label: 'A3 (297×420mm)' },
  a5: { wMm: 148, hMm: 210, label: 'A5 (148×210mm)' },
  letter: { wMm: 215.9, hMm: 279.4, label: 'US Letter (8.5×11in)' },
  a6: { wMm: 105, hMm: 148, label: 'A6 (105×148mm)' },
}

/**
 * Lay a grid of fixed-size photo cells onto a page, honouring margins and gaps.
 * Returns page count so the caller knows how many output files to emit.
 */
export function planSheet(opts: {
  page: keyof typeof PAGE_SIZES | string
  dpi: number
  wMm: number
  hMm: number
  cols: number
  rows: number
  gapMm: number
  marginMm: number
  count: number
}): SheetLayout {
  const size = PAGE_SIZES[opts.page] ?? PAGE_SIZES.a4
  const dpi = Number.isFinite(opts.dpi) && opts.dpi > 0 ? opts.dpi : 300
  const pageW = mmToPx(size.wMm, dpi)
  const pageH = mmToPx(size.hMm, dpi)
  const margin = mmToPx(opts.marginMm, dpi)
  const gap = Math.max(0, mmToPx(opts.gapMm, dpi))
  const cellW = mmToPx(opts.wMm, dpi)
  const cellH = mmToPx(opts.hMm, dpi)
  const usableW = Math.max(1, pageW - margin * 2)
  const usableH = Math.max(1, pageH - margin * 2)
  const cols = Math.max(1, Math.floor(safeDiv(usableW + gap, cellW + gap, 1)))
  const rows = Math.max(1, Math.floor(safeDiv(usableH + gap, cellH + gap, 1)))
  const gridW = cols * cellW + (cols - 1) * gap
  const gridH = rows * cellH + (rows - 1) * gap
  const perPage = Math.max(1, cols * rows)
  return {
    pageW,
    pageH,
    cellW,
    cellH,
    cols,
    rows,
    originX: margin + Math.max(0, Math.round((usableW - gridW) / 2)),
    originY: margin + Math.max(0, Math.round((usableH - gridH) / 2)),
    perPage,
    pages: Math.max(1, Math.ceil(Math.max(0, opts.count) / perPage)),
  }
}

export interface ContactSheetLayout {
  w: number
  h: number
  cellW: number
  cellH: number
  cols: number
  rows: number
  gap: number
  positions: Array<{ x: number; y: number; w: number; h: number }>
}

export function planContactSheet(opts: {
  count: number
  cellMax: number
  gap: number
  cols?: number
  square: boolean
}): ContactSheetLayout {
  const count = Math.max(1, Math.floor(opts.count))
  const cell = Math.max(16, roundPx(opts.cellMax))
  const gap = Math.max(0, roundPx(opts.gap))
  const cols =
    opts.cols && opts.cols > 0
      ? Math.max(1, Math.floor(opts.cols))
      : Math.max(1, Math.ceil(Math.sqrt(count)))
  const rows = Math.max(1, Math.ceil(safeDiv(count, cols, 1)))
  const cellH = opts.square ? cell : cell
  const w = cols * cell + (cols - 1) * gap
  const h = rows * cellH + (rows - 1) * gap
  const positions: ContactSheetLayout['positions'] = []
  for (let i = 0; i < count; i++) {
    const c = i % cols
    const r = Math.floor(safeDiv(i, cols, 0))
    positions.push({ x: c * (cell + gap), y: r * (cellH + gap), w: cell, h: cellH })
  }
  return { w: Math.max(1, w), h: Math.max(1, h), cellW: cell, cellH, cols, rows, gap, positions }
}

export const SOCIAL_PRESETS: Record<string, { w: number; h: number; label: string; ratio: string }> = {
  'instagram-post': { w: 1080, h: 1080, label: 'Instagram Post', ratio: '1:1' },
  'instagram-portrait': { w: 1080, h: 1350, label: 'Instagram Portrait', ratio: '4:5' },
  'instagram-story': { w: 1080, h: 1920, label: 'Instagram Story / Reel', ratio: '9:16' },
  'facebook-post': { w: 1200, h: 630, label: 'Facebook Post', ratio: '1.91:1' },
  'facebook-cover': { w: 820, h: 312, label: 'Facebook Cover', ratio: '2.63:1' },
  'youtube-thumbnail': { w: 1280, h: 720, label: 'YouTube Thumbnail', ratio: '16:9' },
  'youtube-banner': { w: 2560, h: 1440, label: 'YouTube Banner', ratio: '16:9' },
  'linkedin-profile': { w: 400, h: 400, label: 'LinkedIn Profile', ratio: '1:1' },
  'linkedin-banner': { w: 1584, h: 396, label: 'LinkedIn Banner', ratio: '4:1' },
  'x-header': { w: 1500, h: 500, label: 'X / Twitter Header', ratio: '3:1' },
  'pinterest-pin': { w: 1000, h: 1500, label: 'Pinterest Pin', ratio: '2:3' },
  'tiktok-cover': { w: 1080, h: 1920, label: 'TikTok Cover', ratio: '9:16' },
  'whatsapp-profile': { w: 640, h: 640, label: 'WhatsApp Profile', ratio: '1:1' },
  'amazon-main': { w: 1600, h: 1600, label: 'Amazon Main Image', ratio: '1:1' },
  'shopify-square': { w: 2000, h: 2000, label: 'Shopify Square', ratio: '1:1' },
  'etsy-listing': { w: 2700, h: 2025, label: 'Etsy Listing (4:3)', ratio: '4:3' },
  'a4-300dpi': { w: 2480, h: 3508, label: 'A4 @300dpi', ratio: '1:1.414' },
  'a3-300dpi': { w: 3508, h: 4961, label: 'A3 @300dpi', ratio: '1:1.414' },
  'letter-300dpi': { w: 2550, h: 3300, label: 'US Letter @300dpi', ratio: '1:1.294' },
  'favicon-512': { w: 512, h: 512, label: 'Favicon / App Icon 512', ratio: '1:1' },
}

export const ID_PHOTO_SIZES: Record<string, { wMm: number; hMm: number; label: string }> = {
  'passport-35x45': { wMm: 35, hMm: 45, label: 'Passport 35×45mm' },
  '2x2-inch': { wMm: 51, hMm: 51, label: '2×2 inch (51×51mm)' },
  'visa-35x45': { wMm: 35, hMm: 45, label: 'US Visa 2×2in (51×51mm)' },
  'visa-35x45eu': { wMm: 35, hMm: 45, label: 'Schengen Visa 35×45mm' },
  'cnic-30x40': { wMm: 30, hMm: 40, label: 'CNIC / ID 30×40mm' },
  'license-30x40': { wMm: 30, hMm: 40, label: 'Driving Licence 30×40mm' },
  'headshot-25x35': { wMm: 25, hMm: 35, label: 'Headshot 25×35mm' },
  'linkedin-4x4': { wMm: 101.6, hMm: 101.6, label: 'Profile 4×4in (102×102mm)' },
  'india-51x51': { wMm: 51, hMm: 51, label: 'India Passport 51×51mm' },
  'canada-50x70': { wMm: 50, hMm: 70, label: 'Canada 50×70mm' },
  'australia-35x45': { wMm: 35, hMm: 45, label: 'Australia 35×45mm' },
  'japan-35x45': { wMm: 35, hMm: 45, label: 'Japan 35×45mm' },
  'custom': { wMm: 35, hMm: 45, label: 'Custom size' },
}

/** Where the face should sit inside an ID photo, as fractions of the cell. */
export function idPhotoHeadroom(hMm: number, style: 'full' | 'passport' | 'visa' = 'passport'): number {
  const h = Number.isFinite(hMm) && hMm > 0 ? hMm : 45
  if (style === 'full') return 0
  if (style === 'visa') return Math.round(h * 0.08)
  return Math.round(h * 0.12)
}

export function printQualityVerdict(px: number, targetMm: number, dpi: number): { effective: number; verdict: 'print' | 'acceptable' | 'screen'; tone: 'good' | 'warn' | 'bad' } {
  const want = mmToPx(targetMm, dpi)
  const eff = Math.round(safeDiv(px, want, 0) * 100)
  if (eff >= 100) return { effective: eff, verdict: 'print', tone: 'good' }
  if (eff >= 75) return { effective: eff, verdict: 'acceptable', tone: 'warn' }
  return { effective: eff, verdict: 'screen', tone: 'bad' }
}

export function bytesForPixels(w: number, h: number, bitsPerPixel: number): number {
  const W = Math.max(0, Number.isFinite(w) ? Math.round(w) : 0)
  const H = Math.max(0, Number.isFinite(h) ? Math.round(h) : 0)
  const bpp = Number.isFinite(bitsPerPixel) && bitsPerPixel > 0 ? bitsPerPixel : 24
  return Math.round(safeDiv(W * H * bpp, 8, 0))
}

export function megapixels(w: number, h: number): number {
  return safeDiv(Math.max(0, w) * Math.max(0, h), 1e6, 0)
}

export function totalPixels(w: number, h: number): number {
  return Math.max(0, roundPx(w)) * Math.max(0, roundPx(h))
}

/** Guard against canvas explosions: clamp to a maximum pixel budget. */
export const MAX_PIXELS = 80_000_000

export function clampCanvasSize(w: number, h: number, maxPixels = MAX_PIXELS): { w: number; h: number; clamped: boolean } {
  const W = Math.max(1, roundPx(w))
  const H = Math.max(1, roundPx(h))
  const px = W * H
  if (px <= maxPixels) return { w: W, h: H, clamped: false }
  const f = Math.sqrt(safeDiv(maxPixels, px, 1))
  return { w: Math.max(1, Math.floor(W * f)), h: Math.max(1, Math.floor(H * f)), clamped: true }
}
