import { clampNum, safeDiv, safePct } from './values.ts'

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsv {
  h: number
  s: number
  v: number
}

const HEX6 = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export function parseHexColor(raw: string): Rgb {
  const s = String(raw ?? '').trim()
  const m = HEX6.exec(s)
  if (!m) return { r: 0, g: 0, b: 0 }
  let hex = m[1]
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const n = parseInt(hex, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => clampNum(Math.round(Number.isFinite(v) ? v : 0), 0, 255).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase()
}

export function hexToRgb(hex: string): Rgb {
  return parseHexColor(hex)
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const R = clampNum(r, 0, 255) / 255
  const G = clampNum(g, 0, 255) / 255
  const B = clampNum(b, 0, 255) / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6
    else if (max === G) h = (B - R) / d + 2
    else h = (R - G) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : safePct(d, max, 0), v: max * 100 }
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const H = ((h % 360) + 360) % 360
  const S = clampNum(s, 0, 100) / 100
  const V = clampNum(v, 0, 100) / 100
  const c = V * S
  const x = c * (1 - Math.abs(((H / 60) % 2) - 1))
  const m = V - c
  const seg = Math.floor(H / 60) % 6
  const table: Array<[number, number, number]> = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ]
  const [r, g, b] = table[seg]
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }
}

export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * clampNum(r, 0, 255) + 0.7152 * clampNum(g, 0, 255) + 0.0722 * clampNum(b, 0, 255)
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = luminance(a) / 255
  const l2 = luminance(b) / 255
  const hi = Math.max(l1, l2)
  const lo = Math.min(l1, l2)
  return safeDiv(hi + 0.05, lo + 0.05, 21)
}

export function rgbToCmyk({ r, g, b }: Rgb): { c: number; m: number; y: number; k: number } {
  const R = clampNum(r, 0, 255) / 255
  const G = clampNum(g, 0, 255) / 255
  const B = clampNum(b, 0, 255) / 255
  const k = 1 - Math.max(R, G, B)
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: Math.round(safePct(1 - R - k, 1 - k, 0)),
    m: Math.round(safePct(1 - G - k, 1 - k, 0)),
    y: Math.round(safePct(1 - B - k, 1 - k, 0)),
    k: Math.round(k * 100),
  }
}

export function cmykToRgb(c: number, m: number, y: number, k: number): Rgb {
  const C = clampNum(c, 0, 100) / 100
  const M = clampNum(m, 0, 100) / 100
  const Y = clampNum(y, 0, 100) / 100
  const K = clampNum(k, 0, 100) / 100
  return {
    r: Math.round(255 * (1 - C) * (1 - K)),
    g: Math.round(255 * (1 - M) * (1 - K)),
    b: Math.round(255 * (1 - Y) * (1 - K)),
  }
}

export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const R = clampNum(r, 0, 255) / 255
  const G = clampNum(g, 0, 255) / 255
  const B = clampNum(b, 0, 255) / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) }
  const s = d / (1 - Math.abs(2 * l - 1))
  const hsv = rgbToHsv({ r, g, b })
  return { h: hsv.h, s: Math.round(safePct(s, 1, 0)), l: Math.round(l * 100) }
}

export function rgbToLab({ r, g, b }: Rgb): { L: number; a: number; b: number } {
  const lin = (c: number) => {
    const v = clampNum(c, 0, 255) / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const R = lin(r)
  const G = lin(g)
  const B = lin(b)
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(X)
  const fy = f(Y)
  const fz = f(Z)
  return { L: Math.round(116 * fy - 16), a: Math.round(500 * (fx - fy)), b: Math.round(200 * (fy - fz)) }
}

export function colorDistance(a: Rgb, b: Rgb): number {
  const dR = a.r - b.r
  const dG = a.g - b.g
  const dB = a.b - b.b
  return Math.sqrt(dR * dR + dG * dG + dB * dB)
}

export function inGamut({ r, g, b }: Rgb, eps = 2): boolean {
  return [r, g, b].every((v) => v >= -eps && v <= 255 + eps)
}

export function mixColors(a: Rgb, b: Rgb, t: number): Rgb {
  const k = clampNum(t, 0, 1)
  return { r: Math.round(a.r + (b.r - a.r) * k), g: Math.round(a.g + (b.g - a.g) * k), b: Math.round(a.b + (b.b - a.b) * k) }
}

export function hexToCmyk(hex: string): { c: number; m: number; y: number; k: number } {
  return rgbToCmyk(parseHexColor(hex))
}

export function describeColor(hex: string): { name: string; hex: string; hsv: Hsv; l: string } {
  const rgb = parseHexColor(hex)
  const hsv = rgbToHsv(rgb)
  const lum = luminance(rgb)
  const base = rgbToHsv(rgb)
  let name = 'Neutral'
  if (hsv.s < 8) name = lum > 200 ? 'White' : lum > 150 ? 'Light grey' : lum > 55 ? 'Grey' : 'Black'
  else if (base.s > 85) {
    if (base.h < 15 || base.h >= 345) name = 'Red'
    else if (base.h < 45) name = 'Orange'
    else if (base.h < 70) name = 'Yellow'
    else if (base.h < 160) name = 'Green'
    else if (base.h < 200) name = 'Teal'
    else if (base.h < 255) name = 'Blue'
    else if (base.h < 290) name = 'Violet'
    else name = 'Magenta'
  } else name = lum > 170 ? 'Pastel' : lum > 70 ? 'Muted' : 'Deep'
  return { name, hex: rgbToHex(rgb.r, rgb.g, rgb.b), hsv, l: String(Math.round(lum)) }
}

export function cssRgb({ r, g, b }: Rgb): string {
  return `rgb(${clampNum(Math.round(r), 0, 255)}, ${clampNum(Math.round(g), 0, 255)}, ${clampNum(Math.round(b), 0, 255)})`
}
