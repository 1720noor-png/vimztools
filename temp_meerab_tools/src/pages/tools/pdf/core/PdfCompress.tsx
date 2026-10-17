import { useCallback, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument } from 'pdf-lib'
import { FileArchive, Loader2, Download } from 'lucide-react'
import ToolShell from '../../../../components/tools/ToolShell'
import Dropzone from '../../../../components/ui/Dropzone'
import { Button } from '../../../../components/ui/Fields'
import { useToast } from '../../../../components/ui/Toast'
import Seo from '../../../../components/ui/Seo'
import { downloadBlob, formatBytes, readFileAsArrayBuffer } from '../../../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

type Level = 'low' | 'medium' | 'high' | 'extreme'

const levelConfig: Record<Level, { scale: number; quality: number; label: string }> = {
  low: { scale: 1.5, quality: 0.7, label: 'Low (best quality, bigger file)' },
  medium: { scale: 1.25, quality: 0.55, label: 'Medium (balanced)' },
  high: { scale: 1, quality: 0.4, label: 'High (smaller file)' },
  extreme: { scale: 0.75, quality: 0.25, label: 'Extreme (smallest file)' },
}

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState<Level>('medium')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ size: number; original: number } | null>(null)
  const { toast } = useToast()

  const onFiles = useCallback(
    (files: File[]) => {
      const pdf = files[0]
      if (!pdf || !/\.pdf$/i.test(pdf.name)) {
        toast('Please choose a PDF file.', 'error')
        return
      }
      setFile(pdf)
      setResult(null)
    },
    [toast],
  )

  const compress = async () => {
    if (!file) return
    setBusy(true)
    setResult(null)
    try {
      const cfg = levelConfig[level]
      const buffer = await readFileAsArrayBuffer(file)
      const loadingTask = pdfjsLib.getDocument({ data: buffer })
      const pdf = await loadingTask.promise
      const out = await PDFDocument.create()

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: cfg.scale })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        await page.render({ canvas, viewport }).promise
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', cfg.quality),
        )
        if (blob) {
          const imageBytes = new Uint8Array(await blob.arrayBuffer())
          const image = await out.embedJpg(imageBytes)
          const w = viewport.width / cfg.scale
          const h = viewport.height / cfg.scale
          const newPage = out.addPage([w, h])
          newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: w,
            height: h,
          })
        }
        page.cleanup()
      }
      await loadingTask.destroy()

      const outBytes = await out.save({ useObjectStreams: true })
      const blob = new Blob([new Uint8Array(outBytes)], { type: 'application/pdf' })
      const savedRatio = outBytes.byteLength / file.size

      setResult({ size: outBytes.byteLength, original: file.size })
      if (savedRatio < 1) {
        toast(`Compressed to ${(savedRatio * 100).toFixed(0)}% of the original!`)
        downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}-compressed.pdf`)
      } else {
        toast('This PDF is already well optimized — no size reduction achieved.', 'info')
      }
    } catch (e) {
      console.error(e)
      toast('Compression failed. Try another PDF or a lighter level.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const savings = result ? (1 - result.size / result.original) * 100 : 0

  return (
    <>
      <Seo
        title="PDF Compress & Optimize - Free Online | vimz Tools"
        description="Shrink PDF file size by re-rendering pages with adjustable quality. 100% browser-based with PDF.js and pdf-lib, no uploads."
      />
      <ToolShell
        title="PDF Compress & Optimize"
        description="Reduce the size of bulky PDFs by intelligently re-rendering each page at the compression level you choose. Files never leave your browser."
        icon={<FileArchive className="h-6 w-6" />}
        breadcrumb="PDF Utilities"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!file ? (
              <Dropzone
                onFiles={onFiles}
                accept=".pdf"
                multiple={false}
                label="Drop a PDF here to compress it"
              />
            ) : (
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setFile(null); setResult(null); }}>
                    Replace
                  </Button>
                  <Button onClick={compress} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4" />}
                    {busy ? 'Compressing...' : 'Compress PDF'}
                  </Button>
                </div>
              </div>
            )}

            {result && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                  <p className="text-xs font-medium text-slate-400">Original</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">{formatBytes(result.original)}</p>
                </div>
                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center">
                  <p className="text-xs font-medium text-primary-500">Compressed</p>
                  <p className="mt-1 text-lg font-bold text-primary-800">{formatBytes(result.size)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <p className="text-xs font-medium text-emerald-500">Saved</p>
                  <p className="mt-1 text-lg font-bold text-emerald-700">
                    {savings > 0 ? `${savings.toFixed(0)}%` : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800">Compression level</h3>
            <div className="space-y-2.5">
              {(Object.keys(levelConfig) as Level[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                    level === l
                      ? 'border-primary-500 bg-primary-50 text-primary-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'
                  }`}
                >
                  <span className="font-semibold capitalize">{l}</span>
                  <span className="max-w-[45%] text-xs text-slate-400">{levelConfig[l].label.split(' (')[1] ?? ''}</span>
                </button>
              ))}
            </div>
            <Button onClick={compress} disabled={busy || !file} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {busy ? 'Compressing...' : 'Compress & download'}
            </Button>
            <p className="text-xs leading-relaxed text-slate-400">
              Tip: text-heavy PDFs may barely shrink — they're already efficient. Scanned
              or image-heavy PDFs compress extremely well.
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}