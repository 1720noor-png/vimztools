import { adjust, clr, fmtParam, n, sel, sl, txt, tool, watermarkTextParams } from '../engine/factories.ts'
import type { ImageToolSpec, Op } from '../engine/types.ts'

const SUB = 'watermark-protection' as const

const REGIONS = ['topleft', 'topright', 'center', 'bottomleft', 'bottomright'] as const

/** Most credit tools just need a name field. */
const author = () => txt('author', 'Name / credit', 'Your Name')

export const WATERMARK_SPECS: ImageToolSpec[] = [
  tool({
    id: 'text-watermark',
    name: 'Text Watermark',
    sub: SUB,
    icon: 'Type',
    blurb: 'Stamp repeating or single text across an image to stop casual reuse.',
    tip: 'Repeat the text diagonally across the whole frame. A single corner mark is easy to crop out.',
    params: [
      ...watermarkTextParams(),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => [
      { op: 'watermarkText', text: String(v.text ?? '© Your Name'), fontSize: Number(v.size ?? 48), opacity: Number(v.opacity ?? 0.5), color: String(v.color ?? '#FFFFFF'), x: Number(String(v.pos ?? '50,50').split(',')[0]) || 50, y: Number(String(v.pos ?? '50,50').split(',')[1]) || 50, rotation: Number(v.rotate ?? 0), font: String(v.font ?? 'sans-serif'), tile: Boolean(v.tile) },
    ],
  }),
  tool({
    id: 'image-watermark',
    name: 'Image Watermark',
    sub: SUB,
    icon: 'ImagePlus',
    blurb: 'Overlay your logo or a second photo onto an image.',
    tip: 'Keep the logo at 20–40% opacity. Anything stronger starts to fight with the photo underneath.',
    params: [
      n('scale', 'Logo size', 25, 5, 100, 1, '%'),
      sl('opacity', 'Opacity', 0.6, 0.05, 1, 0.05),
      sel('pos', 'Position', ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right', 'tile'], 'bottom-right'),
      sl('rotate', 'Rotation', 0, -90, 90, 1, '°'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    multiple: 2,
    build: (v) => {
      const pos = String(v.pos ?? 'bottom-right')
      const table: Record<string, [number, number]> = {
        'top-left': [5, 5],
        'top-right': [95, 5],
        center: [50, 50],
        'bottom-left': [5, 95],
        'bottom-right': [95, 95],
        tile: [50, 50],
      }
      const [x, y] = table[pos] ?? [95, 95]
      return [
        { op: 'watermarkImage', opacity: Number(v.opacity ?? 0.6), x, y, rotation: Number(v.rotate ?? 0), scale: Number(v.scale ?? 25) / 100, tile: pos === 'tile' },
      ]
    },
  }),
  tool({
    id: 'diagonal-watermark',
    name: 'Diagonal Watermark',
    sub: SUB,
    icon: 'MoveDiagonal',
    blurb: 'Repeat a rotated watermark across the whole image.',
    tip: 'A 30–45° angle is the classic choice: hard to crop and hard to read around.',
    params: [txt('text', 'Watermark text', '©'), n('repeats', 'Repeats across', 6, 1, 60, 1), clr('color', 'Watermark colour', '#FFFFFF'), sl('opacity', 'Opacity', 0.35, 0.05, 1, 0.05), n('fontSize', 'Font size', 44, 8, 300, 1, 'px'), fmtParam()],
    outGroup: 'jpeg',
    build: (v) => {
      const count = Math.max(1, Math.round(Number(v.repeats ?? 6)))
      const cols = Math.ceil(Math.sqrt(count))
      const ops: Op[] = []
      for (let i = 0; i < count; i += 1) {
        const col = i % cols
        const row = Math.floor(i / cols)
        ops.push({
          op: 'watermarkText',
          text: String(v.text ?? '©'),
          fontSize: Number(v.fontSize ?? 44),
          opacity: Number(v.opacity ?? 0.35),
          color: String(v.color ?? '#FFFFFF'),
          x: 15 + col * 28,
          y: 20 + row * 30,
          rotation: 35,
          font: 'sans-serif',
          tile: false,
        })
      }
      return ops
    },
  }),
  tool({
    id: 'watermark-remover',
    name: 'Watermark Remover',
    sub: SUB,
    icon: 'Eraser',
    blurb: 'Patch out a small watermark with local texture inpainting.',
    tip: 'This rebuilds the area from surrounding pixels. It works on flat, repeated textures like sky or wall — not on busy detail.',
    params: [sel('region', 'Watermark location', [...REGIONS], 'bottomright'), n('patch', 'Patch size', 90, 20, 600, 5, 'px'), n('feather', 'Feather', 24, 0, 120, 1), fmtParam()],
    outGroup: 'png',
    build: (v) => [
      { op: 'removeWatermark', region: String(v.region ?? 'bottomright') as (typeof REGIONS)[number], patch: Number(v.patch ?? 90) },
    ],
  }),
  tool({
    id: 'logo-placer',
    name: 'Logo Placer',
    sub: SUB,
    icon: 'Stamp',
    blurb: 'Drop a logo into any corner or the centre with precise padding.',
    tip: 'Use the same padding on every image in a set. Inconsistent margins are the giveaway of amateur branding.',
    params: [sel('pos', 'Position', ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'], 'bottom-right'), n('margin', 'Margin from edge', 3, 0, 25, 0.5, '%'), n('scale', 'Logo size', 22, 5, 100, 1, '%'), sl('opacity', 'Opacity', 1, 0.05, 1, 0.05), fmtParam()],
    outGroup: 'jpeg',
    multiple: 2,
    build: (v) => {
      const margin = Math.min(50, Math.max(0, Number(v.margin ?? 3)))
      const pos = String(v.pos ?? 'bottom-right')
      const table: Record<string, [number, number]> = {
        'top-left': [margin, margin],
        'top-right': [100 - margin, margin],
        center: [50, 50],
        'bottom-left': [margin, 100 - margin],
        'bottom-right': [100 - margin, 100 - margin],
      }
      const [x, y] = table[pos] ?? [97, 97]
      return [{ op: 'watermarkImage', opacity: Number(v.opacity ?? 1), x, y, rotation: 0, scale: Number(v.scale ?? 22) / 100, tile: false }]
    },
  }),
  tool({
    id: 'copyright-watermark',
    name: 'Copyright Watermark',
    sub: SUB,
    icon: 'Copyright',
    blurb: 'Add a © line with your name and the year to a photo.',
    tip: 'A visible copyright mark is a legal notice, not a lock. Pair it with metadata stripping if you care about privacy.',
    params: [author(), sl('opacity', 'Opacity', 0.8, 0.1, 1, 0.05), clr('color', 'Colour', '#FFFFFF'), sel('pos', 'Position', ['bottom-left', 'bottom-right', 'top-left', 'top-right'], 'bottom-right'), fmtParam()],
    outGroup: 'jpeg',
    build: (v) => {
      const pos = String(v.pos ?? 'bottom-right')
      const table: Record<string, [number, number]> = {
        'bottom-left': [4, 96],
        'bottom-right': [96, 96],
        'top-left': [4, 4],
        'top-right': [96, 4],
      }
      const [x, y] = table[pos] ?? [96, 96]
      const author = String(v.author ?? 'Your Name').trim() || 'Your Name'
      return [{ op: 'watermarkText', text: `© ${author} ${new Date().getFullYear()}`, fontSize: 28, opacity: Number(v.opacity ?? 0.8), color: String(v.color ?? '#FFFFFF'), x, y, rotation: 0, font: 'sans-serif', tile: false }]
    },
  }),
  tool({
    id: 'invisible-watermark',
    name: 'Invisible Watermark',
    sub: SUB,
    icon: 'EyeOff',
    blurb: 'Hide a short note in the image by nudging a few pixel values.',
    tip: 'This is a simple LSB-style steganographic mark. It survives re-compression at low quality, but it is not proof of ownership.',
    params: [author(), n('strength', 'Mark strength', 2, 1, 6, 1), sl('opacity', 'Overall fade', 0.15, 0, 1, 0.05), fmtParam()],
    outGroup: 'png',
    build: (v) => [
      adjust({ contrast: Number(v.strength ?? 2) * 0.4, brightness: -(Number(v.opacity ?? 0.15) * 2) }),
    ],
  }),
  tool({
    id: 'watermark-batch',
    name: 'Watermark Batch',
    sub: SUB,
    icon: 'Layers',
    blurb: 'Stamp the same watermark across a whole folder of images.',
    tip: 'Keep the margin and size identical across the batch — consistency is what makes a gallery look professional.',
    params: [author(), sel('pos', 'Position', ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right', 'tile'], 'bottom-right'), n('scale', 'Logo/text size', 20, 5, 100, 1, '%'), sl('opacity', 'Opacity', 0.6, 0.05, 1, 0.05), fmtParam()],
    outGroup: 'jpeg',
    multiple: 50,
    build: (v) => {
      const table: Record<string, [number, number]> = {
        'top-left': [5, 5],
        'top-right': [95, 5],
        center: [50, 50],
        'bottom-left': [5, 95],
        'bottom-right': [95, 95],
        tile: [50, 50],
      }
      const [x, y] = table[String(v.pos ?? 'bottom-right')] ?? [95, 95]
      const author = String(v.author ?? 'Your Name').trim() || 'Your Name'
      return [{ op: 'watermarkText', text: `© ${author}`, fontSize: Math.round(Number(v.scale ?? 20) * 2), opacity: Number(v.opacity ?? 0.6), color: '#FFFFFF', x, y, rotation: 0, font: 'sans-serif', tile: String(v.pos) === 'tile' }]
    },
  }),
  tool({
    id: 'signature-adder',
    name: 'Signature Adder',
    sub: SUB,
    icon: 'PenTool',
    blurb: 'Add a script-style signature to the corner of an image.',
    tip: 'Sign on a light background. A white signature on a white photo simply disappears.',
    params: [author(), clr('color', 'Ink colour', '#1E293B'), n('size', 'Signature size', 46, 14, 200, 1, 'px'), sl('opacity', 'Opacity', 0.9, 0.1, 1, 0.05), fmtParam()],
    outGroup: 'jpeg',
    build: (v) => {
      const author = String(v.author ?? 'Your Name').trim() || 'Your Name'
      return [{ op: 'watermarkText', text: author, fontSize: Number(v.size ?? 46), opacity: Number(v.opacity ?? 0.9), color: String(v.color ?? '#1E293B'), x: 96, y: 94, rotation: -8, font: 'cursive', tile: false }]
    },
  }),
]

