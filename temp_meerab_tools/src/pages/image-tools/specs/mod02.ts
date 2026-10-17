import { NAMED_RATIOS, SOCIAL_PRESETS } from '../engine/geometry.ts'
import { clr, fmtParam, n, pr, sel, sl, tg, tool } from '../engine/factories.ts'
import type { ImageToolSpec, Op, ParamValues } from '../engine/types.ts'

const SUB = 'crop-resize' as const

function pair(v: ParamValues, key: string, fallbackW: number, fallbackH: number): [number, number] {
  const raw = String(v[key] ?? '')
  const parts = raw
    .split(/[,;x×\s]+/)
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (parts.length < 2) return [fallbackW, fallbackH]
  return [Math.round(parts[0]), Math.round(parts[1])]
}

/** Zoom out slightly then crop a window, so the pan sliders really move the frame. */
function pannedSquare(v: ParamValues, size: number): Op[] {
  const zoom = size + Math.round(size * 0.3)
  const shiftX = Math.round(((Number(v.shiftX ?? 0) / 100) * (zoom - size)) / 2)
  const shiftY = Math.round(((Number(v.shiftY ?? 0) / 100) * (zoom - size)) / 2)
  return [
    { op: 'aspect', ratio: 1, mode: 'cover' },
    { op: 'resize', w: zoom, h: zoom, mode: 'cover', unit: 'px' },
    { op: 'crop', x: (zoom - size) / 2 + shiftX, y: (zoom - size) / 2 + shiftY, w: size, h: size, unit: 'px' },
  ]
}

export const CROP_RESIZE_TOOLS: ImageToolSpec[] = [
  tool({
    id: 'image-cropper',
    name: 'Image Cropper',
    sub: SUB,
    icon: 'Crop',
    blurb: 'Crop to a pixel rectangle you can type in, or drag on the preview before you run it.',
    tip: 'Crop before you resize. Cropping first keeps more pixels for the final size instead of throwing them away.',
    params: [
      n('x', 'Left edge (px)', 0, 0, 20000, 1, 'px'),
      n('y', 'Top edge (px)', 0, 0, 20000, 1, 'px'),
      n('w', 'Crop width (px)', 1200, 1, 20000, 1, 'px'),
      n('h', 'Crop height (px)', 900, 1, 20000, 1, 'px'),
      tg('grid', 'Show a rule-of-thirds grid'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => [{ op: 'crop', x: Number(v.x ?? 0), y: Number(v.y ?? 0), w: Number(v.w ?? 1200), h: Number(v.h ?? 900), unit: 'px' }],
  }),
  tool({
    id: 'freeform-image-cropper',
    name: 'Freeform Image Cropper',
    sub: SUB,
    icon: 'PenTool',
    blurb: 'Crop a free rectangle given as percentages, so it scales to any source resolution.',
    tip: 'Percentage crops are resolution-independent — the same numbers work on a phone photo and a 50MP file.',
    params: [
      sl('x', 'Left edge (%)', 0, 0, 90, 0.5),
      sl('y', 'Top edge (%)', 0, 0, 90, 0.5),
      sl('w', 'Width (%)', 100, 1, 100, 0.5),
      sl('h', 'Height (%)', 100, 1, 100, 0.5),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => [{ op: 'crop', x: Number(v.x ?? 0), y: Number(v.y ?? 0), w: Number(v.w ?? 100), h: Number(v.h ?? 100), unit: 'ratio' }],
  }),
  tool({
    id: 'circle-image-cropper',
    name: 'Circle Image Cropper',
    sub: SUB,
    icon: 'Circle',
    blurb: 'Crop to a square and mask it into a perfect circle with a transparent outside.',
    tip: 'Keep the source square before masking, or the circle will be an oval.',
    params: [
      n('size', 'Circle diameter (px)', 512, 16, 8000, 1, 'px'),
      sl('offsetY', 'Vertical offset (%)', 0, -40, 40, 1),
      tg('shadow', 'Add a soft drop shadow'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const size = Math.round(Number(v.size ?? 512))
      const ops: Op[] = pannedSquare(v, size)
      ops.push({ op: 'cropShape', shape: 'circle', radius: 0 })
      if (v.shadow === 'on') ops.push({ op: 'shadow', blur: Math.round(size * 0.03), offsetX: 0, offsetY: Math.round(size * 0.02), color: '#000000', opacity: 0.35 })
      return ops
    },
  }),
  tool({
    id: 'square-image-cropper',
    name: 'Square Image Cropper',
    sub: SUB,
    icon: 'Square',
    blurb: 'Centre-crop anything to a square, with pan controls so the subject stays in frame.',
    tip: 'Centre cropping can cut off faces. Drag the pan sliders until the subject sits where you want it.',
    params: [
      n('size', 'Square side (px)', 1000, 16, 8000, 1, 'px'),
      sl('shiftY', 'Vertical pan (%)', 0, -45, 45, 1),
      sl('shiftX', 'Horizontal pan (%)', 0, -45, 45, 1),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => [...pannedSquare(v, Math.round(Number(v.size ?? 1000))), { op: 'cropShape', shape: 'rect', radius: 0 }],
  }),
  tool({
    id: 'image-rotator',
    name: 'Image Rotator',
    sub: SUB,
    icon: 'RotateCw',
    blurb: 'Rotate by any angle in degrees, optionally expanding the canvas so nothing is clipped.',
    tip: 'Use 90° steps for photos and 0.1–1° steps for straightening a scanned document.',
    params: [
      sl('deg', 'Rotation angle', 90, -180, 180, 0.1, '°'),
      tg('expand', 'Expand canvas to avoid clipping'),
      tg('autoLevel', 'Auto-level after rotating'),
      fmtParam(),
    ],
    outGroup: 'png',
    compare: true,
    build: (v) => {
      const ops: Op[] = [{ op: 'rotate', deg: Number(v.deg ?? 90), expand: v.expand === 'on' }]
      if (v.autoLevel === 'on') ops.push({ op: 'autolevels', amount: 35 })
      return ops
    },
  }),
  tool({
    id: 'image-flipper',
    name: 'Image Flipper',
    sub: SUB,
    icon: 'FlipHorizontal2',
    blurb: 'Mirror an image on one axis or both, for scanned film and mirrored text.',
    tip: 'A mirrored scan is almost always flipped horizontally only — check one word of text first.',
    params: [
      sel('axis', 'Flip direction', ['x', 'y', 'both'], 'x', 'x = left/right, y = top/bottom'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const axis = String(v.axis ?? 'x')
      const ops: Op[] = []
      if (axis === 'x' || axis === 'both') ops.push({ op: 'flip', axis: 'x' })
      if (axis === 'y' || axis === 'both') ops.push({ op: 'flip', axis: 'y' })
      return ops
    },
  }),
  tool({
    id: 'image-dimension-calculator',
    name: 'Image Dimension Calculator',
    sub: SUB,
    icon: 'Calculator',
    blurb: 'Work out the pixel dimensions and simplified aspect ratio of an image, with print size at any DPI.',
    tip: 'Aspect ratios simplify: 1920×1080 is exactly 16:9, which is why it fills a widescreen panel without bars.',
    params: [
      n('dpi', 'Target print DPI', 300, 36, 1200, 1, 'dpi'),
      tg('report', 'Include a print-size report'),
    ],
    kind: 'json',
    needsUpload: true,
    build: () => [],
  }),
  tool({
    id: 'aspect-ratio-calculator',
    name: 'Aspect Ratio Calculator',
    sub: SUB,
    icon: 'Ratio',
    blurb: 'Simplify any width and height into its cleanest ratio and name the closest standard format.',
    tip: 'A 1920×1200 photo is 8:5 — that is the native ratio of most DSLR sensors, which is why it looks "correct".',
    params: [
      n('w', 'Width (px)', 1920, 1, 40000, 1, 'px'),
      n('h', 'Height (px)', 1080, 1, 40000, 1, 'px'),
    ],
    kind: 'json',
    needsUpload: false,
    build: () => [],
  }),
  tool({
    id: 'aspect-ratio-cropper',
    name: 'Aspect Ratio Cropper',
    sub: SUB,
    icon: 'Frame',
    blurb: 'Crop to a named aspect ratio such as 16:9, 4:5 or 9:16, perfectly centred.',
    tip: 'Crop to the target ratio first, then resize. Doing it in this order avoids resampling twice.',
    params: [
      sel('ratio', 'Aspect ratio', NAMED_RATIOS.map((r) => r.label), '16:9 widescreen'),
      sel('mode', 'Fit behaviour', ['cover', 'contain'], 'cover'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const named = NAMED_RATIOS.find((r) => r.label === String(v.ratio ?? '16:9 widescreen')) ?? NAMED_RATIOS[3]
      return [{ op: 'aspect', ratio: named.ratio, mode: String(v.mode ?? 'cover') === 'contain' ? 'contain' : 'cover' }]
    },
  }),
  tool({
    id: 'social-media-image-resizer',
    name: 'Social Media Image Resizer',
    sub: SUB,
    icon: 'Share2',
    blurb: 'Resize to any of the major social platforms’ exact pixel dimensions from one picker.',
    tip: 'Upload at the largest size you have and let the tool downscale — never upscale a small image to fill a banner.',
    params: [
      sel('preset', 'Platform preset', [...Object.keys(SOCIAL_PRESETS), 'custom'], 'instagram-post'),
      pr('custom', 'Custom size (px)', '1200,630', 'Used when the preset is "custom"'),
      sel('mode', 'Fit behaviour', ['cover', 'contain', 'exact'], 'cover'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const key = String(v.preset ?? 'instagram-post')
      const p = SOCIAL_PRESETS[key] ?? { w: pair(v, 'custom', 1200, 630)[0], h: pair(v, 'custom', 1200, 630)[1] }
      return [{ op: 'resize', w: p.w, h: p.h, mode: String(v.mode ?? 'cover') as 'cover' | 'contain' | 'exact', unit: 'px' }]
    },
  }),
  tool({
    id: 'profile-picture-resizer',
    name: 'Profile Picture Resizer',
    sub: SUB,
    icon: 'UserRound',
    blurb: 'Crop to a square and export a crisp circular avatar at any common size.',
    tip: 'Upload 4× the size you need. Platforms downscale avatars, and a large source survives their compression.',
    params: [
      n('size', 'Output size (px)', 400, 64, 2048, 1, 'px'),
      sel('shape', 'Shape', ['circle', 'rounded', 'rect'], 'circle'),
      clr('bg', 'Background colour', '#0EA5E9'),
      tg('outline', 'Add a white ring'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const size = Math.round(Number(v.size ?? 400))
      const ops: Op[] = [
        { op: 'aspect', ratio: 1, mode: 'cover' },
        { op: 'crop', x: 0, y: 0, w: size, h: size, unit: 'px' },
      ]
      if (v.outline === 'on') ops.push({ op: 'border', width: Math.max(2, Math.round(size * 0.02)), color: '#FFFFFF', style: 'solid' })
      ops.push({ op: 'cropShape', shape: String(v.shape ?? 'circle') as 'circle' | 'rounded' | 'rect', radius: Math.round(size * 0.12) })
      return ops
    },
  }),
]
