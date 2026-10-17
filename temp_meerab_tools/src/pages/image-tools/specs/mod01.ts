import { ID_PHOTO_SIZES, mmToPx } from '../engine/geometry.ts'
import { adjust, clr, fmtParam, n, qualityParam, sel, sl, tg, tool, txt } from '../engine/factories.ts'
import type { ImageToolSpec, Op, ParamValues } from '../engine/types.ts'

const SUB = 'id-passport' as const

function idSize(v: ParamValues, key = 'size'): { wMm: number; hMm: number; label: string } {
  const preset = String(v[key] ?? 'passport-35x45')
  if (preset === 'custom') {
    const w = Number(v.customW ?? 0)
    const h = Number(v.customH ?? 0)
    if (w > 0 && h > 0) return { wMm: w, hMm: h, label: `Custom ${w}×${h}mm` }
  }
  return ID_PHOTO_SIZES[preset] ?? ID_PHOTO_SIZES['passport-35x45']
}

const sizeOptions = Object.keys(ID_PHOTO_SIZES)
const customParams = [
  n('customW', 'Custom width (mm)', 35, 10, 200, 1, 'mm'),
  n('customH', 'Custom height (mm)', 45, 10, 200, 1, 'mm'),
]

const backgroundSelect = (def: string) =>
  sel('bg', 'Background colour', ['#FFFFFF', '#F2F2F2', '#D6E4F0', '#C9DAF0', '#BFD7EA', '#E8F1F8', '#0EA5E9'], def, 'Most authorities require a plain off-white or white background')

export const ID_PASSPORT_TOOLS: ImageToolSpec[] = [
  tool({
    id: 'passport-2x2-photo-maker',
    name: '2×2 Inch Photo Maker',
    sub: SUB,
    icon: 'User',
    blurb: 'Crop any portrait to the exact 2×2 inch (51×51mm) US passport/photo size at print resolution.',
    tip: 'Export at 300 DPI. A 51×51mm cell at 300 DPI is 602×602 pixels — anything smaller will look soft in print.',
    params: [
      sel('size', 'Photo size', sizeOptions, '2x2-inch'),
      sel('dpi', 'Print resolution', ['300', '600', '150'], '300', '300 DPI is the standard for ID photos'),
      n('headroom', 'Head space above head (mm)', 4, 0, 20, 1, 'mm'),
      backgroundSelect('#F2F2F2'),
      fmtParam(),
      qualityParam(0.95),
    ],
    outGroup: 'png',
    build: (v) => {
      const size = idSize(v)
      const dpi = Number(v.dpi ?? 300)
      const w = mmToPx(size.wMm, dpi)
      const h = mmToPx(size.hMm, dpi)
      void w
      void h
      return [
        { op: 'aspect', ratio: size.wMm / size.hMm, mode: 'cover' },
        { op: 'crop', x: 0, y: 0, w, h, unit: 'px' },
        { op: 'background', mode: 'color', color: String(v.bg ?? '#F2F2F2'), color2: '#FFFFFF', blur: 10, tolerance: 30, feather: 20, keepColor: 'auto' },
      ]
    },
  }),
  tool({
    id: 'visa-photo-maker',
    name: 'Visa Photo Maker',
    sub: SUB,
    icon: 'Plane',
    blurb: 'Build a 35×45mm or 51×51mm visa photo with the head-size and eye-line rules applied automatically.',
    tip: 'US and Canadian visas want 51×51mm with the head filling 50–69% of the height. Measure the crop before printing.',
    params: [
      sel('size', 'Visa standard', ['visa-35x45', '2x2-inch', 'visa-35x45eu'], '2x2-inch'),
      sel('dpi', 'Print resolution', ['300', '600'], '300'),
      sl('headroom', 'Head space (mm)', 4, 0, 15, 0.5, 'mm'),
      backgroundSelect('#FFFFFF'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const size = idSize(v)
      const dpi = Number(v.dpi ?? 300)
      return [
        { op: 'aspect', ratio: size.wMm / size.hMm, mode: 'cover' },
        { op: 'crop', x: 0, y: 0, w: mmToPx(size.wMm, dpi), h: mmToPx(size.hMm, dpi), unit: 'px' },
        { op: 'background', mode: 'color', color: String(v.bg ?? '#FFFFFF'), color2: '#FFFFFF', blur: 10, tolerance: 30, feather: 20, keepColor: 'auto' },
      ]
    },
  }),
  tool({
    id: 'cnic-id-card-photo-maker',
    name: 'CNIC / ID Card Photo Maker',
    sub: SUB,
    icon: 'IdCard',
    blurb: 'Crop to the 30×40mm size used on national ID cards, with a plain light background.',
    tip: 'ID card photos are printed smaller than passports, so 30×40mm at 300 DPI only needs 354×472 pixels.',
    params: [
      sel('dpi', 'Print resolution', ['300', '600'], '300'),
      sl('headroom', 'Head space (mm)', 3, 0, 12, 0.5, 'mm'),
      backgroundSelect('#F2F2F2'),
      n('padMm', 'Background padding (mm)', 1, 0, 5, 0.5, 'mm'),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const dpi = Number(v.dpi ?? 300)
      const pad = mmToPx(Number(v.padMm ?? 1), dpi)
      return [
        { op: 'aspect', ratio: 30 / 40, mode: 'cover' },
        { op: 'crop', x: 0, y: 0, w: mmToPx(30, dpi), h: mmToPx(40, dpi), unit: 'px' },
        { op: 'background', mode: 'color', color: String(v.bg ?? '#F2F2F2'), color2: '#FFFFFF', blur: 8, tolerance: 30, feather: 20, keepColor: 'auto' },
        { op: 'border', width: pad, color: '#FFFFFF', style: 'solid' },
      ]
    },
  }),
  tool({
    id: 'driving-license-photo-maker',
    name: 'Driving License Photo Maker',
    sub: SUB,
    icon: 'IdCard',
    blurb: 'Produce a licence-acceptable 30×40mm photo with an even, shadow-free background.',
    tip: 'Licence photos reject heavy shadows and visible clothing patterns. Even lighting beats high resolution here.',
    params: [
      sel('size', 'Licence size', ['license-30x40', 'cnic-30x40', 'headshot-25x35'], 'license-30x40'),
      sel('dpi', 'Print resolution', ['300', '600'], '300'),
      backgroundSelect('#E8F1F8'),
      sl('evenness', 'Even out lighting', 25, 0, 100, 1),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const size = idSize(v)
      const dpi = Number(v.dpi ?? 300)
      return [
        { op: 'aspect', ratio: size.wMm / size.hMm, mode: 'cover' },
        { op: 'crop', x: 0, y: 0, w: mmToPx(size.wMm, dpi), h: mmToPx(size.hMm, dpi), unit: 'px' },
        { op: 'clahe', tiles: 4, clip: 20 },
        { op: 'background', mode: 'color', color: String(v.bg ?? '#E8F1F8'), color2: '#FFFFFF', blur: 8, tolerance: 30, feather: 20, keepColor: 'auto' },
      ]
    },
  }),
  tool({
    id: 'passport-background-checker',
    name: 'Passport Photo Background Checker',
    sub: SUB,
    icon: 'ShieldCheck',
    blurb: 'Measure how close a portrait background is to the plain white that passport offices require.',
    tip: 'Authorities want the background within roughly 20% of pure white. Use the measured variance to decide if you need to re-shoot.',
    params: [
      txt('region', 'Sample area', 'top:20-80%,centre:20-80%', 'The upper background is what gets checked'),
      sl('threshold', 'Tolerance from white', 12, 1, 40, 1),
      tg('fix', 'Also output a corrected version'),
    ],
    kind: 'json',
    needsUpload: true,
    build: (v) => [adjust({ brightness: v.fix === 'on' ? 6 : 0, contrast: v.fix === 'on' ? 8 : 0 })],
  }),
  tool({
    id: 'passport-photo-sheet-maker',
    name: 'Passport Photo Sheet Maker',
    sub: SUB,
    icon: 'LayoutGrid',
    blurb: 'Print one A4 sheet of identical passport photos, tiled from a single portrait.',
    tip: 'Print at 100% scale — never "fit to page", or the photos will come out the wrong physical size.',
    params: [
      sel('size', 'Photo size', sizeOptions, 'passport-35x45'),
      sel('dpi', 'Print resolution', ['300', '600'], '300'),
      n('gapMm', 'Gap between photos (mm)', 2, 0, 10, 0.5, 'mm'),
      n('marginMm', 'Page margin (mm)', 8, 0, 25, 1, 'mm'),
      tg('marks', 'Show cut marks'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const size = idSize(v)
      return [
        { op: 'aspect', ratio: size.wMm / size.hMm, mode: 'cover' },
        { op: 'background', mode: 'color', color: '#F2F2F2', color2: '#FFFFFF', blur: 8, tolerance: 30, feather: 20, keepColor: 'auto' },
        {
          op: 'idSheet',
          cols: 99,
          rows: 99,
          gap: 0,
          page: 'a4',
          wMm: size.wMm,
          hMm: size.hMm,
          cutMarks: v.marks === 'on',
        },
      ]
    },
  }),
  tool({
    id: 'passport-photo-print-layout',
    name: 'Passport Photo Print Layout',
    sub: SUB,
    icon: 'Printer',
    blurb: 'Place a passport photo at true physical size on an A4 page, ready to print and trim.',
    tip: 'One photo centred on A4 is the safest way to verify size: cut it out and compare against a bank card.',
    params: [
      sel('size', 'Photo size', sizeOptions, 'passport-35x45'),
      sel('dpi', 'Print resolution', ['300', '600'], '300'),
      sel('page', 'Page size', ['a4', 'letter', 'a5'], 'a4'),
      sel('bg', 'Background', ['#FFFFFF', '#F2F2F2', '#D6E4F0'], '#FFFFFF'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const size = idSize(v)
      const dpi = Number(v.dpi ?? 300)
      const page = String(v.page ?? 'a4')
      const w = mmToPx(size.wMm, dpi)
      const h = mmToPx(size.hMm, dpi)
      return [
        { op: 'background', mode: 'color', color: String(v.bg ?? '#FFFFFF'), color2: '#FFFFFF', blur: 4, tolerance: 20, feather: 20, keepColor: 'auto' },
        { op: 'crop', x: 0, y: 0, w, h, unit: 'px' },
        { op: 'idSheet', cols: 1, rows: 1, gap: 0, page, wMm: size.wMm, hMm: size.hMm, cutMarks: true },
      ]
    },
  }),
  tool({
    id: 'visa-photo-size-converter',
    name: 'Visa Photo Size Converter',
    sub: SUB,
    icon: 'ArrowLeftRight',
    blurb: 'Convert a visa photo between 35×45mm, 51×51mm and 25×35mm without distorting the face.',
    tip: 'Always convert with the aspect ratio locked, or the face will look stretched on the new document.',
    params: [
      sel('from', 'Current size', sizeOptions, 'passport-35x45'),
      sel('to', 'Target size', sizeOptions, '2x2-inch'),
      sel('dpi', 'Print resolution', ['300', '600'], '300'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const from = idSize(v, 'from')
      const to = idSize(v, 'to')
      const dpi = Number(v.dpi ?? 300)
      return [
        { op: 'crop', x: 0, y: 0, w: mmToPx(from.wMm, dpi), h: mmToPx(from.hMm, dpi), unit: 'px' },
        { op: 'aspect', ratio: to.wMm / to.hMm, mode: 'cover' },
        { op: 'crop', x: 0, y: 0, w: mmToPx(to.wMm, dpi), h: mmToPx(to.hMm, dpi), unit: 'px' },
      ]
    },
  }),
  tool({
    id: 'id-photo-cropper',
    name: 'ID Photo Cropper',
    sub: SUB,
    icon: 'Crop',
    blurb: 'Crop to any custom millimetre or pixel size, then flatten onto a document background.',
    tip: 'Type the exact millimetres your authority asks for rather than picking a preset — requirements change.',
    params: [
      ...customParams,
      sel('dpi', 'Print resolution', ['150', '300', '600'], '300'),
      clr('bg', 'Background colour', '#FFFFFF'),
      tg('rounded', 'Round the corners'),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => {
      const dpi = Number(v.dpi ?? 300)
      const w = mmToPx(Number(v.customW ?? 35), dpi)
      const h = mmToPx(Number(v.customH ?? 45), dpi)
      const ops: Op[] = [
        { op: 'aspect', ratio: Number(v.customW ?? 35) / Math.max(1, Number(v.customH ?? 45)), mode: 'cover' },
        { op: 'crop', x: 0, y: 0, w, h, unit: 'px' },
        { op: 'background', mode: 'color', color: String(v.bg ?? '#FFFFFF'), color2: '#FFFFFF', blur: 8, tolerance: 30, feather: 20, keepColor: 'auto' },
      ]
      if (v.rounded === 'on') ops.push({ op: 'cropShape', shape: 'rounded', radius: Math.round(Math.min(w, h) * 0.06) })
      return ops
    },
  }),
  tool({
    id: 'professional-headshot-cropper',
    name: 'Professional Headshot Cropper',
    sub: SUB,
    icon: 'UserRound',
    blurb: 'Auto-detect the face and crop a square professional headshot with balanced head room.',
    tip: 'Square headshots with the eyes about one third from the top read as more professional on CVs and LinkedIn.',
    params: [
      sl('pad', 'Extra space around the face', 0.35, 0, 1, 0.05),
      sel('shape', 'Crop shape', ['circle', 'rounded', 'rect'], 'rounded'),
      sel('dpi', 'Output resolution', ['300', '600'], '300'),
      sl('bg', 'Background brightness', 6, -40, 40, 1),
      fmtParam(),
    ],
    outGroup: 'png',
    build: (v) => [
      { op: 'faceBox', pad: Number(v.pad ?? 0.35), shape: String(v.shape ?? 'rounded') as 'circle' | 'rounded' | 'rect' },
      adjust({ brightness: Number(v.bg ?? 6), contrast: 4 }),
    ],
  }),
  tool({
    id: 'photo-for-job-application',
    name: 'Photo for Job Application',
    sub: SUB,
    icon: 'Briefcase',
    blurb: 'Prepare a compliant application photo at 300 DPI with a neutral background and even tone.',
    tip: 'Many portals reject files over 2MB. Export JPG at quality 85 and you will usually land well under that.',
    params: [
      sel('style', 'Photo style', ['passport-35x45', 'headshot-25x35', 'linkedin-4x4'], 'headshot-25x35'),
      sel('dpi', 'Print resolution', ['300', '600'], '300'),
      sl('quality', 'JPG quality', 0.88, 0.4, 1, 0.02),
      sl('sharp', 'Sharpening', 25, 0, 100, 1),
      fmtParam(),
    ],
    outGroup: 'jpeg',
    build: (v) => {
      const size = idSize(v, 'style')
      const dpi = Number(v.dpi ?? 300)
      return [
        { op: 'aspect', ratio: size.wMm / size.hMm, mode: 'cover' },
        { op: 'crop', x: 0, y: 0, w: mmToPx(size.wMm, dpi), h: mmToPx(size.hMm, dpi), unit: 'px' },
        { op: 'clahe', tiles: 4, clip: 18 },
        { op: 'unsharp', radius: 1, amount: Number(v.sharp ?? 25) },
        { op: 'background', mode: 'color', color: '#F2F2F2', color2: '#FFFFFF', blur: 8, tolerance: 30, feather: 20, keepColor: 'auto' },
      ]
    },
  }),
  tool({
    id: 'multiple-passport-photos-a4',
    name: 'Multiple Passport Photos on A4',
    sub: SUB,
    icon: 'Copy',
    blurb: 'Upload several portraits and lay them all onto one A4 sheet, tiling across pages if needed.',
    tip: 'Ten 35×45mm photos fit on an A4 sheet at 300 DPI. Fewer cuts means less trimming time and fewer mistakes.',
    params: [
      sel('size', 'Photo size', sizeOptions, 'passport-35x45'),
      sel('dpi', 'Print resolution', ['300', '600'], '300'),
      n('gapMm', 'Gap (mm)', 2, 0, 10, 0.5, 'mm'),
      n('marginMm', 'Margin (mm)', 8, 0, 25, 1, 'mm'),
      fmtParam(),
    ],
    outGroup: 'png',
    multiple: 2,
    build: (v) => {
      const size = idSize(v)
      return [
        { op: 'aspect', ratio: size.wMm / size.hMm, mode: 'cover' },
        { op: 'background', mode: 'color', color: '#F2F2F2', color2: '#FFFFFF', blur: 8, tolerance: 30, feather: 20, keepColor: 'auto' },
        { op: 'idSheet', cols: 99, rows: 99, gap: 0, page: 'a4', wMm: size.wMm, hMm: size.hMm, cutMarks: true },
      ]
    },
  }),
  tool({
    id: 'passport-photo-size-checker',
    name: 'Passport Photo Size Checker',
    sub: SUB,
    icon: 'Ruler',
    blurb: 'Check whether an uploaded photo meets a given print size, DPI and face-height requirement.',
    tip: 'Face height is the rule people miss: it must be 70–80% of the photo height for most passports.',
    params: [
      sel('size', 'Required size', sizeOptions, 'passport-35x45'),
      sel('dpi', 'Required resolution', ['300', '600'], '300'),
      sl('minFace', 'Minimum face height (%)', 70, 50, 90, 1),
      sl('maxFace', 'Maximum face height (%)', 80, 55, 95, 1),
    ],
    kind: 'json',
    needsUpload: true,
    build: () => [],
  }),
]

