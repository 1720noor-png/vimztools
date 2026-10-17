import { centerCropForRatio, clampCanvasSize, resolveFit } from './geometry.ts'
import {
  adjustPixels,
  autoLevelsPixels,
  bilinear,
  chromaKeyPixels,
  clahePixels,
  colorReplacePixels,
  ctx2d,
  denoisePixels,
  duotonePixels,
  estimateFaceBox,
  grainPixels,
  grayscalePixels,
  imageDataOf,
  inpaintPixels,
  invertPixels,
  lanczos3,
  makeCanvas,
  pixelatePixels,
  posterizePixels,
  relightPixels,
  removeBackgroundPixels,
  sepiaPixels,
  temperaturePixels,
  unsharpPixels,
  vignettePixels,
  type Ctx,
} from './pixels.ts'
import { parseHexColor } from './colors.ts'
import type { Op } from './types.ts'
import { roundPx, safeDiv } from './values.ts'

export interface Surface {
  canvas: HTMLCanvasElement | OffscreenCanvas
  ctx: Ctx
  w: number
  h: number
}

export interface OpOptions {
  /** optional secondary bitmap for logo watermarks */
  secondary?: ImageBitmap | HTMLImageElement | null
  secondaryW?: number
  secondaryH?: number
}

export function makeSurface(w: number, h: number, fill?: string): Surface {
  const size = clampCanvasSize(w, h)
  const canvas = makeCanvas(size.w, size.h)
  const ctx = ctx2d(canvas)
  if (!ctx) throw new Error('Could not get a 2D drawing context for this image.')
  if (fill) {
    ctx.fillStyle = fill
    ctx.fillRect(0, 0, size.w, size.h)
  }
  return { canvas, ctx, w: size.w, h: size.h }
}

export function surfaceFromSource(
  src: ImageBitmap | HTMLImageElement | ImageData,
  w: number,
  h: number,
): Surface {
  const s = makeSurface(w, h)
  if (src instanceof ImageData) {
    s.ctx.putImageData(src, 0, 0)
  } else {
    s.ctx.imageSmoothingQuality = 'high'
    s.ctx.drawImage(src, 0, 0, s.w, s.h)
  }
  return s
}

export function cloneSurface(s: Surface): Surface {
  const out = makeSurface(s.w, s.h)
  out.ctx.drawImage(s.canvas, 0, 0)
  return out
}

/** Read-modify-write a surface's pixels through a callback. */
function withPixels(s: Surface, fn: (data: Uint8ClampedArray, w: number, h: number) => void): Surface {
  const img = imageDataOf(s.ctx, s.w, s.h)
  fn(img.data, s.w, s.h)
  s.ctx.putImageData(img, 0, 0)
  return s
}

function withBlur(s: Surface, blurPx: number, fn: (t: Surface) => Surface): Surface {
  if (blurPx <= 0) return fn(s)
  const out = makeSurface(s.w, s.h)
  out.ctx.filter = `blur(${blurPx}px)`
  out.ctx.drawImage(s.canvas, 0, 0)
  out.ctx.filter = 'none'
  return fn(out)
}

function drawCrop(s: Surface, x: number, y: number, w: number, h: number): Surface {
  const out = makeSurface(w, h)
  out.ctx.imageSmoothingQuality = 'high'
  out.ctx.drawImage(s.canvas, x, y, w, h, 0, 0, out.w, out.h)
  return out
}

function applyShapeMask(s: Surface, shape: 'rect' | 'circle' | 'rounded', radius: number): Surface {
  if (shape === 'rect') return s
  const out = makeSurface(s.w, s.h)
  out.ctx.save()
  out.ctx.beginPath()
  if (shape === 'circle') {
    out.ctx.ellipse(s.w / 2, s.h / 2, s.w / 2, s.h / 2, 0, 0, Math.PI * 2)
  } else {
    const r = Math.min(radius, Math.min(s.w, s.h) / 2)
    out.ctx.moveTo(r, 0)
    out.ctx.arcTo(s.w, 0, s.w, s.h, r)
    out.ctx.arcTo(s.w, s.h, 0, s.h, r)
    out.ctx.arcTo(0, s.h, 0, 0, r)
    out.ctx.arcTo(0, 0, s.w, 0, r)
    out.ctx.closePath()
  }
  out.ctx.clip()
  out.ctx.drawImage(s.canvas, 0, 0)
  out.ctx.restore()
  return out
}

function resolveUnitPx(value: number, unit: 'px' | 'percent' | 'mm', dpi: number, ref: number): number {
  if (unit === 'px') return value
  if (unit === 'percent') return safeDiv(value * ref, 100, 0)
  return Math.max(1, Math.round((value * (dpi > 0 ? dpi : 96)) / 25.4))
}

/**
 * Apply a single-image op. Returns a new surface (or the same surface for
 * in-place pixel ops). Geometry ops allocate; pixel ops mutate a copy.
 */
export function applySingle(input: Surface, op: Op, opts: OpOptions = {}): Surface {
  switch (op.op) {
    case 'crop': {
      const rx = op.unit === 'ratio' ? op.x / 100 : op.x
      const ry = op.unit === 'ratio' ? op.y / 100 : op.y
      const rw = op.unit === 'ratio' ? op.w / 100 : op.w
      const rh = op.unit === 'ratio' ? op.h / 100 : op.h
      const x = Math.max(0, Math.min(input.w - 1, Math.round(rx * input.w)))
      const y = Math.max(0, Math.min(input.h - 1, Math.round(ry * input.h)))
      const w = Math.max(1, Math.min(input.w - x, Math.round(rw * input.w)))
      const h = Math.max(1, Math.min(input.h - y, Math.round(rh * input.h)))
      return drawCrop(input, x, y, w, h)
    }
    case 'cropShape':
      return applyShapeMask(input, op.shape, op.radius)
    case 'aspect': {
      const c = centerCropForRatio(input.w, input.h, op.ratio)
      return drawCrop(input, c.x, c.y, c.w, c.h)
    }
    case 'resize': {
      let tw = op.w
      let th = op.h
      const mode = op.mode === 'contain' ? 'fit' : op.mode
      if (op.unit === 'percent') {
        tw = safeDiv(op.w * input.w, 100, input.w)
        th = safeDiv(op.h * input.h, 100, input.h)
      } else if (op.unit === 'mm') {
        const dpi = op.dpi && op.dpi > 0 ? op.dpi : 300
        tw = resolveUnitPx(op.w, 'mm', dpi, input.w)
        th = resolveUnitPx(op.h, 'mm', dpi, input.h)
      }
      tw = Math.max(1, roundPx(tw))
      th = Math.max(1, roundPx(th))
      const fit = resolveFit(input.w, input.h, tw, th, mode)
      const out = makeSurface(tw, th)
      if (mode === 'cover' || mode === 'fit') {
        const s = mode === 'cover' ? Math.max(fit.sx, fit.sy) : Math.min(fit.sx, fit.sy)
        const dw = input.w * s
        const dh = input.h * s
        out.ctx.imageSmoothingQuality = 'high'
        out.ctx.drawImage(input.canvas, (tw - dw) / 2, (th - dh) / 2, dw, dh)
      } else {
        out.ctx.imageSmoothingQuality = 'high'
        out.ctx.drawImage(input.canvas, 0, 0, tw, th)
      }
      return out
    }
    case 'scaleToWidth': {
      const tw = Math.max(1, roundPx(op.w))
      const th = Math.max(1, Math.round((input.h * tw) / input.w))
      return resampleTo(input, tw, th)
    }
    case 'scaleToHeight': {
      const th = Math.max(1, roundPx(op.h))
      const tw = Math.max(1, Math.round((input.w * th) / input.h))
      return resampleTo(input, tw, th)
    }
    case 'scale': {
      const f = Math.max(0.01, op.factor)
      return resampleTo(input, input.w * f, input.h * f)
    }
    case 'longEdge': {
      const px = Math.max(1, op.px)
      const f = Math.max(input.w, input.h) > px ? px / Math.max(input.w, input.h) : 1
      return resampleTo(input, input.w * f, input.h * f)
    }
    case 'rotate': {
      const rad = (op.deg * Math.PI) / 180
      const cos = Math.abs(Math.cos(rad))
      const sin = Math.abs(Math.sin(rad))
      const expand = op.expand
      const nw = expand ? input.w * cos + input.h * sin : input.w
      const nh = expand ? input.w * sin + input.h * cos : input.h
      const out = makeSurface(nw, nh)
      out.ctx.translate(out.w / 2, out.h / 2)
      out.ctx.rotate(rad)
      out.ctx.imageSmoothingQuality = 'high'
      out.ctx.drawImage(input.canvas, -input.w / 2, -input.h / 2)
      return out
    }
    case 'flip': {
      const out = makeSurface(input.w, input.h)
      out.ctx.translate(op.axis === 'x' ? input.w : 0, op.axis === 'y' ? input.h : 0)
      out.ctx.scale(op.axis === 'x' ? -1 : 1, op.axis === 'y' ? -1 : 1)
      out.ctx.drawImage(input.canvas, 0, 0)
      return out
    }
    case 'adjust': {
      let s = cloneSurface(input)
      if (op.exposure) {
        const gain = Math.pow(2, op.exposure / 100)
        s = withPixels(s, (d) => {
          for (let i = 0; i < d.length; i += 4) {
            d[i] *= gain
            d[i + 1] *= gain
            d[i + 2] *= gain
          }
        })
      }
      if (op.temperature || op.tint) s = withPixels(s, (d) => temperaturePixels(d, op.temperature, op.tint))
      if (op.brightness || op.contrast || op.saturation || op.hue) {
        s = withPixels(s, (d) => adjustPixels(d, op.brightness, op.contrast, op.saturation, op.hue))
      }
      if (op.grayscale) s = withPixels(s, (d) => grayscalePixels(d, op.grayscale))
      if (op.sepia) s = withPixels(s, (d) => sepiaPixels(d, op.sepia))
      if (op.invert) s = withPixels(s, (d) => invertPixels(d, op.invert))
      if (op.sharpen) s = withPixels(s, (d, w, h) => unsharpPixels(d, w, h, op.sharpen, 1))
      if (op.blur) s = withBlur(s, op.blur, (t) => t)
      return s
    }
    case 'vignette':
      return withPixels(input, (d, w, h) => vignettePixels(d, w, h, op.strength, op.radius, op.feather))
    case 'grain':
      return withPixels(input, (d) => grainPixels(d, op.amount, op.mono))
    case 'pixelate':
      return withPixels(input, (d, w, h) => pixelatePixels(d, w, h, op.block))
    case 'mosaicFace': {
      const box = estimateFaceBoxIn(input, op.region)
      if (!box) return input
      const region = drawCrop(input, box.x, box.y, box.w, box.h)
      const pix = withPixels(region, (d, w, h) => pixelatePixels(d, w, h, op.block))
      const merged = cloneSurface(input)
      merged.ctx.drawImage(pix.canvas, box.x, box.y)
      return merged
    }
    case 'denoise':
      return withPixels(input, (d, w, h) => denoisePixels(d, w, h, op.strength))
    case 'autolevels':
      return withPixels(input, (d) => autoLevelsPixels(d, op.amount))
    case 'clahe':
      return withPixels(input, (d, w, h) => clahePixels(d, w, h, op.tiles, op.clip))
    case 'unsharp':
      return withPixels(input, (d, w, h) => unsharpPixels(d, w, h, op.amount, op.radius))
    case 'upscale': {
      const f = Math.max(1, op.factor)
      const tw = Math.max(1, Math.round(input.w * f))
      const th = Math.max(1, Math.round(input.h * f))
      const img = imageDataOf(input.ctx, input.w, input.h)
      // reuse the resample helpers through a small local import to avoid a cycle
      const out = makeSurface(tw, th)
      const outImg = imageDataOf(out.ctx, tw, th)
      if (op.method === 'nearest') {
        for (let y = 0; y < th; y++) {
          const sy = Math.min(input.h - 1, Math.floor((y * input.h) / th))
          for (let x = 0; x < tw; x++) {
            const sx = Math.min(input.w - 1, Math.floor((x * input.w) / tw))
            const si = (sy * input.w + sx) * 4
            const di = (y * tw + x) * 4
            outImg.data[di] = img.data[si]
            outImg.data[di + 1] = img.data[si + 1]
            outImg.data[di + 2] = img.data[si + 2]
            outImg.data[di + 3] = img.data[si + 3]
          }
        }
      } else {
        const res = op.method === 'lanczos' ? lanczos3(img.data, input.w, input.h, tw, th) : bilinear(img.data, input.w, input.h, tw, th)
        outImg.data.set(res.data)
      }
      out.ctx.putImageData(outImg, 0, 0)
      return out
    }
    case 'background': {
      switch (op.mode) {
        case 'remove': {
          return withPixels(cloneSurface(input), (d, w, h) => removeBackgroundPixels(d, w, h, op.tolerance))
        }
        case 'transparent': {
          const key = parseHexColor(op.color)
          return withPixels(cloneSurface(input), (d) => chromaKeyPixels(d, key, op.tolerance, op.feather))
        }
        case 'color': {
          const out = makeSurface(input.w, input.h, op.color)
          out.ctx.drawImage(input.canvas, 0, 0)
          return out
        }
        case 'blur': {
          const out = makeSurface(input.w, input.h)
          out.ctx.filter = `blur(${Math.max(1, op.blur)}px)`
          out.ctx.drawImage(input.canvas, 0, 0, out.w * 1.1, out.h * 1.1, -out.w * 0.05, -out.h * 0.05, out.w * 1.1, out.h * 1.1)
          out.ctx.filter = 'none'
          return out
        }
        case 'gradient': {
          const out = makeSurface(input.w, input.h)
          const g = out.ctx.createLinearGradient(0, 0, out.w, out.h)
          g.addColorStop(0, op.color)
          g.addColorStop(1, op.color2)
          out.ctx.fillStyle = g
          out.ctx.fillRect(0, 0, out.w, out.h)
          out.ctx.drawImage(input.canvas, 0, 0)
          return out
        }
        case 'studio': {
          const out = makeSurface(input.w, input.h)
          const g = out.ctx.createRadialGradient(out.w / 2, out.h / 2, out.w * 0.1, out.w / 2, out.h / 2, out.w * 0.75)
          g.addColorStop(0, '#ffffff')
          g.addColorStop(1, op.color)
          out.ctx.fillStyle = g
          out.ctx.fillRect(0, 0, out.w, out.h)
          out.ctx.drawImage(input.canvas, 0, 0)
          return out
        }
        default:
          return input
      }
    }
    case 'shadow': {
      const out = makeSurface(input.w, input.h)
      out.ctx.save()
      out.ctx.shadowColor = op.color
      out.ctx.shadowBlur = op.blur
      out.ctx.shadowOffsetX = op.offsetX
      out.ctx.shadowOffsetY = op.offsetY
      out.ctx.globalAlpha = Math.min(1, Math.max(0, op.opacity))
      out.ctx.drawImage(input.canvas, 0, 0)
      out.ctx.restore()
      return out
    }
    case 'border': {
      const out = makeSurface(input.w + op.width * 2, input.h + op.width * 2, op.color)
      out.ctx.drawImage(input.canvas, op.width, op.width)
      if (op.style === 'dashed' || op.style === 'double') {
        out.ctx.strokeStyle = op.color
        out.ctx.lineWidth = Math.max(1, Math.floor(op.width / 6))
        out.ctx.setLineDash(op.style === 'dashed' ? [op.width, op.width] : [])
        if (op.style === 'double') {
          out.ctx.strokeRect(op.width / 2, op.width / 2, out.w - op.width, out.h - op.width)
          out.ctx.strokeRect(op.width, op.width, out.w - op.width * 2, out.h - op.width * 2)
        } else {
          out.ctx.strokeRect(op.width / 2, op.width / 2, out.w - op.width, out.h - op.width)
        }
        out.ctx.setLineDash([])
      }
      return out
    }
    case 'watermarkText': {
      const out = cloneSurface(input)
      drawTextWatermark(out, op.text, op.font, op.fontSize, op.color, op.opacity, op.x, op.y, op.rotation, op.tile)
      return out
    }
    case 'watermarkImage': {
      const out = cloneSurface(input)
      if (opts.secondary && opts.secondaryW && opts.secondaryH) {
        drawImageWatermark(out, opts.secondary, opts.secondaryW, opts.secondaryH, op.opacity, op.x, op.y, op.rotation, op.scale, op.tile)
      }
      return out
    }
    case 'removeWatermark': {
      return withPixels(cloneSurface(input), (d, w, h) => {
        const region = op.region
        const cx = region === 'topleft' ? w * 0.2 : region === 'topright' ? w * 0.8 : w * 0.5
        const cy = region === 'topleft' || region === 'topright' ? h * 0.15 : region === 'bottomleft' ? h * 0.85 : h * 0.5
        inpaintPixels(d, w, h, cx, cy, Math.max(8, Math.min(w, h) * 0.2), Math.max(4, Math.min(w, h) * 0.06))
      })
    }
    case 'relight':
      return withPixels(input, (d, w, h) => relightPixels(d, w, h, op.angle, op.strength))
    case 'inpaint': {
      return withPixels(cloneSurface(input), (d, w, h) => {
        const cx = w / 2
        const cy = op.region === 'top' ? h * 0.3 : op.region === 'bottom' ? h * 0.7 : h / 2
        inpaintPixels(d, w, h, cx, cy, op.radius, op.feather)
      })
    }
    case 'photoFrame':
      return drawPhotoFrame(input, op)
    case 'sticker': {
      const out = makeSurface(input.w, input.h)
      out.ctx.save()
      out.ctx.shadowColor = 'rgba(0,0,0,0.35)'
      out.ctx.shadowBlur = Math.max(4, input.w * 0.02)
      out.ctx.shadowOffsetY = Math.max(2, input.h * 0.01)
      out.ctx.drawImage(input.canvas, 0, 0)
      out.ctx.restore()
      out.ctx.strokeStyle = '#ffffff'
      out.ctx.lineWidth = Math.max(2, Math.min(input.w, input.h) * 0.02)
      out.ctx.strokeRect(out.ctx.lineWidth / 2, out.ctx.lineWidth / 2, out.w - out.ctx.lineWidth, out.h - out.ctx.lineWidth)
      return out
    }
    case 'stripMetadata':
      return cloneSurface(input)
    case 'posterize':
      return withPixels(input, (d) => posterizePixels(d, op.levels))
    case 'duotone':
      return withPixels(input, (d) => duotonePixels(d, op.dark, op.light))
    case 'colorReplace': {
      const from = parseHexColor(op.from)
      const to = parseHexColor(op.to)
      return withPixels(input, (d) => colorReplacePixels(d, from, to, op.tolerance))
    }
    case 'chromaKey': {
      const key = parseHexColor(op.keyColor)
      return withPixels(input, (d) => chromaKeyPixels(d, key, op.tolerance, op.softness))
    }
    case 'faceBox': {
      const box = estimateFaceBoxIn(input, 'auto')
      if (!box) return input
      const pad = op.pad
      const x = Math.max(0, box.x - box.w * pad)
      const y = Math.max(0, box.y - box.h * pad)
      const w = Math.min(input.w - x, box.w * (1 + pad * 2))
      const h = Math.min(input.h - y, box.h * (1 + pad * 2))
      const cropped = drawCrop(input, x, y, w, h)
      const sq = Math.min(cropped.w, cropped.h)
      const sqd = drawCrop(cropped, (cropped.w - sq) / 2, (cropped.h - sq) / 2, sq, sq)
      return applyShapeMask(sqd, op.shape, 12)
    }
    case 'cutoutRect': {
      const inset = Math.min(0.45, Math.max(0, op.inset))
      const w = Math.max(1, input.w * (1 - inset * 2))
      const h = Math.max(1, input.h * (1 - inset * 2))
      return drawCrop(input, (input.w - w) / 2, (input.h - h) / 2, w, h)
    }
    default:
      return input
  }
}

/** High-quality box resample used for scale ops (no library needed). */
function resampleTo(s: Surface, tw: number, th: number): Surface {
  const W = Math.max(1, roundPx(tw))
  const H = Math.max(1, roundPx(th))
  const out = makeSurface(W, H)
  out.ctx.imageSmoothingEnabled = true
  out.ctx.imageSmoothingQuality = 'high'
  if (W * H > s.w * s.h) {
    const img = imageDataOf(s.ctx, s.w, s.h)
    const res = lanczos3(img.data, s.w, s.h, W, H)
    const outImg = imageDataOf(out.ctx, W, H)
    outImg.data.set(res.data)
    out.ctx.putImageData(outImg, 0, 0)
  } else {
    out.ctx.drawImage(s.canvas, 0, 0, W, H)
  }
  return out
}

function estimateFaceBoxIn(s: Surface, region: 'auto' | 'top' | 'center'): { x: number; y: number; w: number; h: number } | null {
  const img = imageDataOf(s.ctx, s.w, s.h)
  const box = estimateFaceBox(img.data, s.w, s.h)
  if (box) return box
  if (region === 'center' || region === 'auto') {
    const size = Math.min(s.w, s.h) * 0.7
    return { x: (s.w - size) / 2, y: (s.h - size) / 2, w: size, h: size }
  }
  const size = Math.min(s.w, s.h) * 0.6
  return { x: (s.w - size) / 2, y: 0, w: size, h: size }
}

function drawTextWatermark(
  s: Surface,
  text: string,
  font: string,
  fontSize: number,
  color: string,
  opacity: number,
  nx: number,
  ny: number,
  rotation: number,
  tile: boolean,
): void {
  const ctx = s.ctx
  ctx.save()
  ctx.globalAlpha = Math.min(1, Math.max(0, opacity))
  ctx.fillStyle = color
  ctx.font = `${Math.max(6, fontSize)}px ${font || 'sans-serif'}`
  ctx.textBaseline = 'middle'
  const px = (nx / 100) * s.w
  const py = (ny / 100) * s.h
  const rot = (rotation * Math.PI) / 180
  if (tile) {
    const stepX = ctx.measureText(text).width + fontSize * 2
    const stepY = fontSize * 3
    for (let y = -s.h; y < s.h * 2; y += stepY) {
      for (let x = -s.w; x < s.w * 2; x += stepX) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rot)
        ctx.fillText(text, 0, 0)
        ctx.restore()
      }
    }
  } else {
    ctx.translate(px, py)
    ctx.rotate(rot)
    ctx.fillText(text, 0, 0)
  }
  ctx.restore()
}

function drawImageWatermark(
  s: Surface,
  img: ImageBitmap | HTMLImageElement,
  iw: number,
  ih: number,
  opacity: number,
  nx: number,
  ny: number,
  rotation: number,
  scale: number,
  tile: boolean,
): void {
  const ctx = s.ctx
  const w = Math.max(8, iw * scale)
  const h = Math.max(8, ih * scale)
  ctx.save()
  ctx.globalAlpha = Math.min(1, Math.max(0, opacity))
  const rot = (rotation * Math.PI) / 180
  const px = (nx / 100) * s.w
  const py = (ny / 100) * s.h
  const place = (x: number, y: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
    ctx.restore()
  }
  if (tile) {
    for (let y = 0; y < s.h + h; y += h * 1.5) for (let x = 0; x < s.w + w; x += w * 1.5) place(x, y)
  } else {
    place(px, py)
  }
  ctx.restore()
}

/** Lazily-bound pixel helpers are imported at the top of the module. */

function drawPhotoFrame(s: Surface, op: Extract<Op, { op: 'photoFrame' }>): Surface {
  const margin = Math.max(4, op.margin)
  const capH = op.caption ? Math.round(margin * 1.6) : 0
  const out = makeSurface(s.w + margin * 2, s.h + margin * 2 + capH)
  const ctx = out.ctx
  ctx.fillStyle = op.style === 'black' ? '#111827' : op.style === 'shadow' ? '#e5e7eb' : '#ffffff'
  ctx.fillRect(0, 0, out.w, out.h)
  if (op.style === 'polaroid') {
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, out.w, out.h)
  }
  if (op.style === 'shadow') {
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = margin
    ctx.shadowOffsetY = Math.round(margin / 3)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(margin / 2, margin / 2, out.w - margin, out.h - capH)
    ctx.restore()
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(s.canvas, margin, margin, s.w, s.h)
  if (op.style === 'polaroid') {
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(margin, margin + s.h, out.w - margin * 2, 1)
  }
  if (op.caption) {
    ctx.fillStyle = op.style === 'black' ? '#f9fafb' : '#111827'
    ctx.font = `${Math.round(margin * 0.5)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(op.caption, out.w / 2, margin + s.h + capH / 2, out.w - margin * 2)
  }
  return out
}

export { resampleTo }
