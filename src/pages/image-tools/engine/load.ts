import { decodeNative, parseBmp, parseIco, parseTiff } from './decode.ts'
import { groupOfFile } from './values.ts'
import { clampCanvasSize } from './geometry.ts'
import type { LoadedImage } from './types.ts'

/** Images currently held open, so the renderer can release them deterministically. */
const liveBitmaps = new Set<ImageBitmap>()

export function releaseImage(img: LoadedImage | null | undefined): void {
  if (!img) return
  if (img.bitmap) {
    liveBitmaps.delete(img.bitmap)
    img.bitmap.close()
    img.bitmap = undefined
  }
  if (img.url) URL.revokeObjectURL(img.url)
  img.url = ''
  img.pixels = undefined
  img.element = undefined
}

export function releaseAll(list: LoadedImage[]): void {
  for (const img of list) releaseImage(img)
}

export function liveBitmapCount(): number {
  return liveBitmaps.size
}

export async function loadFile(file: File, onProgress?: (label: string, pct: number) => void): Promise<LoadedImage> {
  const group = groupOfFile(file)
  onProgress?.(`Reading ${file.name}`, 10)
  const base: LoadedImage = {
    name: file.name,
    size: file.size,
    mime: file.type || 'application/octet-stream',
    url: URL.createObjectURL(file),
    width: 0,
    height: 0,
    file,
    group,
  }
  try {
    if (group === 'bmp') {
      const parsed = parseBmp(await file.arrayBuffer())
      return { ...base, pixels: parsed.pixelData, width: parsed.width, height: parsed.height }
    }
    if (group === 'tiff') {
      const parsed = parseTiff(await file.arrayBuffer())
      return { ...base, pixels: parsed.pixelData, width: parsed.width, height: parsed.height }
    }
    if (group === 'ico') {
      const { entries } = parseIco(await file.arrayBuffer())
      const best = [...entries].sort((a, b) => b.width * b.height - a.width * a.height)[0]
      if (!best) throw new Error('That ICO file has no readable image inside it.')
      if (best.isPng) {
        const pngFile = new File([best.bytes as unknown as BlobPart], `${file.name}.png`, { type: 'image/png' })
        const parsed = await decodeNative(pngFile)
        return {
          ...base,
          element: parsed.bitmap instanceof Image ? parsed.bitmap : undefined,
          bitmap: parsed.bitmap instanceof ImageBitmap ? trackBitmap(parsed.bitmap) : undefined,
          width: parsed.width,
          height: parsed.height,
        }
      }
      const parsed = parseBmp(
        best.bytes.buffer.slice(best.bytes.byteOffset, best.bytes.byteOffset + best.bytes.byteLength) as ArrayBuffer,
      )
      return { ...base, pixels: parsed.pixelData, width: parsed.width, height: parsed.height }
    }
    if (group === 'heic') {
      const decoded = await decodeHeic(file)
      return { ...base, bitmap: decoded.bitmap, width: decoded.width, height: decoded.height }
    }
    const parsed = group === 'svg' ? await decodeNative(file, { w: 1024, h: 1024 }) : await decodeNative(file)
    const size = clampCanvasSize(parsed.width, parsed.height)
    if (size.clamped) {
      onProgress?.('Image is very large — scaling to a safe size', 20)
    }
    return {
      ...base,
      element: parsed.bitmap instanceof Image ? parsed.bitmap : undefined,
      bitmap: parsed.bitmap instanceof ImageBitmap ? trackBitmap(parsed.bitmap) : undefined,
      width: size.w,
      height: size.h,
    }
  } catch (e) {
    URL.revokeObjectURL(base.url)
    throw e instanceof Error ? e : new Error('That file could not be read as an image.')
  }
}

function trackBitmap(b: ImageBitmap): ImageBitmap {
  liveBitmaps.add(b)
  return b
}

async function decodeHeic(file: File): Promise<{ width: number; height: number; bitmap?: ImageBitmap }> {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('This browser cannot decode HEIC files. Convert to JPG or PNG first.')
  }
  try {
    const bitmap = await createImageBitmap(file)
    if (!bitmap.width || !bitmap.height) {
      bitmap.close()
      throw new Error('decoded empty')
    }
    liveBitmaps.add(bitmap)
    return { width: bitmap.width, height: bitmap.height, bitmap }
  } catch {
    throw new Error('This browser cannot decode HEIC files. Convert to JPG or PNG first.')
  }
}

/** Build a drawable source for a loaded image, using raw pixels when present. */
export function sourceOf(img: LoadedImage): ImageBitmap | HTMLImageElement | ImageData {
  if (img.pixels) return img.pixels
  if (img.bitmap) return img.bitmap
  if (img.element) return img.element
  throw new Error(`${img.name} is no longer loaded. Upload it again.`)
}
