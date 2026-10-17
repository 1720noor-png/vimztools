import { describeFileSize, EXT_BY_GROUP, MIME_BY_GROUP } from './values.ts'
import type { MimeGroup } from './types.ts'
import type { Surface } from './ops.ts'
import { canExport } from './values.ts'

export function surfaceToBlob(s: Surface, group: MimeGroup, quality: number): Promise<Blob> {
  const mime = MIME_BY_GROUP[group]
  const q = Math.min(1, Math.max(0.1, quality))
  if ('convertToBlob' in s.canvas && typeof OffscreenCanvas !== 'undefined' && s.canvas instanceof OffscreenCanvas) {
    return s.canvas.convertToBlob({ type: mime, quality: q })
  }
  return new Promise((resolve, reject) => {
    ;(s.canvas as HTMLCanvasElement).toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The browser could not encode the result.'))),
      mime,
      q,
    )
  })
}

export function outputName(base: string, group: MimeGroup, suffix = ''): string {
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.slice(0, dot) : base
  return `${stem}${suffix}.${EXT_BY_GROUP[group]}`
}

export function guardExport(group: MimeGroup): void {
  if (!canExport(group)) {
    throw new Error(`This browser cannot encode ${group.toUpperCase()} files. Choose JPG, PNG, or WebP instead.`)
  }
}

export function surfaceToDataUrl(s: Surface, group: MimeGroup, quality: number): Promise<string> {
  const mime = MIME_BY_GROUP[group]
  if ('toDataURL' in s.canvas) {
    return Promise.resolve((s.canvas as HTMLCanvasElement).toDataURL(mime, Math.min(1, Math.max(0.1, quality))))
  }
  return surfaceToBlob(s, group, quality).then(
    (b) =>
      new Promise<string>((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = () => resolve(String(fr.result))
        fr.onerror = () => reject(new Error('Could not read the result.'))
        fr.readAsDataURL(b)
      }),
  )
}

export function surfaceToBytes(s: Surface, group: MimeGroup, quality: number): Promise<Uint8Array> {
  return surfaceToBlob(s, group, quality).then((b) => b.arrayBuffer()).then((ab) => new Uint8Array(ab))
}

export interface SheetPdfOptions {
  page: 'a4' | 'letter' | 'a3' | 'a5'
  orientation: 'portrait' | 'landscape'
  marginMm: number
  fit: 'contain' | 'cover'
  title?: string
}

/** Build a real multi-page PDF from surfaces using the bundled jspdf. */
export async function surfacesToPdf(
  surfaces: Surface[],
  o: SheetPdfOptions,
): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: o.page, orientation: o.orientation, compress: true })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const m = Number.isFinite(o.marginMm) && o.marginMm >= 0 ? o.marginMm : 10
  const availW = Math.max(1, pw - m * 2)
  const availH = Math.max(1, ph - m * 2)
  for (let i = 0; i < surfaces.length; i++) {
    if (i > 0) doc.addPage(o.page, o.orientation)
    const s = surfaces[i]
    const r = s.w / s.h
    let w = availW
    let h = w / r
    if (h > availH) {
      h = availH
      w = h * r
    }
    const x = m + (availW - w) / 2
    const y = m + (availH - h) / 2
    doc.addImage(surfaceToDataUrlSync(s), 'JPEG', x, y, w, h, undefined, 'FAST')
  }
  if (o.title) doc.setProperties({ title: o.title })
  return doc.output('blob')
}

/** Synchronous data URL for canvas; OffscreenCanvas is converted via a cached blob read. */
function surfaceToDataUrlSync(s: Surface): string {
  if ('toDataURL' in s.canvas) return (s.canvas as HTMLCanvasElement).toDataURL('image/jpeg', 0.9)
  throw new Error('PDF export needs a main-thread canvas.')
}

export function surfacesToDoc(surfaces: Surface[], title: string): Blob {
  const imgs = surfaces
    .map(
      (s, i) =>
        `<figure><img src="${surfaceToDataUrlSync(s)}" width="${Math.round(s.w)}" height="${Math.round(s.h)}" alt="Image ${i + 1}"/><figcaption>Image ${i + 1} — ${s.w}×${s.h}px</figcaption></figure>`,
    )
    .join('\n')
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><h1>${escapeHtml(title)}</h1>${imgs}</body></html>`
  return new Blob([html], { type: 'application/msword' })
}

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function filesToZip(files: Array<{ name: string; blob: Blob }>): Promise<Blob> {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  for (const f of files) zip.file(f.name, f.blob)
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
}

export function jsonBlob(value: unknown): Blob {
  return new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
}

export function textBlob(value: string): Blob {
  return new Blob([value], { type: 'text/plain;charset=utf-8' })
}

export function reportRow(label: string, value: string | number, tone?: 'good' | 'warn' | 'bad' | 'neutral') {
  return { label, value: String(value), ...(tone ? { tone: tone as 'good' | 'warn' | 'bad' | 'neutral' } : {}) }
}

export function sizeOfLabel(blob: Blob): string {
  return describeFileSize(blob.size)
}
