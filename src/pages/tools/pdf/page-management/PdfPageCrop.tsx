import { useCallback, useEffect, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Download, Eraser, Loader2 } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface PageThumb {
  index: number
  url: string
}

export default function PdfPageCrop() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [thumbs, setThumbs] = useState<PageThumb[]>([])
  const [deleted, setDeleted] = useState<Record<number, boolean>>({})
  const [top, setTop] = useState(0)
  const [bottom, setBottom] = useState(0)
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)
  const { toast } = useToast()

  const onFiles = useCallback(
    async (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setFile(pdf)
      setBusy(true)
      setThumbs([])
      setDeleted({})
      setTop(0)
      setBottom(0)
      setLeft(0)
      setRight(0)
      try {
        const buffer = await readFileAsArrayBuffer(pdf)
        const loadingTask = pdfjsLib.getDocument({ data: buffer })
        const doc = await loadingTask.promise
        const rendered: PageThumb[] = []
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i)
          const viewport = page.getViewport({ scale: 0.4 })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          await page.render({ canvas, viewport }).promise
          rendered.push({ index: i - 1, url: canvas.toDataURL('image/jpeg', 0.7) })
          page.cleanup()
        }
        await loadingTask.destroy()
        setThumbs(rendered)
        toast(`Loaded ${rendered.length} page${rendered.length > 1 ? 's' : ''}.`)
      } catch {
        toast('Failed to read this PDF.', 'error')
      } finally {
        setBusy(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    return () => {
      thumbs.forEach((t) => URL.revokeObjectURL(t.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleDelete = (idx: number) => {
    setDeleted((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const apply = async () => {
    if (!file) return
    setBusy(true)
    try {
      const src = await PDFDocument.load(await readFileAsArrayBuffer(file), { ignoreEncryption: true })
      const out = await PDFDocument.create()
      const all = src.getPageIndices()
      const keep = all.filter((idx) => !deleted[idx])
      const pages = await out.copyPages(src, keep)
      for (let i = 0; i < pages.length; i++) out.addPage(pages[i])

      if (top > 0 || bottom > 0 || left > 0 || right > 0) {
        const outPages = out.getPages()
        for (const p of outPages) {
          const { width, height } = p.getSize()
          if (left + right >= width || top + bottom >= height) {
            toast('Crop amounts are larger than the page.', 'error')
            return
          }
          p.setCropBox(left, bottom, width - left - right, height - top - bottom)
          p.setMediaBox(left, bottom, width - left - right, height - top - bottom)
        }
      }

      const bytes = await out.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), `${stripFileExtension(file.name)}-cropped.pdf`)
      const removed = keep.length < all.length ? `, removed ${all.length - keep.length}` : ''
      toast(`Saved ${keep.length} page${keep.length > 1 ? 's' : ''} (${top}+${bottom}/${left}+${right}${removed}).`)
    } catch (e) {
      console.error(e)
      toast('Export failed. The PDF may be protected.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setFile(null)
    setThumbs([])
    setDeleted({})
  }

  const total = thumbs.length
  const kept = total - Object.values(deleted).filter(Boolean).length

  return (
    <>
      <Seo
        title="PDF Page Eraser & Crop - Free Online | vimz Tools"
        description="Trim uneven margins and remove blank or unwanted pages from a PDF. Crop and erase are applied 100% in your browser - free and private."
      />
      <ToolShell
        title="PDF Page Eraser & Crop"
        description="Remove unwanted pages and trim margins from every page in one pass. Preview thumbnails let you pick exactly what to erase before exporting."
        icon={<Eraser className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Tip: use the scissors icon on a page to erase it, then adjust the margin sliders to crop all remaining pages."
      >
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to crop or erase pages"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {total} page{total !== 1 && 's'} · {kept} kept
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={reset}>
                      Replace
                    </Button>
                    <Button onClick={apply} disabled={busy || kept === 0}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {busy ? 'Applying...' : 'Download PDF'}
                    </Button>
                  </div>
                </div>

                {thumbs.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {thumbs.map((t) => {
                      const isDeleted = !!deleted[t.index]
                      return (
                        <div
                          key={t.index}
                          className={`overflow-hidden rounded-2xl border bg-white transition ${
                            isDeleted ? 'border-rose-300 opacity-40' : 'border-slate-200'
                          }`}
                        >
                          <div className="relative flex items-center justify-center bg-slate-100 p-3">
                            <img
                              src={t.url}
                              alt={`Page ${t.index + 1}`}
                              className="max-h-44 rounded-lg bg-white object-contain shadow-sm"
                            />
                            {isDeleted && (
                              <span className="absolute inset-x-0 top-0 rounded-t-lg bg-rose-500 py-1 text-center text-xs font-bold text-white">
                                Erased
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between px-3 py-2.5">
                            <p className="text-xs font-semibold text-slate-600">Page {t.index + 1}</p>
                            <button
                              onClick={() => toggleDelete(t.index)}
                              className={`rounded-lg border p-1.5 transition ${
                                isDeleted
                                  ? 'border-rose-500 bg-rose-50 text-rose-600'
                                  : 'border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                              }`}
                              aria-label={isDeleted ? `Restore page ${t.index + 1}` : `Erase page ${t.index + 1}`}
                            >
                              <Eraser className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Crop margins (%)</h3>
            <Field label={`Top: ${top}%`}>
              <input
                type="range"
                min={0}
                max={40}
                value={top}
                onChange={(e) => setTop(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>
            <Field label={`Bottom: ${bottom}%`}>
              <input
                type="range"
                min={0}
                max={40}
                value={bottom}
                onChange={(e) => setBottom(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>
            <Field label={`Left: ${left}%`}>
              <input
                type="range"
                min={0}
                max={40}
                value={left}
                onChange={(e) => setLeft(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>
            <Field label={`Right: ${right}%`}>
              <input
                type="range"
                min={0}
                max={40}
                value={right}
                onChange={(e) => setRight(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </Field>
            <Button onClick={apply} disabled={busy || !file || kept === 0} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {busy ? 'Applying...' : 'Crop & download'}
            </Button>
            <p className="text-xs leading-relaxed text-slate-400">
              Margins are measured from each page edge. Removed pages are excluded from the output.
            </p>
          </div>

          {busy && <LoadingOverlay message="Cropping and removing pages..." />}
        </div>
      </ToolShell>
    </>
  )
}