import { useCallback, useMemo, useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { ArrowUpDown, Download, Loader2, RotateCw, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button } from '../../../../components/ui/Fields'
import { LoadingOverlay } from '../../../../components/ui/Spinner'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, readFileAsArrayBuffer, stripFileExtension } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface PageThumb {
  index: number
  url: string
}

export default function PdfPageReorder() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [thumbs, setThumbs] = useState<PageThumb[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [rotations, setRotations] = useState<Record<number, number>>({})
  const [deleted, setDeleted] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  const onFiles = useCallback(
    async (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a valid PDF file.', 'error')
        return
      }
      setBusy(true)
      setThumbs([])
      setRotations({})
      setDeleted({})
      setFile(pdf)
      try {
        const buffer = await readFileAsArrayBuffer(pdf)
        const loadingTask = pdfjsLib.getDocument({ data: buffer })
        const doc = await loadingTask.promise
        const rendered: PageThumb[] = []
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i)
          const viewport = page.getViewport({ scale: 0.45 })
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
        setOrder(rendered.map((p) => p.index))
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

  const activeOrder = useMemo(
    () => order.filter((idx) => !deleted[idx]),
    [order, deleted],
  )

  const movePage = (pos: number, dir: -1 | 1) => {
    const list = [...activeOrder]
    const target = pos + dir
    if (target < 0 || target >= list.length) return
    const current = list[pos]
    list.splice(pos, 1)
    list.splice(target, 0, current)
    setOrder(list)
  }

  const rotatePage = (idx: number) => {
    setRotations((prev) => ({ ...prev, [idx]: ((prev[idx] ?? 0) + 90) % 360 }))
  }

  const toggleDelete = (idx: number) => {
    setDeleted((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const apply = async () => {
    if (!file || activeOrder.length === 0) return
    setBusy(true)
    try {
      const src = await PDFDocument.load(await readFileAsArrayBuffer(file), { ignoreEncryption: true })
      const out = await PDFDocument.create()
      const pages = await out.copyPages(src, activeOrder)
      for (let i = 0; i < pages.length; i++) {
        const original = src.getPage(activeOrder[i])
        const rot = (original.getRotation().angle + (rotations[activeOrder[i]] ?? 0)) % 360
        pages[i].setRotation(degrees(rot))
        out.addPage(pages[i])
      }
      const bytes = await out.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), `${stripFileExtension(file.name)}-reordered.pdf`)
      toast(`Saved ${activeOrder.length} page${activeOrder.length > 1 ? 's' : ''}.`)
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
    setOrder([])
    setRotations({})
    setDeleted({})
  }

  const total = thumbs.length
  const keptCount = activeOrder.length

  return (
    <>
      <Seo
        title="PDF Page Reorder & Rotate - Free Online | vimz Tools"
        description="Rearrange, rotate and remove pages from a PDF with live thumbnails - entirely in your browser. Free and private."
      />
      <ToolShell
        title="PDF Page Reorder & Rotate"
        description="Drag-free page management: move pages up or down, rotate them 90 degrees and delete unwanted pages. Rebuilds your PDF entirely on your device."
        icon={<ArrowUpDown className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
        instruction="Tip: rotate a page that scans sideways, or delete blank pages before sharing your file."
      >
        <div className="relative">
          {!file ? (
            <Dropzone
              onFiles={onFiles}
              accept=".pdf"
              multiple={false}
              label="Drop a PDF here to manage its pages"
            />
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {total} page{total !== 1 && 's'} · {keptCount} kept
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={reset}>
                      Replace
                    </Button>
                    <Button onClick={apply} disabled={busy || keptCount === 0}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {busy ? 'Building...' : 'Download PDF'}
                    </Button>
                  </div>
                </div>
              </div>

              {activeOrder.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
                  <p className="font-semibold text-slate-600">All pages removed</p>
                  <p className="mt-1 text-sm text-slate-400">Remove the checks above to restore pages.</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeOrder.map((idx, pos) => {
                  const thumb = thumbs.find((t) => t.index === idx)
                  const rot = rotations[idx] ?? 0
                  return (
                    <div
                      key={`${idx}-${pos}`}
                      className={`overflow-hidden rounded-2xl border bg-white transition ${
                        deleted[idx] ? 'border-slate-200 opacity-40' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-center bg-slate-100 p-3">
                        {thumb && (
                          <img
                            src={thumb.url}
                            alt={`Page ${idx + 1}`}
                            className="max-h-48 rounded-lg bg-white object-contain shadow-sm"
                            style={rot ? { transform: `rotate(${rot}deg)` } : undefined}
                          />
                        )}
                      </div>
                      <div className="space-y-2 px-3 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-700">
                            Page {pos + 1} <span className="text-xs font-normal text-slate-400">(was {idx + 1})</span>
                          </p>
                          {rot > 0 && (
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                              {rot}°
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => movePage(pos, -1)}
                            disabled={pos === 0}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Move page ${pos + 1} up`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => movePage(pos, 1)}
                            disabled={pos === activeOrder.length - 1}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Move page ${pos + 1} down`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => rotatePage(idx)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Rotate page ${pos + 1}`}
                          >
                            <RotateCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleDelete(idx)}
                            className={`rounded-lg border p-1.5 transition ${
                              deleted[idx]
                                ? 'border-rose-500 bg-rose-50 text-rose-600'
                                : 'border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                            aria-label={deleted[idx] ? `Restore page ${pos + 1}` : `Delete page ${pos + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {busy && <LoadingOverlay message="Building your reordered PDF..." />}
        </div>
      </ToolShell>
    </>
  )
}