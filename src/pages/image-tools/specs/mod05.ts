import { adjust, bgParam, clr, fmtParam, n, sel, sl, tg, tool, toleranceParam } from '../engine/factories.ts'
import type { ImageToolSpec, Op } from '../engine/types.ts'

const SUB = 'background-cutout' as const

function remove(v: Record<string, string | number | boolean | undefined>): Op {
  return {
    op: 'background',
    mode: 'remove',
    color: String(v.color ?? '#ffffff'),
    color2: '#0EA5E9',
    blur: 0,
    tolerance: Number(v.tolerance ?? 30),
    feather: Number(v.feather ?? 20),
    keepColor: (v.keep === 'keep' ? 'keep' : 'none') as 'keep' | 'none',
  }
}

export const BACKGROUND_SPECS: ImageToolSpec[] = [
  tool({
    id: 'background-remover-ai',
    name: 'AI Background Remover',
    sub: SUB,
    alsoIn: ['ai-image'],
    icon: 'Sparkles',
    blurb: 'Lift the subject off the background with an on-device edge-aware cutout.',
    tip: 'This runs a deterministic border-flood algorithm in your browser, not a neural network. It works best when the background is a flat, even colour and the subject does not touch the frame edge.',
    params: [clr('color', 'Background colour to remove', '#ffffff'), toleranceParam(30), sl('feather', 'Edge softness', 20, 0, 100, 1), sel('keep', 'Edge handling', ['remove', 'keep'], 'remove', '"keep" leaves a fringe of the original background colour')],
    outGroup: 'png',
    build: (v) => [remove(v)],
  }),
  tool({
    id: 'product-background-remover',
    name: 'Product Background Remover',
    sub: SUB,
    alsoIn: ['ecommerce'],
    icon: 'Package',
    blurb: 'Cut a product out cleanly and drop it onto a studio backdrop.',
    tip: 'Shoot products on a plain, evenly lit surface. The flatter the background, the cleaner the cutout.',
    params: [
      clr('color', 'Background colour to remove', '#ffffff'),
      toleranceParam(30),
      sl('feather', 'Edge softness', 14, 0, 100, 1),
      sel('backdrop', 'Backdrop', ['transparent', 'white', 'soft-grey', 'gradient', 'studio'], 'white'),
      sel('keep', 'Edge handling', ['remove', 'keep'], 'remove'),
    ],
    outGroup: 'png',
    build: (v) => {
      const ops: Op[] = [remove(v)]
      const backdrop = String(v.backdrop ?? 'white')
      if (backdrop === 'transparent') return ops
      if (backdrop === 'white') return [...ops, { op: 'background', mode: 'color', color: '#FFFFFF', color2: '#0EA5E9', blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' }]
      if (backdrop === 'soft-grey') return [...ops, { op: 'background', mode: 'color', color: '#F1F5F9', color2: '#0EA5E9', blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' }]
      if (backdrop === 'gradient') return [...ops, { op: 'background', mode: 'gradient', color: '#FFFFFF', color2: '#E2E8F0', blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' }]
      return [...ops, { op: 'background', mode: 'studio', color: '#FFFFFF', color2: '#CBD5E1', blur: 30, tolerance: 0, feather: 0, keepColor: 'auto' }]
    },
  }),
  tool({
    id: 'chroma-key-remover',
    name: 'Chroma Key Remover',
    sub: SUB,
    icon: 'Clapperboard',
    blurb: 'Remove a green or blue screen using a key colour and tolerance.',
    tip: 'Light the subject evenly and keep the key colour as far from the subject as possible. Spill on hair and edges is normal.',
    params: [clr('keyColor', 'Key colour', '#00FF00'), sl('tolerance', 'Tolerance', 40, 0, 100, 1), sl('softness', 'Edge softness', 25, 0, 100, 1)],
    outGroup: 'png',
    build: (v) => [
      { op: 'chromaKey', keyColor: String(v.keyColor ?? '#00FF00'), tolerance: Number(v.tolerance ?? 40), softness: Number(v.softness ?? 25) },
    ],
  }),
  tool({
    id: 'white-background-remover',
    name: 'White Background Remover',
    sub: SUB,
    icon: 'Sun',
    blurb: 'Strip a plain white backdrop from a product or portrait photo.',
    tip: 'If the edges come out ragged, raise the tolerance a little and lower the edge softness.',
    params: [toleranceParam(35), sl('feather', 'Edge softness', 18, 0, 100, 1), sel('keep', 'Edge handling', ['remove', 'keep'], 'remove')],
    outGroup: 'png',
    build: (v) => [remove({ ...v, color: '#ffffff' })],
  }),
  tool({
    id: 'transparent-background-maker',
    name: 'Transparent Background Maker',
    sub: SUB,
    icon: 'Layers',
    blurb: 'Make the background fully transparent so you can place the subject anywhere.',
    tip: 'Always export as PNG. JPG cannot store transparency, so the background would turn black.',
    params: [toleranceParam(30), sl('feather', 'Edge softness', 20, 0, 100, 1), fmtParam()],
    outGroup: 'png',
    build: (v) => [remove(v)],
  }),
  tool({
    id: 'background-color-changer',
    name: 'Background Colour Changer',
    sub: SUB,
    icon: 'PaintBucket',
    blurb: 'Swap a photo backdrop for any colour while keeping the subject untouched.',
    tip: 'Pick a colour close to the lighting in the photo. A pure white background under warm light always looks fake.',
    params: [clr('color', 'Colour to replace', '#ffffff'), toleranceParam(30), bgParam('#0EA5E9'), sl('feather', 'Edge softness', 25, 0, 100, 1)],
    outGroup: 'png',
    build: (v) => [
      { op: 'colorReplace', from: String(v.color ?? '#ffffff'), to: String(v.bg ?? '#0EA5E9'), tolerance: Number(v.tolerance ?? 30) },
    ],
  }),
  tool({
    id: 'background-blur',
    name: 'Background Blur',
    sub: SUB,
    icon: 'Aperture',
    blurb: 'Blur only the background so the subject pops without a cutout.',
    tip: 'A strong blur hides distractions and needs no transparency at all, so it never leaves rough edges.',
    params: [n('strength', 'Blur strength', 24, 2, 120, 1), tg('vignette', 'Add a subtle vignette')],
    outGroup: 'png',
    build: (v) => {
      const ops: Op[] = [
        { op: 'background', mode: 'blur', color: '#ffffff', color2: '#0EA5E9', blur: Number(v.strength ?? 24), tolerance: 0, feather: 0, keepColor: 'auto' },
      ]
      if (v.vignette) ops.push({ op: 'vignette', strength: 35, radius: 75, feather: 45 })
      return ops
    },
  }),
  tool({
    id: 'background-gradient-adder',
    name: 'Background Gradient Adder',
    sub: SUB,
    icon: 'Triangle',
    blurb: 'Add a clean vertical gradient behind a cut-out subject.',
    tip: 'Keep the gradient subtle. A strong colour shift behind a subject draws more attention than the subject.',
    params: [clr('color', 'Gradient top', '#EFF6FF'), clr('color2', 'Gradient bottom', '#BAE6FD'), sl('feather', 'Edge softness', 20, 0, 100, 1)],
    outGroup: 'png',
    build: (v) => [
      remove(v),
      { op: 'background', mode: 'gradient', color: String(v.color ?? '#EFF6FF'), color2: String(v.color2 ?? '#BAE6FD'), blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' },
    ],
  }),
  tool({
    id: 'studio-background',
    name: 'Studio Background',
    sub: SUB,
    icon: 'Camera',
    blurb: 'Give a product shot a soft studio sweep instead of a flat colour.',
    tip: 'Studio gradients read as professional because they match how a light box falls across a backdrop.',
    params: [clr('color', 'Backdrop colour', '#FFFFFF'), clr('color2', 'Shadow colour', '#CBD5E1'), n('blur', 'Sweep softness', 34, 4, 120, 1), sl('feather', 'Edge softness', 20, 0, 100, 1)],
    outGroup: 'png',
    build: (v) => [
      remove(v),
      { op: 'background', mode: 'studio', color: String(v.color ?? '#FFFFFF'), color2: String(v.color2 ?? '#CBD5E1'), blur: Number(v.blur ?? 34), tolerance: 0, feather: 0, keepColor: 'auto' },
    ],
  }),
  tool({
    id: 'background-desaturation',
    name: 'Background Desaturation',
    sub: SUB,
    icon: 'Contrast',
    blurb: 'Drain the colour out of the background so the subject stands out.',
    tip: 'A small drop works best. Desaturating the whole frame makes the image look broken rather than focused.',
    params: [n('strength', 'Desaturation', 85, 0, 100, 1, '%'), sl('feather', 'Edge softness', 30, 0, 100, 1)],
    outGroup: 'png',
    build: (v) => [
      { op: 'background', mode: 'remove', color: '#ffffff', color2: '#0EA5E9', blur: 0, tolerance: 0, feather: Number(v.feather ?? 30), keepColor: 'auto' },
      adjust({ saturation: -(Number(v.strength ?? 85) / 100) }),
    ],
  }),
  tool({
    id: 'background-shadow-remover',
    name: 'Background Shadow Remover',
    sub: SUB,
    icon: 'Eraser',
    blurb: 'Soften or drop the cast shadow around a cut-out subject.',
    tip: 'Keeping a small amount of shadow makes a product look seated rather than pasted on.',
    params: [toleranceParam(45), sl('feather', 'Shadow softness', 40, 0, 120, 1), sel('keep', 'Edge handling', ['remove', 'keep'], 'keep')],
    outGroup: 'png',
    build: (v) => [remove(v)],
  }),
  tool({
    id: 'background-replacer-batch',
    name: 'Background Replacer (Batch)',
    sub: SUB,
    alsoIn: ['ecommerce'],
    icon: 'Images',
    blurb: 'Apply one cutout and backdrop to a whole set of images at once.',
    tip: 'Batch work needs consistent lighting. Different studio lights produce visibly different edges.',
    params: [clr('color', 'Colour to remove', '#ffffff'), toleranceParam(30), sel('backdrop', 'Backdrop', ['transparent', 'white', 'soft-grey', 'gradient', 'studio'], 'white'), sl('feather', 'Edge softness', 20, 0, 100, 1)],
    outGroup: 'png',
    multiple: 50,
    build: (v) => {
      const ops: Op[] = [remove(v)]
      const backdrop = String(v.backdrop ?? 'white')
      if (backdrop === 'transparent') return ops
      if (backdrop === 'white') return [...ops, { op: 'background', mode: 'color', color: '#FFFFFF', color2: '#0EA5E9', blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' }]
      if (backdrop === 'soft-grey') return [...ops, { op: 'background', mode: 'color', color: '#F1F5F9', color2: '#0EA5E9', blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' }]
      if (backdrop === 'gradient') return [...ops, { op: 'background', mode: 'gradient', color: '#FFFFFF', color2: '#E2E8F0', blur: 0, tolerance: 0, feather: 0, keepColor: 'auto' }]
      return [...ops, { op: 'background', mode: 'studio', color: '#FFFFFF', color2: '#CBD5E1', blur: 30, tolerance: 0, feather: 0, keepColor: 'auto' }]
    },
  }),
  tool({
    id: 'transparent-shadow-maker',
    name: 'Transparent Shadow Maker',
    sub: SUB,
    icon: 'Circle',
    blurb: 'Render an object with a soft drop shadow on a transparent canvas.',
    tip: 'Export as PNG so the shadow sits on transparency, then drop it over any layout.',
    params: [n('blur', 'Shadow blur', 26, 0, 120, 1, 'px'), n('offsetY', 'Shadow offset', 12, -120, 120, 1, 'px'), n('opacity', 'Shadow opacity', 45, 0, 100, 1, '%')],
    outGroup: 'png',
    build: (v) => {
      const shadow: Op = { op: 'shadow', blur: Number(v.blur ?? 26), offsetX: 0, offsetY: Number(v.offsetY ?? 12), color: '#0F172A', opacity: Number(v.opacity ?? 45) / 100 }
      const border: Op = { op: 'cutoutRect', inset: 0 }
      return [border, shadow]
    },
  }),
]
