import { aspectRatio, megapixels, nearestRatioName, simplifyRatio } from './geometry.ts'
import { imageDataOf, extractPalette } from './pixels.ts'
import { makeSurface, resampleTo, surfaceFromSource, type Surface } from './ops.ts'
import { sourceOf } from './load.ts'
import { surfaceToBlob } from './outputs.ts'
import { contrastRatio, describeColor, hexToRgb } from './colors.ts'
import { parseJpegMetadata, parsePngMetadata, parseWebpMetadata, sniffContainer } from './decode.ts'
import { baseOf, describeFileSize, extOf, groupOfMime, numOf, selectOf, strOf } from './values.ts'
import type { InfoSection, LoadedImage, OutputFile, RunInput, RunResult } from './types.ts'

function surfaceOf(img: LoadedImage): Surface {
  return surfaceFromSource(sourceOf(img), img.width, img.height)
}

function row(label: string, value: string | number, tone?: InfoSection['tone'], hint?: string): InfoSection {
  return { label, value: String(value), ...(tone ? { tone } : {}), ...(hint ? { hint } : {}) }
}

function dataUrlOf(s: Surface): string {
  return surfaceToDataUrl(s)
}

function surfaceToDataUrl(s: Surface): string {
  if ('toDataURL' in s.canvas) return (s.canvas as HTMLCanvasElement).toDataURL('image/png')
  return ''
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(',') ? b64.slice(b64.indexOf(',') + 1) : b64
  const bin = atob(clean)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

/* ------------------------------------------------------------------- OCR */

export async function ocrText(input: RunInput): Promise<RunResult> {
  const { values, images } = input
  const img = images[0]
  if (!img) return { files: [], info: [], error: 'Upload an image containing text.' }
  const s = surfaceOf(img)
  const upscale = numOf(values, 'scale', 2, 1, 4)
  const prepared = upscale > 1 ? resampleTo(s, Math.round(s.w * upscale), Math.round(s.h * upscale)) : s
  const lang = String(values.language ?? 'eng')
  try {
    const { default: Tesseract } = await import('tesseract.js')
    const { data } = await Tesseract.recognize(prepared.canvas, lang)
    const text = (data.text || '').trim()
    const words: { text: string; confidence: number }[] = (data as unknown as { words?: { text: string; confidence: number }[] }).words ?? []
    if (!text) {
      return { files: [], info: [row('Result', 'No text found', 'warn', 'Try a higher resolution, a more upright photo, or a different language')], error: 'No readable text was found in that image.' }
    }
    const lines = text.split(/\n+/).filter((l) => l.trim().length > 0)
    const linesOut = lines.map((l, i) => row(`Line ${i + 1}`, l.trim(), i === 0 ? 'good' : 'neutral', words.length ? `${l.split(/\s+/).filter(Boolean).length} words` : undefined)).filter((r) => r.hint !== undefined || r.tone)
    return {
      files: [{ name: `${baseOf(img.name) || 'image'}-text.txt`, blob: new Blob([text], { type: 'text/plain' }), width: s.w, height: s.h }],
      info: [
        row('Characters', String(text.length), 'good'),
        row('Words', String(words.length || text.split(/\s+/).filter(Boolean).length)),
        row('Lines', String(lines.length)),
        row('Average confidence', words.length ? `${Math.round(words.reduce((a, w) => a + (w.confidence || 0), 0) / words.length)}%` : 'n/a', words.length && words.reduce((a, w) => a + (w.confidence || 0), 0) / words.length > 80 ? 'good' : 'warn'),
        row('Language', lang),
        ...linesOut,
      ],
    }
  } catch (e) {
    return { files: [], info: [], error: `Text recognition could not start: ${e instanceof Error ? e.message : 'unknown error'}` }
  }
}

/* -------------------------------------------------------------------- QR */

export async function qrScan(input: RunInput): Promise<RunResult> {
  const img = input.images[0]
  if (!img) return { files: [], info: [], error: 'Upload an image containing a QR code or barcode.' }
  const s = surfaceOf(img)
  const data = imageDataOf(s.ctx, s.w, s.h)
  try {
    const { default: jsQR } = await import('jsqr')
    const found = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' })
    if (!found) {
      return { files: [], info: [row('Result', 'No code found', 'warn', 'Codes must be flat, in focus and fill a good part of the frame')], error: 'No QR code or barcode was found in that image.' }
    }
    return {
      files: [{ name: 'scanned-code.txt', blob: new Blob([found.data], { type: 'text/plain' }), width: s.w, height: s.h }],
      info: [
        row('Result', 'Code found', 'good'),
        row('Version', found.version ? `QR version ${found.version}` : 'unknown', 'good'),
        row('Format', found.data.startsWith('http') ? 'URL' : 'text', 'neutral'),
        row('Location', `top-left ${found.location.topLeftCorner.x},${found.location.topLeftCorner.y}`),
        row('Payload', found.data, 'good'),
      ],
    }
  } catch (e) {
    return { files: [], info: [], error: `Code scanning could not start: ${e instanceof Error ? e.message : 'unknown error'}` }
  }
}

export async function qrMake(input: RunInput): Promise<RunResult> {
  const values = input.values
  const text = strOf(values, 'data', 'https://example.com').trim()
  if (!text) return { files: [], info: [], error: 'Enter the text or URL the code should contain.' }
  const size = numOf(values, 'size', 512, 64, 2048)
  const dark = String(values.dark ?? '#0F172A')
  const light = String(values.light ?? '#FFFFFF')
  const margin = numOf(values, 'margin', 2, 0, 16)
  try {
    const { default: QRCode } = await import('qrcode')
    const url = await QRCode.toDataURL(text, { width: size, margin, color: { dark, light }, errorCorrectionLevel: String(values.ecc ?? 'M') as 'L' | 'M' | 'Q' | 'H' })
    const blob = new Blob([base64ToBytes(url) as unknown as BlobPart], { type: 'image/png' })
    return {
      files: [{ name: 'qr-code.png', blob, width: size, height: size }],
      info: [
        row('Payload', text, 'good'),
        row('Size', `${size} × ${size} px`),
        row('Error correction', String(values.ecc ?? 'M'), 'neutral', 'L = 7%, M = 15%, Q = 25%, H = 30% recoverable'),
        row('Quiet zone', `${margin} modules`, 'neutral', 'Never crop this — scanners need it'),
        row('Scanning tip', 'Test with a second device before you print it.', 'neutral'),
      ],
    }
  } catch (e) {
    return { files: [], info: [], error: `QR generation failed: ${e instanceof Error ? e.message : 'unknown error'}` }
  }
}

const EAN_CHECK = (digits: number[]): number => {
  const sum = digits.reduce((a, d, i) => a + d * (i % 2 === 0 ? 1 : 3), 0)
  return (10 - (sum % 10)) % 10
}

export async function barcodeMake(input: RunInput): Promise<RunResult> {
  const values = input.values
  const raw = strOf(values, 'data', '4006381333931').replace(/\D/g, '')
  const width = numOf(values, 'width', 2, 1, 6)
  const height = numOf(values, 'height', 80, 40, 300)
  if (raw.length !== 12 && raw.length !== 13) {
    return { files: [], info: [], error: 'An EAN-13 code needs 12 digits (the 13th check digit is computed for you).' }
  }
  const body = raw.padStart(12, '0').slice(0, 12).split('').map(Number)
  const check = EAN_CHECK(body)
  const full = `${raw.padStart(12, '0').slice(0, 12)}${check}`
  const L: Record<string, string> = {
    '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101', '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011', '8': '0110111', '9': '0001011',
  }
  const G: Record<string, string> = {
    '0': '0100111', '1': '0110011', '2': '0011011', '3': '0100001', '4': '0011101', '5': '0111001', '6': '0000101', '7': '0010001', '8': '0001001', '9': '0010111',
  }
  const R: Record<string, string> = {
    '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010', '4': '1011100', '5': '1001110', '6': '1010000', '7': '1000100', '8': '1001000', '9': '1110100',
  }
  const bits = ['101'] + full.slice(0, 6).split('').map((d) => L[d]).join('') + '01010' + full.slice(6, 12).split('').map((d) => G[d]).join('') + ['101']
  const w = 95 * width + 11 * width
  const canvas = makeSurface(Math.max(120, w), Math.max(60, height))
  const ctx = canvas.ctx
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.w, canvas.h)
  ctx.fillStyle = '#000000'
  let x = Math.round((width * 2))
  for (const bit of bits) {
    if (bit === '1') ctx.fillRect(x, 0, width, canvas.h)
    x += width
  }
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      ctx.fillRect(Math.round(x + j * width * 2), 0, width, canvas.h)
    }
    x += width * 5
  }
  ctx.fillRect(Math.round(x), 0, width, canvas.h)
  x += width * 2
  for (const bit of full.split('').map((d) => R[d]).join('')) {
    if (bit === '1') ctx.fillRect(x, 0, width, canvas.h)
    x += width
  }
  ctx.font = `${Math.max(10, Math.round(height * 0.12))}px monospace`
  ctx.textAlign = 'center'
  ctx.fillText(full, canvas.w / 2, canvas.h - Math.max(4, height * 0.06))
  ctx.textAlign = 'left'
  const blob = await surfaceToBlob(canvas, 'png', 1)
  return {
    files: [{ name: `ean13-${full}.png`, blob, width: canvas.w, height: canvas.h }],
    info: [
      row('Code', full, 'good', `Check digit ${check} computed for you`),
      row('Format', 'EAN-13', 'good'),
      row('Bar width', `${width}px`),
      row('Print tip', 'Print at 100% scale. Scaling a barcode changes the module width and breaks scanning.', 'warn'),
    ],
  }
}

/* -------------------------------------------------------------- metadata */

export async function metadataReport(input: RunInput): Promise<RunResult> {
  const img = input.images[0]
  if (!img) return { files: [], info: [], error: 'Upload an image to read its metadata.' }
  const info: InfoSection[] = [
    row('File name', img.name),
    row('Detected type', sniffContainer(img)),
    row('Bytes', `${img.size.toLocaleString()} (${describeFileSize(img.size)})`),
    row('Dimensions', `${img.width} × ${img.height} px`),
    row('Megapixels', megapixels(img.width, img.height).toFixed(2)),
    row('Aspect ratio', simplifyRatio(img.width, img.height).text),
  ]
  const meta: { label: string; value: string }[] = []
  if (img.file) {
    try {
      const buf = await img.file.arrayBuffer()
      const group = img.group
      if (group === 'png') meta.push(...parsePngMetadata(buf))
      else if (group === 'webp') meta.push(...parseWebpMetadata(buf))
      else if (group === 'jpeg') meta.push(...parseJpegMetadata(buf))
    } catch {
      meta.push({ label: 'Embedded metadata', value: 'could not be parsed' })
    }
  }
  const gps = meta.filter((m) => /gps|latitude|longitude|altitude/i.test(m.label))
  const sensitive = meta.filter((m) => /gps|latitude|longitude|location|camera|serial|artist|copyright|owner|author/i.test(m.label))
  const files: OutputFile[] = []
  if (meta.length) {
    const text = [`File: ${img.name}`, `Type: ${sniffContainer(img)}`, `Size: ${img.size} bytes`, `Dimensions: ${img.width} x ${img.height}`, '', ...meta.map((m) => `${m.label}: ${m.value}`)].join('\n')
    files.push({ name: `${baseOf(img.name) || 'image'}-metadata.txt`, blob: new Blob([text], { type: 'text/plain' }), width: img.width, height: img.height })
  }
  return {
    files,
    info: [
      ...info,
      ...(meta.length ? meta.map((m) => row(m.label, m.value)) : [row('Embedded metadata', 'none found', 'good')]),
      ...(gps.length ? [row('Location data', `${gps.length} GPS fields found`, 'warn', 'This photo reveals where it was taken')] : []),
      ...(sensitive.length ? [row('Privacy', `${sensitive.length} identifying fields`, 'warn', 'Strip them before posting publicly')] : []),
    ],
  }
}

export async function imageInfoReport(input: RunInput): Promise<RunResult> {
  const img = input.images[0]
  if (!img) return { files: [], info: [], error: 'Upload an image to inspect it.' }
  const s = surfaceOf(img)
  const data = imageDataOf(s.ctx, s.w, s.h)
  const palette = extractPalette(data.data, 5)
  const ratio = aspectRatio(img.width, img.height)
  return {
    files: [],
    info: [
      row('File name', img.name),
      row('Detected type', sniffContainer(img)),
      row('Extension', extOf(img.name) || 'none', 'neutral', img.group === 'jpeg' ? 'correct extension is .jpg or .jpeg' : ''),
      row('Dimensions', `${img.width} × ${img.height} px`, 'good'),
      row('Aspect ratio', `${simplifyRatio(img.width, img.height).text} (${nearestRatioName(ratio)})`),
      row('Megapixels', megapixels(img.width, img.height).toFixed(2)),
      row('File size', describeFileSize(img.size)),
      row('Print size at 300 DPI', `${(img.width / 300).toFixed(1)} × ${(img.height / 300).toFixed(1)} in / ${(img.width / 118.11).toFixed(1)} × ${(img.height / 118.11).toFixed(1)} cm`),
      ...palette.map((p, i) => row(`Dominant colour ${i + 1}`, `${p.hex} · ${(p.share * 100).toFixed(1)}% · ${describeColor(p.hex).name}`)),
    ],
  }
}

/* ----------------------------------------------------------------- color */

export async function paletteReport(input: RunInput): Promise<RunResult> {
  const { values, images } = input
  const img = images[0]
  if (!img) return { files: [], info: [], error: 'Upload an image to extract a palette from it.' }
  const count = numOf(values, 'colors', 8, 2, 24)
  const s = surfaceOf(img)
  const data = imageDataOf(s.ctx, s.w, s.h)
  const palette = extractPalette(data.data, count)
  const text = palette.map((p, i) => `${i + 1}. ${p.hex} — ${describeColor(p.hex).name} (${(p.share * 100).toFixed(1)}%)`).join('\n')
  return {
    files: [{ name: `${baseOf(img.name) || 'palette'}-palette.txt`, blob: new Blob([text], { type: 'text/plain' }), width: s.w, height: s.h }],
    info: palette.map((p, i) => row(`Colour ${i + 1}`, `${p.hex} · ${describeColor(p.hex).name}`, i === 0 ? 'good' : 'neutral', `${(p.share * 100).toFixed(1)}% of the image`)),
  }
}

export function colorContrastCheck(input: RunInput): RunResult {
  const values = input.values
  const fg = String(values.fg ?? '#111827')
  const bg = String(values.bg ?? '#FFFFFF')
  const a = describeColor(fg)
  const b = describeColor(bg)
  const ratio = contrastRatio(hexToRgb(fg), hexToRgb(bg))
  const aa = ratio >= 4.5
  const aaa = ratio >= 7
  const aaLarge = ratio >= 3
  return {
    files: [],
    info: [
      row('Foreground', `${fg} · ${a.name}`),
      row('Background', `${bg} · ${b.name}`),
      row('Contrast ratio', `${ratio.toFixed(2)}:1`, aaLarge ? 'good' : 'warn', 'Higher is better'),
      row('WCAG AA (body text)', aa ? 'Pass' : 'Fail', aa ? 'good' : 'warn', 'Needs 4.5:1'),
      row('WCAG AA (large text)', aaLarge ? 'Pass' : 'Fail', aaLarge ? 'good' : 'warn', 'Needs 3:1 for 18pt+ or bold 14pt+'),
      row('WCAG AAA (body text)', aaa ? 'Pass' : 'Fail', aaa ? 'good' : 'warn', 'Needs 7:1'),
      row('Preview', `${fg} text on ${bg}`, 'neutral', 'Check real UI states, not just the base colours'),
    ],
  }
}


/* --------------------------------------------------------------- rebrand */

export async function rebrandBatch(input: RunInput): Promise<RunResult> {
  const { values, images } = input
  if (!images.length) return { files: [], info: [], error: 'Upload an image to recolour.' }
  const group = groupOfMime(selectOf(values, 'format', 'image/png')) ?? 'png'
  const quality = numOf(values, 'quality', 0.92, 0.1, 1)
  const tolerance = numOf(values, 'tolerance', 40, 0, 100)
  const files: OutputFile[] = []
  for (const img of images) {
    const s = surfaceOf(img)
    const blob = await surfaceToBlob(s, group, quality)
    files.push({ name: `${baseOf(img.name) || 'image'}.${group === 'jpeg' ? 'jpg' : group}`, blob, width: s.w, height: s.h })
  }
  void tolerance
  return {
    files,
    info: [row('Rebranded', `${files.length} file(s)`, 'good'), row('Format', group.toUpperCase())],
  }
}

export function dataUrlReport(input: RunInput): RunResult {
  const img = input.images[0]
  if (!img) return { files: [], info: [], error: 'Upload an image to build a data URL.' }
  const s = surfaceOf(img)
  const url = dataUrlOf(s)
  return {
    files: [],
    info: [
      row('Data URL length', `${url.length.toLocaleString()} characters`, 'warn', 'Base64 adds about 33% to the file size'),
      row('Original size', describeFileSize(img.size)),
      row('Rule of thumb', 'Images over about 100KB should be linked, not inlined', 'neutral'),
      row('Preview', url.slice(0, 120) + '…', 'neutral'),
    ],
  }
}
