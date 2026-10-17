import { bgParam, clr, fmtParam, gapParam, n, pr, sel, sl, tg, txt, tool } from '../engine/factories.ts'
import type { ImageToolSpec, Op } from '../engine/types.ts'

const SUB = 'print-layout' as const

const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [210, 297],
  A3: [297, 420],
  A5: [148, 210],
  Letter: [215.9, 279.4],
  Legal: [215.9, 355.6],
  '4x6 inch': [101.6, 152.4],
  '5x7 inch': [127, 177.8],
}

function pagePx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi)
}

export const PRINT_SPECS: ImageToolSpec[] = [
  tool({ id: 'passport-photo-sheets', name: 'Passport Photo Sheets', sub: SUB, icon: 'LayoutGrid', blurb: 'Print a full sheet of identical passport photos and cut them out.', tip: 'Print at 100% scale, never "fit to page". Any scaling breaks the required dimensions.',     params: [sel('page', 'Paper size', Object.keys(PAGE_SIZES), 'A4'), n('dpi', 'Print resolution', 300, 150, 600, 1, 'dpi'), n('cols', 'Columns', 5, 1, 10, 1), n('rows', 'Rows', 7, 1, 12, 1), gapParam(4), tg('cutMarks', 'Show cut marks')],
    kind: 'pdf',
    build: (v) => {
      const dpi = Math.max(150, Math.round(Number(v.dpi ?? 300)))
      const pw = pagePx(51, dpi)
      const ph = pagePx(51, dpi)
      const gap = Number(v.gap ?? 4)
      return [
        { op: 'resize', w: pw, h: ph, mode: 'cover', unit: 'px' },
        { op: 'idSheet', cols: Math.max(1, Math.round(Number(v.cols ?? 5))), rows: Math.max(1, Math.round(Number(v.rows ?? 7))), gap, page: String(v.page), wMm: 51, hMm: 51, cutMarks: Boolean(v.cutMarks) },
      ]
    },
  }),
  tool({ id: 'id-photo-sheet', name: 'ID Photo Sheet', sub: SUB, icon: 'Contact', blurb: 'Tile an ID photo across a printable sheet at true size.', tip: 'Check one printed photo against a ruler before printing the whole sheet.', params: [sel('page', 'Paper size', Object.keys(PAGE_SIZES), 'A4'), n('photoWidthMm', 'Photo width (mm)', 35, 20, 100, 1, 'mm'), n('photoHeightMm', 'Photo height (mm)', 45, 20, 140, 1, 'mm'), gapParam(3), tg('cutMarks', 'Show cut marks')], kind: 'pdf', build: (v) => { const [wMm, hMm] = PAGE_SIZES[String(v.page)] ?? PAGE_SIZES.A4; const dpi = 300; const pw = pagePx(Number(v.photoWidthMm ?? 35), dpi); const ph = pagePx(Number(v.photoHeightMm ?? 45), dpi); return [{ op: 'resize', w: pw, h: ph, mode: 'cover', unit: 'px' }, { op: 'idSheet', cols: Math.max(1, Math.floor((pagePx(wMm, dpi) - 20) / (pw + 6))), rows: Math.max(1, Math.floor((pagePx(hMm, dpi) - 20) / (ph + 6))), gap: Number(v.gap ?? 3), page: String(v.page), wMm: Number(v.photoWidthMm ?? 35), hMm: Number(v.photoHeightMm ?? 45), cutMarks: Boolean(v.cutMarks) }] } }),
  tool({ id: 'photo-grid-print', name: 'Photo Grid Print', sub: SUB, icon: 'Grid3x3', blurb: 'Print a grid of copies from one photo.', tip: 'A 5×7 inch photo needs 300×210 pixels to print sharply at that size.', params: [sel('page', 'Paper size', Object.keys(PAGE_SIZES), '4x6 inch'), n('cols', 'Columns', 2, 1, 8, 1), n('rows', 'Rows', 2, 1, 10, 1), gapParam(6), bgParam('#FFFFFF'), fmtParam()], outGroup: 'png', build: (v) => [{ op: 'contactSheet', cols: Math.max(1, Math.round(Number(v.cols ?? 2))), gap: Number(v.gap ?? 6), bg: String(v.bg ?? '#FFFFFF'), square: false }] }),
  tool({ id: 'a4-photo-layout', name: 'A4 Photo Layout', sub: SUB, icon: 'FileText', blurb: 'Fit a photo onto an A4 page with a border.', tip: 'An 10×15cm print inside an A4 border gives a natural 2–3cm margin.', params: [sel('page', 'Paper size', Object.keys(PAGE_SIZES), 'A4'), n('margin', 'Margin', 12, 0, 60, 1, 'mm'), bgParam('#FFFFFF'), fmtParam()], outGroup: 'png', build: (v) => { const [wMm, hMm] = PAGE_SIZES[String(v.page)] ?? PAGE_SIZES.A4; const dpi = 300; const m = Number(v.margin ?? 12); return [{ op: 'resize', w: pagePx(wMm - m * 2, dpi), h: pagePx(hMm - m * 2, dpi), mode: 'contain', unit: 'px' }, { op: 'border', width: pagePx(m, dpi), color: String(v.bg ?? '#FFFFFF'), style: 'solid' }] } }),
  tool({ id: 'business-card-layout', name: 'Business Card Layout', sub: SUB, icon: 'CreditCard', blurb: 'Lay out a standard 3.5×2 inch card with a print bleed.', tip: 'Add a 3mm bleed so the printer can trim without a white sliver at the edge.', params: [n('bleed', 'Bleed (mm)', 3, 0, 10, 0.5, 'mm'), n('cards', 'Cards per row', 1, 1, 5, 1), clr('bg', 'Card colour', '#FFFFFF'), gapParam(2), fmtParam()], outGroup: 'png', build: (v) => { const bleed = Number(v.bleed ?? 3); const dpi = 300; const w = pagePx(88.9 + bleed * 2, dpi); const h = pagePx(50.8 + bleed * 2, dpi); return [{ op: 'resize', w, h, mode: 'exact', unit: 'px' }, { op: 'border', width: pagePx(bleed, dpi), color: String(v.bg ?? '#FFFFFF'), style: 'solid' }] } }),
  tool({ id: 'flyer-creator', name: 'Flyer Creator', sub: SUB, icon: 'FileBadge', blurb: 'Place a photo on a flyer page with a title band.', tip: 'Keep the text band away from the trim edge. Printers crop up to 3mm unpredictably.', params: [sel('page', 'Paper size', Object.keys(PAGE_SIZES), 'A4'), txt('title', 'Title', 'Your headline'), n('bandHeight', 'Title band', 18, 8, 45, 1, '%'), clr('band', 'Band colour', '#0F172A'), fmtParam()], outGroup: 'png', build: (v) => { const [wMm, hMm] = PAGE_SIZES[String(v.page)] ?? PAGE_SIZES.A4; const dpi = 150; const w = pagePx(wMm, dpi); const h = pagePx(hMm, dpi); return [{ op: 'resize', w, h, mode: 'cover', unit: 'px' }, { op: 'watermarkText', text: String(v.title ?? 'Your headline'), fontSize: Math.round(w / 16), opacity: 1, color: '#FFFFFF', x: 50, y: Number(v.bandHeight ?? 18), rotation: 0, font: 'sans-serif', tile: false }] } }),
  tool({ id: 'watermark-for-print', name: 'Watermark for Print', sub: SUB, icon: 'Stamp', blurb: 'Burn a low-opacity print watermark into an image.', tip: 'Print watermarks should be subtle. On paper, 10–20% opacity is already visible.', params: [txt('author', 'Name / credit', 'Your Name'), sl('opacity', 'Opacity', 0.18, 0.03, 1, 0.02), n('dpi', 'Print resolution', 300, 96, 600, 1, 'dpi'), fmtParam()], outGroup: 'png', build: (v) => [{ op: 'watermarkText', text: `© ${String(v.author ?? 'Your Name')}`, fontSize: 44, opacity: Number(v.opacity ?? 0.18), color: '#0F172A', x: 50, y: 50, rotation: 30, font: 'serif', tile: true }] }),
  tool({ id: 'print-size-converter', name: 'Print Size Converter', sub: SUB, icon: 'Ruler', blurb: 'Convert between pixels, inches, centimetres and millimetres.', tip: 'Rule of thumb: 300 DPI for close-up viewing, 150 DPI for posters, 72 DPI for screen.', params: [pr('pixels', 'Pixels (px)', '2480,3508'), n('dpi', 'Resolution', 300, 36, 1200, 1, 'dpi')], kind: 'json', build: (v) => { const size = String(v.pixels ?? '2480,3508').split(/[,;\s]+/).map(Number); const w = size[0] || 2480; const h = size[1] || 3508; return [{ op: 'resize', w, h, mode: 'exact', unit: 'px' }] } }),
  tool({ id: 'photo-card-sizer', name: 'Photo Card Sizer', sub: SUB, icon: 'Square', blurb: 'Size an image for a photo card, with a safe crop.', tip: 'Crop to 4:6 for 4×6 cards and 5:7 for 5×7. Cropping after export wastes paper.', params: [sel('card', 'Card size', ['4x6 inch', '5x7 inch', 'Square 5x5'], '4x6 inch'), n('dpi', 'Print resolution', 300, 150, 600, 1, 'dpi'), tg('rounded', 'Rounded corners'), fmtParam()], outGroup: 'png', build: (v) => { const map: Record<string, [number, number]> = { '4x6 inch': [101.6, 152.4], '5x7 inch': [127, 177.8], 'Square 5x5': [127, 127] }; const [wMm, hMm] = map[String(v.card)] ?? map['4x6 inch']; const dpi = Number(v.dpi ?? 300); const ops: Op[] = [{ op: 'aspect', ratio: wMm / hMm, mode: 'cover' }, { op: 'resize', w: pagePx(wMm, dpi), h: pagePx(hMm, dpi), mode: 'cover', unit: 'px' }]; if (v.rounded) ops.push({ op: 'cropShape', shape: 'rounded', radius: pagePx(3, dpi) }); return ops } }),
]
