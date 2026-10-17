import { adjust, bgParam, clr, fmtParam, gapParam, n, qualityParam, sel, sl, txt, tool } from '../engine/factories.ts'
import { renameBatch, stripMetadataRun } from '../engine/runners.ts'
import { compressToTarget } from '../engine/runners.ts'
import { ocrText } from '../engine/analysis.ts'
import type { ImageToolSpec } from '../engine/types.ts'

const SUB = 'batch' as const

const shared = [
  n('maxEdge', 'Longest edge (px)', 1920, 0, 12000, 100, 'px'),
  sel('format', 'Output format', ['image/jpeg', 'image/webp', 'image/png'], 'image/jpeg'),
  qualityParam(0.82),
]

function resizeBatch(v: Record<string, string | number | boolean | undefined>) {
  const edge = Number(v.maxEdge ?? 0)
  return edge > 0 ? [{ op: 'longEdge' as const, px: edge }] : []
}

export const BATCH_SPECS: ImageToolSpec[] = [
  tool({ id: 'batch-image-resizer', name: 'Batch Image Resizer', sub: SUB, alsoIn: ['crop-resize'], icon: 'Images', blurb: 'Resize a whole folder of images to one size.', tip: 'Pick the size the smallest image needs. Upscaling a whole folder wastes a lot of disk.', params: shared, outGroup: 'jpeg', multiple: 100, build: resizeBatch }),
  tool({ id: 'batch-cropper', name: 'Batch Cropper', sub: SUB, icon: 'Crop', blurb: 'Crop many images to the same shape and size.', tip: 'Batch cropping assumes consistent framing. Check the first few before running the whole folder.', params: [sel('ratio', 'Crop shape', ['1:1', '4:5', '16:9', '3:2'], '1:1'), n('width', 'Width (px)', 1080, 100, 6000, 10, 'px')], outGroup: 'png', multiple: 100, build: (v) => { const map: Record<string, number> = { '1:1': 1, '4:5': 4 / 5, '16:9': 16 / 9, '3:2': 3 / 2 }; const r = map[String(v.ratio)] ?? 1; const w = Math.round(Number(v.width ?? 1080)); return [{ op: 'aspect', ratio: r, mode: 'cover' }, { op: 'resize', w, h: Math.round(w / r), mode: 'cover', unit: 'px' }] } }),
  tool({ id: 'batch-watermarker', name: 'Batch Watermarker', sub: SUB, icon: 'Stamp', blurb: 'Stamp the same watermark across a whole folder.', tip: 'Apply it to a copy. Once a watermark is flattened in you cannot get the original back.', params: [txt('author', 'Name / credit', 'Your Name'), sel('pos', 'Position', ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'], 'bottom-right'), sl('opacity', 'Opacity', 0.6, 0.05, 1, 0.05), fmtParam()], outGroup: 'jpeg', multiple: 100, build: (v) => { const table: Record<string, [number, number]> = { 'top-left': [5, 5], 'top-right': [95, 5], center: [50, 50], 'bottom-left': [5, 95], 'bottom-right': [95, 95] }; const [x, y] = table[String(v.pos)] ?? [95, 95]; return [{ op: 'watermarkText', text: `© ${String(v.author ?? 'Your Name')}`, fontSize: 32, opacity: Number(v.opacity ?? 0.6), color: '#FFFFFF', x, y, rotation: 0, font: 'sans-serif', tile: false }] } }),
  tool({ id: 'batch-format-converter', name: 'Batch Format Converter', sub: SUB, icon: 'Repeat', blurb: 'Convert a folder of images into one format at once.', tip: 'Convert to WebP for the web and keep the originals. Re-encoding repeatedly is lossy.', params: [sel('format', 'Output format', ['image/jpeg', 'image/webp', 'image/png'], 'image/webp'), qualityParam(0.85), n('maxEdge', 'Longest edge (px)', 0, 0, 12000, 100, 'px')], outGroup: 'webp', multiple: 100, build: resizeBatch }),
  tool({ id: 'batch-renamer', name: 'Batch Renamer', sub: SUB, icon: 'FileText', blurb: 'Preview a rename pattern before you apply it to a folder.', tip: 'Use {n} for a counter. A zero-padded counter sorts correctly in every file browser.', params: [txt('pattern', 'Rename pattern', '{name}-{n}'), n('start', 'Start number', 1, 0, 100000, 1)], kind: 'json', multiple: 200, custom: renameBatch }),
  tool({ id: 'batch-metadata-cleaner', name: 'Batch Metadata Cleaner', sub: SUB, icon: 'ShieldOff', blurb: 'Strip EXIF and GPS data from a whole folder.', tip: 'Do this before any batch upload to a public site. It takes seconds and removes real privacy risk.', params: [sel('format', 'Output format', ['image/png', 'image/jpeg'], 'image/png'), qualityParam(0.92)], outGroup: 'png', multiple: 100, custom: stripMetadataRun }),
  tool({ id: 'batch-grayscale', name: 'Batch Grayscale', sub: SUB, icon: 'Contrast', blurb: 'Convert a folder of images to black and white.', tip: 'Grayscale suits archival scans. It does not suit food, product or fashion photography.', params: [sl('amount', 'Greyscale', 1, 0, 1, 0.05), sl('contrast', 'Contrast', 0.12, -1, 1, 0.05), fmtParam()], outGroup: 'png', multiple: 100, build: (v) => [adjust({ grayscale: Number(v.amount ?? 1), contrast: Number(v.contrast ?? 0.12) })] }),
  tool({ id: 'batch-ocr', name: 'Batch OCR', sub: SUB, icon: 'ScanText', blurb: 'Run text recognition over a folder and export the text.', tip: 'OCR is CPU-bound. Do twenty pages at a time so the tab stays responsive.', params: [sel('language', 'Language', ['eng', 'spa', 'fra', 'deu', 'ita', 'por', 'nld', 'rus', 'ara', 'hin', 'chi_sim', 'jpn', 'kor'], 'eng'), n('scale', 'Upscale before reading', 2, 1, 4, 1, 'x'), gapParam(0)], kind: 'text', multiple: 40, custom: ocrText }),
  tool({ id: 'batch-zip-downloader', name: 'Batch ZIP Downloader', sub: SUB, icon: 'FolderArchive', blurb: 'Take a folder of images and get one tidy ZIP file.', tip: 'A ZIP keeps the folder structure and avoids a wall of separate downloads.', params: [n('longEdge', 'Longest edge (px)', 0, 0, 12000, 100, 'px'), sel('format', 'Format inside the ZIP', ['image/jpeg', 'image/png', 'image/webp', 'original'], 'original'), qualityParam(0.85)], outGroup: 'jpeg', multiple: 200, build: resizeBatch }),
  tool({ id: 'batch-target-size-compressor', name: 'Batch Target Size Compressor', sub: SUB, icon: 'Target', blurb: 'Compress a folder so every file lands under one size limit.', tip: 'Set the limit to the smallest in your group. The rest will simply come out smaller.', params: [n('targetKb', 'Target size (KB)', 200, 5, 20480, 5, 'KB'), sel('format', 'Output format', ['image/jpeg', 'image/webp'], 'image/jpeg')], outGroup: 'jpeg', multiple: 60, custom: compressToTarget }),
]

void bgParam
void clr
