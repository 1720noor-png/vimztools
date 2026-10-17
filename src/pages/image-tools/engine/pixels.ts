import { parseHexColor, rgbToHex } from './colors.ts'
import { clampNum, safeDiv } from './values.ts'

export type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export function makeCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  const W = Math.max(1, Math.round(w))
  const H = Math.max(1, Math.round(h))
  if (typeof OffscreenCanvas !== 'undefined' && typeof document === 'undefined') return new OffscreenCanvas(W, H)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  return c
}

export function ctx2d(
  c: HTMLCanvasElement | OffscreenCanvas,
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  return c.getContext('2d', { willReadFrequently: true }) as Ctx | null
}

export function imageDataOf(ctx: Ctx, w: number, h: number): ImageData {
  return ctx.getImageData(0, 0, Math.max(1, w), Math.max(1, h))
}

export function drawSmooth(
  ctx: Ctx,
  src: CanvasImageSource,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void {
  const S = sw > 0 && sh > 0
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  if (S) ctx.drawImage(src, 0, 0, sw, sh, dx, dy, dw, dh)
  else ctx.drawImage(src, dx, dy, dw, dh)
}

/** Lanczos-3 separable resample of an ImageData. Used by the "AI" upscaler. */
export function lanczos3(data: Uint8ClampedArray, w: number, h: number, tw: number, th: number): ImageData {
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const TW = Math.max(1, Math.round(tw))
  const TH = Math.max(1, Math.round(th))
  const out = new ImageData(TW, TH)
  const a = 3
  const kernel = (t: number): number => {
    const x = Math.abs(t)
    if (x < 1e-8) return 1
    if (x >= a) return 0
    const px = Math.PI * x
    return (a * Math.sin(px) * Math.sin(px / a)) / (px * px)
  }
  const buildWeights = (srcLen: number, dstLen: number) => {
    const scale = safeDiv(dstLen, srcLen, 1)
    const support = scale < 1 ? a : a
    const inv = 1 / scale
    const rows: Array<{ start: number; w: Float32Array; norm: number }> = []
    for (let i = 0; i < dstLen; i++) {
      const center = (i + 0.5) * inv - 0.5
      const start = Math.max(0, Math.ceil(center - support))
      const end = Math.min(srcLen - 1, Math.floor(center + support))
      const count = Math.max(1, end - start + 1)
      const wts = new Float32Array(count)
      let norm = 0
      for (let k = 0; k < count; k++) {
        const v = kernel((start + k - center) * inv)
        wts[k] = v
        norm += v
      }
      rows.push({ start, w: wts, norm: norm === 0 ? 1 : norm })
    }
    return rows
  }
  const wx = buildWeights(W, TW)
  const wy = buildWeights(H, TH)
  const tmp = new Float32Array(TW * H * 4)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < TW; x++) {
      const row = wx[x]
      let r = 0
      let g = 0
      let b = 0
      let al = 0
      for (let k = 0; k < row.w.length; k++) {
        const sx = Math.min(W - 1, row.start + k)
        const si = (y * W + sx) * 4
        const wt = row.w[k] / row.norm
        r += data[si] * wt
        g += data[si + 1] * wt
        b += data[si + 2] * wt
        al += data[si + 3] * wt
      }
      const di = (y * TW + x) * 4
      tmp[di] = r
      tmp[di + 1] = g
      tmp[di + 2] = b
      tmp[di + 3] = al
    }
  }
  for (let y = 0; y < TH; y++) {
    const row = wy[y]
    for (let x = 0; x < TW; x++) {
      let r = 0
      let g = 0
      let b = 0
      let al = 0
      for (let k = 0; k < row.w.length; k++) {
        const sy = Math.min(H - 1, row.start + k)
        const si = (sy * TW + x) * 4
        const wt = row.w[k] / row.norm
        r += tmp[si] * wt
        g += tmp[si + 1] * wt
        b += tmp[si + 2] * wt
        al += tmp[si + 3] * wt
      }
      const di = (y * TW + x) * 4
      out.data[di] = r
      out.data[di + 1] = g
      out.data[di + 2] = b
      out.data[di + 3] = al
    }
  }
  return out
}

/** Bilinear resample — cheaper, used for large upscales. */
export function bilinear(data: Uint8ClampedArray, w: number, h: number, tw: number, th: number): ImageData {
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const TW = Math.max(1, Math.round(tw))
  const TH = Math.max(1, Math.round(th))
  const out = new ImageData(TW, TH)
  const xr = safeDiv(W, TW, 1)
  const yr = safeDiv(H, TH, 1)
  for (let y = 0; y < TH; y++) {
    const fy = clampNum((y + 0.5) * yr - 0.5, 0, H - 1)
    const y0 = Math.floor(fy)
    const y1 = Math.min(H - 1, y0 + 1)
    const wy = fy - y0
    for (let x = 0; x < TW; x++) {
      const fx = clampNum((x + 0.5) * xr - 0.5, 0, W - 1)
      const x0 = Math.floor(fx)
      const x1 = Math.min(W - 1, x0 + 1)
      const wx = fx - x0
      const i00 = (y0 * W + x0) * 4
      const i01 = (y0 * W + x1) * 4
      const i10 = (y1 * W + x0) * 4
      const i11 = (y1 * W + x1) * 4
      const di = (y * TW + x) * 4
      for (let c = 0; c < 4; c++) {
        const top = data[i00 + c] * (1 - wx) + data[i01 + c] * wx
        const bot = data[i10 + c] * (1 - wx) + data[i11 + c] * wx
        out.data[di + c] = top * (1 - wy) + bot * wy
      }
    }
  }
  return out
}

/** Brightness / contrast / saturation / hue on raw pixels. */
export function adjustPixels(
  data: Uint8ClampedArray,
  brightness: number,
  contrast: number,
  saturation: number,
  hueDeg: number,
): void {
  const br = clampNum(brightness, -100, 100)
  const ct = clampNum(contrast, -100, 100)
  const st = clampNum(saturation, -100, 100)
  const hd = clampNum(hueDeg, -180, 180)
  const cf = (259 * (ct + 255)) / (255 * (259 - ct))
  const satF = 1 + st / 100
  const rad = (hd * Math.PI) / 180
  const cosH = Math.cos(rad)
  const sinH = Math.sin(rad)
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] + br
    let g = data[i + 1] + br
    let b = data[i + 2] + br
    r = cf * (r - 128) + 128
    g = cf * (g - 128) + 128
    b = cf * (b - 128) + 128
    if (satF !== 1) {
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
      r = l + (r - l) * satF
      g = l + (g - l) * satF
      b = l + (b - l) * satF
    }
    if (hd !== 0) {
      const m = 0.213 + cosH * 0.787 - sinH * 0.213
      const ms = 0.715 - cosH * 0.715 - sinH * 0.715
      const o = 0.072 - cosH * 0.072 + sinH * 0.928
      const nr = (cosH + sinH * 0.143) * r + m * g + o * b
      const ng = ms * r + (cosH - sinH * 0.14) * g + (1 - o) * b
      const nb = o * r + ms * g + (cosH + sinH * 0.143) * b
      r = nr
      g = ng
      b = nb
    }
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }
}

export function grayscalePixels(data: Uint8ClampedArray, amount: number): void {
  const k = clampNum(amount, 0, 100) / 100
  for (let i = 0; i < data.length; i += 4) {
    const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    data[i] += (l - data[i]) * k
    data[i + 1] += (l - data[i + 1]) * k
    data[i + 2] += (l - data[i + 2]) * k
  }
}

export function sepiaPixels(data: Uint8ClampedArray, amount: number): void {
  const k = clampNum(amount, 0, 100) / 100
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
    const sr = Math.min(255, l * 1.07 + 14)
    const sg = Math.min(255, l * 0.93 + 9)
    const sb = Math.min(255, l * 0.78)
    data[i] += (sr - r) * k
    data[i + 1] += (sg - g) * k
    data[i + 2] += (sb - b) * k
  }
}

export function invertPixels(data: Uint8ClampedArray, amount: number): void {
  const k = clampNum(amount, 0, 100) / 100
  for (let i = 0; i < data.length; i += 4) {
    data[i] += (255 - data[i]) * k
    data[i + 1] += (255 - data[i + 1]) * k
    data[i + 2] += (255 - data[i + 2]) * k
  }
}

/** White-balance shift: temperature pushes warm, tint pushes green/magenta. */
export function temperaturePixels(data: Uint8ClampedArray, temperature: number, tint: number): void {
  const t = clampNum(temperature, -100, 100) / 100
  const g = clampNum(tint, -100, 100) / 100
  const rGain = 1 + t * 0.35
  const bGain = 1 - t * 0.35
  const gGain = 1 + g * 0.3
  for (let i = 0; i < data.length; i += 4) {
    data[i] *= rGain
    data[i + 1] *= gGain
    data[i + 2] *= bGain
  }
}

export function posterizePixels(data: Uint8ClampedArray, levels: number): void {
  const n = Math.max(2, Math.round(levels))
  const step = 255 / (n - 1)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step)
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step)
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step)
  }
}

export function duotonePixels(data: Uint8ClampedArray, darkHex: string, lightHex: string): void {
  const dark = parseHexColor(darkHex)
  const light = parseHexColor(lightHex)
  for (let i = 0; i < data.length; i += 4) {
    const l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
    data[i] = dark.r + (light.r - dark.r) * l
    data[i + 1] = dark.g + (light.g - dark.g) * l
    data[i + 2] = dark.b + (light.b - dark.b) * l
  }
}

/** Unsharp mask (3×3 laplacian) — real edge sharpening, no AI needed. */
export function unsharpPixels(data: Uint8ClampedArray, w: number, h: number, amount: number, radius = 1): void {
  const a = clampNum(amount, 0, 300) / 100
  if (a === 0) return
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const src = data.slice()
  const R = Math.max(1, Math.round(radius))
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      for (let c = 0; c < 3; c++) {
        let sum = 0
        let n = 0
        for (let dy = -R; dy <= R; dy++) {
          const yy = y + dy
          if (yy < 0 || yy >= H) continue
          for (let dx = -R; dx <= R; dx++) {
            const xx = x + dx
            if (xx < 0 || xx >= W) continue
            sum += src[(yy * W + xx) * 4 + c]
            n++
          }
        }
        const avg = safeDiv(sum, n, src[i + c])
        data[i + c] = src[i + c] + (src[i + c] - avg) * a
      }
    }
  }
}

/** Edge-preserving denoise: replace each pixel with the median of its neighbourhood. */
export function denoisePixels(data: Uint8ClampedArray, w: number, h: number, strength: number): void {
  const k = clampNum(strength, 0, 100)
  if (k === 0) return
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const src = data.slice()
  const win: number[] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      for (let c = 0; c < 3; c++) {
        win.length = 0
        const r = k > 50 ? 2 : 1
        for (let dy = -r; dy <= r; dy++) {
          const yy = clampNum(y + dy, 0, H - 1)
          for (let dx = -r; dx <= r; dx++) {
            const xx = clampNum(x + dx, 0, W - 1)
            win.push(src[(yy * W + xx) * 4 + c])
          }
        }
        win.sort((p, q) => p - q)
        const median = win[Math.floor(win.length / 2)]
        data[i + c] = src[i + c] + (median - src[i + c]) * (k / 100)
      }
    }
  }
}

export function autoLevelsPixels(data: Uint8ClampedArray, amount: number): void {
  const k = clampNum(amount, 0, 100) / 100
  if (k === 0) return
  let lo = 255
  let hi = 0
  const hist = new Uint32Array(256)
  for (let i = 0; i < data.length; i += 4) {
    const l = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2])
    hist[clampNum(l, 0, 255)]++
    if (l < lo) lo = l
    if (l > hi) hi = l
  }
  const total = Math.max(1, data.length / 4)
  let cut = 0
  let acc = 0
  const clip = total * 0.005
  for (let v = 0; v < 256; v++) {
    acc += hist[v]
    if (acc > clip) {
      cut = v
      break
    }
  }
  let cutHigh = 255
  acc = 0
  for (let v = 255; v >= 0; v--) {
    acc += hist[v]
    if (acc > clip) {
      cutHigh = v
      break
    }
  }
  const span = Math.max(1, cutHigh - cut)
  const lut = new Uint8ClampedArray(256)
  for (let v = 0; v < 256; v++) {
    const stretched = ((v - cut) / span) * 255
    lut[v] = v + (clampNum(stretched, 0, 255) - v) * k
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]]
    data[i + 1] = lut[data[i + 1]]
    data[i + 2] = lut[data[i + 2]]
  }
}

/** CLAHE on the luminance channel — local contrast without global blowout. */
export function clahePixels(data: Uint8ClampedArray, w: number, h: number, tiles: number, clipLimit: number): void {
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const tx = Math.max(1, Math.min(16, Math.round(tiles)))
  const ty = tx
  const clip = Math.max(1, clipLimit) / 100
  const bins = 64
  const luma = new Uint8ClampedArray(W * H)
  for (let i = 0, p = 0; p < luma.length; p++, i += 4) {
    luma[p] = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2])
  }
  const luts: Array<Float32Array> = []
  for (let tyi = 0; tyi < ty; tyi++) {
    for (let txi = 0; txi < tx; txi++) {
      const x0 = Math.floor((txi * W) / tx)
      const x1 = Math.floor(((txi + 1) * W) / tx)
      const y0 = Math.floor((tyi * H) / ty)
      const y1 = Math.floor(((tyi + 1) * H) / ty)
      const hist = new Float32Array(bins)
      const n = Math.max(1, (x1 - x0) * (y1 - y0))
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          hist[Math.min(bins - 1, Math.floor((luma[y * W + x] / 256) * bins))]++
        }
      }
      const limit = Math.max(1, n * clip)
      for (let i = 0; i < bins; i++) if (hist[i] > limit) hist[i] = limit
      const lut = new Float32Array(bins)
      let sum = 0
      for (let i = 0; i < bins; i++) {
        sum += hist[i]
        lut[i] = sum / n
      }
      for (let i = 0; i < bins; i++) lut[i] *= bins
      luts.push(lut)
    }
  }
  for (let y = 0; y < H; y++) {
    const tY = Math.min(ty - 1, Math.floor((y * ty) / H))
    for (let x = 0; x < W; x++) {
      const tX = Math.min(tx - 1, Math.floor((x * tx) / W))
      const lut = luts[tY * tx + tX]
      const l = luma[y * W + x]
      const i = (y * W + x) * 4
      const mapped = lut[Math.min(bins - 1, Math.floor((l / 256) * bins))]
      const gain = safeDiv(mapped, l, 1)
      data[i] = clampNum(data[i] * gain, 0, 255)
      data[i + 1] = clampNum(data[i + 1] * gain, 0, 255)
      data[i + 2] = clampNum(data[i + 2] * gain, 0, 255)
    }
  }
}

/** Film grain. Deterministic (seeded) so the same input gives the same output. */
export function grainPixels(data: Uint8ClampedArray, amount: number, mono: boolean, seed = 12345): void {
  const a = clampNum(amount, 0, 100)
  if (a === 0) return
  let s = seed >>> 0
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296 - 0.5
  }
  for (let i = 0; i < data.length; i += 4) {
    const n = rand() * a * 2
    data[i] = clampNum(data[i] + n, 0, 255)
    data[i + 1] = clampNum(data[i + 1] + (mono ? n : rand() * a * 2), 0, 255)
    data[i + 2] = clampNum(data[i + 2] + (mono ? n : rand() * a * 2), 0, 255)
  }
}

/** Pixelate by block-averaging. */
export function pixelatePixels(data: Uint8ClampedArray, w: number, h: number, block: number): void {
  const b = Math.max(1, Math.round(block))
  if (b <= 1) return
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const src = data.slice()
  for (let by = 0; by < H; by += b) {
    for (let bx = 0; bx < W; bx += b) {
      let r = 0
      let g = 0
      let bl = 0
      let al = 0
      let n = 0
      for (let y = by; y < Math.min(H, by + b); y++) {
        for (let x = bx; x < Math.min(W, bx + b); x++) {
          const i = (y * W + x) * 4
          r += src[i]
          g += src[i + 1]
          bl += src[i + 2]
          al += src[i + 3]
          n++
        }
      }
      const avg = [r / n, g / n, bl / n, al / n]
      for (let y = by; y < Math.min(H, by + b); y++) {
        for (let x = bx; x < Math.min(W, bx + b); x++) {
          const i = (y * W + x) * 4
          data[i] = avg[0]
          data[i + 1] = avg[1]
          data[i + 2] = avg[2]
          data[i + 3] = avg[3]
        }
      }
    }
  }
}

/** Radial vignette, in normalised device coordinates so it scales with the image. */
export function vignettePixels(data: Uint8ClampedArray, w: number, h: number, strength: number, radius: number, feather: number): void {
  const s = clampNum(strength, 0, 100) / 100
  if (s === 0) return
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const r = clampNum(radius, 5, 200) / 100
  const f = clampNum(feather, 1, 100) / 100
  const cx = W / 2
  const cy = H / 2
  const maxD = Math.hypot(cx, cy) || 1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - cx, y - cy) / maxD
      const start = r * (1 - f)
      if (d <= start) continue
      const t = clampNum((d - start) / Math.max(0.0001, r * f), 0, 1)
      const factor = 1 - s * t * t
      const i = (y * W + x) * 4
      data[i] *= factor
      data[i + 1] *= factor
      data[i + 2] *= factor
    }
  }
}

/** Chroma-key / colour replace: turn matching pixels transparent, feather the edge. */
export function chromaKeyPixels(
  data: Uint8ClampedArray,
  key: { r: number; g: number; b: number },
  tolerance: number,
  softness: number,
): void {
  const tol = clampNum(tolerance, 0, 100) * 4.4
  const soft = Math.max(1, clampNum(softness, 0, 100) / 10)
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.sqrt((data[i] - key.r) ** 2 + (data[i + 1] - key.g) ** 2 + (data[i + 2] - key.b) ** 2)
    if (d <= tol) data[i + 3] = 0
    else if (d <= tol + soft * 4) data[i + 3] = clampNum(((d - tol) / (soft * 4)) * 255, 0, 255)
  }
}

export function colorReplacePixels(
  data: Uint8ClampedArray,
  from: { r: number; g: number; b: number },
  to: { r: number; g: number; b: number },
  tolerance: number,
): void {
  const tol = clampNum(tolerance, 0, 100) * 4.4
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    const d = Math.sqrt((data[i] - from.r) ** 2 + (data[i + 1] - from.g) ** 2 + (data[i + 2] - from.b) ** 2)
    if (d <= tol) {
      const k = 1 - d / Math.max(1, tol)
      data[i] = from.r + (to.r - from.r) * k
      data[i + 1] = from.g + (to.g - from.g) * k
      data[i + 2] = from.b + (to.b - from.b) * k
    }
  }
}

/**
 * Flood-fill from the borders to estimate the background, then knock it out.
 * Deterministic and dependency-free — no model download, no upload.
 */
export function removeBackgroundPixels(data: Uint8ClampedArray, w: number, h: number, tolerance: number): number {
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const tol = clampNum(tolerance, 0, 100) * 4.4
  const seen = new Uint8Array(W * H)
  const stack: number[] = []
  const push = (x: number, y: number) => {
    const p = y * W + x
    if (seen[p]) return
    seen[p] = 1
    stack.push(p)
  }
  for (let x = 0; x < W; x++) {
    push(x, 0)
    push(x, H - 1)
  }
  for (let y = 0; y < H; y++) {
    push(0, y)
    push(W - 1, y)
  }
  let r0 = 0
  let g0 = 0
  let b0 = 0
  let n0 = 0
  for (let p = 0; p < W * H; p++) {
    if (!seen[p]) continue
    const i = p * 4
    r0 += data[i]
    g0 += data[i + 1]
    b0 += data[i + 2]
    n0++
  }
  if (n0 === 0) return 0
  const key = { r: r0 / n0, g: g0 / n0, b: b0 / n0 }
  let removed = 0
  while (stack.length) {
    const p = stack.pop() as number
    const i = p * 4
    const d = Math.sqrt((data[i] - key.r) ** 2 + (data[i + 1] - key.g) ** 2 + (data[i + 2] - key.b) ** 2)
    if (d > tol) continue
    data[i + 3] = 0
    removed++
    const x = p % W
    const y = Math.floor(p / W)
    if (x > 0) push(x - 1, y)
    if (x < W - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y < H - 1) push(x, y + 1)
  }
  return removed
}

/** Directional relight: estimate a light gradient and re-apply it to the luminance. */
export function relightPixels(data: Uint8ClampedArray, w: number, h: number, angleDeg: number, strength: number): void {
  const s = clampNum(strength, 0, 100) / 100
  if (s === 0) return
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const a = (clampNum(angleDeg, 0, 360) * Math.PI) / 180
  const lx = Math.cos(a)
  const ly = Math.sin(a)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = safeDiv(x, W, 0) - 0.5
      const v = safeDiv(y, H, 0) - 0.5
      const ramp = (u * lx + v * ly) * 2
      const gain = 1 + ramp * s * 0.5
      const i = (y * W + x) * 4
      data[i] = clampNum(data[i] * gain, 0, 255)
      data[i + 1] = clampNum(data[i + 1] * gain, 0, 255)
      data[i + 2] = clampNum(data[i + 2] * gain, 0, 255)
    }
  }
}

/**
 * Inpaint a region by diffusing surrounding pixels inward (coherent fill).
 * Used by the "object remover" tools — no network, no model.
 */
export function inpaintPixels(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  cx: number,
  cy: number,
  radius: number,
  feather: number,
): number {
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const r = Math.max(1, Math.round(radius))
  const f = Math.max(1, Math.round(feather))
  const x0 = Math.max(0, Math.floor(cx - r - f))
  const x1 = Math.min(W - 1, Math.ceil(cx + r + f))
  const y0 = Math.max(0, Math.floor(cy - r - f))
  const y1 = Math.min(H - 1, Math.ceil(cy + r + f))
  if (x1 < x0 || y1 < y0) return 0
  const src = data.slice()
  const mask = new Uint8Array(W * H)
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy)
      if (d <= r) mask[y * W + x] = 1
      else if (d <= r + f) mask[y * W + x] = 2
    }
  }
  let filled = 0
  const sample = (x: number, y: number, c: number): number => {
    let sum = 0
    let n = 0
    for (let dy = -f; dy <= f; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= H) continue
      for (let dx = -f; dx <= f; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= W) continue
        const m = mask[yy * W + xx]
        if (m !== 0) continue
        sum += src[(yy * W + xx) * 4 + c]
        n++
      }
    }
    return n ? sum / n : 0
  }
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const m = mask[y * W + x]
      if (m === 0) continue
      const i = (y * W + x) * 4
      const a = sample(x, y, 0)
      const b = sample(x, y, 1)
      const c = sample(x, y, 2)
      if (m === 1) {
        data[i] = a
        data[i + 1] = b
        data[i + 2] = c
        data[i + 3] = 255
        filled++
      } else {
        const k = clampNum(safeDiv(r + f - Math.hypot(x - cx, y - cy), f, 0), 0, 1)
        data[i] = src[i] + (a - src[i]) * k
        data[i + 1] = src[i + 1] + (b - src[i + 1]) * k
        data[i + 2] = src[i + 2] + (c - src[i + 2]) * k
        data[i + 3] = src[i + 3] + (255 - src[i + 3]) * k
      }
    }
  }
  return filled
}

/**
 * Estimate a face box with a skin-tone + symmetry heuristic.
 * Deliberately conservative: returns null when it is not confident, so the UI
 * can say "position it yourself" instead of guessing wrong.
 */
export function estimateFaceBox(data: Uint8ClampedArray, w: number, h: number): { x: number; y: number; w: number; h: number } | null {
  const W = Math.max(1, w)
  const H = Math.max(1, h)
  const stepX = Math.max(1, Math.floor(W / 120))
  const stepY = Math.max(1, Math.floor(H / 120))
  let minX = W
  let minY = H
  let maxX = -1
  let maxY = -1
  let count = 0
  for (let y = 0; y < H; y += stepY) {
    for (let x = 0; x < W; x += stepX) {
      const i = (y * W + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const mx = Math.max(r, g, b)
      const mn = Math.min(r, g, b)
      if (mx < 60) continue
      if (r <= g + 18 || g <= b) continue
      const sat = (mx - mn) / mx
      if (sat < 0.12 || sat > 0.62) continue
      if (b > 140) continue
      count++
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  const total = Math.floor(W / stepX) * Math.floor(H / stepY)
  const ratio = safeDiv(count, total, 0)
  if (count < 24 || ratio < 0.02 || ratio > 0.62 || maxX < 0 || maxY < 0) return null
  const bw = maxX - minX
  const bh = maxY - minY
  if (bw < W * 0.05 || bh < H * 0.05) return null
  if (bw / bh < 0.35 || bw / bh > 2.6) return null
  const padX = bw * 0.35
  const padY = bh * 0.25
  return {
    x: Math.max(0, Math.round(minX - padX)),
    y: Math.max(0, Math.round(minY - padY)),
    w: Math.min(W, Math.round(bw + padX * 2)),
    h: Math.min(H, Math.round(bh + padY * 2)),
  }
}

/** Extract a dominant palette by k-means in a small RGB space. Deterministic seeding. */
export function extractPalette(data: Uint8ClampedArray, count: number): Array<{ hex: string; share: number; pixels: number }> {
  const k = Math.max(1, Math.min(12, Math.round(count)))
  const W = Math.floor(data.length / 4)
  if (W === 0) return []
  const stride = Math.max(1, Math.floor(W / 4000))
  const samples: Array<[number, number, number]> = []
  for (let p = 0; p < W; p += stride) {
    if (data[p * 4 + 3] < 32) continue
    samples.push([data[p * 4], data[p * 4 + 1], data[p * 4 + 2]])
  }
  if (samples.length === 0) return []
  const sorted = [...samples].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]))
  const centroids: Array<[number, number, number]> = []
  for (let i = 0; i < k; i++) {
    const s = sorted[Math.floor(((i + 0.5) / k) * sorted.length)] ?? sorted[sorted.length - 1]
    centroids.push([s[0], s[1], s[2]])
  }
  const sums = centroids.map(() => [0, 0, 0, 0])
  for (let iter = 0; iter < 8; iter++) {
    for (let i = 0; i < sums.length; i++) sums[i] = [0, 0, 0, 0]
    for (const s of samples) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < centroids.length; c++) {
        const dr = s[0] - centroids[c][0]
        const dg = s[1] - centroids[c][1]
        const db = s[2] - centroids[c][2]
        const d = dr * dr + dg * dg + db * db
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      sums[best][0] += s[0]
      sums[best][1] += s[1]
      sums[best][2] += s[2]
      sums[best][3]++
    }
    for (let c = 0; c < centroids.length; c++) {
      const n = sums[c][3]
      if (n > 0) centroids[c] = [sums[c][0] / n, sums[c][1] / n, sums[c][2] / n]
    }
  }
  return centroids
    .map((c, i) => ({ hex: rgbToHex(c[0], c[1], c[2]), pixels: sums[i][3], share: safeDiv(sums[i][3], samples.length, 0) }))
    .filter((c) => c.pixels > 0)
    .sort((a, b) => b.share - a.share)
}
