import { useCallback, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import JSZip from 'jszip'
import { Images, Download, Loader2, FileArchive } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button, Field, Select } from '../../../../components/ui/Fields'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, formatBytes, readFileAsArrayBuffer } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface PageImage {
  url: string
  page: number
  size: number
}

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [pages, setPages] = useState<PageImage[]>([])
  const [scale, setScale] = useState(2)
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('png')
  const [quality, setQuality] = useState(0.9)
  const { toast } = useToast()

  const onFiles = useCallback((files: File[]) => {
    const pdf = files[0]
    if (!pdf || !/\.pdf$/i.test(pdf.name)) {
      toast('Please choose a valid PDF file.', 'error')
      return
    }
    setPages([])
    setFile(pdf)
  }, [toast])

  const convert = async () => {
    if (!file) return
    setBusy(true)
    setPages([])
    const urls: string[] = []
    try {
      const buffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const doc = await loadingTask.promise
      const rendered: PageImage[] = []

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        await page.render({ canvas, viewport }).promise

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, outputFormat === 'png' ? 'image/png' : 'image/jpeg', quality),
        )
        if (blob) {
          const url = URL.createObjectURL(blob)
          urls.push(url)
          rendered.push({ url, page: i, size: blob.size })
        }
        page.cleanup()
      }
      await loadingTask.destroy()
      setPages(rendered)
      toast(`Rendered ${rendered.length} page${rendered.length > 1 ? 's' : ''}.`)
    } catch (e) {
      console.error(e)
      toast('Failed to render PDF. Make sure it is a valid file.', 'error')
    } finally {
      urls.forEach((u) => setTimeout(() => URL.revokeObjectURL(u), 60000))
      setBusy(false)
    }
  }

  const downloadAll = async () => {
    if (!file) return
    const base = file.name.replace(/\.pdf$/i, '')
    for (const p of pages) {
      const blob = await fetch(p.url).then((r) => r.blob())
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${base}-page-${p.page}.${outputFormat === 'png' ? 'png' : 'jpg'}`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 3000)
    }
    toast(`Downloaded ${pages.length} image${pages.length > 1 ? 's' : ''}.`)
  }

  const downloadZip = async () => {
    if (pages.length === 0) return
    setBusy(true)
    try {
      const zip = new JSZip()
      const base = file?.name.replace(/\.pdf$/i, '') ?? 'pdf'
      const ext = outputFormat === 'png' ? 'png' : 'jpg'
      for (const p of pages) {
        const blob = await fetch(p.url).then((r) => r.blob())
        zip.file(`${base}-page-${p.page}.${ext}`, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(zipBlob, `${base}-images.zip`)
      toast(`Saved ${pages.length} image${pages.length > 1 ? 's' : ''} as a ZIP.`)
    } catch (e) {
      console.error(e)
      toast('ZIP export failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.url))
    setPages([])
    setFile(null)
  }

  return (
    <>
      <Seo
        title="PDF to Image Converter - Free Online | vimz Tools"
        description="Turn every page of a PDF into high-resolution PNG or JPG images right in your browser. Free, private, no uploads."
      />
      <ToolShell
        title="PDF to Image Converter"
        description="Render every page of any PDF into crisp PNG or JPG images with adjustable resolution — all processed locally with PDF.js."
        icon={<Images className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to convert its pages"
              />
            ) : (
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={reset}>
                    Replace
                  </Button>
                  <Button onClick={convert} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />}
                    {busy ? 'Rendering...' : 'Convert to images'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Render options</h3>
            <Field label={`Resolution scale ×${scale}`}>
              <input
                type="range"
                min={1}
                max={4}
                step={0.5}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
              <p className="mt-1 text-xs text-slate-400">Higher = sharper, larger files</p>
            </Field>
            <Field label="Output format">
              <Select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpeg')}>
                <option value="png">PNG (lossless)</option>
                <option value="jpeg">JPG (smaller)</option>
              </Select>
            </Field>
            {outputFormat === 'jpeg' && (
              <Field label={`Quality: ${Math.round(quality * 100)}%`}>
                <input
                  type="range"
                  min={0.4}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </Field>
            )}
            <Button onClick={convert} disabled={busy || !file} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />}
              {busy ? 'Rendering...' : 'Convert to images'}
            </Button>
          </div>
        </div>

        {pages.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                {pages.length} rendered page{pages.length > 1 && 's'}
              </h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={reset}>
                  Clear
                </Button>
                <Button variant="secondary" onClick={downloadAll}>
                  <Download className="h-4 w-4" /> Download all
                </Button>
                <Button onClick={downloadZip} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4" />}
                  {busy ? 'Zipping...' : 'Download ZIP'}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((p) => (
                <div key={p.page} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-center bg-slate-100 p-3">
                    <img
                      src={p.url}
                      alt={`Page ${p.page}`}
                      className="max-h-64 rounded-lg bg-white object-contain shadow-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Page {p.page}</p>
                      <p className="text-xs text-slate-400">{formatBytes(p.size)}</p>
                    </div>
                    <a
                      href={p.url}
                      download={`${file?.name.replace(/\.pdf$/i, '')}-page-${p.page}.${outputFormat === 'png' ? 'png' : 'jpg'}`}
                      className="rounded-lg bg-primary-100 p-2 text-primary-700 transition hover:bg-primary-600 hover:text-white"
                      aria-label={`Download page ${p.page}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ToolShell>
    </>
  )
}