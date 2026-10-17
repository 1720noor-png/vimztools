import { groupOfMime, groupOfName } from './values.ts'
import type { MimeGroup } from './types.ts'

export interface ParsedImage {
  width: number
  height: number
  /** raw pixel data for formats the browser cannot decode */
  bitmap?: ImageBitmap | HTMLImageElement
  pixelData?: ImageData
  note?: string
}

export function sniffFormat(file: { name: string; type?: string }): MimeGroup | null {
  return groupOfMime(file.type) ?? groupOfName(file.name)
}

export function decodeNative(file: File | Blob, forced?: { w: number; h: number }): Promise<ParsedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    if (forced) {
      img.width = forced.w
      img.height = forced.h
    }
    img.onload = () => {
      const width = img.naturalWidth || img.width
      const height = img.naturalHeight || img.height
      if (!width || !height) {
        URL.revokeObjectURL(url)
        reject(new Error('That file decoded to a 0×0 image, so there is nothing to process.'))
        return
      }
      resolve({ width, height, bitmap: img, note: 'decoded by the browser' })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('This browser cannot decode that format. Try converting it to PNG or JPG first.'))
    }
    img.src = url
  })
}

// ---------------------------------------------------------------------------
// BMP
// ---------------------------------------------------------------------------

export function parseBmp(buf: ArrayBuffer): ParsedImage {
  const view = new DataView(buf)
  if (buf.byteLength < 54 || view.getUint8(0) !== 0x42 || view.getUint8(1) !== 0x4d) {
    throw new Error('Not a BMP file (missing BM signature).')
  }
  const pixelOffset = view.getUint32(10, true)
  const dibSize = view.getUint32(14, true)
  if (dibSize < 12) throw new Error('Unsupported BMP header.')
  const width = view.getInt32(18, true)
  let height = view.getInt32(22, true)
  const bpp = dibSize >= 40 ? view.getUint16(28, true) : view.getUint16(28, true)
  const compression = dibSize >= 40 ? view.getUint32(30, true) : 0
  let paletteCount = dibSize >= 40 ? view.getUint32(46, true) : 0
  const upsideDown = height < 0
  if (upsideDown) height = -height
  if (width <= 0 || height <= 0) throw new Error('BMP reports a 0-sized image.')
  if (compression !== 0 && compression !== 3) throw new Error('Only uncompressed BMP files are supported.')
  if (paletteCount === 0 && bpp <= 8) paletteCount = 1 << bpp
  const W = Math.abs(width)
  const H = height
  const out = new ImageData(W, H)
  const rowSize = Math.floor((bpp * W + 31) / 32) * 4
  if (bpp === 24 || bpp === 32) {
    const bytes = bpp / 8
    for (let y = 0; y < H; y++) {
      const srcRow = upsideDown ? y : H - 1 - y
      let p = pixelOffset + srcRow * rowSize
      for (let x = 0; x < W; x++) {
        if (p + 2 >= buf.byteLength) break
        const i = (y * W + x) * 4
        out.data[i] = view.getUint8(p + 2)
        out.data[i + 1] = view.getUint8(p + 1)
        out.data[i + 2] = view.getUint8(p)
        out.data[i + 3] = bpp === 32 ? view.getUint8(p + 3) : 255
        p += bytes
      }
    }
  } else if (bpp === 8 || bpp === 4 || bpp === 1) {
    const palStart = 14 + dibSize
    const mask = bpp === 8 ? 0xff : bpp === 4 ? 0x0f : 0x01
    for (let y = 0; y < H; y++) {
      const srcRow = upsideDown ? y : H - 1 - y
      let p = pixelOffset + srcRow * rowSize
      for (let x = 0; x < W; x++) {
        const byte = view.getUint8(p + Math.floor(x / (8 / bpp))) || 0
        const shift = 8 - bpp * (x % (8 / bpp)) - bpp
        const idx = (byte >> shift) & mask
        const c = palStart + idx * 4
        const i = (y * W + x) * 4
        if (c + 2 < buf.byteLength) {
          out.data[i] = view.getUint8(c + 2)
          out.data[i + 1] = view.getUint8(c + 1)
          out.data[i + 2] = view.getUint8(c)
        }
        out.data[i + 3] = 255
      }
    }
  } else {
    throw new Error(`Unsupported BMP bit depth: ${bpp}.`)
  }
  return { width: W, height: H, pixelData: out, note: 'decoded with the built-in BMP reader' }
}

// ---------------------------------------------------------------------------
// Baseline TIFF (uncompressed, packbits, LZW-free paths)
// ---------------------------------------------------------------------------

const TIFF_TYPES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 }

export function parseTiff(buf: ArrayBuffer): ParsedImage {
  const view = new DataView(buf)
  if (buf.byteLength < 8) throw new Error('File is too small to be a TIFF.')
  const le = view.getUint8(0) === 0x49
  const magic = view.getUint16(2, le)
  if (magic !== 42) throw new Error('Not a baseline TIFF (expected magic 42).')
  const ifd = view.getUint32(4, le)
  const tags: Record<number, number[]> = {}
  const count = view.getUint16(ifd, le)
  for (let i = 0; i < count; i++) {
    const e = ifd + 2 + i * 12
    if (e + 12 > buf.byteLength) break
    const tag = view.getUint16(e, le)
    const type = view.getUint16(e + 2, le)
    const n = view.getUint32(e + 4, le)
    const size = TIFF_TYPES[type]
    if (!size) continue
    const total = size * n
    let off = e + 8
    if (total > 4) off = view.getUint32(e + 8, le)
    const values: number[] = []
    for (let k = 0; k < n && off + size * (k + 1) <= buf.byteLength; k++) {
      const p = off + size * k
      if (type === 3 || type === 8) values.push(view.getUint16(p, le))
      else if (type === 4 || type === 9) values.push(view.getUint32(p, le))
      else if (type === 1 || type === 2 || type === 6 || type === 7) values.push(view.getUint8(p))
      else values.push(0)
    }
    tags[tag] = values
  }
  const width = tags[256]?.[0] ?? 0
  const height = tags[257]?.[0] ?? 0
  if (!width || !height) throw new Error('TIFF is missing its width/height tags.')
  const samples = tags[277]?.[0] ?? 1
  const bits = tags[258]?.[0] ?? 8
  const compression = tags[259]?.[0] ?? 1
  const rowsPerStrip = tags[278]?.[0] ?? height
  const stripOffsets = tags[273] ?? []
  if (compression === 6 || compression === 7) {
    throw new Error('This TIFF uses JPEG compression inside the file, which this browser cannot decode directly. Re-save it as PNG or JPG.')
  }
  if (bits !== 8) {
    throw new Error(`Only 8-bit TIFFs are supported (this file is ${bits}-bit). Re-save it as PNG or JPG.`)
  }
  const out = new ImageData(width, height)
  for (let s = 0; s < stripOffsets.length; s++) {
    const start = stripOffsets[s]
    const rowBytes = width * samples
    const rows = Math.min(rowsPerStrip, height - s * rowsPerStrip)
    for (let r = 0; r < rows; r++) {
      for (let x = 0; x < width; x++) {
        const p = start + r * rowBytes + x * samples
        if (p + samples > buf.byteLength) break
        const i = ((s * rowsPerStrip + r) * width + x) * 4
        if (samples >= 3) {
          out.data[i] = view.getUint8(p)
          out.data[i + 1] = view.getUint8(p + 1)
          out.data[i + 2] = view.getUint8(p + 2)
        } else {
          const v = view.getUint8(p)
          out.data[i] = v
          out.data[i + 1] = v
          out.data[i + 2] = v
        }
        out.data[i + 3] = 255
      }
    }
  }
  return { width, height, pixelData: out, note: 'decoded with the built-in TIFF reader' }
}

// ---------------------------------------------------------------------------
// ICO
// ---------------------------------------------------------------------------

export interface IcoEntry {
  width: number
  height: number
  isPng: boolean
  bytes: Uint8Array
  bitDepth: number
}

export function parseIco(buf: ArrayBuffer): { entries: IcoEntry[] } {
  const view = new DataView(buf)
  if (buf.byteLength < 6) throw new Error('File is too small to be an ICO.')
  if (view.getUint8(0) !== 0 || view.getUint8(1) !== 0 || view.getUint8(2) !== 1 || view.getUint8(3) !== 0) {
    throw new Error('Not an ICO file.')
  }
  const total = view.getUint16(4, true)
  const entries: IcoEntry[] = []
  for (let i = 0; i < total; i++) {
    const e = 6 + i * 16
    if (e + 16 > buf.byteLength) break
    const w = view.getUint8(e) || 256
    const h = view.getUint8(e + 1) || 256
    const size = view.getUint32(e + 8, true)
    const off = view.getUint32(e + 12, true)
    if (off + size > buf.byteLength) continue
    const bytes = new Uint8Array(buf.slice(off, off + size))
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50
    entries.push({ width: w, height: h, isPng, bytes, bitDepth: isPng ? 32 : 32 })
  }
  if (entries.length === 0) throw new Error('ICO contains no readable images.')
  return { entries }
}

export function buildIco(images: Array<{ png: Uint8Array; size: number }>): Blob {
  const total = images.length
  const header = new Uint8Array(6 + total * 16)
  const dv = new DataView(header.buffer)
  dv.setUint16(0, 0, true)
  dv.setUint16(2, 1, true)
  dv.setUint16(4, total, true)
  let offset = header.length
  images.forEach((img, i) => {
    const e = 6 + i * 16
    const s = img.size >= 256 ? 0 : img.size
    header[e] = s
    header[e + 1] = s
    header[e + 2] = 0
    header[e + 3] = 0
    dv.setUint16(e + 4, 1, true)
    dv.setUint16(e + 6, 32, true)
    dv.setUint32(e + 8, img.png.length, true)
    dv.setUint32(e + 12, offset, true)
    offset += img.png.length
  })
  const parts: BlobPart[] = [header.buffer as ArrayBuffer]
  for (const img of images) parts.push(img.png as unknown as BlobPart)
  return new Blob(parts, { type: 'image/x-icon' })
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export interface MetaRow {
  label: string
  value: string
}

const jpegApp1ExifKeys: Record<number, string> = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x011a: 'XResolution',
  0x011b: 'YResolution',
  0x0128: 'ResolutionUnit',
  0x0131: 'Software',
  0x0132: 'ModifyDate',
  0x013b: 'Artist',
  0x8298: 'Copyright',
  0x8769: 'ExifIFD',
  0x8825: 'GPSIFD',
  0x9003: 'DateTimeOriginal',
  0x920a: 'FocalLength',
  0x9204: 'ExposureBias',
  0x9207: 'MeteringMode',
  0x9201: 'ShutterSpeedValue',
  0x9202: 'ApertureValue',
  0x9209: 'Flash',
  0x9286: 'UserComment',
  0xa002: 'PixelXDimension',
  0xa003: 'PixelYDimension',
  0xa430: 'OwnerName',
  0xa431: 'BodySerialNumber',
}

const exifGpsTags: Record<number, string> = {
  1: 'GPSLatitudeRef',
  2: 'GPSLatitude',
  3: 'GPSLongitudeRef',
  4: 'GPSLongitude',
  5: 'GPSAltitudeRef',
  6: 'GPSAltitude',
  7: 'GPSTimeStamp',
}

function readExifIfd(view: DataView, tiffStart: number, ifdOffset: number, le: boolean): Record<string, string> {
  const out: Record<string, string> = {}
  if (ifdOffset <= 0 || tiffStart + ifdOffset + 2 > view.byteLength) return out
  const n = view.getUint16(tiffStart + ifdOffset, le)
  for (let i = 0; i < n; i++) {
    const e = tiffStart + ifdOffset + 2 + i * 12
    if (e + 12 > view.byteLength) break
    const tag = view.getUint16(e, le)
    const type = view.getUint16(e + 2, le)
    const cnt = view.getUint32(e + 4, le)
    const name = jpegApp1ExifKeys[tag]
    if (!name) continue
    const size = TIFF_TYPES[type] ?? 1
    let p = e + 8
    if (size * cnt > 4) p = tiffStart + view.getUint32(e + 8, le)
    if (type === 2) {
      let s = ''
      for (let k = 0; k < cnt && p + k < view.byteLength; k++) {
        const c = view.getUint8(p + k)
        if (c === 0) break
        s += String.fromCharCode(c)
      }
      if (s) out[name] = s
    } else if (type === 3 || type === 8) {
      out[name] = String(view.getUint16(p, le))
    } else if (type === 4 || type === 9) {
      const v = view.getUint32(p, le)
      out[name] = name.toLowerCase().includes('date') ? formatExifDate(v) : String(v)
    } else if (type === 5 || type === 10) {
      const num = view.getUint32(p, le)
      const den = view.getUint32(p + 4, le) || 1
      out[name] = `${num}/${den}`
    } else if (type === 1 || type === 6 || type === 7) {
      out[name] = String(view.getUint8(p))
    }
  }
  return out
}

function formatExifDate(v: number): string {
  const y = Math.floor(v / 1e10)
  if (y < 1900 || y > 2200) return String(v)
  const rest = v % 1e10
  const mo = Math.floor(rest / 1e6)
  const d = Math.floor(rest / 1e4) % 100
  const h = Math.floor(rest / 100) % 100
  const mi = rest % 100
  return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}`
}

function pad(n: number): string {
  return String(Math.max(0, Math.min(99, n))).padStart(2, '0')
}

export function parseJpegMetadata(buf: ArrayBuffer): MetaRow[] {
  const view = new DataView(buf)
  const bytes = new Uint8Array(buf)
  const rows: MetaRow[] = []
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return rows
  let p = 2
  while (p + 4 < bytes.length) {
    if (bytes[p] !== 0xff) {
      p++
      continue
    }
    const marker = bytes[p + 1]
    const len = view.getUint16(p + 2, false)
    if (marker === 0xe0 && bytes[p + 4] === 0x4a && bytes[p + 5] === 0x46) {
      rows.push({ label: 'JPEG marker', value: 'JFIF' })
    }
    if (marker === 0xe1 && bytes[p + 4] === 0x45 && bytes[p + 5] === 0x78 && bytes[p + 6] === 0x69 && bytes[p + 7] === 0x66) {
      const tiffStart = p + 10
      const le = view.getUint16(tiffStart) === 0x4949
      const ifd = view.getUint32(tiffStart + 4, le)
      const exif = readExifIfd(view, tiffStart, ifd, le)
      for (const [k, v] of Object.entries(exif)) rows.push({ label: k, value: v })
      const gpsIfd = Number(exif.GPSIFD ?? 0)
      if (gpsIfd) {
        for (const [k, v] of Object.entries(readExifIfd(view, tiffStart, gpsIfd, le))) {
          if (exifGpsTags[Object.keys(exifGpsTags).find((t) => exifGpsTags[Number(t)] === k) as unknown as number] || k.startsWith('GPS')) {
            rows.push({ label: k, value: v })
          }
        }
      }
    }
    if (marker === 0xda) break
    p += 2 + len
  }
  return rows
}

export function parsePngMetadata(buf: ArrayBuffer): MetaRow[] {
  const view = new DataView(buf)
  const bytes = new Uint8Array(buf)
  const rows: MetaRow[] = []
  if (bytes.length < 8 || bytes[0] !== 0x89) return rows
  let p = 8
  while (p + 8 <= bytes.length) {
    const len = view.getUint32(p, false)
    const type = String.fromCharCode(bytes[p + 4], bytes[p + 5], bytes[p + 6], bytes[p + 7])
    if (type === 'IEND') break
    if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
      const start = p + 8
      const end = Math.min(bytes.length, start + len)
      let key = ''
      let i = start
      for (; i < end && bytes[i] !== 0; i++) key += String.fromCharCode(bytes[i])
      let value = ''
      for (let k = i + 1; k < end; k++) value += String.fromCharCode(bytes[k])
      rows.push({ label: key || 'text', value: value.slice(0, 200) })
    }
    if (type === 'pHYs' && p + 8 + 9 <= bytes.length) {
      const sx = view.getUint32(p + 8, false)
      const sy = view.getUint32(p + 12, false)
      const unit = bytes[p + 16]
      const dpi = unit === 1 ? `${Math.round(sx * 0.0254)} × ${Math.round(sy * 0.0254)}` : `${sx} × ${sy} px/unit`
      rows.push({ label: 'pHYs', value: `${dpi} DPI` })
    }
    if (type === 'gAMA' && p + 8 + 4 <= bytes.length) {
      rows.push({ label: 'gAMA', value: `${(view.getUint32(p + 8, false) / 100000).toFixed(3)}` })
    }
    p += 12 + len
  }
  return rows
}

export function parseWebpMetadata(buf: ArrayBuffer): MetaRow[] {
  const bytes = new Uint8Array(buf)
  const view = new DataView(buf)
  const rows: MetaRow[] = []
  if (bytes.length < 30) return rows
  let p = 12
  while (p + 8 <= bytes.length) {
    const fourcc = String.fromCharCode(bytes[p], bytes[p + 1], bytes[p + 2], bytes[p + 3])
    const size = view.getUint32(p + 4, true)
    if (fourcc === 'EXIF') rows.push({ label: 'EXIF chunk', value: `${size} bytes (present)` })
    if (fourcc === 'XMP ') rows.push({ label: 'XMP chunk', value: `${size} bytes (present)` })
    if (fourcc === 'ICCP') rows.push({ label: 'ICC profile', value: `${size} bytes (embedded)` })
    p += 8 + size + (size % 2)
  }
  return rows
}

export function parseIccProfileName(buf: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buf)
  if (bytes.length < 132) return null
  const tagCount = new DataView(buf).getUint32(128, false)
  for (let i = 0; i < tagCount; i++) {
    const p = 132 + i * 12
    if (p + 12 > bytes.length) break
    const sig = String.fromCharCode(bytes[p], bytes[p + 1], bytes[p + 2], bytes[p + 3])
    if (sig !== 'desc') continue
    const off = new DataView(buf).getUint32(p + 4, false)
    if (off + 12 >= bytes.length) return 'embedded profile'
    const dv = new DataView(buf)
    const asciiLen = dv.getUint32(off + 8, false)
    let name = ''
    for (let k = 0; k < Math.min(64, asciiLen); k++) name += String.fromCharCode(dv.getUint8(off + 12 + k))
    return name || 'embedded profile'
  }
  return null
}

/** Header sniff that does not need a full decode — used by the info tools. */
export function sniffContainer(file: { name: string; type?: string }): string {
  const g = sniffFormat(file)
  const map: Record<string, string> = {
    jpeg: 'JFIF/EXIF (ISO/IEC 10918-1)',
    png: 'PNG (ISO/IEC 15948)',
    webp: 'WebP (RIFF container)',
    avif: 'AVIF (ISOBMFF/AV1)',
    gif: 'GIF89a',
    bmp: 'Windows Bitmap',
    tiff: 'Baseline TIFF (6.0)',
    heic: 'HEIF/HEIC (ISO 23008-12)',
    ico: 'ICO container',
    pdf: 'PDF document',
    text: 'Plain text',
  }
  return g ? map[g] ?? 'Unknown container' : 'Unknown container'
}
