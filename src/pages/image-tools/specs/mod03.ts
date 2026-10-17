import { autoOptimize, checkPrint, compressToTarget, inspectImage } from '../engine/runners.ts'
import { fmtParam, gapParam, n, qualityParam, sel, sl, tg, tool } from '../engine/factories.ts'
import type { ImageToolSpec, Op } from '../engine/types.ts'

const SUB = 'compression' as const

/** Every compressor shares a resize-then-encode core so the tools behave consistently. */
function encode(
  v: Record<string, string | number | boolean | undefined>,
  extra: Op[] = [],
): Op[] {
  const maxEdge = Number(v.maxEdge ?? 0)
  const ops: Op[] = []
  if (maxEdge > 0) {
    ops.push({ op: 'longEdge', px: maxEdge })
  }
  ops.push(...extra)
  const quality = Number(v.quality ?? 0.85)
  if (quality > 0) {
    ops.push({ op: 'adjust', brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0, sharpen: 0.05, grayscale: 0, sepia: 0, invert: 0, exposure: 0, temperature: 0, tint: 0 })
  }
  return ops
}

const longEdgeParam = sl('maxEdge', 'Longest edge (px)', 1920, 0, 12000, 100, 'px', '0 keeps the original size')

/** Fewer colours = a coarser posterize step, which is what actually shrinks PNG/GIF data. */
function colorReduce(colors: number): Op {
  return { op: 'posterize', levels: Math.max(2, Math.min(64, Math.round(colors / 4))) }
}

export const COMPRESSION_SPECS: ImageToolSpec[] = [
  tool({
    id: 'jpg-compressor',
    name: 'JPG Compressor',
    sub: SUB,
    icon: 'FileImage',
    blurb: 'Shrink a JPG while keeping it usable on the web.',
    tip: 'Around 75–85% quality is the sweet spot for photos: halve the quality, lose a little sharpness, keep most of the detail.',
    params: [sl('quality', 'Quality', 0.8, 0.3, 1, 0.05, '', 'Lower quality means a smaller file'), longEdgeParam, fmtParam()],
    outGroup: 'jpeg',
    build: (v) => (v.format === 'image/png' ? [] : encode(v)),
  }),
  tool({
    id: 'png-compressor',
    name: 'PNG Compressor',
    sub: SUB,
    icon: 'FileImage',
    blurb: 'Reduce a PNG by cutting the colour depth and trimming wasted pixels.',
    tip: 'For logos and flat art, dropping the colour count to 64 or 32 is usually invisible but can halve the file.',
    params: [
      n('colors', 'Colours to keep', 64, 2, 256, 2),
      tg('stripMeta', 'Drop hidden metadata'),
      longEdgeParam,
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => [
      ...(Number(v.maxEdge ?? 0) > 0 ? [{ op: 'longEdge' as const, px: Number(v.maxEdge) }] : []),
      colorReduce(Number(v.colors ?? 64)),
      { op: 'stripMetadata' },
    ],
  }),
  tool({
    id: 'webp-compressor',
    name: 'WebP Compressor',
    sub: SUB,
    icon: 'FileImage',
    blurb: 'Re-encode an image as WebP, usually far smaller than JPG at the same look.',
    tip: 'WebP is the best format for the modern web. Offer JPG as a fallback and WebP as the default.',
    params: [qualityParam(0.8), longEdgeParam, fmtParam()],
    outGroup: 'webp',
    build: (v) => encode(v),
  }),
  tool({
    id: 'gif-compressor',
    name: 'GIF Compressor',
    sub: SUB,
    icon: 'FileImage',
    blurb: 'Reduce a GIF by flattening it to a single frame with fewer colours.',
    tip: 'This flattens animation to one frame. Use a video-to-GIF tool if you need to keep motion.',
    params: [n('colors', 'Colours to keep', 32, 2, 256, 2), longEdgeParam, fmtParam()],
    outGroup: 'png',
    build: (v) => [
      ...(Number(v.maxEdge ?? 0) > 0 ? [{ op: 'longEdge' as const, px: Number(v.maxEdge) }] : []),
      colorReduce(Number(v.colors ?? 32)),
    ],
  }),
  tool({
    id: 'image-size-reducer',
    name: 'Image Size Reducer',
    sub: SUB,
    icon: 'Minimize2',
    blurb: 'Shrink a file until it fits a size budget, without touching its look.',
    tip: 'A target of 200 KB works for email attachments; 100 KB keeps you under most forum upload limits.',
    params: [n('targetKb', 'Target file size (KB)', 200, 5, 20480, 5, 'KB'), sel('format', 'Output format', ['image/jpeg', 'image/webp', 'image/png'], 'image/jpeg'), tg('allowResize', 'Allow resizing to reach the target'), qualityParam(0.9)],
    outGroup: 'jpeg',
    custom: compressToTarget,
  }),
  tool({
    id: 'compress-to-target-size',
    name: 'Compress to Target Size',
    sub: SUB,
    icon: 'Target',
    blurb: 'Search quality and resolution until the file lands on your exact size limit.',
    tip: 'Quality is lowered first, then the image is scaled. That order keeps as much detail as possible.',
    params: [n('targetKb', 'Target file size (KB)', 100, 5, 20480, 5, 'KB'), sel('format', 'Output format', ['image/jpeg', 'image/webp', 'image/png'], 'image/jpeg'), tg('allowResize', 'Allow resizing to reach the target')],
    outGroup: 'jpeg',
    custom: compressToTarget,
  }),
  tool({
    id: 'image-quality-optimizer',
    name: 'Image Quality Optimizer',
    sub: SUB,
    icon: 'Wand2',
    blurb: 'Look at an image, then pick the resolution and quality that fit your budget.',
    tip: 'Most web images look fine below 2400px on the long edge. Upscaling never adds real detail.',
    params: [n('targetKb', 'Target file size (KB)', 500, 5, 20480, 5, 'KB'), tg('preferWebp', 'Prefer WebP over JPG')],
    outGroup: 'jpeg',
    custom: autoOptimize,
  }),
  tool({
    id: 'batch-image-compressor',
    name: 'Batch Image Compressor',
    sub: SUB,
    alsoIn: ['batch'],
    icon: 'Layers',
    blurb: 'Compress a whole folder of images to one quality and download them as a ZIP.',
    tip: 'Batch tools keep your original files untouched. Check a few results before deleting anything.',
    params: [qualityParam(0.8), longEdgeParam, sel('format', 'Output format', ['image/jpeg', 'image/webp', 'image/png'], 'image/jpeg'), gapParam()],
    outGroup: 'jpeg',
    multiple: 50,
    build: (v) => encode(v),
  }),
  tool({
    id: 'lossless-compressor',
    name: 'Lossless Compressor',
    sub: SUB,
    icon: 'ShieldCheck',
    blurb: 'Make a smaller copy without changing a single pixel, and drop hidden metadata.',
    tip: 'Lossless re-encoding also strips EXIF and GPS data, so it is the safest way to share a photo privately.',
    params: [tg('stripMeta', 'Drop hidden metadata'), longEdgeParam, fmtParam()],
    outGroup: 'png',
    build: (v) => [
      ...(Number(v.maxEdge ?? 0) > 0 ? [{ op: 'longEdge' as const, px: Number(v.maxEdge) }] : []),
      { op: 'stripMetadata' },
    ],
  }),
  tool({
    id: 'image-file-size-checker',
    name: 'Image File Size Checker',
    sub: SUB,
    icon: 'Search',
    blurb: 'Read the real size, dimensions and format of an image before you upload it.',
    tip: 'Many upload forms cap files at 2–5 MB. Check before you choose a photo, not after.',
    params: [],
    kind: 'json',
    custom: inspectImage,
  }),
  tool({
    id: 'dpi-resolution-checker',
    name: 'DPI & Resolution Checker',
    sub: SUB,
    icon: 'Ruler',
    blurb: 'Check whether an image has enough pixels to print at the size you need.',
    tip: 'For a crisp A4 print at 300 DPI you need about 2480 × 3508 pixels.',
    params: [
      n('targetMm', 'Print width (mm)', 51, 5, 500, 1, 'mm'),
      n('dpi', 'Required DPI', 300, 36, 1200, 1, 'dpi'),
    ],
    kind: 'json',
    custom: checkPrint,
  }),
]
