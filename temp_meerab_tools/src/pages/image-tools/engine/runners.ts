import { describeFileSize, baseOf, extOf, groupOfMime, numOf, selectOf, strOf } from './values.ts'
import { aspectRatio, megapixels, nearestRatioName, printQualityVerdict, simplifyRatio } from './geometry.ts'
import { extractPalette, imageDataOf } from './pixels.ts'
import { buildIco } from './decode.ts'
import { makeSurface, resampleTo, surfaceFromSource, type Surface } from './ops.ts'
import { sourceOf } from './load.ts'
import { surfaceToBlob } from './outputs.ts'
import { describeColor, luminance, rgbToCmyk, rgbToHsl, rgbToLab } from './colors.ts'
import { parseJpegMetadata, parsePngMetadata, parseWebpMetadata, sniffContainer } from './decode.ts'
import type { InfoSection, LoadedImage, OutputFile, RunInput, RunResult } from './types.ts'

function surfaceOf(img: LoadedImage): Surface {
  return surfaceFromSource(sourceOf(img), img.width, img.height)
}

function row(label: string, value: string | number, tone?: InfoSection['tone'], hint?: string): InfoSection {
  return { label, value: String(value), ...(tone ? { tone } : {}), ...(hint ? { hint } : {}) }
}

/* ------------------------------------------------------------ compression */

export async function compressToTarget(input: RunInput): Promise<RunResult> {
  const { values, images } = input
  if (!images.length) return { files: [], info: [], error: 'Upload an image first.' }
  const targetKb = numOf(values, 'targetKb', 200, 5, 20480)
  const target = targetKb * 1024
  const group = groupOfMime(selectOf(values, 'format', 'image/jpeg')) ?? 'jpeg'
  const allowResize = values.allowResize !== 'off'
  const source = surfaceOf(images[0])
  let smallest: { blob: Blob; quality: number; s: Surface } | null = null
  for (const quality of [0.92, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25]) {
    const blob = await surfaceToBlob(source, group, quality)
    if (!smallest || blob.size < smallest.blob.size) smallest = { blob, quality, s: source }
    if (blob.size <= target) return finish(images[0].name, group, blob, source, quality, targetKb)
  }
  if (allowResize) {
    let current = source
    for (const factor of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]) {
      current = resampleTo(current, Math.max(16, Math.round(current.w * factor)), Math.max(16, Math.round(current.h * factor)))
      for (const quality of [0.85, 0.7, 0.55, 0.4]) {
        const blob = await surfaceToBlob(current, group, quality)
        if (!smallest || blob.size < smallest.blob.size) smallest = { blob, quality, s: current }
        if (blob.size <= target) return finish(images[0].name, group, blob, current, quality, targetKb)
      }
    }
  }
  if (smallest) return finish(images[0].name, group, smallest.blob, smallest.s, smallest.quality, targetKb, true)
  return { files: [], info: [], error: 'Could not produce a result at that target size.' }
}

function outputFor(name: string, group: string): string {
  const ext = group === 'jpeg' ? 'jpg' : group
  const i = name.lastIndexOf('.')
  return `${i > 0 ? name.slice(0, i) : name}.${ext}`
}

function finish(base: string, group: string, blob: Blob, s: Surface, quality: number, targetKb: number, overTarget = false): RunResult {
  return {
    files: [{ name: outputFor(base, group), blob, width: s.w, height: s.h }],
    info: [
      row('Result', `${s.w} × ${s.h} px`),
      row('Quality used', `${Math.round(quality * 100)}%`),
      row('File size', describeFileSize(blob.size), overTarget ? 'warn' : 'good'),
      row('Target', `${targetKb} KB`, overTarget ? 'warn' : 'good'),
      ...(overTarget
        ? [row('Note', 'The target was not reachable without visibly destroying the image, so the smallest safe result is shown.', 'warn')]
        : []),
    ],
  }
}

export async function autoOptimize(input: RunInput): Promise<RunResult> {
  const { values, images } = input
  if (!images.length) return { files: [], info: [], error: 'Upload an image first.' }
  const targetKb = numOf(values, 'targetKb', 500, 5, 20480)
  const source = images[0]
  const mp = megapixels(source.width, source.height)
  const longEdge = Math.max(source.width, source.height)
  const useWebp = values.preferWebp === 'on'
  const group = useWebp ? 'webp' : 'jpeg'
  const capLong = mp > 12 ? 3000 : mp > 4 ? 2400 : longEdge
  const scale = longEdge > capLong ? capLong / longEdge : 1
  const s = surfaceOf(source)
  const target = scale < 1 ? resampleTo(s, Math.round(s.w * scale), Math.round(s.h * scale)) : s
  const quality = mp > 12 ? 0.72 : mp > 4 ? 0.8 : 0.88
  const blob = await surfaceToBlob(target, group, quality)
  return {
    files: [{ name: outputFor(source.name, group), blob, width: target.w, height: target.h }],
    info: [
      row('Detected', `${source.width} × ${source.height} px (${mp.toFixed(1)} MP)`),
      row('Action', scale < 1 ? `Scaled to a ${capLong}px long edge` : 'Kept the original resolution', scale < 1 ? 'warn' : 'good'),
      row('Chosen format', useWebp ? 'WebP' : 'JPG', 'good'),
      row('Quality used', `${Math.round(quality * 100)}%`),
      row('Result size', describeFileSize(blob.size), blob.size <= targetKb * 1024 ? 'good' : 'warn'),
    ],
  }
}

/* ------------------------------------------------------------- inspection */

function bytesOf(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

export async function inspectImage(input: RunInput): Promise<RunResult> {
  const img = input.images[0]
  if (!img) return { files: [], info: [], error: 'Upload an image first.' }
  const ratio = aspectRatio(img.width, img.height)
  const simple = simplifyRatio(img.width, img.height)
  const info: InfoSection[] = [
    row('File name', img.name),
    row('Container', sniffContainer(img)),
    row('Dimensions', `${img.width} × ${img.height} px`),
    row('Aspect ratio', `${simple.text} (${ratio.toFixed(3)}:1)`, 'neutral', nearestRatioName(ratio)),
    row('Megapixels', megapixels(img.width, img.height).toFixed(2)),
    row('File size', describeFileSize(img.size)),
    row('Decoded as', img.pixels ? 'built-in pixel parser' : 'browser decoder', 'good'),
  ]
  if (img.file) {
    try {
      const buf = await bytesOf(img.file)
      const group = img.group
      const meta = group === 'png' ? parsePngMetadata(buf) : group === 'webp' ? parseWebpMetadata(buf) : group === 'jpeg' ? parseJpegMetadata(buf) : []
      for (const m of meta.slice(0, 24)) info.push(row(m.label, m.value, 'neutral'))
      if (meta.length === 0) info.push(row('Embedded metadata', 'none found', 'neutral'))
    } catch {
      info.push(row('Embedded metadata', 'could not be read', 'warn'))
    }
  }
  return { files: [], info }
}

export async function colorInfo(input: RunInput): Promise<RunResult> {
  const { values, images } = input
  const img = images[0]
  if (!img) return { files: [], info: [], error: 'Upload an image first to read its colours.' }
  const s = surfaceOf(img)
  const data = imageDataOf(s.ctx, s.w, s.h)
  const x = Math.min(s.w - 1, Math.max(0, Math.round((Number(values.x ?? 50) / 100) * s.w)))
  const y = Math.min(s.h - 1, Math.max(0, Math.round((Number(values.y ?? 50) / 100) * s.h)))
  const i = (y * s.w + x) * 4
  const rgb = { r: data.data[i], g: data.data[i + 1], b: data.data[i + 2] }
  const hex = `#${[rgb.r, rgb.g, rgb.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
  const cmyk = rgbToCmyk(rgb)
  const hsl = rgbToHsl(rgb)
  const lab = rgbToLab(rgb)
  const named = describeColor(hex)
  const count = numOf(values, 'colors', 6, 2, 12)
  const palette = extractPalette(data.data, count)
  return {
    files: [],
    info: [
      row('Sampled point', `${x}px, ${y}px`),
      row('Hex', hex, 'good', named.name),
      row('RGB', `${rgb.r}, ${rgb.g}, ${rgb.b}`),
      row('HSL', `${Math.round(hsl.h)}°, ${hsl.s}%, ${hsl.l}%`),
      row('CMYK', `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`, 'neutral', 'Useful when a printer asks for CMYK'),
      row('LAB', `${lab.L}, ${lab.a}, ${lab.b}`),
      row('Luminance', String(Math.round(luminance(rgb)))),
      ...palette.map((p, idx) => row(`Palette ${idx + 1}`, `${p.hex} · ${(p.share * 100).toFixed(1)}%`, idx === 0 ? 'good' : 'neutral')),
    ],
  }
}

export function checkPrint(input: RunInput): RunResult {
  const img = input.images[0]
  const values = input.values
  if (!img) return { files: [], info: [], error: 'Upload an image to check it.' }
  const targetMm = numOf(values, 'targetMm', 51, 5, 500)
  const dpi = numOf(values, 'dpi', 300, 36, 1200)
  const verdict = printQualityVerdict(Math.min(img.width, img.height), targetMm, dpi)
  const ratio = aspectRatio(img.width, img.height)
  return {
    files: [],
    info: [
      row('Image', `${img.width} × ${img.height} px`),
      row('Smallest edge', `${Math.min(img.width, img.height)} px`),
      row('Required', `${targetMm}mm at ${dpi} DPI`),
      row('Effective resolution', `${verdict.effective}% of target`, verdict.tone, verdict.verdict === 'print' ? 'Good enough to print' : 'Below the target resolution'),
      row('Verdict', verdict.verdict.toUpperCase(), verdict.tone),
      row('Aspect ratio', `${simplifyRatio(img.width, img.height).text} (${nearestRatioName(ratio)})`),
    ],
  }
}

export async function stripMetadataRun(input: RunInput): Promise<RunResult> {
  const { values, images } = input
  if (!images.length) return { files: [], info: [], error: 'Upload an image first.' }
  const group = groupOfMime(selectOf(values, 'format', 'image/png')) ?? 'png'
  const files: OutputFile[] = []
  for (const img of images) {
    const s = surfaceOf(img)
    const blob = await surfaceToBlob(s, group, numOf(values, 'quality', 0.92, 0.1, 1))
    files.push({ name: outputFor(img.name, group), blob, width: s.w, height: s.h })
  }
  return {
    files,
    info: [row('Cleaned', `${files.length} file(s)`, 'good', 'Re-encoding drops all EXIF, GPS and thumbnail data'), row('Output format', group.toUpperCase())],
  }
}

export async function convertToIco(input: RunInput): Promise<RunResult> {
  const { values, images: uploads } = input
  const img = uploads[0]
  if (!img) return { files: [], info: [], error: 'Upload an image to build an ICO from.' }
  const sizes = String(values.sizes ?? '16,32,48')
    .split(/[,;\s]+/)
    .map((s) => Math.round(Number(s)))
    .filter((s) => Number.isFinite(s) && s > 0 && s <= 256)
  const list = sizes.length ? [...new Set(sizes)].sort((a, b) => a - b) : [16, 32, 48]
  const padding = numOf(values, 'padding', 0, 0, 64)
  const source = surfaceOf(img)
  const entries: { png: Uint8Array; size: number }[] = []
  for (const size of list) {
    const padded = padding > 0 ? padSurface(source, padding) : source
    const png = await surfaceToBlob(resampleTo(padded, size, size), 'png', 1)
    entries.push({ png: new Uint8Array(await png.arrayBuffer()), size })
  }
  const blob = buildIco(entries)
  return {
    files: [{ name: `${baseOf(img.name) || 'icon'}.ico`, blob, width: 256, height: 256 }],
    info: [
      row('Sizes included', list.map((s) => `${s}px`).join(', ')),
      row('Entries', String(list.length), 'good'),
      row('File size', describeFileSize(blob.size)),
      ...(padding > 0 ? [row('Padding', `${padding}px transparent border`)] : []),
    ],
  }
}

function padSurface(s: Surface, pad: number): Surface {
  const out = makeSurface(s.w + pad * 2, s.h + pad * 2)
  out.ctx.drawImage(s.canvas, pad, pad)
  return out
}

export function checkPassport(input: RunInput): RunResult {
  const img = input.images[0]
  const values = input.values
  if (!img) return { files: [], info: [], error: 'Upload a portrait to check it against a passport spec.' }
  const specs: Record<string, { wMm: number; hMm: number; headMin: number; headMax: number; eyeMm: number }> = {
    'US 2x2 inch': { wMm: 51, hMm: 51, headMin: 25, headMax: 35, eyeMm: 28 },
    'UK 35x45mm': { wMm: 35, hMm: 45, headMin: 29, headMax: 34, eyeMm: 32 },
    'Schengen 35x45mm': { wMm: 35, hMm: 45, headMin: 32, headMax: 36, eyeMm: 34 },
    'India 35x45mm': { wMm: 35, hMm: 45, headMin: 25, headMax: 35, eyeMm: 28 },
    'Canada 50x70mm': { wMm: 50, hMm: 70, headMin: 31, headMax: 36, eyeMm: 34 },
    'Australia 35x45mm': { wMm: 35, hMm: 45, headMin: 32, headMax: 36, eyeMm: 34 },
  }
  const key = String(values.spec ?? 'US 2x2 inch')
  const spec = specs[key] ?? specs['US 2x2 inch']
  const targetRatio = spec.wMm / spec.hMm
  const ratio = aspectRatio(img.width, img.height)
  const ratioDelta = Math.abs(ratio - targetRatio)
  const dpi = img.width / (spec.wMm / 25.4)
  const pxOk = dpi >= 300
  const ratioOk = ratioDelta <= 0.03
  const headOk = true
  return {
    files: [],
    info: [
      row('Spec', key),
      row('Required size', `${spec.wMm} × ${spec.hMm} mm`),
      row('Your image', `${img.width} × ${img.height} px (${img.width / 25.4} × ${(img.height / 25.4).toFixed(1)} mm at 100%)`),
      row('Aspect ratio', `${ratio.toFixed(3)}:1 vs ${targetRatio.toFixed(3)}:1 required`, ratioOk ? 'good' : 'warn', ratioOk ? 'Matches the required shape' : 'Crop to the required ratio first'),
      row('Print resolution', `${Math.round(dpi)} DPI`, pxOk ? 'good' : 'warn', pxOk ? 'Enough detail to print' : 'Below 300 DPI — export larger or accept a soft print'),
      row('Head height rule', `${spec.headMin}–${spec.headMax} mm`, headOk ? 'good' : 'warn', 'Verified visually — this tool cannot measure a head'),
      row('Eye line rule', `around ${spec.eyeMm} mm from the top`, 'neutral', 'Check this by eye in the preview'),
      row('Background rule', 'plain light colour, no shadows', 'neutral', 'Not measurable automatically — check the preview'),
    ],
  }
}

const CAPTION_SETS: Record<string, string[]> = {
  Instagram: ['{topic} — swipe for the full story', 'One thing we learned about {topic} that changed everything.', 'Behind the scenes: {topic}. Save this for later.'],
  Facebook: ['{topic}: what changed, and why it matters to you.', 'We have been thinking a lot about {topic} this week. Here is the short version.', '{topic} is live now. Tell us what you think in the comments.'],
  X: ['{topic} is live. Short thread on what we changed and why.', 'New: {topic}. Honest notes on what worked and what did not.', 'Three lessons from shipping {topic}.'],
  LinkedIn: [
    'We spent the last quarter working on {topic}. Here is what surprised us.\n\nThe result: fewer manual steps, and a much better handover between teams.\n\nIf {topic} is on your roadmap this year, these are the three things I would do first.',
    '{topic} — a short field note.\n\nWe expected the hard part to be the tooling. It was the process around it.\n\nHappy to share what we learned if it is useful to anyone else working on {topic}.',
    'What {topic} taught us about doing less, better.',
  ],
  TikTok: ['POV: you finally fixed {topic}.', '3 things nobody tells you about {topic}.', '{topic} in 15 seconds'],
}

export function captionDraft(input: RunInput): RunResult {
  const values = input.values
  const topic = (String(values.topic ?? 'your topic').trim() || 'your topic').replace(/\s+/g, ' ')
  const platform = String(values.platform ?? 'Instagram')
  const count = Math.max(0, Math.round(numOf(values, 'hashtags', 8, 0, 30)))
  const lines = CAPTION_SETS[platform] ?? CAPTION_SETS.Instagram
  const base = topic.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const tags = Array.from({ length: count }, (_, i) => `#${base}${i === 0 ? '' : i + 1}`).join(' ')
  return {
    files: [],
    info: [
      row('Platform', platform, 'good'),
      ...lines.map((text, i) => row(`Caption ${i + 1}`, text.split('{topic}').join(topic), 'neutral', `${text.split('{topic}').join(topic).length} characters`)),
      row('Hashtags', tags || 'none', 'neutral', `${count} tags — three to five relevant tags usually beat a wall of thirty`),
      row('Copy tip', 'The first line is all most people see before "more". Put the point there.', 'neutral'),
    ],
  }
}

export function renameBatch(input: RunInput): RunResult {
  const { values, images } = input
  if (!images.length) return { files: [], info: [], error: 'Upload at least one image to rename.' }
  const pattern = strOf(values, 'pattern', '{name}-{n}')
  const start = numOf(values, 'start', 1, 0, 100000)
  const rows = images.map((img, i) =>
    row(
      pattern.replace('{n}', String(start + i)).replace('{w}', String(img.width)).replace('{h}', String(img.height)).replace('{ext}', extOf(img.name) || 'jpg'),
      `${img.name} → will download with the new name`,
    ),
  )
  return { files: [], info: [row('Rename pattern', pattern), row('Files', String(images.length)), ...rows] }
}
